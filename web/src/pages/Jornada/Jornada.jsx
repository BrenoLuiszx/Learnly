import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../Header/Header";
import { cursosAPI, matriculasAPI } from "../../services/api";
import { getJornadas } from "../../config/jornadas";
import { formatDuration } from "../../utils/format";
import "../../styles/jornada.css";

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
);

const Jornada = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [cursos, setCursos] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [loading, setLoading] = useState(true);

  const jornadaDef = getJornadas().find((j) => j.slug === slug);

  useEffect(() => {
    if (!jornadaDef) return;
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cursosRes, matriculasRes] = await Promise.all([
        cursosAPI.listarTodos(),
        usuario ? matriculasAPI.minhasMatriculas().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);

      const allCursos = Array.isArray(cursosRes.data) ? cursosRes.data : [];
      const jornadaCursos = jornadaDef.cursoIds
        .map((id) => allCursos.find((c) => c.id === id))
        .filter(Boolean);

      setCursos(jornadaCursos);
      setMatriculas(Array.isArray(matriculasRes.data) ? matriculasRes.data : []);
    } catch (err) {
      console.error("Erro ao carregar jornada:", err);
    } finally {
      setLoading(false);
    }
  };

  // Derive completion state from real matricula data
  const getMatricula = (cursoId) =>
    matriculas.find((m) => m.cursoId === cursoId || m.curso_id === cursoId);

  const isConcluido = (cursoId) => {
    const m = getMatricula(cursoId);
    return m?.concluido === true || m?.concluido === 1;
  };

  const getProgresso = (cursoId) => {
    const m = getMatricula(cursoId);
    return m ? parseFloat(m.progresso || 0) : 0;
  };

  // A step is unlocked if all previous steps are concluded
  const isUnlocked = (index) => {
    if (index === 0) return true;
    return isConcluido(cursos[index - 1]?.id);
  };

  const concludedCount = cursos.filter((c) => isConcluido(c.id)).length;
  const totalCount = cursos.length;
  const jornadaConcluida = totalCount > 0 && concludedCount === totalCount;
  const overallProgress = totalCount > 0 ? (concludedCount / totalCount) * 100 : 0;

  // ── Error states ──────────────────────────────────────────────

  if (!jornadaDef) {
    return (
      <div className="jornada-page">
        <Header />
        <div className="jornada-empty-state">
          <div className="empty-icon">🗺️</div>
          <h2>Jornada não encontrada</h2>
          <p>Esta jornada não existe ou ainda não foi criada.</p>
          <button className="btn-jornada-back" onClick={() => navigate("/cursos")}>
            <ArrowIcon /> Ver todas as jornadas
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="jornada-page">
        <Header />
        <div className="jornada-empty-state">
          <div className="jornada-spinner" />
          <p>Carregando jornada...</p>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────

  return (
    <div className="jornada-page">
      <Header />

      {/* Hero */}
      <div className="jornada-hero">
        <div className="jornada-hero-inner">
          <button className="btn-jornada-back" onClick={() => navigate("/cursos")}>
            <ArrowIcon /> Todas as jornadas
          </button>

          <div className="jornada-hero-body">
            <div className="jornada-badge">{jornadaDef.icon}</div>
            <div className="jornada-hero-text">
              <div className="jornada-meta-row">
                <span className="jornada-nivel">{jornadaDef.nivel}</span>
                <span className="jornada-dot">·</span>
                <span className="jornada-count">{totalCount} cursos</span>
                {jornadaConcluida && (
                  <span className="jornada-completed-badge">
                    <CheckIcon /> Concluída
                  </span>
                )}
              </div>
              <h1>{jornadaDef.titulo}</h1>
              <p>{jornadaDef.descricao}</p>

              <div className="jornada-progress-row">
                <div className="jornada-progress-track">
                  <div
                    className="jornada-progress-fill"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <span className="jornada-progress-label">
                  {concludedCount}/{totalCount} concluídos
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="jornada-body">
        <div className="jornada-timeline">
          {cursos.map((curso, index) => {
            const concluido = isConcluido(curso.id);
            const unlocked = isUnlocked(index);
            const progresso = getProgresso(curso.id);
            const matricula = getMatricula(curso.id);
            const isCurrent = unlocked && !concluido;

            return (
              <div
                key={curso.id}
                className={`jt-item ${concluido ? "jt-done" : ""} ${isCurrent ? "jt-current" : ""} ${!unlocked ? "jt-locked" : ""}`}
              >
                {/* Connector line */}
                {index < cursos.length - 1 && (
                  <div className={`jt-connector ${concluido ? "jt-connector-done" : ""}`} />
                )}

                {/* Step marker */}
                <div className="jt-marker">
                  {concluido ? <CheckIcon /> : !unlocked ? <LockIcon /> : <span>{index + 1}</span>}
                </div>

                {/* Card */}
                <div className="jt-card">
                  <div className="jt-card-top">
                    <div className="jt-card-info">
                      <div className="jt-card-meta">
                        <span className="jt-categoria">{curso.categoria}</span>
                        <span className="jt-duracao">{formatDuration(curso.duracao)}</span>
                      </div>
                      <h3 className="jt-titulo">{curso.titulo}</h3>
                      <p className="jt-descricao">{curso.descricao}</p>
                    </div>

                    {concluido && (
                      <div className="jt-done-seal">
                        <CheckIcon />
                        <span>Concluído</span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar — only when enrolled and not yet done */}
                  {matricula && !concluido && (
                    <div className="jt-progress-row">
                      <div className="jt-progress-track">
                        <div
                          className="jt-progress-fill"
                          style={{ width: `${progresso}%` }}
                        />
                      </div>
                      <span className="jt-progress-pct">{Math.round(progresso)}%</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="jt-actions">
                    {!unlocked ? (
                      <div className="jt-locked-msg">
                        <LockIcon />
                        <span>Conclua o curso anterior para desbloquear</span>
                      </div>
                    ) : concluido ? (
                      <button
                        className="jt-btn jt-btn-secondary"
                        onClick={() => navigate(`/curso/${curso.id}`)}
                      >
                        Revisar curso
                      </button>
                    ) : (
                      <button
                        className="jt-btn jt-btn-primary"
                        onClick={() => navigate(`/curso/${curso.id}`)}
                      >
                        <PlayIcon />
                        {matricula ? "Continuar curso" : "Começar curso"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Completion trophy */}
          {totalCount > 0 && (
            <div className={`jt-finish ${jornadaConcluida ? "jt-finish-done" : ""}`}>
              <div className="jt-finish-marker">
                {jornadaConcluida ? "🏆" : "🎯"}
              </div>
              <div className="jt-finish-text">
                {jornadaConcluida
                  ? "Jornada concluída! Parabéns."
                  : "Conclua todos os cursos para completar a jornada"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jornada;
