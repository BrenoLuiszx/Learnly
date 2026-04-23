import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cursosAPI, aulasAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../Header/Header";
import { saveLastCourse } from "../../utils/lastCourse";
import "../../styles/aula-player.css";

const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
};

const AulaPlayer = () => {
  const { cursoId, aulaId } = useParams();
  const navigate = useNavigate();
  const { usuario: user } = useAuth();

  const [curso, setCurso] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [aulaAtual, setAulaAtual] = useState(null);
  const [progressoAulas, setProgressoAulas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    carregarDados();
  }, [cursoId, aulaId, user]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [cursoDados, aulasDados, progressoDados] = await Promise.all([
        cursosAPI.buscarPorId(cursoId),
        aulasAPI.listarPorCurso(cursoId),
        aulasAPI.progresso(cursoId).catch(() => ({ data: [] }))
      ]);

      setCurso(cursoDados.data);
      setAulas(aulasDados.data || []);
      setProgressoAulas(progressoDados.data || []);

      const aula = (aulasDados.data || []).find(a => a.id === Number(aulaId));
      setAulaAtual(aula);

      // Record after data is loaded so we can include the lesson title
      saveLastCourse(Number(cursoId), Number(aulaId), aula?.titulo ?? null);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAulaConcluida = async (aula) => {
    const jaConcluida = progressoAulas.some(p => p.aulaId === aula.id && p.concluido);
    try {
      if (jaConcluida) {
        await aulasAPI.desconcluir(aula.id);
      } else {
        await aulasAPI.concluir(aula.id);
      }
      const progressoDados = await aulasAPI.progresso(cursoId);
      setProgressoAulas(progressoDados.data || []);
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
    }
  };

  const irParaAula = (aula) => {
    saveLastCourse(Number(cursoId), aula.id, aula.titulo);
    navigate(`/curso/${cursoId}/aula/${aula.id}`);
  };

  const proximaAula = () => {
    if (!aulaAtual) return;
    const indexAtual = aulas.findIndex(a => a.id === aulaAtual.id);
    if (indexAtual < aulas.length - 1) {
      irParaAula(aulas[indexAtual + 1]);
    }
  };

  const aulaAnterior = () => {
    if (!aulaAtual) return;
    const indexAtual = aulas.findIndex(a => a.id === aulaAtual.id);
    if (indexAtual > 0) {
      irParaAula(aulas[indexAtual - 1]);
    }
  };

  const videoId = getYouTubeId(aulaAtual?.url);
  const indexAtual = aulas.findIndex(a => a.id === aulaAtual?.id);
  const temProxima = indexAtual < aulas.length - 1;
  const temAnterior = indexAtual > 0;

  if (loading) {
    return (
      <div>
        <Header />
        <div className="aula-player-loading">
          <div className="loading-spinner"></div>
          <p>Carregando aula...</p>
        </div>
      </div>
    );
  }

  if (!aulaAtual) {
    return (
      <div>
        <Header />
        <div className="aula-player-error">
          <h2>Aula não encontrada</h2>
          <button onClick={() => navigate(`/curso/${cursoId}`)} className="btn-voltar">
            ← Voltar ao Curso
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="aula-player-page">
      <Header />
      
      <div className="aula-player-container">
        {/* Player Principal */}
        <div className="aula-player-main">
          <div className="player-wrapper">
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={aulaAtual.titulo}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="player-fallback">
                <p>Não foi possível carregar o vídeo.</p>
                <a href={aulaAtual.url} target="_blank" rel="noopener noreferrer" className="btn-externo">
                  Abrir link externo
                </a>
              </div>
            )}
          </div>

          {/* Informações da Aula */}
          <div className="aula-info-section">
            <div className="aula-header">
              <div>
                <div className="aula-breadcrumb">
                  <button onClick={() => navigate(`/curso/${cursoId}`)} className="breadcrumb-link">
                    {curso?.titulo}
                  </button>
                  <span className="breadcrumb-separator">›</span>
                  <span className="breadcrumb-current">Aula {aulaAtual.ordem}</span>
                </div>
                <h1 className="aula-titulo">{aulaAtual.titulo}</h1>
                {aulaAtual.descricao && (
                  <p className="aula-descricao">{aulaAtual.descricao}</p>
                )}
              </div>
              <button
                onClick={() => toggleAulaConcluida(aulaAtual)}
                className={`btn-concluir-aula ${progressoAulas.some(p => p.aulaId === aulaAtual.id && p.concluido) ? 'concluida' : ''}`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                {progressoAulas.some(p => p.aulaId === aulaAtual.id && p.concluido) ? 'Concluída' : 'Marcar como Concluída'}
              </button>
            </div>

            {/* Navegação entre aulas */}
            <div className="aula-navegacao">
              <button
                onClick={() => navigate(`/curso/${cursoId}`)}
                className="btn-nav-aula btn-voltar-curso"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                Voltar ao Curso
              </button>
              <button
                onClick={aulaAnterior}
                disabled={!temAnterior}
                className="btn-nav-aula"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
                Anterior
              </button>
              <button
                onClick={proximaAula}
                disabled={!temProxima}
                className="btn-nav-aula btn-proxima"
              >
                Próxima
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar com lista de aulas */}
        <div className="aula-player-sidebar">
          <div className="sidebar-header">
            <h3>Conteúdo do Curso</h3>
            <span className="aulas-count">{aulas.length} aulas</span>
          </div>
          
          <div className="aulas-lista-sidebar">
            {aulas.map((aula) => {
              const concluida = progressoAulas.some(p => p.aulaId === aula.id && p.concluido);
              const ativa = aula.id === aulaAtual.id;
              
              return (
                <div
                  key={aula.id}
                  className={`aula-item-sidebar ${ativa ? 'ativa' : ''} ${concluida ? 'concluida' : ''}`}
                  onClick={() => irParaAula(aula)}
                >
                  <div className="aula-numero-sidebar">{aula.ordem}</div>
                  <div className="aula-info-sidebar">
                    <h4>{aula.titulo}</h4>
                    {concluida && (
                      <div className="aula-concluida-badge">
                        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}>
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                        Concluída
                      </div>
                    )}
                  </div>
                  {ativa && (
                    <div className="aula-playing-indicator">
                      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}>
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AulaPlayer;
