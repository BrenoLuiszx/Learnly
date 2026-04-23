import React, { useState, useEffect } from 'react';
import { getYouTubeId } from '../utils/format';

const getThumbnail = (url) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
};

/**
 * Shared lesson manager modal used by both Admin and Colaborador.
 *
 * Props:
 *   curso        – { id, titulo } of the course being edited
 *   aulas        – current lesson array (managed by parent)
 *   loading      – bool, disables save button
 *   msg          – status message string
 *   onSave       – () => void
 *   onClose      – () => void
 *   onAdd        – () => void
 *   onRemove     – (idx) => void
 *   onUpdate     – (idx, field, value) => void
 *   onMove       – (idx, direction) => void   direction: -1 | 1
 *   onMoveToPos  – (idx, newOrder) => void
 */
const LessonManager = ({
  curso, aulas, loading, msg,
  onSave, onClose, onAdd, onRemove, onUpdate, onMove, onMoveToPos,
}) => {
  const [activeIdx, setActiveIdx] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // When a lesson is selected, load its URL into the mini player
  useEffect(() => {
    if (activeIdx !== null && aulas[activeIdx]) {
      setPreviewUrl(aulas[activeIdx].url || '');
    }
  }, [activeIdx, aulas]);

  const ytId = getYouTubeId(previewUrl);
  const thumb = getThumbnail(previewUrl);
  const hasAulas = aulas.length > 0;
  const activeAula = activeIdx !== null ? aulas[activeIdx] : null;

  const closeModal = () => { setActiveIdx(null); onClose(); };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={closeModal}
    >
      <div
        style={{
          background: '#1c1c1e', border: '1px solid rgba(255,215,0,0.15)',
          borderRadius: '1.25rem', width: '100%', maxWidth: '1000px',
          maxHeight: '92vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 24px', borderBottom: '1px solid #2c2c2e', flexShrink: 0,
        }}>
          <div>
            <h2 style={{ color: '#f2f2f7', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              Gerenciar Aulas
            </h2>
            <p style={{ color: '#888', fontSize: '0.82rem', margin: '3px 0 0' }}>
              {curso?.titulo} · {aulas.length} {aulas.length === 1 ? 'aula' : 'aulas'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={onAdd}
              style={{
                padding: '7px 16px', background: 'rgba(255,215,0,0.1)',
                border: '1px solid rgba(255,215,0,0.3)', borderRadius: '8px',
                color: '#ffd700', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              + Adicionar Aula
            </button>
            <button
              onClick={closeModal}
              style={{
                width: '32px', height: '32px', background: '#2c2c2e',
                border: '1px solid #3a3a3c', borderRadius: '50%',
                color: '#aeaeb2', fontSize: '1.1rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* ── Body: two columns ── */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

          {/* Left: lesson list */}
          <div style={{
            width: '340px', flexShrink: 0, borderRight: '1px solid #2c2c2e',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {!hasAulas ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: '#555' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎬</div>
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>Nenhuma aula ainda.</p>
                  <p style={{ fontSize: '0.8rem', margin: '4px 0 0', color: '#444' }}>
                    Clique em "+ Adicionar Aula" para começar.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {aulas.map((aula, idx) => {
                    const isActive = activeIdx === idx;
                    const thumb = getThumbnail(aula.url);
                    const hasUrl = !!aula.url;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveIdx(isActive ? null : idx)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                          background: isActive ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isActive ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.06)'}`,
                          transition: 'all 0.15s',
                        }}
                      >
                        {/* Order controls */}
                        <div
                          style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 }}
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onMove(idx, -1)}
                            disabled={idx === 0}
                            style={{
                              background: 'none', border: 'none', color: idx === 0 ? '#333' : '#666',
                              fontSize: '0.6rem', cursor: idx === 0 ? 'not-allowed' : 'pointer',
                              padding: '1px 4px', lineHeight: 1,
                            }}
                          >▲</button>
                          <div style={{
                            width: '22px', height: '22px', borderRadius: '6px',
                            background: isActive ? '#ffd700' : '#2c2c2e',
                            color: isActive ? '#000' : '#ffd700',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                          }}>
                            {aula.ordem || idx + 1}
                          </div>
                          <button
                            onClick={() => onMove(idx, 1)}
                            disabled={idx === aulas.length - 1}
                            style={{
                              background: 'none', border: 'none',
                              color: idx === aulas.length - 1 ? '#333' : '#666',
                              fontSize: '0.6rem', cursor: idx === aulas.length - 1 ? 'not-allowed' : 'pointer',
                              padding: '1px 4px', lineHeight: 1,
                            }}
                          >▼</button>
                        </div>

                        {/* Thumbnail */}
                        <div style={{
                          width: '52px', height: '36px', borderRadius: '6px', flexShrink: 0,
                          background: thumb ? `url(${thumb}) center/cover` : '#111',
                          border: '1px solid #2c2c2e', overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {!thumb && (
                            <span style={{ color: '#444', fontSize: '1rem' }}>▶</span>
                          )}
                        </div>

                        {/* Title */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            color: aula.titulo ? '#f2f2f7' : '#555',
                            fontSize: '0.82rem', fontWeight: 500, margin: 0,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            fontStyle: aula.titulo ? 'normal' : 'italic',
                          }}>
                            {aula.titulo || 'Sem título'}
                          </p>
                          {aula.descricao && (
                            <p style={{
                              color: '#666', fontSize: '0.72rem', margin: '2px 0 0',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {aula.descricao}
                            </p>
                          )}
                          {!hasUrl && (
                            <p style={{ color: '#ef4444', fontSize: '0.68rem', margin: '2px 0 0' }}>
                              ⚠ URL obrigatória
                            </p>
                          )}
                        </div>

                        {/* Remove */}
                        <button
                          onClick={e => { e.stopPropagation(); onRemove(idx); if (activeIdx === idx) setActiveIdx(null); }}
                          disabled={aulas.length === 1}
                          style={{
                            background: 'none', border: 'none', flexShrink: 0,
                            color: aulas.length === 1 ? '#333' : '#555',
                            fontSize: '1.1rem', cursor: aulas.length === 1 ? 'not-allowed' : 'pointer',
                            padding: '2px 4px', lineHeight: 1, transition: 'color 0.15s',
                          }}
                          onMouseEnter={e => { if (aulas.length > 1) e.target.style.color = '#ef4444'; }}
                          onMouseLeave={e => { e.target.style.color = aulas.length === 1 ? '#333' : '#555'; }}
                          title="Remover aula"
                        >×</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: editor + mini player */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {activeAula === null ? (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '12px',
                color: '#555', padding: '32px',
              }}>
                <div style={{ fontSize: '2.5rem' }}>o</div>
                <p style={{ fontSize: '0.9rem', margin: 0, textAlign: 'center' }}>
                  Selecione uma aula na lista para editar
                </p>
                <p style={{ fontSize: '0.8rem', margin: 0, color: '#444', textAlign: 'center' }}>
                  ou clique em "+ Adicionar Aula" para criar uma nova
                </p>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0' }}>

                {/* Mini player */}
                <div style={{
                  background: '#111', borderBottom: '1px solid #2c2c2e', flexShrink: 0,
                }}>
                  {ytId ? (
                    <div style={{ position: 'relative', paddingBottom: '42%', height: 0 }}>
                      <iframe
                        key={previewUrl}
                        src={`https://www.youtube.com/embed/${ytId}?rel=0`}
                        title={activeAula.titulo || 'Preview'}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                      />
                    </div>
                  ) : previewUrl ? (
                    <div style={{
                      padding: '20px', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '8px', minHeight: '80px', justifyContent: 'center',
                    }}>
                      <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>
                        ⚠ URL não reconhecida como YouTube
                      </span>
                      <a
                        href={previewUrl} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#60a5fa', fontSize: '0.78rem' }}
                      >
                        Abrir link externo ↗
                      </a>
                    </div>
                  ) : (
                    <div style={{
                      padding: '20px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', minHeight: '80px',
                    }}>
                      <span style={{ color: '#444', fontSize: '0.82rem' }}>
                        Cole uma URL do YouTube para ver o preview
                      </span>
                    </div>
                  )}
                </div>

                {/* Edit fields */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Lesson badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      background: 'rgba(255,215,0,0.12)', color: '#ffd700',
                      border: '1px solid rgba(255,215,0,0.25)', borderRadius: '6px',
                      padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700,
                    }}>
                      Aula {activeAula.ordem || activeIdx + 1}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#555', fontSize: '0.75rem' }}>Posição:</span>
                      <input
                        type="number"
                        min={1}
                        max={aulas.length}
                        value={activeAula.ordem || activeIdx + 1}
                        onChange={e => onMoveToPos(activeIdx, parseInt(e.target.value) || 1)}
                        style={{
                          width: '52px', padding: '3px 6px', background: '#2c2c2e',
                          border: '1px solid #3a3a3c', borderRadius: '6px',
                          color: '#ffd700', fontSize: '0.78rem', fontWeight: 700,
                          textAlign: 'center', fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#aeaeb2', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Título da Aula *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Introdução ao React"
                      value={activeAula.titulo}
                      onChange={e => onUpdate(activeIdx, 'titulo', e.target.value)}
                      style={{
                        width: '100%', padding: '10px 12px', background: '#0a0a0b',
                        border: `1px solid ${activeAula.titulo ? '#3a3a3c' : 'rgba(239,68,68,0.4)'}`,
                        borderRadius: '8px', color: '#f2f2f7', fontSize: '0.9rem',
                        fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s',
                        outline: 'none',
                      }}
                      onFocus={e => e.target.style.borderColor = '#ffd700'}
                      onBlur={e => e.target.style.borderColor = activeAula.titulo ? '#3a3a3c' : 'rgba(239,68,68,0.4)'}
                    />
                  </div>

                  {/* URL */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#aeaeb2', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      URL do Vídeo *
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={activeAula.url}
                      onChange={e => {
                        onUpdate(activeIdx, 'url', e.target.value);
                        setPreviewUrl(e.target.value);
                      }}
                      style={{
                        width: '100%', padding: '10px 12px', background: '#0a0a0b',
                        border: `1px solid ${activeAula.url ? '#3a3a3c' : 'rgba(239,68,68,0.4)'}`,
                        borderRadius: '8px', color: '#f2f2f7', fontSize: '0.9rem',
                        fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s',
                        outline: 'none',
                      }}
                      onFocus={e => e.target.style.borderColor = '#ffd700'}
                      onBlur={e => e.target.style.borderColor = activeAula.url ? '#3a3a3c' : 'rgba(239,68,68,0.4)'}
                    />
                    {activeAula.url && !getYouTubeId(activeAula.url) && (
                      <p style={{ color: '#fbbf24', fontSize: '0.72rem', margin: '4px 0 0' }}>
                        ℹ URL não é do YouTube — o player não funcionará, mas o link será salvo.
                      </p>
                    )}
                    {activeAula.url && getYouTubeId(activeAula.url) && (
                      <p style={{ color: '#34d399', fontSize: '0.72rem', margin: '4px 0 0' }}>
                        ✓ URL do YouTube reconhecida
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#aeaeb2', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Descrição da Aula
                    </label>
                    <textarea
                      placeholder="Explique o que será abordado nesta aula..."
                      value={activeAula.descricao || ''}
                      onChange={e => onUpdate(activeIdx, 'descricao', e.target.value)}
                      rows={4}
                      style={{
                        width: '100%', padding: '10px 12px', background: '#0a0a0b',
                        border: '1px solid #3a3a3c', borderRadius: '8px',
                        color: '#f2f2f7', fontSize: '0.9rem', fontFamily: 'inherit',
                        resize: 'vertical', boxSizing: 'border-box', outline: 'none',
                        transition: 'border-color 0.2s', lineHeight: 1.5,
                      }}
                      onFocus={e => e.target.style.borderColor = '#ffd700'}
                      onBlur={e => e.target.style.borderColor = '#3a3a3c'}
                    />
                  </div>

                  {/* Navigation between lessons */}
                  <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                    <button
                      onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                      disabled={activeIdx === 0}
                      style={{
                        flex: 1, padding: '8px', background: '#2c2c2e',
                        border: '1px solid #3a3a3c', borderRadius: '8px',
                        color: activeIdx === 0 ? '#444' : '#aeaeb2',
                        fontSize: '0.8rem', fontWeight: 600, cursor: activeIdx === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      ← Aula anterior
                    </button>
                    <button
                      onClick={() => setActiveIdx(Math.min(aulas.length - 1, activeIdx + 1))}
                      disabled={activeIdx === aulas.length - 1}
                      style={{
                        flex: 1, padding: '8px', background: '#2c2c2e',
                        border: '1px solid #3a3a3c', borderRadius: '8px',
                        color: activeIdx === aulas.length - 1 ? '#444' : '#aeaeb2',
                        fontSize: '0.8rem', fontWeight: 600,
                        cursor: activeIdx === aulas.length - 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Próxima aula →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: 'flex', gap: '10px', padding: '16px 24px',
          borderTop: '1px solid #2c2c2e', flexShrink: 0, alignItems: 'center',
        }}>
          {msg && (
            <p style={{
              flex: 1, margin: 0, fontSize: '0.82rem', fontWeight: 600,
              color: msg.toLowerCase().includes('erro') || msg.toLowerCase().includes('precisam') ? '#ef4444' : '#34d399',
            }}>
              {msg}
            </p>
          )}
          {!msg && <div style={{ flex: 1 }} />}
          <button
            onClick={onSave}
            disabled={loading}
            style={{
              padding: '9px 24px', background: loading ? '#2c2c2e' : '#ffd700',
              border: 'none', borderRadius: '8px',
              color: loading ? '#555' : '#000',
              fontSize: '0.9rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {loading ? 'Salvando...' : 'Salvar Aulas'}
          </button>
          <button
            onClick={closeModal}
            style={{
              padding: '9px 20px', background: '#2c2c2e',
              border: '1px solid #3a3a3c', borderRadius: '8px',
              color: '#aeaeb2', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonManager;
