import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cursosAPI } from '../../services/api';
import Header from '../Header/Header';
import { useCourseActions } from '../../hooks/useCourseActions';
import { formatDuration } from '../../utils/format';
import '../../styles/cursos-bigtech.css';
import './meus-cursos.css';

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const BookmarkIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);

const EmptyHeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 40, height: 40 }}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const EmptyBookmarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 40, height: 40 }}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);

const MeusCursos = () => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('favoritos');
  const { favorites, watchLater, toggleFavorite, toggleWatchLater } = useCourseActions();

  useEffect(() => {
    cursosAPI.listarTodos()
      .then(r => setCursos(Array.isArray(r.data) ? r.data : []))
      .catch(() => setCursos([]))
      .finally(() => setLoading(false));
  }, []);

  const favoritados = cursos.filter(c => favorites.has(c.id));
  const assistirDepois = cursos.filter(c => watchLater.has(c.id));
  // Union count: courses in either list, no double-counting
  const totalSalvos = new Set([...favorites, ...watchLater]).size;

  const CourseCard = ({ curso }) => {
    const isFav = favorites.has(curso.id);
    const isWL = watchLater.has(curso.id);
    return (
      <div className="mc-card" onClick={() => navigate(`/curso/${curso.id}`)}>
        <div className="mc-card-top">
          <span className="mc-card-category">{curso.categoria}</span>
          <div className="mc-card-actions">
            <button
              className={`mc-icon-btn fav${isFav ? ' active' : ''}`}
              onClick={e => { e.stopPropagation(); toggleFavorite(curso.id); }}
              title={isFav ? 'Remover dos favoritos' : 'Favoritar'}
            >
              <HeartIcon filled={isFav} />
            </button>
            <button
              className={`mc-icon-btn wl${isWL ? ' active' : ''}`}
              onClick={e => { e.stopPropagation(); toggleWatchLater(curso.id); }}
              title={isWL ? 'Remover de assistir depois' : 'Salvar para depois'}
            >
              <BookmarkIcon filled={isWL} />
            </button>
          </div>
        </div>
        <div className="mc-card-body">
          <h3 className="mc-card-title">{curso.titulo}</h3>
          <p className="mc-card-desc">{curso.descricao}</p>
        </div>
        <div className="mc-card-footer">
          <span className="mc-card-instructor">{curso.instrutor}</span>
          <span className="mc-card-duration">{formatDuration(curso.duracao)}</span>
        </div>
        <button className="mc-card-cta" onClick={e => { e.stopPropagation(); navigate(`/curso/${curso.id}`); }}>
          Ver Curso
        </button>
      </div>
    );
  };

  const EmptyState = ({ icon, title, subtitle }) => (
    <div className="mc-empty">
      <div className="mc-empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
      <button className="mc-empty-cta" onClick={() => navigate('/cursos')}>
        Explorar Cursos
      </button>
    </div>
  );

  return (
    <div className="courses-page">
      <Header />
      <div className="mc-page">
        {loading ? (
          <div className="courses-loading">
            <div className="loading-spinner" />
            <p>Carregando...</p>
          </div>
        ) : (
          <>
            <div className="mc-page-header">
              <div className="mc-page-header-text">
                <h1>Meus Cursos</h1>
                <p>Gerencie seus favoritos e cursos salvos para assistir depois.</p>
              </div>
              <div className="mc-page-header-stats">
                <div className="mc-stat">
                  <span className="mc-stat-value">{favoritados.length}</span>
                  <span className="mc-stat-label">Favoritos</span>
                </div>
                <div className="mc-stat-divider" />
                <div className="mc-stat">
                  <span className="mc-stat-value">{assistirDepois.length}</span>
                  <span className="mc-stat-label">Assistir Depois</span>
                </div>
                <div className="mc-stat-divider" />
                <div className="mc-stat">
                  <span className="mc-stat-value">{totalSalvos}</span>
                  <span className="mc-stat-label">Total Salvos</span>
                </div>
              </div>
            </div>

            <div className="mc-tabs">
              <button
                className={`mc-tab${activeSection === 'favoritos' ? ' active' : ''}`}
                onClick={() => setActiveSection('favoritos')}
              >
                <HeartIcon filled={activeSection === 'favoritos'} />
                Favoritos
                <span className="mc-tab-count">{favoritados.length}</span>
              </button>
              <button
                className={`mc-tab${activeSection === 'assistir' ? ' active' : ''}`}
                onClick={() => setActiveSection('assistir')}
              >
                <BookmarkIcon filled={activeSection === 'assistir'} />
                Assistir Depois
                <span className="mc-tab-count">{assistirDepois.length}</span>
              </button>
            </div>

            {activeSection === 'favoritos' ? (
              favoritados.length > 0 ? (
                <div className="mc-grid">
                  {favoritados.map(c => <CourseCard key={c.id} curso={c} />)}
                </div>
              ) : (
                <EmptyState
                  icon={<EmptyHeartIcon />}
                  title="Nenhum favorito ainda"
                  subtitle="Explore os cursos e clique no coração para salvar seus favoritos aqui."
                />
              )
            ) : (
              assistirDepois.length > 0 ? (
                <div className="mc-grid">
                  {assistirDepois.map(c => <CourseCard key={c.id} curso={c} />)}
                </div>
              ) : (
                <EmptyState
                  icon={<EmptyBookmarkIcon />}
                  title="Nenhum curso salvo"
                  subtitle="Use o ícone de marcador nos cursos para salvá-los aqui e assistir quando quiser."
                />
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MeusCursos;
