import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalSearch } from '../search/useGlobalSearch';
import '../styles/global-search.css';

// ── Type metadata ─────────────────────────────────────────────────────────────
const TYPE_META = {
  page:    { label: 'Página',       color: '#60a5fa' },
  section: { label: 'Seção',        color: '#a78bfa' },
  course:  { label: 'Curso',        color: '#ffd700' },
  jornada: { label: 'Jornada',      color: '#34d399' },
  lesson:  { label: 'Aula',         color: '#fb923c' },
  setting: { label: 'Configuração', color: '#f472b6' },
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="gs-icon">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const SpinnerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="gs-icon gs-spinner">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
      strokeDasharray="31.4" strokeLinecap="round"/>
  </svg>
);

const ClearIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="gs-clear-icon">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="gs-result-arrow">
    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" className="gs-recent-icon">
    <circle cx="12" cy="12" r="9"/>
    <polyline points="12 7 12 12 15 14"/>
  </svg>
);

// ── Highlighted text ──────────────────────────────────────────────────────────
const Highlighted = ({ text, highlight }) => {
  if (!highlight || typeof highlight !== 'object') return <>{text}</>;
  return (
    <>
      {highlight.before}
      <mark className="gs-mark">{highlight.match}</mark>
      {highlight.after}
    </>
  );
};

// ── Result row (no icon cell) ─────────────────────────────────────────────────
const ResultRow = ({ result, isActive, itemRef, query, highlight: hl, onClick }) => {
  const meta   = TYPE_META[result.type] ?? { label: result.type, color: '#888' };
  const labelHL = hl(result.label, query);
  return (
    <button
      ref={isActive ? itemRef : null}
      className={`gs-result${isActive ? ' gs-result-active' : ''}`}
      onClick={onClick}
      role="option"
      aria-selected={isActive}
    >
      <span className="gs-result-body">
        <span className="gs-result-label">
          <Highlighted text={result.label} highlight={labelHL} />
        </span>
        <span className="gs-result-sub">{result.sublabel}</span>
      </span>
      <span className="gs-result-type" style={{ color: meta.color, borderColor: `${meta.color}28` }}>
        {meta.label}
      </span>
      <ArrowIcon />
    </button>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const GlobalSearch = () => {
  const navigate     = useNavigate();
  const { usuario }  = useAuth();
  const inputRef     = useRef(null);
  const containerRef = useRef(null);

  const {
    query, setQuery,
    results, recent,
    loading,
    activeIndex, activeItemRef,
    open, setOpen,
    openWithRecent,
    handleKeyDown,
    selectResult,
    highlight,
  } = useGlobalSearch(usuario);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setOpen]);

  // Global shortcut: / or Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      if (
        (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') ||
        (e.key === 'k' && (e.ctrlKey || e.metaKey))
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        openWithRecent();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [openWithRecent]);

  const onSelect = (result) => {
    selectResult(result, (r) => navigate(r.route));
    inputRef.current?.blur();
  };

  const hasQuery    = query.trim().length >= 2;
  const showPanel   = open && (hasQuery || recent.length > 0);
  const showLoader  = hasQuery && loading;
  const showResults = hasQuery && !loading && results.length > 0;
  const showEmpty   = hasQuery && !loading && results.length === 0;
  const showRecent  = !hasQuery && recent.length > 0;

  const grouped = results.reduce((acc, r) => {
    const g = r.type === 'course'  ? 'Cursos'       :
              r.type === 'jornada' ? 'Jornadas'      :
              r.type === 'setting' ? 'Configurações' :
              r.type === 'section' ? 'Seções'        : 'Páginas';
    if (!acc[g]) acc[g] = [];
    acc[g].push(r);
    return acc;
  }, {});

  const flatResults = Object.values(grouped).flat();

  return (
    <div className="gs-container" ref={containerRef}>

      {/* ── Input bar — original design ── */}
      <div
        className={`gs-input-wrap${open ? ' gs-focused' : ''}`}
        onClick={() => { inputRef.current?.focus(); openWithRecent(); }}
      >
        {loading ? <SpinnerIcon /> : <SearchIcon />}

        <input
          ref={inputRef}
          type="text"
          className="gs-input"
          placeholder="Buscar cursos, páginas, configurações..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={openWithRecent}
          onKeyDown={(e) => handleKeyDown(e, onSelect)}
          autoComplete="off"
          spellCheck={false}
          aria-label="Busca global"
          aria-expanded={showPanel}
          aria-haspopup="listbox"
          role="combobox"
        />

        {query && (
          <button
            className="gs-clear-btn"
            onClick={(e) => { e.stopPropagation(); setQuery(''); inputRef.current?.focus(); }}
            aria-label="Limpar busca"
            tabIndex={-1}
          >
            <ClearIcon />
          </button>
        )}
      </div>

      {/* ── Results panel — refined design ── */}
      {showPanel && (
        <div className="gs-dropdown" role="listbox">

          {/* Loading skeleton */}
          {showLoader && (
            <div className="gs-loading-rows">
              {[60, 80, 50].map((w, i) => (
                <div key={i} className="gs-skeleton-row">
                  <div className="gs-skeleton-text">
                    <div className="gs-skeleton gs-skeleton-label" style={{ width: `${w}%` }} />
                    <div className="gs-skeleton gs-skeleton-sub"   style={{ width: `${w + 15}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grouped results */}
          {showResults && Object.entries(grouped).map(([groupName, items]) => (
            <div key={groupName} className="gs-group">
              <div className="gs-group-label">{groupName}</div>
              {items.map((result) => {
                const flatIdx = flatResults.indexOf(result);
                return (
                  <ResultRow
                    key={result.id}
                    result={result}
                    isActive={flatIdx === activeIndex}
                    itemRef={activeItemRef}
                    query={query}
                    highlight={highlight}
                    onClick={() => onSelect(result)}
                  />
                );
              })}
            </div>
          ))}

          {/* Empty state */}
          {showEmpty && (
            <div className="gs-empty">
              <p className="gs-empty-title">Sem resultados para "{query}"</p>
            </div>
          )}

          {/* Recent searches */}
          {showRecent && (
            <div className="gs-group">
              <div className="gs-group-label">Recentes</div>
              {recent.map((result, i) => (
                <button
                  key={result.id}
                  ref={i === activeIndex ? activeItemRef : null}
                  className={`gs-result${i === activeIndex ? ' gs-result-active' : ''}`}
                  onClick={() => onSelect(result)}
                  role="option"
                  aria-selected={i === activeIndex}
                >
                  <ClockIcon />
                  <span className="gs-result-body">
                    <span className="gs-result-label">{result.label}</span>
                    <span className="gs-result-sub">{result.sublabel}</span>
                  </span>
                  <ArrowIcon />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
