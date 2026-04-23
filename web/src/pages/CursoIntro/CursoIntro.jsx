import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cursosAPI, matriculasAPI, aulasAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCourseActions } from '../../hooks/useCourseActions';
import Header from '../Header/Header';
import '../../styles/curso-intro.css';

const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
};

const formatDuration = (min) => {
  if (!min) return '—';
  const h = Math.floor(min / 60), m = min % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`;
};

const parseJSON = (str) => {
  if (!str) return [];
  try { return JSON.parse(str) || []; } catch { return []; }
};

// Platform-level benefits — always shown
const PLATFORM_BENEFITS = [
  { icon: '📈', title: 'Progresso rastreado', desc: 'Acompanhe cada aula concluída e veja sua evolução em tempo real.' },
  { icon: '🏆', title: 'Certificado de conclusão', desc: 'Ao terminar, emita seu certificado e comprove seu aprendizado.' },
  { icon: '♾️', title: 'Acesso ilimitado', desc: 'Revise o conteúdo quantas vezes precisar, sem prazo de expiração.' },
  { icon: '🎯', title: 'Aprenda no seu ritmo', desc: 'Pause, retome e avance conforme sua disponibilidade.' },
];

const StarRow = ({ value }) => (
  <span className="ci-stars" aria-label={`${value} de 5 estrelas`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} viewBox="0 0 24 24" fill={s <= Math.round(value) ? '#ffd700' : 'none'}
        stroke="#ffd700" strokeWidth="1.5" className="ci-star">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ))}
  </span>
);

const CursoIntro = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matriculado, setMatriculado] = useState(false);
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [totalAulas, setTotalAulas] = useState(0);
  const [enrolling, setEnrolling] = useState(false);
  const { watchLater, toggleWatchLater } = useCourseActions();

  useEffect(() => {
    const load = async () => {
      try {
        const [cursoRes, statusRes, aulasRes] = await Promise.all([
          cursosAPI.buscarPorId(id),
          matriculasAPI.status(id).catch(() => ({ data: {} })),
          aulasAPI.listarPorCurso(id).catch(() => ({ data: [] })),
        ]);
        setCurso(cursoRes.data);
        setMatriculado(statusRes.data.matriculado === true);
        setTotalAlunos(statusRes.data.totalMatriculados || 0);
        setTotalAulas(Array.isArray(aulasRes.data) ? aulasRes.data.length : 0);
      } catch {
        navigate('/cursos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDetails = () => navigate(`/curso/${id}`);

  const handleEnroll = async () => {
    if (!usuario) return navigate(`/login?returnTo=/curso/${id}/intro`);
    if (matriculado) return navigate(`/curso/${id}`);
    setEnrolling(true);
    try { await matriculasAPI.matricular(id); } catch { /* already enrolled */ }
    navigate(`/curso/${id}`);
  };

  if (loading) return (
    <div className="ci-page">
      <Header />
      <div className="ci-loading"><div className="ci-spinner" /></div>
    </div>
  );

  if (!curso) return null;

  // Derived data from the rich API response
  const ytId       = getYouTubeId(curso.url);
  const thumbUrl   = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null;
  const coverImg   = curso.imagem || thumbUrl;
  const mediaAval  = curso.mediaAvaliacao;
  const totalAval  = curso.totalAvaliacoes || 0;
  const links      = parseJSON(curso.linksExternos).filter(l => l.url);
  const anexos     = parseJSON(curso.anexos).filter(a => a.url);
  const hasContent = curso.descricaoDetalhada && curso.descricaoDetalhada.trim().length > 0;
  const hasResources = links.length > 0 || anexos.length > 0;

  return (
    <div className="ci-page">
      <Header />

      {/* ── Hero ── */}
      <section className="ci-hero" style={coverImg ? {
        '--ci-hero-bg': `url(${coverImg})`,
      } : {}}>
        {coverImg && <div className="ci-hero-backdrop" />}

        <div className="ci-hero-inner">
          <div className="ci-hero-text">
            <span className="ci-category">{curso.categoria}</span>
            <h1 className="ci-title">{curso.titulo}</h1>
            <p className="ci-desc">{curso.descricao}</p>

            {/* Rating + stats */}
            <div className="ci-stats">
              {mediaAval > 0 && (
                <div className="ci-stat ci-stat-rating">
                  <StarRow value={mediaAval} />
                  <span className="ci-stat-value ci-gold">{Number(mediaAval).toFixed(1)}</span>
                  {totalAval > 0 && (
                    <span className="ci-stat-label">({totalAval} {totalAval === 1 ? 'avaliação' : 'avaliações'})</span>
                  )}
                </div>
              )}
              {totalAlunos > 0 && (
                <div className="ci-stat">
                  <span className="ci-stat-value">{totalAlunos.toLocaleString('pt-BR')}</span>
                  <span className="ci-stat-label">{totalAlunos === 1 ? 'aluno' : 'alunos'}</span>
                </div>
              )}
              {totalAulas > 0 && (
                <div className="ci-stat">
                  <span className="ci-stat-value">{totalAulas}</span>
                  <span className="ci-stat-label">{totalAulas === 1 ? 'aula' : 'aulas'}</span>
                </div>
              )}
              <div className="ci-stat">
                <span className="ci-stat-value">{formatDuration(curso.duracao)}</span>
                <span className="ci-stat-label">de conteúdo</span>
              </div>
            </div>

            <p className="ci-instructor-line">
              Instrutor: <strong>{curso.instrutor}</strong>
            </p>

          <div className="ci-ctas">
              {matriculado ? (
                <button className="ci-btn-primary" onClick={() => navigate(`/curso/${id}`)}>
                  Continuar Curso →
                </button>
              ) : (
                <>
                  <button className="ci-btn-primary" onClick={handleDetails}>
                    Saiba mais detalhes
                  </button>
                  <button className="ci-btn-secondary" onClick={handleEnroll} disabled={enrolling}>
                    {enrolling && <span className="ci-btn-spinner" />}
                    {enrolling ? 'Matriculando...' : 'Matricular-se agora'}
                  </button>
                </>
              )}
              {usuario && (
                <button
                  className={`ci-btn-save${watchLater.has(Number(id)) ? ' ci-btn-save--active' : ''}`}
                  onClick={() => toggleWatchLater(Number(id))}
                  title={watchLater.has(Number(id)) ? 'Remover de assistir depois' : 'Salvar para assistir depois'}
                >
                  <svg viewBox="0 0 24 24" fill={watchLater.has(Number(id)) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  {watchLater.has(Number(id)) ? 'Salvo' : 'Salvar'}
                </button>
              )}
            </div>

            {!usuario && (
              <p className="ci-login-hint">
                Já tem conta?{' '}
                <button className="ci-link" onClick={() => navigate(`/login?returnTo=/curso/${id}/intro`)}>
                  Faça login
                </button>
              </p>
            )}
          </div>

          {/* Thumbnail card */}
          <div className="ci-hero-visual">
            <div
              className="ci-thumb"
              style={thumbUrl ? { backgroundImage: `url(${thumbUrl})` }
                : coverImg ? { backgroundImage: `url(${coverImg})` } : {}}
              onClick={handleDetails}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleDetails()}
              aria-label="Ver detalhes do curso"
            >
              <div className="ci-thumb-overlay" />
              <div className="ci-play-btn" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <span className="ci-thumb-duration">{formatDuration(curso.duracao)}</span>
            </div>

            {/* Certificate teaser */}
            <div className="ci-cert-teaser">
              <span className="ci-cert-icon">🏆</span>
              <div className="ci-cert-text">
                <strong>Certificado incluído</strong>
                <span>Conclua o curso e emita seu certificado de conclusão.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Course-specific content (descricaoDetalhada) ── */}
      {hasContent && (
        <section className="ci-content">
          <div className="ci-section-inner ci-content-inner">
            <div className="ci-content-body">
              <h2 className="ci-section-title">Sobre este curso</h2>
              <div className="ci-rich-text">
                {curso.descricaoDetalhada.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Sidebar: instructor + meta */}
            <aside className="ci-content-aside">

              {/* Instructor card */}
              <div className="ci-instructor-card">
                <h3>Instrutor</h3>
                <div className="ci-instructor-body">
                  {curso.instrutorFoto ? (
                    <img src={curso.instrutorFoto} alt={curso.instrutor} className="ci-instructor-avatar" />
                  ) : (
                    <div className="ci-instructor-avatar ci-instructor-avatar-placeholder">
                      {curso.instrutor?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="ci-instructor-name">{curso.instrutor}</p>
                    {curso.instrutorBio && (
                      <p className="ci-instructor-bio">{curso.instrutorBio}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Course meta */}
              <div className="ci-meta-card">
                {[
                  { label: 'Categoria',  value: curso.categoria },
                  { label: 'Duração',    value: formatDuration(curso.duracao) },
                  { label: 'Aulas',      value: totalAulas > 0 ? `${totalAulas} aulas` : '—' },
                  { label: 'Modalidade', value: 'Online' },
                  ...(mediaAval > 0 ? [{ label: 'Avaliação', value: `${Number(mediaAval).toFixed(1)} / 5` }] : []),
                  ...(totalAlunos > 0 ? [{ label: 'Alunos', value: totalAlunos.toLocaleString('pt-BR') }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="ci-meta-row">
                    <span className="ci-meta-label">{label}</span>
                    <span className="ci-meta-value">{value}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>
      )}

      {/* ── Course image (if no descricaoDetalhada, show image prominently) ── */}
      {!hasContent && curso.imagem && (
        <section className="ci-image-section">
          <div className="ci-section-inner">
            <img src={curso.imagem} alt={curso.titulo} className="ci-course-image" />
          </div>
        </section>
      )}

      {/* ── External links & attachments ── */}
      {hasResources && (
        <section className="ci-resources">
          <div className="ci-section-inner">
            <h2 className="ci-section-title">Recursos do curso</h2>
            {!matriculado && (
              <p className="ci-resources-locked-hint">
                <svg viewBox="0 0 24 24" fill="currentColor" className="ci-lock-icon">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                Matricule-se para acessar os recursos completos.
              </p>
            )}
            <div className="ci-resources-grid">
              {links.map((link, i) => (
                matriculado ? (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="ci-resource-item ci-resource-link">
                    <span className="ci-resource-icon">🔗</span>
                    <span>{link.titulo || link.url}</span>
                  </a>
                ) : (
                  <div key={i} className="ci-resource-item ci-resource-locked">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="ci-resource-lock">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                    <span>{link.titulo || 'Link externo'}</span>
                  </div>
                )
              ))}
              {anexos.map((anexo, i) => (
                matriculado ? (
                  <a key={i} href={anexo.url} target="_blank" rel="noopener noreferrer"
                    className="ci-resource-item ci-resource-file">
                    <span className="ci-resource-icon">📎</span>
                    <span>{anexo.nome || 'Material complementar'}</span>
                  </a>
                ) : (
                  <div key={i} className="ci-resource-item ci-resource-locked">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="ci-resource-lock">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                    <span>{anexo.nome || 'Material complementar'}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Platform benefits ── */}
      <section className="ci-benefits">
        <div className="ci-section-inner">
          <h2 className="ci-section-title">O que você vai obter</h2>
          <div className="ci-benefits-grid">
            {PLATFORM_BENEFITS.map((b) => (
              <div key={b.title} className="ci-benefit-card">
                <span className="ci-benefit-icon">{b.icon}</span>
                <div>
                  <h3>{b.title}</h3>
                  <p>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="ci-bottom-cta">
        <div className="ci-section-inner ci-bottom-inner">
          <div>
            {matriculado ? (
              <>
                <h2>Continue de onde parou</h2>
                <p>Você já está matriculado em <strong>{curso.titulo}</strong>.</p>
              </>
            ) : (
              <>
                <h2>Quer aprender {curso.titulo}?</h2>
                <p>Veja todos os detalhes, aulas e conteúdo antes de se matricular.</p>
              </>
            )}
          </div>
          <div className="ci-ctas">
            {matriculado ? (
              <button className="ci-btn-primary" onClick={() => navigate(`/curso/${id}`)}>
                Continuar Curso →
              </button>
            ) : (
              <>
                <button className="ci-btn-primary" onClick={handleDetails}>
                  Saiba mais detalhes
                </button>
                <button className="ci-btn-secondary" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling && <span className="ci-btn-spinner" />}
                  {enrolling ? 'Matriculando...' : 'Matricular-se agora'}
                </button>
              </>
            )}
            {usuario && (
              <button
                className={`ci-btn-save${watchLater.has(Number(id)) ? ' ci-btn-save--active' : ''}`}
                onClick={() => toggleWatchLater(Number(id))}
                title={watchLater.has(Number(id)) ? 'Remover de assistir depois' : 'Salvar para assistir depois'}
              >
                <svg viewBox="0 0 24 24" fill={watchLater.has(Number(id)) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                {watchLater.has(Number(id)) ? 'Salvo' : 'Salvar'}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CursoIntro;
