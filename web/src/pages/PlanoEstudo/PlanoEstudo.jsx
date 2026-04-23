import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cursosAPI } from '../../services/api';
import { getJornadas } from '../../config/jornadas';
import { useCourseActions } from '../../hooks/useCourseActions';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../Header/Header';
import './plano-estudo.css';

/* ── Icons ── */
const IconMap     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>;
const IconBook    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IconArrow   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconReset   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>;
const IconFlag    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
const IconStar    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconSpinner = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pe-spinner"><circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>;
const IconSave    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
const IconSaveFilled = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;

/* ── Constants ── */
const AREAS = ['Frontend', 'Backend', 'Data Science', 'DevOps', 'Database', 'Mobile', 'Design', 'Marketing', 'Negócios', 'Idiomas', 'Saúde', 'Diversos'];

const TIME_OPTIONS = [
  { value: 'low',    label: 'Até 1h por dia' },
  { value: 'medium', label: '1h a 3h por dia' },
  { value: 'high',   label: 'Mais de 3h por dia' },
];

const LEVEL_OPTIONS = ['Iniciante', 'Intermediário', 'Avançado'];

const EMPTY_PREFS = { tempo: '', areaFoco: '', topicos: [], facilidades: [], nivel: '' };

/* ── Recommendation engine ── */
function buildRecommendation(prefs, allCursos, jornadas) {
  const { areaFoco, topicos, facilidades, nivel } = prefs;

  const scored = allCursos.map(curso => {
    let score = 0;
    const cat   = (curso.categoria || '').toLowerCase();
    const title = (curso.titulo    || '').toLowerCase();
    const desc  = (curso.descricao || '').toLowerCase();

    if (areaFoco && cat === areaFoco.toLowerCase()) score += 10;

    topicos.forEach(t => {
      const tl = t.toLowerCase();
      if (cat === tl || title.includes(tl) || desc.includes(tl)) score += 5;
    });

    // Already comfortable → deprioritise
    facilidades.forEach(f => {
      if (cat === f.toLowerCase()) score -= 2;
    });

    if (nivel) {
      const nivelKeywords = {
        'Iniciante':     ['basico', 'básico', 'iniciante', 'fundamentos', 'intro'],
        'Intermediário': ['intermediario', 'intermediário'],
        'Avançado':      ['avancado', 'avançado', 'completo', 'expert'],
      };
      const kws = nivelKeywords[nivel] || [];
      if (kws.some(k => title.includes(k) || desc.includes(k))) score += 3;
    }

    return { ...curso, _score: score };
  });

  const recommended = scored
    .filter(c => c._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 6);

  // Fill up to 3 with area-matching courses if needed
  if (recommended.length < 3 && areaFoco) {
    const ids = new Set(recommended.map(c => c.id));
    const extras = scored
      .filter(c => !ids.has(c.id) && (c.categoria || '').toLowerCase() === areaFoco.toLowerCase())
      .slice(0, 3 - recommended.length);
    recommended.push(...extras);
  }

  const matchedJornadas = jornadas.filter(j => {
    const jt = j.titulo.toLowerCase();
    const matchesArea  = areaFoco && jt.includes(areaFoco.toLowerCase());
    const matchesTopic = topicos.some(t => jt.includes(t.toLowerCase()));
    const matchesNivel = !nivel || j.nivel === nivel;
    return (matchesArea || matchesTopic) && matchesNivel;
  });

  return { courses: recommended, jornadas: matchedJornadas };
}

function reasonText(curso, prefs) {
  const cat = (curso.categoria || '').toLowerCase();
  if (prefs.areaFoco && cat === prefs.areaFoco.toLowerCase())
    return `área de foco: ${prefs.areaFoco}`;
  for (const t of prefs.topicos) {
    if (cat === t.toLowerCase() || (curso.titulo || '').toLowerCase().includes(t.toLowerCase()))
      return `tópico de interesse: ${t}`;
  }
  return 'complementa seu perfil de aprendizado';
}

