import React, { useState } from 'react';
import { getYouTubeId, formatDuration } from '../utils/format';

const parseLinks = (val) => {
  if (Array.isArray(val)) return val;
  try { return val ? JSON.parse(val) : []; } catch { return []; }
};

const formatDuracao = (min) => formatDuration(min);

/**
 * Full-page live preview of a course, mirroring CursoDetalhes layout.
 * Props:
 *   form        – course form state object
 *   aulas       – array of lesson objects (optional)
 *   onClose     – callback to close the preview
 *   role        – 'admin' | 'colaborador' (cosmetic label only)
 *   onAprovar   – (optional) admin approval callback
 *   onRejeitar  – (optional) admin rejection callback
 */
const CourseFormPreview = ({ form, aulas = [], onClose, role = 'admin', onAprovar, onRejeitar }) => {
  const [aulaAtual, setAulaAtual] = useState(aulas[0] || null);

  const duracaoMin = Math.round((parseFloat(form.duracao) || 0) * 60);
  const linksExternos = parseLinks(form.linksExternos).filter(l => l.url);
  const anexos = parseLinks(form.anexos).filter(a => a.url);
  const ytId = getYouTubeId(aulaAtual?.url || form.url);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(6px)',
      overflowY: 'auto', display: 'flex', flexDirection: 'column',
    }}>
      {/* Preview top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 1,
        background: '#0a0a0b', borderBottom: '1px solid #2c2c2e',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            background: onAprovar ? 'rgba(251,191,36,0.12)' : 'rgba(255,215,0,0.12)',
            color: onAprovar ? '#fbbf24' : '#ffd700',
            border: `1px solid ${onAprovar ? 'rgba(251,191,36,0.3)' : 'rgba(255,215,0,0.3)'}`,
            borderRadius: '6px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            {onAprovar ? 'Revisão de Aprovação' : 'Pré-visualização'}
          </span>
          <span style={{ color: '#555', fontSize: '0.8rem' }}>
            {onAprovar
              ? 'Revise o curso antes de aprovar ou rejeitar'
              : role === 'admin' ? 'Visão do aluno — dados reais após salvar' : 'Como o aluno verá este curso'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {onAprovar && (
            <>
              <button onClick={onRejeitar} style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px', color: '#ef4444', padding: '7px 18px',
                fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
              }}>
                ✗ Rejeitar
              </button>
              <button onClick={onAprovar} style={{
                background: '#34d399', border: 'none', borderRadius: '8px',
                color: '#000', padding: '7px 18px', fontSize: '0.85rem',
                fontWeight: 700, cursor: 'pointer',
              }}>
                ✓ Aprovar Curso
              </button>
            </>
          )}
          <button onClick={onClose} style={{
            background: '#2c2c2e', border: '1px solid #3a3a3c', borderRadius: '8px',
            color: '#aeaeb2', padding: '6px 16px', fontSize: '0.85rem',
            fontWeight: 600, cursor: 'pointer',
          }}>
            ✕ Fechar
          </button>
        </div>
      </div>

      {/* Simulated course page */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>

        {/* Hero */}
        <div style={{ marginBottom: '32px' }}>

          {/* Cover image */}
          {form.imagem && (
            <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', maxHeight: '320px' }}>
              <img src={form.imagem} alt="capa" style={{ width: '100%', objectFit: 'cover', maxHeight: '320px', display: 'block' }} />
            </div>
          )}

          {/* Category + title */}
          <div style={{ marginBottom: '16px' }}>
            {form.categoria && (
              <span style={{
                background: '#ffd700', color: '#000', borderRadius: '999px',
                padding: '3px 12px', fontSize: '0.75rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'inline-block',
              }}>
                {form.categoria}
              </span>
            )}
            <h1 style={{
              color: form.titulo ? '#f2f2f7' : '#444', fontSize: '2rem', fontWeight: 800,
              margin: '10px 0 8px', lineHeight: 1.2,
            }}>
              {form.titulo || <span style={{ fontStyle: 'italic' }}>Título do curso</span>}
            </h1>
            <p style={{ color: '#aeaeb2', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 16px' }}>
              {form.descricao || <span style={{ color: '#444', fontStyle: 'italic' }}>Descrição curta aparecerá aqui</span>}
            </p>

            {/* Meta row */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
              {form.instrutor && (
                <span style={{ color: '#ffd700', fontSize: '0.9rem', fontWeight: 600 }}>
                  👤 {form.instrutor}
                </span>
              )}
              {duracaoMin > 0 && (
                <span style={{ color: '#888', fontSize: '0.9rem' }}>
                  ⏱ {formatDuracao(duracaoMin)}
                </span>
              )}
              {aulas.length > 0 && (
                <span style={{ color: '#888', fontSize: '0.9rem' }}>
                  🎬 {aulas.length} {aulas.length === 1 ? 'aula' : 'aulas'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>

          {/* Main column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Video player */}
            <section>
              <div style={{
                background: '#1c1c1e', borderRadius: '12px', overflow: 'hidden',
                border: '1px solid #2c2c2e',
              }}>
                {aulaAtual && ytId ? (
                  <>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #2c2c2e', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: 'rgba(255,215,0,0.12)', color: '#ffd700', borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700 }}>
                        Aula {aulaAtual.ordem || 1}
                      </span>
                      <span style={{ color: '#f2f2f7', fontSize: '0.9rem', fontWeight: 600 }}>{aulaAtual.titulo}</span>
                    </div>
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                      <iframe
                        key={aulaAtual.url}
                        src={`https://www.youtube.com/embed/${ytId}?rel=0`}
                        title={aulaAtual.titulo}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                      />
                    </div>
                  </>
                ) : (
                  <div style={{
                    aspectRatio: '16/9', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '12px',
                    background: (() => {
                      const ytId = getYouTubeId(form.url);
                      if (ytId) return `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)), url(https://img.youtube.com/vi/${ytId}/maxresdefault.jpg) center/cover no-repeat`;
                      if (form.imagem) return `linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)), url(${form.imagem}) center/cover no-repeat`;
                      return '#111';
                    })(),
                  }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,215,0,0.15)', border: '2px solid rgba(255,215,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.5rem' }}>▶</span>
                    </div>
                    <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>
                      {aulas.length === 0 ? 'Nenhuma aula cadastrada ainda' : 'Selecione uma aula para visualizar'}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Lessons list */}
            {aulas.length > 0 && (
              <section>
                <h2 style={{ color: '#f2f2f7', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 16px' }}>
                  Aulas do Curso
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {aulas.map((aula, i) => (
                    <div
                      key={i}
                      onClick={() => setAulaAtual(aula)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                        background: aulaAtual?.ordem === aula.ordem ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${aulaAtual?.ordem === aula.ordem ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.06)'}`,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                        background: aulaAtual?.ordem === aula.ordem ? '#ffd700' : '#2c2c2e',
                        color: aulaAtual?.ordem === aula.ordem ? '#000' : '#ffd700',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700,
                      }}>
                        {aula.ordem || i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#f2f2f7', fontSize: '0.9rem', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {aula.titulo || 'Sem título'}
                        </p>
                        {aula.descricao && (
                          <p style={{ color: '#888', fontSize: '0.78rem', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {aula.descricao}
                          </p>
                        )}
                      </div>
                      <span style={{ color: '#555', fontSize: '0.75rem', flexShrink: 0 }}>▶ Assistir</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* About */}
            <section>
              <h2 style={{ color: '#f2f2f7', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 16px' }}>
                Sobre o Curso
              </h2>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2c2c2e', borderRadius: '12px', padding: '20px' }}>
                <p style={{ color: '#aeaeb2', fontSize: '0.95rem', lineHeight: 1.7, margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>
                  {form.descricaoDetalhada || form.descricao || <span style={{ color: '#444', fontStyle: 'italic' }}>Descrição detalhada aparecerá aqui</span>}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #2c2c2e' }}>
                  {[
                    { label: 'Modalidade', value: 'Online' },
                    { label: 'Duração', value: duracaoMin > 0 ? formatDuracao(duracaoMin) : '—' },
                    { label: 'Categoria', value: form.categoria || '—' },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center' }}>
                      <p style={{ color: '#555', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>{item.label}</p>
                      <p style={{ color: '#f2f2f7', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* External links */}
            {linksExternos.length > 0 && (
              <section>
                <h2 style={{ color: '#f2f2f7', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 16px' }}>
                  Links Externos
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {linksExternos.map((link, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '12px 16px', background: 'rgba(96,165,250,0.06)',
                      border: '1px solid rgba(96,165,250,0.15)', borderRadius: '10px',
                    }}>
                      <span style={{ color: '#60a5fa', fontSize: '1rem' }}>🔗</span>
                      <span style={{ color: '#60a5fa', fontSize: '0.9rem', fontWeight: 500 }}>
                        {link.titulo || link.url}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Attachments */}
            {anexos.length > 0 && (
              <section>
                <h2 style={{ color: '#f2f2f7', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 16px' }}>
                  Materiais Complementares
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {anexos.map((anexo, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '12px 16px', background: 'rgba(52,211,153,0.06)',
                      border: '1px solid rgba(52,211,153,0.15)', borderRadius: '10px',
                    }}>
                      <span style={{ color: '#34d399', fontSize: '1rem' }}>📎</span>
                      <span style={{ color: '#34d399', fontSize: '0.9rem', fontWeight: 500 }}>
                        {anexo.nome || 'Baixar material'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '72px' }}>

            {/* Instructor card */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2c2c2e', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: '#f2f2f7', fontSize: '1rem', fontWeight: 700, margin: '0 0 16px' }}>Instrutor</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(255,215,0,0.12)', border: '2px solid rgba(255,215,0,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#ffd700', fontSize: '1.25rem', fontWeight: 700,
                }}>
                  {form.instrutor ? form.instrutor.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <p style={{ color: '#f2f2f7', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                    {form.instrutor || <span style={{ color: '#444', fontStyle: 'italic' }}>Nome do instrutor</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Course specs */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2c2c2e', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: '#f2f2f7', fontSize: '1rem', fontWeight: 700, margin: '0 0 16px' }}>Detalhes do Curso</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Duração', value: duracaoMin > 0 ? formatDuracao(duracaoMin) : '—' },
                  { label: 'Modalidade', value: 'Online' },
                  { label: 'Categoria', value: form.categoria || '—' },
                  { label: 'Aulas', value: aulas.length > 0 ? `${aulas.length} aulas` : '—' },
                  { label: 'Links', value: linksExternos.length > 0 ? `${linksExternos.length} links` : '—' },
                  { label: 'Materiais', value: anexos.length > 0 ? `${anexos.length} arquivos` : '—' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #1c1c1e' }}>
                    <span style={{ color: '#888', fontSize: '0.85rem' }}>{item.label}</span>
                    <span style={{ color: '#f2f2f7', fontSize: '0.85rem', fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enroll CTA (cosmetic) */}
            <div style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <p style={{ color: '#ffd700', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
                Botão de matrícula
              </p>
              <div style={{ background: '#ffd700', color: '#000', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', fontWeight: 700 }}>
                Matricular-se no Curso
              </div>
              <p style={{ color: '#555', fontSize: '0.72rem', margin: '8px 0 0' }}>Aparece para alunos não matriculados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseFormPreview;
