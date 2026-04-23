import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cursosAPI, matriculasAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../Header/Header";
import { useCourseActions } from "../../hooks/useCourseActions";
import { formatDuration } from "../../utils/format";
import { getJornadas } from "../../config/jornadas";
import "../../styles/cursos-bigtech.css";

const Cursos = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [categoria, setCategoria] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("cursos");
  const [jornadas, setJornadas] = useState(getJornadas);
  const { favorites, watchLater, toggleFavorite, toggleWatchLater } = useCourseActions();

  useEffect(() => {
    carregarCursos();
    if (usuario) {
      matriculasAPI.minhasMatriculas()
        .then((r) => setMatriculas(Array.isArray(r.data) ? r.data : []))
        .catch(() => {});
    }
  }, [usuario]);

  useEffect(() => {
    if (activeTab === 'jornadas') setJornadas(getJornadas());
  }, [activeTab]);

  const carregarCursos = async () => {
    try {
      const response = await cursosAPI.listarTodos();
      setCursos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
      setCursos([]);
    } finally {
      setLoading(false);
    }
  };

  const buscarCursos = async () => {
    if (!filtro.trim()) {
      carregarCursos();
      return;
    }
    try {
      setLoading(true);
      const response = await cursosAPI.buscarPorTitulo(filtro.trim());
      setCursos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      setCursos([]);
    } finally {
      setLoading(false);
    }
  };

  const filtrarPorCategoria = async (cat) => {
    setCategoria(cat);
    setFiltro("");

    if (!cat) {
      carregarCursos();
      return;
    }

    try {
      setLoading(true);
      const response = await cursosAPI.buscarPorCategoria(cat);
      setCursos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erro ao filtrar cursos:", error);
      setCursos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="courses-loading">
          <div className="loading-spinner"></div>
          <p>Carregando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <Header />
      <div className="courses-container">
        <div className="courses-hero">
          <h1>LEARNLY</h1>
          <p>
            A plataforma de cursos mais avançada do Brasil. Conteúdo exclusivo,
            instrutores renomados e tecnologia de ponta para acelerar sua
            carreira.
          </p>
        </div>

        <div className="course-filters">
          <div className="filters-header">
            <h2 className="filters-title">Descubra seu próximo nível</h2>
            <div className="filters-stats">
              <span className="stats-badge">
                {activeTab === 'cursos' ? `${cursos.length} Cursos Premium` : `${jornadas.length} Jornadas Disponíveis`}
              </span>
              {activeTab === 'cursos' && (
                <div className="view-toggle">
                  <button
                    className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                    onClick={() => setViewMode("grid")}
                    title="Visualização em Grade"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
                    </svg>
                  </button>
                  <button
                    className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                    onClick={() => setViewMode("list")}
                    title="Visualização em Lista"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {activeTab === 'cursos' && (
            <div className="filters-controls">
              <div className="search-group">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Digite sua próxima habilidade... (React, Python, Node.js)"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && buscarCursos()}
                />
              </div>

              <select
                className="category-select"
                value={categoria}
                onChange={(e) => filtrarPorCategoria(e.target.value)}
              >
                <option value="">Explorar Tudo</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Data Science">Data Science</option>
                <option value="Database">Database</option>
                <option value="DevOps">DevOps</option>
                <option value="Mobile">Mobile</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Negócios">Negócios</option>
                <option value="Idiomas">Idiomas</option>
                <option value="Música">Música</option>
                <option value="Violão">Violão</option>
                <option value="Canto">Canto</option>
                <option value="Fotografia">Fotografia</option>
                <option value="Saúde">Saúde</option>
                <option value="Diversos">Diversos</option>
              </select>
              


              <button className="btn-search" onClick={buscarCursos}>
                Buscar
              </button>

              <button
                className="btn-clear"
                onClick={() => {
                  setFiltro("");
                  setCategoria("");
                  carregarCursos();
                }}
              >
                Limpar
              </button>
            </div>
          )}
        </div>

        <div className="courses-tabs">
          <button 
            className={`tab-btn ${activeTab === 'cursos' ? 'active' : ''}`} 
            onClick={() => setActiveTab('cursos')}
          >
            Todos os Cursos
          </button>
          <button 
            className={`tab-btn ${activeTab === 'jornadas' ? 'active' : ''}`} 
            onClick={() => setActiveTab('jornadas')}
          >
            Jornadas
          </button>
        </div>

        {activeTab === 'cursos' ? (
          <div className={`courses-grid ${viewMode}`}>
            {cursos.map((curso, index) => (
              <div
                key={curso.id}
                className="course-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {curso.imagem && (
                  <div className="course-cover">
                    <img
                      src={curso.imagem}
                      alt={curso.titulo}
                      className="course-cover-img"
                      onError={(e) => { e.currentTarget.closest('.course-cover').style.display = 'none'; }}
                    />
                  </div>
                )}
                <div className="course-card-body">
                  <div className="course-header">
                  <div className="course-category">{curso.categoria}</div>
                  <div className="course-card-icons">
                    <button
                      className={`card-icon-btn${favorites.has(curso.id) ? ' active-fav' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(curso.id); }}
                      title={favorites.has(curso.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      aria-label="Favoritar"
                    >
                      <svg viewBox="0 0 24 24" fill={favorites.has(curso.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                    <button
                      className={`card-icon-btn${watchLater.has(curso.id) ? ' active-wl' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleWatchLater(curso.id); }}
                      title={watchLater.has(curso.id) ? 'Remover de assistir depois' : 'Salvar para assistir depois'}
                      aria-label="Assistir depois"
                    >
                      <svg viewBox="0 0 24 24" fill={watchLater.has(curso.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                    </button>
                    <div className="course-duration">{formatDuration(curso.duracao)}</div>
                  </div>
                  </div>

                  <h3 className="course-title">{curso.titulo}</h3>
                  <p className="course-description">{curso.descricao}</p>

                  <div className="course-instructor">
                    Instrutor: {curso.instrutor}
                  </div>

                  <div className="course-actions">
                    <button
                      className="btn-watch"
                      onClick={() => navigate(`/curso/${curso.id}/intro`)}
                    >
                      Ver Curso
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
            <div className="jornadas-grid">
            {jornadas.map((jornada, index) => {
              // Resolve real course names from loaded courses list
              const jornadaCursos = jornada.cursoIds
                .map((id) => cursos.find((c) => c.id === id))
                .filter(Boolean);

              // Real progress: count concluded courses
              const concludedCount = jornada.cursoIds.filter((id) =>
                matriculas.some(
                  (m) => (m.cursoId === id || m.curso_id === id) && (m.concluido === true || m.concluido === 1)
                )
              ).length;
              const totalCount = jornada.cursoIds.length;
              const progressPct = totalCount > 0 ? (concludedCount / totalCount) * 100 : 0;
              const jornadaDone = totalCount > 0 && concludedCount === totalCount;

              return (
                <div key={jornada.slug} className="jornada-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="jornada-header">
                    <div className="jornada-icon">{jornada.icon}</div>
                    <div className="jornada-info">
                      <h3 className="jornada-title">{jornada.titulo}</h3>
                      <p className="jornada-description">{jornada.descricao}</p>
                    </div>
                  </div>

                  <div className="jornada-stats">
                    <span className="stat-item">{totalCount} Cursos</span>
                    <span className="stat-item">{jornada.nivel}</span>
                    {jornadaDone && <span className="stat-item stat-done">✓ Concluída</span>}
                  </div>

                  {/* Progress bar — only shown when user is logged in */}
                  {usuario && (
                    <div className="jornada-card-progress">
                      <div className="jornada-card-track">
                        <div className="jornada-card-fill" style={{ width: `${progressPct}%` }} />
                      </div>
                      <span className="jornada-card-pct">{concludedCount}/{totalCount}</span>
                    </div>
                  )}

                  <div className="jornada-courses">
                    {jornadaCursos.map((curso, idx) => {
                      const done = matriculas.some(
                        (m) => (m.cursoId === curso.id || m.curso_id === curso.id) && (m.concluido === true || m.concluido === 1)
                      );
                      return (
                        <div key={curso.id} className={`mini-course ${done ? 'mini-course-done' : ''}`}>
                          <span className="course-number">{done ? '✓' : idx + 1}</span>
                          <span className="course-name">{curso.titulo}</span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    className="btn-jornada"
                    onClick={() => navigate(`/jornada/${jornada.slug}`)}
                  >
                    {concludedCount > 0 ? "Continuar Jornada" : "Iniciar Jornada"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'cursos' && cursos.length === 0 && (
          <div className="no-courses">
            <svg
              className="no-courses-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <h3>Nenhum curso encontrado</h3>
            <p>
              Não encontramos cursos com esses critérios. Tente ajustar seus
              filtros ou explore outras categorias.
            </p>
            <button
              className="btn-primary"
              onClick={() => {
                setFiltro("");
                setCategoria("");
                carregarCursos();
              }}
            >
              Explorar Todos os Cursos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cursos;