/* ── ChipSelect ── */
const ChipSelect = ({ options, selected, onChange, max = 99 }) => (
  <div className="pe-chips">
    {options.map(opt => {
      const active = selected.includes(opt);
      return (
        <button
          key={opt}
          type="button"
          className={`pe-chip${active ? ' pe-chip--active' : ''}`}
          onClick={() => {
            if (active) onChange(selected.filter(x => x !== opt));
            else if (selected.length < max) onChange([...selected, opt]);
          }}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

/* ── Main ── */
const PlanoEstudo = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { watchLater, toggleWatchLater } = useCourseActions();
  const [prefs,     setPrefs]     = useState(EMPTY_PREFS);
  const [allCursos, setAllCursos] = useState([]);
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [step,      setStep]      = useState('form'); // 'form' | 'result'

  // Restore saved plan after returning from login
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('learnly_plano_estudo_state');
      if (saved) {
        const { prefs: p, result: r } = JSON.parse(saved);
        if (p) setPrefs(p);
        if (r) { setResult(r); setStep('result'); }
        sessionStorage.removeItem('learnly_plano_estudo_state');
      }
    } catch {}
  }, []);

  useEffect(() => {
    cursosAPI.listarTodos()
      .then(r => setAllCursos(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  const set = patch => setPrefs(p => ({ ...p, ...patch }));
  const canSubmit = prefs.tempo && prefs.areaFoco && prefs.nivel;

  const isGuest = !usuario;

  const goToLogin = () => {
    try { sessionStorage.setItem('learnly_plano_estudo_state', JSON.stringify({ prefs, result })); } catch {}
    navigate(`/login?returnTo=${encodeURIComponent('/plano-estudo')}`);
  };

  const handleGenerate = () => {
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => {
      setResult(buildRecommendation(prefs, allCursos, getJornadas()));
      setStep('result');
      setLoading(false);
    }, 700);
  };

  const handleReset = () => {
    setPrefs(EMPTY_PREFS);
    setResult(null);
    setStep('form');
  };
  // Navigate to Planning with the recommended courses pre-filled as cards
  const handleLevarParaPlanning = () => {
    if (!result?.courses?.length) return;
    const prefillCards = result.courses.map(curso => ({
      tipo: 'Curso',
      col: 'todo',
      titulo: curso.titulo,
      cursoId: curso.id,
      cursoNome: curso.titulo,
      categoria: curso.categoria || '',
      nota: `Recomendado pelo Plano de Estudo · ${reasonText(curso, prefs)}`,
    }));
    navigate('/planning', { state: { prefillCards } });
  };

  return (
    <div className="pe-page">
      <Header />

      <div className="pe-hero">
        <div className="pe-hero-inner">
          <div className="pe-hero-icon"><IconMap /></div>
          <div>
            <h1 className="pe-hero-title">Plano de Estudo</h1>
            <p className="pe-hero-sub">Responda algumas perguntas e receba um caminho de aprendizado personalizado com os cursos da plataforma.</p>
          </div>
        </div>
      </div>

      <div className="pe-body">

        {step === 'form' ? (
          <div className="pe-form-card">

            <div className="pe-field">
              <label className="pe-label"><IconFlag /> Quanto tempo você tem para estudar por dia?</label>
              <div className="pe-radio-group">
                {TIME_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`pe-radio-btn${prefs.tempo === opt.value ? ' pe-radio-btn--active' : ''}`}
                    onClick={() => set({ tempo: opt.value })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pe-field">
              <label className="pe-label"><IconBook /> Qual área você quer seguir? <span className="pe-label-req">*</span></label>
              <div className="pe-chips">
                {AREAS.map(area => (
                  <button
                    key={area}
                    type="button"
                    className={`pe-chip${prefs.areaFoco === area ? ' pe-chip--active pe-chip--focus' : ''}`}
                    onClick={() => set({ areaFoco: area })}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div className="pe-field">
              <label className="pe-label"><IconStar /> Quais tópicos você quer estudar? <span className="pe-label-hint">(opcional · até 5)</span></label>
              <ChipSelect options={AREAS} selected={prefs.topicos} onChange={v => set({ topicos: v })} max={5} />
            </div>

            <div className="pe-field">
              <label className="pe-label"><IconStar /> Em quais áreas você já tem facilidade? <span className="pe-label-hint">(opcional)</span></label>
              <ChipSelect options={AREAS} selected={prefs.facilidades} onChange={v => set({ facilidades: v })} max={5} />
            </div>

            <div className="pe-field">
              <label className="pe-label"><IconFlag /> Qual é o seu nível atual? <span className="pe-label-req">*</span></label>
              <div className="pe-radio-group">
                {LEVEL_OPTIONS.map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    className={`pe-radio-btn${prefs.nivel === lvl ? ' pe-radio-btn--active' : ''}`}
                    onClick={() => set({ nivel: lvl })}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="pe-generate-btn"
              onClick={handleGenerate}
              disabled={!canSubmit || loading}
            >
              {loading
                ? <><IconSpinner /> Gerando plano...</>
                : <><IconMap /> Gerar meu plano de estudo</>}
            </button>

          </div>
        ) : (
          <div className="pe-result">

            <div className="pe-result-banner">
              <div className="pe-result-banner-text">
                <p className="pe-result-banner-title">Seu plano está pronto! 🎯</p>
                <p className="pe-result-banner-sub">
                  Perfil: <strong>{prefs.areaFoco}</strong> · <strong>{prefs.nivel}</strong> · <strong>{TIME_OPTIONS.find(t => t.value === prefs.tempo)?.label}</strong>
                </p>
              </div>
              <button className="pe-reset-btn" onClick={handleReset}><IconReset /> Refazer</button>
            </div>

            {isGuest && (
              <div style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: '14px', padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.1rem' }}>👋</span>
                  <span style={{ fontSize: '0.85rem', color: '#888' }}>Você está no <strong style={{ color: '#ffd700' }}>modo visitante</strong> — salvar cursos, enviar para o Planejamento e acompanhar progresso requerem login.</span>
                </div>
                <button onClick={goToLogin} style={{ padding: '9px 20px', background: '#ffd700', border: 'none', borderRadius: '9px', color: '#000', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Entrar na conta
                </button>
              </div>
            )}

            {result.jornadas.length > 0 && (
              <section className="pe-section">
                <h2 className="pe-section-title">Jornadas recomendadas</h2>
                <p className="pe-section-sub">Trilhas completas que combinam com seu perfil</p>
                <div className="pe-jornadas-grid">
                  {result.jornadas.map(j => (
                    <div key={j.slug} className="pe-jornada-card">
                      <div className="pe-jornada-icon">{j.icon}</div>
                      <div className="pe-jornada-info">
                        <p className="pe-jornada-title">{j.titulo}</p>
                        <p className="pe-jornada-desc">{j.descricao}</p>
                        <div className="pe-jornada-meta">
                          <span className="pe-badge">{j.nivel}</span>
                          <span className="pe-badge pe-badge--dim">{j.cursoIds.length} cursos</span>
                        </div>
                      </div>
                      <button className="pe-card-btn" onClick={() => navigate(`/jornada/${j.slug}`)}>
                        Iniciar <IconArrow />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="pe-section">
              <h2 className="pe-section-title">Cursos recomendados</h2>
              <p className="pe-section-sub">Selecionados com base nas suas preferências e no catálogo atual da plataforma</p>

              {result.courses.length === 0 ? (
                <div className="pe-empty">
                  <IconBook />
                  <p>Nenhum curso encontrado para esse perfil ainda.</p>
                  <span>Novos cursos são adicionados regularmente — tente ajustar suas preferências.</span>
                  <button className="pe-reset-btn" style={{ marginTop: 12 }} onClick={handleReset}>
                    <IconReset /> Ajustar preferências
                  </button>
                </div>
              ) : (
                <div className="pe-courses-list">
                  {result.courses.map((curso, i) => (
                    <div key={curso.id} className="pe-course-row">
                      <div className="pe-course-step">{i + 1}</div>
                      <div className="pe-course-info">
                        <div className="pe-course-meta">
                          <span className="pe-badge">{curso.categoria}</span>
                          <span className="pe-reason">✦ {reasonText(curso, prefs)}</span>
                        </div>
                        <p className="pe-course-title">{curso.titulo}</p>
                        {curso.descricao && <p className="pe-course-desc">{curso.descricao}</p>}
                      </div>
                      <div className="pe-course-actions">
                        <button className="pe-card-btn pe-card-btn--sm" onClick={() => navigate(`/curso/${curso.id}/intro`)}>
                          Ver <IconArrow />
                        </button>
                        {usuario ? (
                          <button
                            className={`pe-save-btn${watchLater.has(curso.id) ? ' pe-save-btn--active' : ''}`}
                            onClick={() => toggleWatchLater(curso.id)}
                            title={watchLater.has(curso.id) ? 'Remover de assistir depois' : 'Salvar para assistir depois'}
                          >
                            {watchLater.has(curso.id) ? <IconSaveFilled /> : <IconSave />}
                            {watchLater.has(curso.id) ? 'Salvo' : 'Salvar'}
                          </button>
                        ) : (
                          <button className="pe-save-btn" onClick={goToLogin} title="Faça login para salvar">
                            <IconSave /> Salvar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {result.courses.length > 0 && (
              <div className="pe-cta">
                {isGuest ? (
                  <>
                    <p>Faça login para salvar este plano e organizar os cursos no seu Planejamento.</p>
                    <button className="pe-cta-btn" onClick={goToLogin}>
                      Entrar para salvar <IconArrow />
                    </button>
                  </>
                ) : (
                  <>
                    <p>Quer organizar esses cursos no seu quadro de planejamento?</p>
                    <button className="pe-cta-btn" onClick={handleLevarParaPlanning}>
                      Levar para o Planejamento <IconArrow />
                    </button>
                  </>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default PlanoEstudo;
