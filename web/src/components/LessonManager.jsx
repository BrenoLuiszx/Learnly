import React, { useState, useEffect } from 'react';
import { getYouTubeId } from '../utils/format';

const getThumbnail = (url) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
};

const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const IconChevronUp = ({ disabled }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style={{ opacity: disabled ? 0.2 : 0.7 }}>
    <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
  </svg>
);

const IconChevronDown = ({ disabled }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style={{ opacity: disabled ? 0.2 : 0.7 }}>
    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
  </svg>
);

const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

const IconWarning = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    background: '#18181b', border: '1px solid rgba(255,215,0,0.18)',
    borderRadius: '1.5rem', width: '100%', maxWidth: '1160px',
    maxHeight: '94vh', display: 'flex', flexDirection: 'column',
    boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.07)',
    flexShrink: 0,
  },
  headerTitle: { color: '#f4f4f5', fontSize: '1.35rem', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' },
  headerSub: { color: '#71717a', fontSize: '0.88rem', margin: '4px 0 0', fontWeight: 400 },
  btnAdd: {
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '10px 20px', background: 'rgba(255,215,0,0.12)',
    border: '1.5px solid rgba(255,215,0,0.4)', borderRadius: '10px',
    color: '#ffd700', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
    transition: 'all 0.15s',
  },
  btnClose: {
    width: '38px', height: '38px', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%',
    color: '#a1a1aa', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
  },
  body: { display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' },

  // Left panel
  leftPanel: {
    width: '380px', flexShrink: 0,
    borderRight: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  leftScroll: { flex: 1, overflowY: 'auto', padding: '16px' },
  emptyState: {
    textAlign: 'center', padding: '56px 24px', color: '#52525b',
  },
  emptyIcon: { fontSize: '3rem', marginBottom: '12px' },
  emptyTitle: { fontSize: '1rem', fontWeight: 600, margin: '0 0 6px', color: '#71717a' },
  emptyHint: { fontSize: '0.85rem', margin: 0, color: '#52525b' },
  lessonList: { display: 'flex', flexDirection: 'column', gap: '8px' },

  lessonItem: (isActive) => ({
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '14px 14px', borderRadius: '12px', cursor: 'pointer',
    background: isActive ? 'rgba(255,215,0,0.09)' : 'rgba(255,255,255,0.03)',
    border: `1.5px solid ${isActive ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.07)'}`,
    transition: 'all 0.15s',
  }),
  orderCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 },
  orderBtn: (disabled) => ({
    background: 'none', border: 'none', padding: '3px 5px',
    cursor: disabled ? 'not-allowed' : 'pointer', lineHeight: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }),
  orderBadge: (isActive) => ({
    width: '28px', height: '28px', borderRadius: '8px',
    background: isActive ? '#ffd700' : '#27272a',
    color: isActive ? '#000' : '#ffd700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.78rem', fontWeight: 800, flexShrink: 0,
  }),
  thumb: (t) => ({
    width: '64px', height: '44px', borderRadius: '8px', flexShrink: 0,
    background: t ? `url(${t}) center/cover` : '#27272a',
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
  }),
  thumbIcon: { color: '#52525b' },
  lessonMeta: { flex: 1, minWidth: 0 },
  lessonTitle: (hasTitle) => ({
    color: hasTitle ? '#f4f4f5' : '#52525b',
    fontSize: '0.9rem', fontWeight: 600, margin: 0,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    fontStyle: hasTitle ? 'normal' : 'italic',
  }),
  lessonDesc: {
    color: '#71717a', fontSize: '0.78rem', margin: '3px 0 0',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  urlMissing: {
    display: 'flex', alignItems: 'center', gap: '4px',
    color: '#f87171', fontSize: '0.75rem', margin: '3px 0 0', fontWeight: 500,
  },
  removeBtn: (disabled) => ({
    background: 'none', border: 'none', flexShrink: 0,
    color: disabled ? '#3f3f46' : '#52525b',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: '6px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
  }),

  // Right panel
  rightPanel: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  placeholder: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '14px', color: '#52525b', padding: '48px',
  },
  placeholderIcon: { fontSize: '3.5rem', opacity: 0.5 },
  placeholderTitle: { fontSize: '1.05rem', fontWeight: 600, margin: 0, color: '#71717a' },
  placeholderHint: { fontSize: '0.88rem', margin: 0, color: '#52525b', textAlign: 'center' },

  editorScroll: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  previewArea: { background: '#0f0f10', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 },
  previewRatio: { position: 'relative', paddingBottom: '40%', height: 0 },
  previewIframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  previewEmpty: {
    padding: '28px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', minHeight: '90px',
  },
  previewEmptyText: { color: '#52525b', fontSize: '0.88rem' },

  fields: { padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '22px' },
  badgeRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  badge: {
    background: 'rgba(255,215,0,0.12)', color: '#ffd700',
    border: '1.5px solid rgba(255,215,0,0.28)', borderRadius: '8px',
    padding: '4px 12px', fontSize: '0.78rem', fontWeight: 800,
    letterSpacing: '0.03em',
  },
  posLabel: { color: '#71717a', fontSize: '0.82rem', fontWeight: 500 },
  posInput: {
    width: '58px', padding: '5px 8px',
    background: '#27272a', border: '1px solid #3f3f46',
    borderRadius: '8px', color: '#ffd700',
    fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', fontFamily: 'inherit',
    outline: 'none',
  },
  fieldGroup: {},
  label: {
    display: 'block', fontSize: '0.75rem', fontWeight: 700,
    color: '#a1a1aa', marginBottom: '8px',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  input: (valid) => ({
    width: '100%', padding: '12px 16px',
    background: '#0f0f10',
    border: `1.5px solid ${valid === false ? 'rgba(248,113,113,0.5)' : '#3f3f46'}`,
    borderRadius: '10px', color: '#f4f4f5',
    fontSize: '0.95rem', fontFamily: 'inherit',
    boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.15s',
  }),
  textarea: {
    width: '100%', padding: '12px 16px',
    background: '#0f0f10', border: '1.5px solid #3f3f46',
    borderRadius: '10px', color: '#f4f4f5',
    fontSize: '0.95rem', fontFamily: 'inherit',
    resize: 'vertical', boxSizing: 'border-box', outline: 'none',
    lineHeight: 1.6, transition: 'border-color 0.15s',
  },
  urlOk: { display: 'flex', alignItems: 'center', gap: '5px', color: '#34d399', fontSize: '0.78rem', margin: '6px 0 0', fontWeight: 600 },
  urlWarn: { display: 'flex', alignItems: 'center', gap: '5px', color: '#fbbf24', fontSize: '0.78rem', margin: '6px 0 0', fontWeight: 500 },
  navRow: { display: 'flex', gap: '10px', paddingTop: '4px' },
  navBtn: (disabled) => ({
    flex: 1, padding: '11px 16px',
    background: '#27272a', border: '1.5px solid #3f3f46',
    borderRadius: '10px', color: disabled ? '#3f3f46' : '#a1a1aa',
    fontSize: '0.88rem', fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
  }),

  // Footer
  footer: {
    display: 'flex', gap: '12px', padding: '20px 32px',
    borderTop: '1px solid rgba(255,255,255,0.07)',
    flexShrink: 0, alignItems: 'center',
  },
  footerMsg: (isError) => ({
    flex: 1, margin: 0, fontSize: '0.88rem', fontWeight: 600,
    color: isError ? '#f87171' : '#34d399',
  }),
  btnSave: (loading) => ({
    padding: '11px 28px',
    background: loading ? '#27272a' : '#ffd700',
    border: 'none', borderRadius: '10px',
    color: loading ? '#52525b' : '#000',
    fontSize: '0.95rem', fontWeight: 800,
    cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
  }),
  btnCancel: {
    padding: '11px 22px',
    background: '#27272a', border: '1.5px solid #3f3f46',
    borderRadius: '10px', color: '#a1a1aa',
    fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
  },
};

const LessonManager = ({
  curso, aulas, loading, msg,
  onSave, onClose, onAdd, onRemove, onUpdate, onMove, onMoveToPos,
}) => {
  const [activeIdx, setActiveIdx] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (activeIdx !== null && aulas[activeIdx]) {
      setPreviewUrl(aulas[activeIdx].url || '');
    }
  }, [activeIdx, aulas]);

  const hasAulas = aulas.length > 0;
  const activeAula = activeIdx !== null ? aulas[activeIdx] : null;
  const closeModal = () => { setActiveIdx(null); onClose(); };
  const stop = (fn) => (e) => { e.stopPropagation(); fn && fn(e); };
  const videoId = getYouTubeId(previewUrl);
  const isError = msg && (msg.toLowerCase().includes('erro') || msg.toLowerCase().includes('precisam'));

  return (
    <div style={s.overlay}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div style={s.header}>
          <div>
            <h2 style={s.headerTitle}>Gerenciar Aulas</h2>
            <p style={s.headerSub}>{curso?.titulo} · {aulas.length} {aulas.length === 1 ? 'aula' : 'aulas'}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button type="button" onClick={stop(onAdd)} style={s.btnAdd}>
              <IconPlus /> Adicionar Aula
            </button>
            <button type="button" onClick={stop(closeModal)} style={s.btnClose}>
              <IconClose />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={s.body}>

          {/* Left: lesson list */}
          <div style={s.leftPanel}>
            <div style={s.leftScroll}>
              {!hasAulas ? (
                <div style={s.emptyState}>
                  <div style={s.emptyIcon}>🎬</div>
                  <p style={s.emptyTitle}>Nenhuma aula ainda</p>
                  <p style={s.emptyHint}>Clique em "Adicionar Aula" para começar.</p>
                </div>
              ) : (
                <div style={s.lessonList}>
                  {aulas.map((aula, idx) => {
                    const isActive = activeIdx === idx;
                    const t = getThumbnail(aula.url);
                    return (
                      <div key={idx} onClick={stop(() => setActiveIdx(isActive ? null : idx))} style={s.lessonItem(isActive)}>

                        {/* Order controls */}
                        <div style={s.orderCol} onClick={e => e.stopPropagation()}>
                          <button type="button" onClick={stop(() => onMove(idx, -1))} disabled={idx === 0} style={s.orderBtn(idx === 0)}>
                            <IconChevronUp disabled={idx === 0} />
                          </button>
                          <div style={s.orderBadge(isActive)}>{aula.ordem || idx + 1}</div>
                          <button type="button" onClick={stop(() => onMove(idx, 1))} disabled={idx === aulas.length - 1} style={s.orderBtn(idx === aulas.length - 1)}>
                            <IconChevronDown disabled={idx === aulas.length - 1} />
                          </button>
                        </div>

                        {/* Thumbnail */}
                        <div style={s.thumb(t)}>
                          {!t && <span style={s.thumbIcon}><IconPlay /></span>}
                        </div>

                        {/* Meta */}
                        <div style={s.lessonMeta}>
                          <p style={s.lessonTitle(!!aula.titulo)}>{aula.titulo || 'Sem título'}</p>
                          {aula.descricao && <p style={s.lessonDesc}>{aula.descricao}</p>}
                          {!aula.url && (
                            <span style={s.urlMissing}>
                              <IconWarning /> URL obrigatória
                            </span>
                          )}
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={stop(() => { onRemove(idx); if (activeIdx === idx) setActiveIdx(null); })}
                          disabled={aulas.length === 1}
                          style={s.removeBtn(aulas.length === 1)}
                          title="Remover aula"
                          onMouseEnter={e => { if (aulas.length > 1) e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = aulas.length === 1 ? '#3f3f46' : '#52525b'; e.currentTarget.style.background = 'none'; }}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: editor */}
          <div style={s.rightPanel}>
            {activeAula === null ? (
              <div style={s.placeholder}>
                <div style={s.placeholderIcon}>🎬</div>
                <p style={s.placeholderTitle}>Selecione uma aula para editar</p>
                <p style={s.placeholderHint}>Clique em qualquer aula na lista ao lado<br />ou adicione uma nova para começar.</p>
              </div>
            ) : (
              <div style={s.editorScroll}>

                {/* Preview */}
                <div style={s.previewArea}>
                  {videoId ? (
                    <div style={s.previewRatio}>
                      <iframe
                        key={previewUrl}
                        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                        title={activeAula.titulo || 'Preview'}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={s.previewIframe}
                      />
                    </div>
                  ) : (
                    <div style={s.previewEmpty}>
                      <span style={s.previewEmptyText}>Cole uma URL do YouTube para ver o preview</span>
                    </div>
                  )}
                </div>

                {/* Fields */}
                <div style={s.fields}>

                  {/* Badge + position */}
                  <div style={s.badgeRow}>
                    <span style={s.badge}>Aula {activeAula.ordem || activeIdx + 1}</span>
                    <span style={s.posLabel}>Posição:</span>
                    <input
                      type="number" min={1} max={aulas.length}
                      value={activeAula.ordem || activeIdx + 1}
                      onChange={e => onMoveToPos(activeIdx, parseInt(e.target.value) || 1)}
                      onClick={e => e.stopPropagation()}
                      style={s.posInput}
                    />
                  </div>

                  {/* Title */}
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Título da Aula *</label>
                    <input
                      type="text" placeholder="Ex: Introdução ao React"
                      value={activeAula.titulo}
                      onChange={e => onUpdate(activeIdx, 'titulo', e.target.value)}
                      onClick={e => e.stopPropagation()}
                      style={s.input(activeAula.titulo ? null : false)}
                      onFocus={e => e.target.style.borderColor = '#ffd700'}
                      onBlur={e => e.target.style.borderColor = activeAula.titulo ? '#3f3f46' : 'rgba(248,113,113,0.5)'}
                    />
                  </div>

                  {/* URL */}
                  <div style={s.fieldGroup}>
                    <label style={s.label}>URL do YouTube *</label>
                    <input
                      type="text" placeholder="https://www.youtube.com/watch?v=..."
                      value={activeAula.url || ''}
                      onChange={e => { onUpdate(activeIdx, 'url', e.target.value); setPreviewUrl(e.target.value); }}
                      onClick={e => e.stopPropagation()}
                      style={s.input(activeAula.url ? null : false)}
                      onFocus={e => e.target.style.borderColor = '#ffd700'}
                      onBlur={e => e.target.style.borderColor = activeAula.url ? '#3f3f46' : 'rgba(248,113,113,0.5)'}
                    />
                    {activeAula.url && getYouTubeId(activeAula.url) && (
                      <span style={s.urlOk}><IconCheck /> URL do YouTube reconhecida</span>
                    )}
                    {activeAula.url && !getYouTubeId(activeAula.url) && (
                      <span style={s.urlWarn}>ℹ URL não é do YouTube</span>
                    )}
                  </div>

                  {/* Description */}
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Descrição da Aula</label>
                    <textarea
                      placeholder="Explique o que será abordado nesta aula..."
                      value={activeAula.descricao || ''}
                      onChange={e => onUpdate(activeIdx, 'descricao', e.target.value)}
                      onClick={e => e.stopPropagation()}
                      rows={4}
                      style={s.textarea}
                      onFocus={e => e.target.style.borderColor = '#ffd700'}
                      onBlur={e => e.target.style.borderColor = '#3f3f46'}
                    />
                  </div>

                  {/* Navigation */}
                  <div style={s.navRow}>
                    <button type="button" onClick={stop(() => setActiveIdx(Math.max(0, activeIdx - 1)))} disabled={activeIdx === 0} style={s.navBtn(activeIdx === 0)}>← Aula anterior</button>
                    <button type="button" onClick={stop(() => setActiveIdx(Math.min(aulas.length - 1, activeIdx + 1)))} disabled={activeIdx === aulas.length - 1} style={s.navBtn(activeIdx === aulas.length - 1)}>Próxima aula →</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={s.footer}>
          {msg
            ? <p style={s.footerMsg(isError)}>{msg}</p>
            : <div style={{ flex: 1 }} />
          }
          <button type="button" onClick={stop(onSave)} disabled={loading} style={s.btnSave(loading)}>
            {loading ? 'Salvando...' : 'Salvar Aulas'}
          </button>
          <button type="button" onClick={stop(closeModal)} style={s.btnCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default LessonManager;
