import { useNavigate } from 'react-router-dom';
import { formatDuration } from '../utils/format';
import { loadLastCourse } from '../utils/lastCourse';

const IconBook  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IconPlay  = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const IconClock = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
const IconEmpty = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5-2 4-2 4 2 4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;

const Section = ({ label, count, children }) => (
  <div className="ud-section">
    <div className="ud-section-header">
      <p className="ud-section-title">{label}</p>
      {count != null && <span className="ud-section-count">{count}</span>}
    </div>
    {children}
  </div>
);

const DashboardTab = ({ stats, usuario }) => {
  const navigate = useNavigate();

  if (!stats) return (
    <div className="ud-section">
      <div className="ud-skeleton" style={{ height: 120 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="ud-skeleton" style={{ height: 200 }} />
        <div className="ud-skeleton" style={{ height: 200 }} />
      </div>
    </div>
  );

  const cursos      = stats.cursosDetalhes || [];
  const emAndamento = cursos.filter(c => !c.concluido);
  const concluidos  = cursos.filter(c => c.concluido);

  const lastAccessed = loadLastCourse();

  const ultimoAcessado = (() => {
    if (lastAccessed?.cursoId) {
      const match = cursos.find(c => c.cursoId === lastAccessed.cursoId);
      if (match) return {
        ...match,
        _lastAulaId:    lastAccessed.aulaId,
        _lastAulaTitle: lastAccessed.aulaTitle,
      };
    }
    // Fallback: most recently active course by ultimaAtividade
    const sorted = [...cursos].sort((a, b) => {
      const ta = a.ultimaAtividade ? new Date(a.ultimaAtividade).getTime() : 0;
      const tb = b.ultimaAtividade ? new Date(b.ultimaAtividade).getTime() : 0;
      return tb - ta;
    });
    return sorted.length > 0 ? sorted[0] : null;
  })();

  const handleContinue = () => {
    if (!ultimoAcessado) return;
    const aulaId = ultimoAcessado._lastAulaId;
    if (aulaId) {
      // Go directly to the lesson in the dedicated player
      navigate(`/curso/${ultimoAcessado.cursoId}/aula/${aulaId}`);
    } else {
      // No specific lesson known — open the course detail page
      navigate(`/curso/${ultimoAcessado.cursoId}`);
    }
  };

  // Label for the "last lesson" line
  const lastLessonLabel = (() => {
    if (ultimoAcessado?._lastAulaTitle) return ultimoAcessado._lastAulaTitle;
    if (ultimoAcessado?.proximaAulaTitulo) return ultimoAcessado.proximaAulaTitulo;
    if (ultimoAcessado?.ultimaAulaTitulo)  return ultimoAcessado.ultimaAulaTitulo;
    return null;
  })();

  const lastLessonPrefix = (() => {
    if (ultimoAcessado?._lastAulaTitle)    return 'Última vista:';
    if (ultimoAcessado?.proximaAulaTitulo) return 'Próxima:';
    if (ultimoAcessado?.ultimaAulaTitulo)  return 'Última vista:';
    return null;
  })();

  const pct = c => Math.round(Number(c.progresso) || 0);

  return (
    <div className="ud-content-grid">

      {/* ── Continue ── */}
      {ultimoAcessado && (
        <div className="ud-full">
          <Section label="Continuar aprendendo">
            <div className="ud-continue-card">
              <div className="ud-continue-body">
                <div className="ud-continue-eyebrow">
                  <IconPlay /><span>Continue de onde parou</span>
                </div>
                <p className="ud-continue-title">{ultimoAcessado.tituloCurso}</p>
                <div className="ud-continue-meta">
                  {ultimoAcessado.categoria && (
                    <span className="pf-cat-badge">{ultimoAcessado.categoria}</span>
                  )}
                  {ultimoAcessado.ultimaAtividade && (
                    <span className="ud-continue-date">
                      <IconClock />
                      {new Date(ultimoAcessado.ultimaAtividade).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
                <p className="ud-continue-next">
                  {lastLessonLabel
                    ? <>{lastLessonPrefix} <strong>{lastLessonLabel}</strong></>
                    : 'Comece a primeira aula'
                  }
                </p>
                <div className="ud-continue-footer">
                  <div className="ud-continue-bar-wrap">
                    <div className="ud-continue-bar-track">
                      <div className="ud-continue-bar-fill" style={{ width: `${pct(ultimoAcessado)}%` }} />
                    </div>
                    <span className="ud-continue-bar-label">
                      {ultimoAcessado.aulasVistas ?? 0}/{ultimoAcessado.totalAulas ?? 0} aulas · {pct(ultimoAcessado)}%
                    </span>
                  </div>
                  <button className="ud-continue-btn" onClick={handleContinue}>
                    <IconPlay /> Continuar
                  </button>
                </div>
              </div>
              <div className="ud-continue-ring" aria-hidden="true">
                <svg viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="#ffd700" strokeWidth="3"
                    strokeDasharray={`${pct(ultimoAcessado)} 100`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                </svg>
                <span>{pct(ultimoAcessado)}%</span>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ── Em andamento ── */}
      {emAndamento.length > 0 && (
        <div>
          <Section label="Em andamento" count={emAndamento.length}>
            <div className="ud-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {emAndamento.map(c => (
                  <div key={c.cursoId} className="ud-course-row">
                    <div className="ud-course-icon"><IconBook /></div>
                    <div className="ud-course-info">
                      <p className="ud-course-title">{c.tituloCurso}</p>
                      <div className="ud-course-meta">
                        {c.categoria && <span className="pf-cat-badge">{c.categoria}</span>}
                        <span className="ud-course-meta-text">{c.aulasVistas ?? 0}/{c.totalAulas ?? 0} aulas</span>
                        {c.ultimaAtividade && (
                          <span className="ud-course-meta-text">
                            {new Date(c.ultimaAtividade).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                      <div className="ud-course-bar">
                        <div className="ud-course-bar-fill" style={{ width: `${pct(c)}%` }} />
                      </div>
                    </div>
                    <span className="ud-course-pct">{pct(c)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ── Concluídos ── */}
      {concluidos.length > 0 && (
        <div>
          <Section label="Concluídos" count={concluidos.length}>
            <div className="ud-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {concluidos.map(c => (
                  <div key={c.cursoId} className="ud-done-row">
                    <div className="ud-done-icon"><IconCheck /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="ud-done-title">{c.tituloCurso}</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        {c.categoria && <span className="pf-cat-badge">{c.categoria}</span>}
                        {c.duracao > 0 && <span className="ud-done-meta">{formatDuration(c.duracao)}</span>}
                        {c.dataConclusao && (
                          <span className="ud-done-meta">
                            Concluído em {new Date(c.dataConclusao).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ── Histórico ── */}
      {cursos.length > 0 && (
        <div className="ud-full">
          <Section label="Histórico" count={cursos.length}>
            <div className="ud-card">
              <div className="ud-history-grid">
                {cursos.map(c => (
                  <div key={c.cursoId} className="ud-history-row">
                    <div
                      className="ud-history-icon"
                      style={{
                        background: c.concluido ? 'rgba(52,211,153,0.1)' : 'rgba(255,215,0,0.08)',
                        color: c.concluido ? '#34d399' : '#ffd700',
                      }}
                    >
                      {c.concluido ? <IconCheck /> : <IconPlay />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="ud-history-title">{c.tituloCurso}</p>
                      <div className="ud-history-sub">
                        <span>{c.aulasVistas ?? 0}/{c.totalAulas ?? 0} aulas</span>
                        {c.duracao > 0 && <span>{formatDuration(c.duracao)}</span>}
                        {c.dataInscricao && <span>Inscrito {new Date(c.dataInscricao).toLocaleDateString('pt-BR')}</span>}
                      </div>
                    </div>
                    <div>
                      <p className="ud-history-status" style={{ color: c.concluido ? '#34d399' : '#ffd700' }}>
                        {c.concluido ? 'Concluído' : `${pct(c)}%`}
                      </p>
                      {c.dataConclusao && (
                        <p className="ud-history-date">{new Date(c.dataConclusao).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ── Empty ── */}
      {cursos.length === 0 && (
        <div className="ud-full">
          <div className="ud-card">
            <div className="ud-empty">
              <IconEmpty />
              <p>Nenhuma atividade ainda.</p>
              <span>Matricule-se em um curso para começar sua jornada.</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardTab;
