import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardTab from '../../components/DashboardTab';
import UserAvatar from '../../components/UserAvatar';
import { usuariosAPI, certificadosAPI, usuarioDashboardAPI, progressoAPI, cursosAPI, matriculasAPI } from '../../services/api';
import Header from '../Header/Header';
import { formatDuration } from '../../utils/format';
import '../../styles/perfil.css';

/* ── SVG icons ── */
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const IconBook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconFileText = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);
const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconKanban = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/>
  </svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const IconGrip = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <circle cx="9" cy="7" r="1.5"/><circle cx="15" cy="7" r="1.5"/>
    <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
    <circle cx="9" cy="17" r="1.5"/><circle cx="15" cy="17" r="1.5"/>
  </svg>
);
const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IconShare = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconAward = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);
const IconPencil = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconBriefcase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="12"/>
  </svg>
);
const IconTag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const IconLink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IconPreview = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

/* ── CV helpers ── */
const CvSection = ({ title, icon, children, onEdit, editing }) => (
  <div className="cv-section">
    <div className="cv-section-header">
      <span className="cv-section-icon">{icon}</span>
      <span className="cv-section-title">{title}</span>
      <button className="cv-edit-btn" onClick={onEdit}>
        {editing ? 'Concluído' : <><IconPencil /> Editar</>}
      </button>
    </div>
    <div className="cv-section-body">{children}</div>
  </div>
);

const CurriculoTab = ({ usuario, certificados, stats }) => {
  const [cv, setCv] = useState({});
  const [cvLoaded, setCvLoaded] = useState(false);
  const [editSec, setEditSec] = useState(null);
  const [preview, setPreview] = useState(false);
  const [cursosData, setCursosData] = useState([]);
  const [pdfToast, setPdfToast] = useState(false);
  const saveTimer = React.useRef(null);

  // draft states per section
  const [dResumo, setDResumo] = useState('');
  const [dSkills, setDSkills] = useState('');
  const [dExpForm, setDExpForm] = useState({ titulo: '', empresa: '', periodo: '', descricao: '' });
  const [dProjForm, setDProjForm] = useState({ titulo: '', url: '', descricao: '' });

  const handleDownloadPdf = () => {
    setPdfToast(true);
    setTimeout(() => setPdfToast(false), 3000);
  };

  // Load CV from backend on mount (user-specific)
  useEffect(() => {
    if (!usuario) return;
    setCvLoaded(false);
    usuarioDashboardAPI.getCurriculo()
      .then(r => {
        try { setCv(JSON.parse(r.data.curriculo || '{}') || {}); }
        catch { setCv({}); }
      })
      .catch(() => setCv({}))
      .finally(() => setCvLoaded(true));
  }, [usuario?.id]);

  useEffect(() => {
    if (!usuario) return;
    const load = async () => {
      try {
        const [rM, rC] = await Promise.all([matriculasAPI.minhasMatriculas(), cursosAPI.listarTodos()]);
        const mats = rM.data || [];
        const todos = rC.data || [];
        setCursosData(mats.map(m => {
          const c = todos.find(x => x.id === m.cursoId);
          return { cursoId: m.cursoId, titulo: c?.titulo || `Curso #${m.cursoId}`, categoria: c?.categoria || '', concluido: m.concluido, dataInscricao: m.dataInscricao, dataConclusao: m.dataConclusao };
        }));
      } catch {}
    };
    load();
  }, [usuario?.id]);

  const persist = (patch) => {
    const next = { ...cv, ...patch };
    setCv(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      usuarioDashboardAPI.saveCurriculo(JSON.stringify(next)).catch(() => {});
    }, 600);
  };

  const openEdit = (sec) => {
    if (editSec === sec) { setEditSec(null); return; }
    setEditSec(sec);
    if (sec === 'resumo') setDResumo(cv.resumo || '');
    if (sec === 'skills') setDSkills((cv.skills || []).join(', '));
  };

  const saveResumo = () => { persist({ resumo: dResumo.trim() }); setEditSec(null); };
  const saveSkills = () => {
    const arr = dSkills.split(',').map(s => s.trim()).filter(Boolean);
    persist({ skills: arr }); setEditSec(null);
  };
  const addExp = () => {
    if (!dExpForm.titulo.trim()) return;
    persist({ experiencias: [...(cv.experiencias || []), { ...dExpForm, id: Date.now() }] });
    setDExpForm({ titulo: '', empresa: '', periodo: '', descricao: '' });
  };
  const removeExp = (id) => persist({ experiencias: (cv.experiencias || []).filter(e => e.id !== id) });
  const addProj = () => {
    if (!dProjForm.titulo.trim()) return;
    persist({ projetos: [...(cv.projetos || []), { ...dProjForm, id: Date.now() }] });
    setDProjForm({ titulo: '', url: '', descricao: '' });
  };
  const removeProj = (id) => persist({ projetos: (cv.projetos || []).filter(p => p.id !== id) });

  const roleLabel = usuario?.role === 'admin' ? 'Administrador' : usuario?.role === 'colaborador' ? 'Colaborador' : 'Usuário';
  const cursosConcluidos = cursosData.filter(c => c.concluido);

  if (preview) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {pdfToast && (
        <div className="cv-pdf-toast">
          <IconDownload /> Exportação em PDF em breve
        </div>
      )}
      <div className="pf-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 className="pf-card-title" style={{ margin: 0 }}><IconPreview /> Pré-visualização do Currículo</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="cv-pdf-btn" onClick={handleDownloadPdf}>
              <IconDownload /> Baixar PDF
            </button>
            <button className="cv-preview-btn" onClick={() => setPreview(false)}>← Voltar para edição</button>
          </div>
        </div>
      </div>

      <div className="cv-preview-doc" id="cv-pdf-target">
        {/* Header */}
        <div className="cv-preview-header">
          <div className="cv-preview-avatar">
            <UserAvatar foto={usuario?.foto} nome={usuario?.nome ?? ''} size={60} />
          </div>
          <div>
            <h1 className="cv-preview-name">{usuario?.nome}</h1>
            <p className="cv-preview-email">{usuario?.email}</p>
            <span className="pf-role-badge" style={{ marginTop: '6px', display: 'inline-block' }}>{roleLabel}</span>
          </div>
          {stats && (
            <div className="cv-preview-stats">
              <div className="cv-preview-stat"><span>{stats.concluidos}</span>Cursos</div>
              <div className="cv-preview-stat"><span>{certificados.length}</span>Certs</div>
              <div className="cv-preview-stat"><span>{Math.floor((stats.totalMinutos || 0) / 60)}h</span>Estudo</div>
            </div>
          )}
        </div>

        {cv.resumo && (
          <div className="cv-preview-section">
            <p className="cv-preview-sec-title">Sobre mim</p>
            <p className="cv-preview-text">{cv.resumo}</p>
          </div>
        )}

        {(cv.skills || []).length > 0 && (
          <div className="cv-preview-section">
            <p className="cv-preview-sec-title">Habilidades</p>
            <div className="cv-skills-wrap">
              {cv.skills.map(s => <span key={s} className="cv-skill-chip">{s}</span>)}
            </div>
          </div>
        )}

        {cursosConcluidos.length > 0 && (
          <div className="cv-preview-section">
            <p className="cv-preview-sec-title">Formação — Cursos Concluídos</p>
            {cursosConcluidos.map(c => (
              <div key={c.cursoId} className="cv-preview-entry">
                <div className="cv-preview-entry-dot" />
                <div>
                  <p className="cv-preview-entry-title">{c.titulo}</p>
                  <p className="cv-preview-entry-sub">
                    {c.categoria && <span className="pf-cat-badge" style={{ marginRight: 6 }}>{c.categoria}</span>}
                    {c.dataConclusao && new Date(c.dataConclusao).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {certificados.length > 0 && (
          <div className="cv-preview-section">
            <p className="cv-preview-sec-title">Certificados</p>
            {certificados.map(cert => (
              <div key={cert.id} className="cv-preview-entry">
                <div className="cv-preview-entry-dot" style={{ background: '#ffd700' }} />
                <div>
                  <p className="cv-preview-entry-title">{cert.tituloCurso}</p>
                  <p className="cv-preview-entry-sub">{new Date(cert.dataEmissao).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {(cv.experiencias || []).length > 0 && (
          <div className="cv-preview-section">
            <p className="cv-preview-sec-title">Experiências</p>
            {cv.experiencias.map(e => (
              <div key={e.id} className="cv-preview-entry">
                <div className="cv-preview-entry-dot" style={{ background: '#60a5fa' }} />
                <div>
                  <p className="cv-preview-entry-title">{e.titulo} {e.empresa && <span style={{ color: '#888', fontWeight: 400 }}>@ {e.empresa}</span>}</p>
                  {e.periodo && <p className="cv-preview-entry-sub">{e.periodo}</p>}
                  {e.descricao && <p className="cv-preview-entry-desc">{e.descricao}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {(cv.projetos || []).length > 0 && (
          <div className="cv-preview-section">
            <p className="cv-preview-sec-title">Projetos</p>
            {cv.projetos.map(p => (
              <div key={p.id} className="cv-preview-entry">
                <div className="cv-preview-entry-dot" style={{ background: '#a78bfa' }} />
                <div>
                  <p className="cv-preview-entry-title">
                    {p.titulo}
                    {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="cv-proj-link"><IconLink /></a>}
                  </p>
                  {p.descricao && <p className="cv-preview-entry-desc">{p.descricao}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Toolbar */}
      <div className="pf-card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 className="pf-card-title" style={{ margin: 0 }}><IconFileText /> Meu Currículo</h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#555' }}>Edite cada seção e visualize o resultado final.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="cv-pdf-btn" onClick={handleDownloadPdf}>
              <IconDownload /> Baixar PDF
            </button>
            <button className="cv-preview-btn" onClick={() => setPreview(true)}>
              <IconPreview /> Pré-visualizar
            </button>
          </div>
        </div>
      </div>

      {/* Resumo Pessoal */}
      <div className="pf-card">
        <CvSection title="Resumo Pessoal" icon={<IconUser />} editing={editSec === 'resumo'} onEdit={() => openEdit('resumo')}>
          {editSec === 'resumo' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea
                className="pf-textarea"
                rows={4}
                maxLength={600}
                value={dResumo}
                onChange={e => setDResumo(e.target.value)}
                placeholder="Escreva um breve resumo sobre você, suas áreas de interesse e objetivos..."
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#555' }}>{dResumo.length}/600</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="pl-cancel-btn" onClick={() => setEditSec(null)}>Cancelar</button>
                  <button className="pf-submit-btn" style={{ padding: '8px 20px' }} onClick={saveResumo}>Salvar</button>
                </div>
              </div>
            </div>
          ) : cv.resumo ? (
            <p className="cv-text-display">{cv.resumo}</p>
          ) : (
            <p className="cv-empty-hint">Clique em Editar para adicionar um resumo pessoal.</p>
          )}
        </CvSection>
      </div>

      {/* Habilidades */}
      <div className="pf-card">
        <CvSection title="Habilidades" icon={<IconTag />} editing={editSec === 'skills'} onEdit={() => openEdit('skills')}>
          {editSec === 'skills' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                className="pl-input"
                value={dSkills}
                onChange={e => setDSkills(e.target.value)}
                placeholder="Ex: JavaScript, React, Node.js, SQL, Git..."
                autoFocus
              />
              <p style={{ fontSize: '0.72rem', color: '#555', margin: 0 }}>Separe as habilidades por vírgula.</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button className="pl-cancel-btn" onClick={() => setEditSec(null)}>Cancelar</button>
                <button className="pf-submit-btn" style={{ padding: '8px 20px' }} onClick={saveSkills}>Salvar</button>
              </div>
            </div>
          ) : (cv.skills || []).length > 0 ? (
            <div className="cv-skills-wrap">
              {cv.skills.map(s => <span key={s} className="cv-skill-chip">{s}</span>)}
            </div>
          ) : (
            <p className="cv-empty-hint">Adicione suas habilidades técnicas e soft skills.</p>
          )}
        </CvSection>
      </div>

      {/* Formação / Cursos */}
      <div className="pf-card">
        <CvSection title="Formação — Cursos" icon={<IconBook />} editing={false} onEdit={() => {}}>
          <p style={{ fontSize: '0.75rem', color: '#555', margin: '0 0 12px' }}>Populado automaticamente com seus cursos concluídos na plataforma.</p>
          {cursosData.length === 0 ? (
            <p className="cv-empty-hint">Nenhum curso encontrado.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cursosData.map(c => (
                <div key={c.cursoId} className="cv-entry-row">
                  <div className="cv-entry-dot" style={{ background: c.concluido ? '#34d399' : '#3a3a3c' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="cv-entry-title">{c.titulo}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {c.categoria && <span className="pf-cat-badge">{c.categoria}</span>}
                      {c.dataConclusao
                        ? <span style={{ fontSize: '0.72rem', color: '#34d399' }}>Concluído em {new Date(c.dataConclusao).toLocaleDateString('pt-BR')}</span>
                        : <span style={{ fontSize: '0.72rem', color: '#555' }}>Em andamento</span>
                      }
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: c.concluido ? '#34d399' : '#555', flexShrink: 0 }}>
                    {c.concluido ? '✓ Concluído' : 'Em andamento'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CvSection>
      </div>

      {/* Certificados */}
      <div className="pf-card">
        <CvSection title="Certificados" icon={<IconAward />} editing={false} onEdit={() => {}}>
          <p style={{ fontSize: '0.75rem', color: '#555', margin: '0 0 12px' }}>Sincronizado com seus certificados emitidos.</p>
          {certificados.length === 0 ? (
            <p className="cv-empty-hint">Nenhum certificado emitido ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {certificados.map(cert => (
                <div key={cert.id} className="cv-entry-row">
                  <div className="cv-entry-dot" style={{ background: '#ffd700' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="cv-entry-title">{cert.tituloCurso}</p>
                    <p style={{ fontSize: '0.72rem', color: '#555', margin: 0 }}>Emitido em {new Date(cert.dataEmissao).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: cert.publico ? '#34d399' : '#555', border: `1px solid ${cert.publico ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '999px', padding: '2px 8px', flexShrink: 0 }}>
                    {cert.publico ? 'Público' : 'Privado'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CvSection>
      </div>

      {/* Experiências */}
      <div className="pf-card">
        <CvSection title="Experiências" icon={<IconBriefcase />} editing={editSec === 'exp'} onEdit={() => openEdit('exp')}>
          {(cv.experiencias || []).length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: editSec === 'exp' ? '16px' : 0 }}>
              {cv.experiencias.map(e => (
                <div key={e.id} className="cv-entry-row" style={{ alignItems: 'flex-start' }}>
                  <div className="cv-entry-dot" style={{ background: '#60a5fa', marginTop: '6px' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="cv-entry-title">{e.titulo}{e.empresa && <span style={{ color: '#888', fontWeight: 400 }}> @ {e.empresa}</span>}</p>
                    {e.periodo && <p style={{ fontSize: '0.72rem', color: '#555', margin: '2px 0' }}>{e.periodo}</p>}
                    {e.descricao && <p style={{ fontSize: '0.8rem', color: '#aeaeb2', margin: '4px 0 0', lineHeight: 1.5 }}>{e.descricao}</p>}
                  </div>
                  {editSec === 'exp' && (
                    <button className="pl-del-btn" onClick={() => removeExp(e.id)}><IconTrash /></button>
                  )}
                </div>
              ))}
            </div>
          )}
          {editSec === 'exp' && (
            <div className="cv-add-form">
              <p className="cv-add-form-title">Adicionar experiência</p>
              <div className="cv-form-grid">
                <input className="pl-input" placeholder="Cargo / Função *" value={dExpForm.titulo} onChange={e => setDExpForm(f => ({ ...f, titulo: e.target.value }))} />
                <input className="pl-input" placeholder="Empresa" value={dExpForm.empresa} onChange={e => setDExpForm(f => ({ ...f, empresa: e.target.value }))} />
                <input className="pl-input" placeholder="Período (ex: Jan 2022 – Dez 2023)" value={dExpForm.periodo} onChange={e => setDExpForm(f => ({ ...f, periodo: e.target.value }))} />
                <input className="pl-input" placeholder="Descrição breve" value={dExpForm.descricao} onChange={e => setDExpForm(f => ({ ...f, descricao: e.target.value }))} />
              </div>
              <button className="pf-submit-btn" style={{ padding: '8px 20px', marginTop: '8px' }} onClick={addExp}>Adicionar</button>
            </div>
          )}
          {editSec !== 'exp' && (cv.experiencias || []).length === 0 && (
            <p className="cv-empty-hint">Adicione suas experiências profissionais.</p>
          )}
        </CvSection>
      </div>

      {/* Projetos */}
      <div className="pf-card">
        <CvSection title="Projetos" icon={<IconLink />} editing={editSec === 'proj'} onEdit={() => openEdit('proj')}>
          {(cv.projetos || []).length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: editSec === 'proj' ? '16px' : 0 }}>
              {cv.projetos.map(p => (
                <div key={p.id} className="cv-entry-row" style={{ alignItems: 'flex-start' }}>
                  <div className="cv-entry-dot" style={{ background: '#a78bfa', marginTop: '6px' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="cv-entry-title">
                      {p.titulo}
                      {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="cv-proj-link"><IconLink /></a>}
                    </p>
                    {p.descricao && <p style={{ fontSize: '0.8rem', color: '#aeaeb2', margin: '4px 0 0', lineHeight: 1.5 }}>{p.descricao}</p>}
                  </div>
                  {editSec === 'proj' && (
                    <button className="pl-del-btn" onClick={() => removeProj(p.id)}><IconTrash /></button>
                  )}
                </div>
              ))}
            </div>
          )}
          {editSec === 'proj' && (
            <div className="cv-add-form">
              <p className="cv-add-form-title">Adicionar projeto</p>
              <div className="cv-form-grid">
                <input className="pl-input" placeholder="Nome do projeto *" value={dProjForm.titulo} onChange={e => setDProjForm(f => ({ ...f, titulo: e.target.value }))} />
                <input className="pl-input" placeholder="URL (GitHub, site...)" value={dProjForm.url} onChange={e => setDProjForm(f => ({ ...f, url: e.target.value }))} />
                <input className="pl-input" placeholder="Descrição" value={dProjForm.descricao} onChange={e => setDProjForm(f => ({ ...f, descricao: e.target.value }))} style={{ gridColumn: '1 / -1' }} />
              </div>
              <button className="pf-submit-btn" style={{ padding: '8px 20px', marginTop: '8px' }} onClick={addProj}>Adicionar</button>
            </div>
          )}
          {editSec !== 'proj' && (cv.projetos || []).length === 0 && (
            <p className="cv-empty-hint">Adicione projetos pessoais ou profissionais.</p>
          )}
        </CvSection>
      </div>
    </div>
  );
};

/* ── CertificadosTab ── */
const CertificadosTab = ({ usuario }) => {
  const [emitidos, setEmitidos] = useState([]);
  const [disponiveis, setDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emitindo, setEmitindo] = useState(null);   // cursoId being issued
  const [modal, setModal] = useState(null);          // cert object for detail modal
  const [toastMsg, setToastMsg] = useState('');

  const toast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [r1, r2] = await Promise.all([
          certificadosAPI.meusCertificados(),
          certificadosAPI.disponiveis(),
        ]);
        setEmitidos(r1.data || []);
        setDisponiveis(r2.data || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const handleEmitir = async (cursoId) => {
    setEmitindo(cursoId);
    try {
      const res = await certificadosAPI.emitir(cursoId);
      setEmitidos(prev => [res.data, ...prev]);
      setDisponiveis(prev => prev.filter(d => d.cursoId !== cursoId));
      toast('Certificado emitido com sucesso!');
    } catch { toast('Erro ao emitir certificado.'); }
    setEmitindo(null);
  };

  const handleToggleVisibilidade = async (id) => {
    try {
      const res = await certificadosAPI.alternarVisibilidade(id);
      setEmitidos(prev => prev.map(c => c.id === id ? res.data : c));
      if (modal?.id === id) setModal(res.data);
    } catch {}
  };

  const handleDownload = (cert) => {
    if (cert.urlCertificado) {
      window.open(cert.urlCertificado, '_blank', 'noopener,noreferrer');
    } else {
      toast('Download em breve — funcionalidade em desenvolvimento.');
    }
  };

  const handleShare = (cert) => {
    const url = cert.urlCertificado || window.location.href;
    if (navigator.share) {
      navigator.share({ title: cert.tituloCurso, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      toast('Link copiado para a área de transferência!');
    }
  };

  if (loading) return <div className="pf-empty"><p>Carregando certificados...</p></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Toast */}
      {toastMsg && (
        <div className="ct-toast">{toastMsg}</div>
      )}

      {/* Modal */}
      {modal && (
        <div className="ct-overlay" onClick={() => setModal(null)}>
          <div className="ct-modal" onClick={e => e.stopPropagation()}>
            <div className="ct-modal-seal">
              <IconAward />
            </div>
            <p className="ct-modal-label">Certificado de Conclusão</p>
            <h2 className="ct-modal-title">{modal.tituloCurso}</h2>
            <p className="ct-modal-name">Concedido a <strong>{modal.nomeUsuario}</strong></p>
            <p className="ct-modal-date">Emitido em {new Date(modal.dataEmissao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>

            <div className="ct-modal-actions">
              <button className="ct-action-btn primary" onClick={() => handleDownload(modal)}>
                <IconDownload /> Baixar PDF
              </button>
              <button className="ct-action-btn" onClick={() => handleShare(modal)}>
                <IconShare /> Compartilhar
              </button>
              <button
                className="ct-action-btn"
                onClick={() => handleToggleVisibilidade(modal.id)}
                style={{ color: modal.publico ? '#34d399' : '#888' }}
              >
                {modal.publico ? <IconEye /> : <IconEyeOff />}
                {modal.publico ? 'Público' : 'Privado'}
              </button>
            </div>

            {!modal.urlCertificado && (
              <p className="ct-modal-note">O arquivo PDF será gerado automaticamente em breve.</p>
            )}

            <button className="ct-modal-close" onClick={() => setModal(null)}>Fechar</button>
          </div>
        </div>
      )}

      {/* Disponíveis para emitir */}
      {disponiveis.length > 0 && (
        <div className="pf-card">
          <h3 className="pf-card-title"><IconAward /> Disponíveis para Emitir
            <span className="ct-count-badge">{disponiveis.length}</span>
          </h3>
          <p className="ct-section-desc">Você concluiu estes cursos e pode emitir seu certificado agora.</p>
          <div className="ct-available-grid">
            {disponiveis.map(d => (
              <div key={d.cursoId} className="ct-available-card">
                <div className="ct-available-icon"><IconAward /></div>
                <div className="ct-available-info">
                  <p className="ct-available-title">{d.tituloCurso}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {d.categoria && <span className="pf-cat-badge">{d.categoria}</span>}
                    {d.dataConclusao && (
                      <span style={{ fontSize: '0.72rem', color: '#555' }}>
                        Concluído em {new Date(d.dataConclusao).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="ct-emit-btn"
                  onClick={() => handleEmitir(d.cursoId)}
                  disabled={emitindo === d.cursoId}
                >
                  {emitindo === d.cursoId ? 'Emitindo...' : 'Emitir Certificado'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificados emitidos */}
      <div className="pf-card">
        <h3 className="pf-card-title"><IconShield /> Meus Certificados
          {emitidos.length > 0 && <span className="ct-count-badge">{emitidos.length}</span>}
        </h3>

        {emitidos.length === 0 ? (
          <div className="pf-empty">
            <IconShield />
            <p>Nenhum certificado emitido ainda.</p>
            <span>Conclua um curso para liberar seu certificado.</span>
          </div>
        ) : (
          <div className="ct-issued-grid">
            {emitidos.map(cert => (
              <div key={cert.id} className="ct-issued-card" onClick={() => setModal(cert)}>
                <div className="ct-issued-seal">
                  <IconAward />
                  <div className="ct-issued-ribbon" />
                </div>
                <div className="ct-issued-body">
                  <p className="ct-issued-title">{cert.tituloCurso}</p>
                  <p className="ct-issued-date">Emitido em {new Date(cert.dataEmissao).toLocaleDateString('pt-BR')}</p>
                  <div className="ct-issued-footer">
                    <span className="ct-vis-badge" style={{ color: cert.publico ? '#34d399' : '#555', borderColor: cert.publico ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)' }}>
                      {cert.publico ? <><IconEye /> Público</> : <><IconEyeOff /> Privado</>}
                    </span>
                    <span className="ct-view-hint">Ver detalhes →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── PlanejamentoTab ── */
const DEFAULT_PLAN_COLS = [
  { id: 'todo',  label: 'A Estudar',    color: '#5b8dd9' },
  { id: 'doing', label: 'Em Progresso', color: '#c9a84c' },
  { id: 'done',  label: 'Concluído',    color: '#4aab7e' },
];
const TIPO_COLORS = { Meta: '#5b8dd9', Curso: '#c9a84c', Aula: '#8b72c8' };

const PlanejamentoTab = () => {
  const { usuario } = useAuth();
  const uid = usuario?.id ?? 'guest';

  const [cards,  setCards]  = useState([]);
  const [cols,   setCols]   = useState(DEFAULT_PLAN_COLS);
  const [loaded, setLoaded] = useState(false);
  const [form,   setForm]   = useState({ col: 'todo', titulo: '', tipo: 'Meta', nota: '' });
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editNota, setEditNota] = useState('');
  const dragCard = React.useRef(null);
  const dragOver = React.useRef(null);
  const saveTimer = React.useRef(null);

  // Load from API (same source as Planning page)
  useEffect(() => {
    setLoaded(false);
    if (!usuario) { setLoaded(true); return; }
    usuarioDashboardAPI.getPlanejamento()
      .then(r => {
        const remoteCards = JSON.parse(r.data.cards || '[]');
        const remoteCols  = JSON.parse(r.data.cols  || '[]');
        setCards(remoteCards);
        setCols(remoteCols.length > 0 ? remoteCols : DEFAULT_PLAN_COLS);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [uid]);

  // Debounced API save — mirrors Planning page persist logic
  const persist = (nextCards, nextCols) => {
    setCards(nextCards);
    clearTimeout(saveTimer.current);
    if (usuario) {
      saveTimer.current = setTimeout(() => {
        usuarioDashboardAPI.savePlanejamento(
          JSON.stringify(nextCards),
          JSON.stringify(nextCols ?? cols)
        ).catch(() => {});
      }, 600);
    }
  };

  const addCard = () => {
    if (!form.titulo.trim()) return;
    persist([...cards, { id: Date.now(), col: form.col, titulo: form.titulo.trim(), tipo: form.tipo, nota: form.nota.trim() }], cols);
    setForm(f => ({ ...f, titulo: '', nota: '' }));
    setAdding(false);
  };

  const moveCard   = (id, col) => persist(cards.map(c => c.id === id ? { ...c, col } : c), cols);
  const deleteCard = (id)      => persist(cards.filter(c => c.id !== id), cols);
  const saveNota   = (id)      => { persist(cards.map(c => c.id === id ? { ...c, nota: editNota } : c), cols); setEditId(null); };

  const onDragStart    = (id)  => { dragCard.current = id; };
  const onDragEnterCol = (col) => { dragOver.current = col; };
  const onDrop = () => {
    if (dragCard.current != null && dragOver.current) moveCard(dragCard.current, dragOver.current);
    dragCard.current = null; dragOver.current = null;
  };

  const total = cards.length;
  const done  = cards.filter(c => c.col === 'done').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header bar */}
      <div className="pf-card" style={{ padding: '16px 20px' }}>
        <div className="pl-header">
          <div>
            <h3 className="pf-card-title" style={{ margin: 0 }}><IconKanban /> Meu Planejamento</h3>
            {total > 0 && (
              <p className="pl-subtitle">{done} de {total} tarefas concluídas</p>
            )}
          </div>
          <button className="pl-add-btn" onClick={() => setAdding(a => !a)}>
            <IconPlus /> Nova tarefa
          </button>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="pf-progress-track" style={{ marginTop: '12px' }}>
            <div className="pf-progress-fill" style={{ width: `${Math.round((done / total) * 100)}%` }} />
          </div>
        )}

        {/* Add form */}
        {adding && (
          <div className="pl-form">
            <div className="pl-form-row">
              <input
                className="pl-input"
                placeholder="Título..."
                value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addCard()}
                autoFocus
              />
              <select className="pl-select" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                <option value="Meta">Meta de Estudo</option>
                <option value="Curso">Curso</option>
                <option value="Aula">Aula</option>
              </select>
              <select className="pl-select" value={form.col} onChange={e => setForm(f => ({ ...f, col: e.target.value }))}>
                {cols.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="pl-form-row">
              <input
                className="pl-input"
                placeholder="Nota opcional (curso, aula, link...)" 
                value={form.nota}
                onChange={e => setForm(f => ({ ...f, nota: e.target.value }))}
              />
              <button className="pl-confirm-btn" onClick={addCard}>Adicionar</button>
              <button className="pl-cancel-btn" onClick={() => setAdding(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>

      {/* Board */}
      {!loaded ? (
        <div style={{ color: '#555', fontSize: '0.82rem', padding: '16px 0' }}>Carregando planejamento...</div>
      ) : (
      <div className="pl-board">
        {cols.map(col => {
          const colCards = cards.filter(c => c.col === col.id);
          return (
            <div
              key={col.id}
              className="pl-col"
              onDragOver={e => { e.preventDefault(); onDragEnterCol(col.id); }}
              onDrop={onDrop}
            >
              <div className="pl-col-header">
                <span className="pl-col-dot" style={{ background: col.color }} />
                <span className="pl-col-label">{col.label}</span>
                <span className="pl-col-count">{colCards.length}</span>
              </div>

              <div className="pl-col-body">
                {colCards.map(card => (
                  <div
                    key={card.id}
                    className="pl-card"
                    draggable
                    onDragStart={() => onDragStart(card.id)}
                  >
                    <div className="pl-card-top">
                      <span className="pl-grip"><IconGrip /></span>
                      <span className="pl-tipo" style={{ color: TIPO_COLORS[card.tipo] || '#888', borderColor: (TIPO_COLORS[card.tipo] || '#888') + '44' }}>{card.tipo}</span>
                      <button className="pl-del-btn" onClick={() => deleteCard(card.id)} title="Remover"><IconTrash /></button>
                    </div>

                    <p className="pl-card-title" style={{ textDecoration: card.col === 'done' ? 'line-through' : 'none', opacity: card.col === 'done' ? 0.5 : 1 }}>
                      {card.titulo}
                    </p>

                    {editId === card.id ? (
                      <div className="pl-nota-edit">
                        <input
                          className="pl-input"
                          value={editNota}
                          onChange={e => setEditNota(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveNota(card.id); if (e.key === 'Escape') setEditId(null); }}
                          autoFocus
                        />
                        <button className="pl-confirm-btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => saveNota(card.id)}>OK</button>
                      </div>
                    ) : (
                      <p className="pl-nota" onClick={() => { setEditId(card.id); setEditNota(card.nota || ''); }}>
                        {card.nota || <span style={{ color: '#3a3a3c' }}>+ adicionar nota</span>}
                      </p>
                    )}

                    {/* Move buttons */}
                    <div className="pl-move-row">
                      {cols.filter(c => c.id !== col.id).map(c => (
                        <button key={c.id} className="pl-move-btn" style={{ borderColor: c.color + '55', color: c.color }} onClick={() => moveCard(card.id, c.id)}>
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {colCards.length === 0 && (
                  <div className="pl-col-empty">Arraste um card aqui</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};

const Perfil = () => {
  const { usuario, login, token } = useAuth();
  const [aba, setAba] = useState('dashboard');
  const [justificativa, setJustificativa] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [editando, setEditando] = useState(false);
  const [nomeEdit, setNomeEdit] = useState(usuario?.nome || '');
  const [certificados, setCertificados] = useState([]);
  const [stats, setStats] = useState(null);
  const [cursosProgresso, setCursosProgresso] = useState([]);
  const [progressoLoading, setProgressoLoading] = useState(false);

  useEffect(() => {
    if (usuario) { carregarStats(); carregarCertificados(); }
  }, [usuario]);

  useEffect(() => {
    if (!usuario) return;
    if (aba === 'progresso') carregarProgresso();
  }, [aba]);

  const carregarStats = async () => {
    try { const res = await usuarioDashboardAPI.dashboard(); setStats(res.data); } catch {}
  };

  const carregarCertificados = async () => {
    try { const res = await certificadosAPI.meusCertificados(); setCertificados(res.data || []); } catch {}
  };

  const carregarProgresso = async () => {
    setProgressoLoading(true);
    try {
      const [resP, resC] = await Promise.all([matriculasAPI.minhasMatriculas(), cursosAPI.listarTodos()]);
      const concluidos = (resP.data || []).filter(m => m.concluido);
      const todosCursos = resC.data || [];
      setCursosProgresso(concluidos.map(p => {
        const curso = todosCursos.find(c => c.id === p.cursoId);
        return { ...p, tituloCurso: curso?.titulo || `Curso #${p.cursoId}`, categoriaCurso: curso?.categoria || '', duracaoCurso: curso?.duracao || 0 };
      }));
    } catch {}
    setProgressoLoading(false);
  };

  const handleSolicitar = async (e) => {
    e.preventDefault();
    if (!justificativa.trim()) { setMensagem('Preencha a justificativa.'); return; }
    setLoading(true); setMensagem('');
    try {
      const res = await usuariosAPI.solicitarColaborador(usuario.id, justificativa);
      login({ ...usuario, statusSolicitacao: res.data.statusSolicitacao }, token);
      setMensagem('Solicitação enviada com sucesso!');
      setJustificativa('');
    } catch { setMensagem('Erro ao enviar solicitação. Tente novamente.'); }
    setLoading(false);
  };

  const handleSalvarPerfil = async () => {
    if (!nomeEdit.trim()) return;
    setLoading(true);
    try {
      const res = await usuarioDashboardAPI.atualizarPerfil(usuario.id, { nome: nomeEdit });
      login({ ...usuario, nome: res.data.nome }, token);
      setEditando(false); setMensagem('Perfil atualizado!');
    } catch { setMensagem('Erro ao atualizar perfil.'); }
    setLoading(false);
  };

  const roleLabel = usuario?.role === 'admin' ? 'Administrador' : usuario?.role === 'colaborador' ? 'Colaborador' : 'Usuário';

  const statusSolic = {
    pendente: { cls: 'warn', texto: 'Solicitação enviada — aguardando análise do admin' },
    aprovada: { cls: 'ok',   texto: 'Solicitação aprovada!' },
    recusada: { cls: 'err',  texto: 'Solicitação recusada. Você pode tentar novamente.' },
  }[usuario?.statusSolicitacao];

  const podeSolicitar = usuario?.role === 'user' &&
    (!usuario?.statusSolicitacao || ['nenhuma', 'recusada'].includes(usuario.statusSolicitacao));

  const navItems = [
    { key: 'dashboard',      label: 'Dashboard',     icon: <IconDashboard /> },
    { key: 'planejamento',   label: 'Planejamento',  icon: <IconKanban /> },
    { key: 'perfil',         label: 'Perfil',        icon: <IconUser /> },
    { key: 'progresso',      label: 'Progresso',     icon: <IconBook />,    count: stats ? (stats.matriculas ?? stats.cursosAcessados) : null },
    { key: 'certificados',   label: 'Certificados',  icon: <IconShield />,  count: certificados.length },
    { key: 'curriculo',      label: 'Currículo',     icon: <IconFileText /> },
  ];

  const msgOk = mensagem && (mensagem.includes('sucesso') || mensagem.includes('atualizado'));

  const NAV_GROUPS = [
    { label: 'Aprendizado', items: ['dashboard', 'progresso', 'planejamento'] },
    { label: 'Perfil',      items: ['perfil', 'certificados', 'curriculo'] },
  ];

  return (
    <div className="pf-page">
      <Header />
      <div className="pf-layout">

        {/* ── Hero ── */}
        <div className="pf-hero">
          <div className="pf-hero-top">
            <div className="pf-avatar">
              <UserAvatar foto={usuario?.foto} nome={usuario?.nome ?? ''} size={96} />
            </div>
            <div className="pf-hero-info">
              {editando ? (
                <div className="pf-name-edit">
                  <input
                    className="pf-name-input"
                    value={nomeEdit}
                    onChange={e => setNomeEdit(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSalvarPerfil()}
                  />
                  <button className="pf-save-btn" onClick={handleSalvarPerfil} disabled={loading}>Salvar</button>
                  <button className="pf-cancel-btn" onClick={() => setEditando(false)}>Cancelar</button>
                </div>
              ) : (
                <div className="pf-name-row">
                  <h2 className="pf-name">{usuario?.nome}</h2>
                  <button className="pf-edit-btn" onClick={() => { setEditando(true); setNomeEdit(usuario?.nome || ''); }}>
                    <IconPencil /> Editar nome
                  </button>
                </div>
              )}
              <p className="pf-email">{usuario?.email}</p>
              <div className="pf-hero-meta">
                <span className="pf-role-badge">{roleLabel}</span>
              </div>
            </div>
          </div>

          {stats ? (
            <div className="pf-stats">
              {[
                { label: 'Matrículas',   value: stats.matriculas ?? stats.cursosAcessados, tab: 'progresso' },
                { label: 'Concluídos',   value: stats.concluidos,                          tab: 'progresso' },
                { label: 'Certificados', value: stats.certificados,                        tab: 'certificados' },
                { label: 'Horas',        value: `${Math.floor((stats.totalMinutos || 0) / 60)}h`, tab: 'dashboard' },
              ].map(({ label, value, tab }) => (
                <button key={label} className="pf-stat" onClick={() => setAba(tab)}>
                  <span className="pf-stat-value">{value}</span>
                  <span className="pf-stat-label">{label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="pf-stats">
              {[0,1,2,3].map(i => <div key={i} className="pf-stat pf-stat-skeleton" />)}
            </div>
          )}

          {mensagem && <div className={`pf-msg ${msgOk ? 'ok' : 'err'}`}>{mensagem}</div>}
        </div>

        {/* ── Body ── */}
        <div className="pf-body">

          {/* Sidebar */}
          <nav className="pf-sidenav">
            {NAV_GROUPS.map(group => (
              <div key={group.label} className="pf-nav-group">
                <span className="pf-nav-group-label">{group.label}</span>
                {navItems.filter(n => group.items.includes(n.key)).map(({ key, label, icon, count }) => (
                  <button
                    key={key}
                    className={`pf-nav-btn${aba === key ? ' active' : ''}`}
                    onClick={() => setAba(key)}
                  >
                    {icon}
                    {label}
                    {count != null && <span className="pf-nav-count">{count}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          {/* Main */}
          <main className="pf-main">

            {/* ── Dashboard ── */}
            {aba === 'dashboard' && (
              <div className="pf-tab-fade">
                <DashboardTab stats={stats} usuario={usuario} />
              </div>
            )}

            {/* ── Planejamento ── */}
            {aba === 'planejamento' && (
              <div className="pf-tab-fade">
                <PlanejamentoTab />
              </div>
            )}

            {/* ── Perfil ── */}
            {aba === 'perfil' && (
              <div className="pf-tab-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Account info */}
                <div className="pf-card">
                  <h3 className="pf-card-title"><IconUser /> Informações da Conta</h3>
                  <div className="pf-account-grid">
                    <div className="pf-account-field">
                      <span className="pf-account-label">Nome</span>
                      {editando ? (
                        <div className="pf-name-edit" style={{ marginTop: '4px' }}>
                          <input className="pf-name-input" style={{ fontSize: '0.9rem' }} value={nomeEdit} onChange={e => setNomeEdit(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSalvarPerfil()} />
                          <button className="pf-save-btn" onClick={handleSalvarPerfil} disabled={loading}>Salvar</button>
                          <button className="pf-cancel-btn" onClick={() => setEditando(false)}>Cancelar</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                          <span className="pf-account-value">{usuario?.nome}</span>
                          <button className="pf-edit-btn" onClick={() => { setEditando(true); setNomeEdit(usuario?.nome || ''); }}>Editar</button>
                        </div>
                      )}
                    </div>
                    <div className="pf-account-field">
                      <span className="pf-account-label">E-mail</span>
                      <span className="pf-account-value" style={{ marginTop: '4px', display: 'block' }}>{usuario?.email}</span>
                    </div>
                    <div className="pf-account-field">
                      <span className="pf-account-label">Função</span>
                      <span className="pf-role-badge" style={{ marginTop: '6px', display: 'inline-block' }}>{roleLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Collaborator request */}
                <div className="pf-card">
                  <h3 className="pf-card-title"><IconBriefcase /> Acesso de Colaborador</h3>

                  {usuario?.role === 'colaborador' && (
                    <div className="pf-collab-banner ok">
                      Você já é um colaborador e pode criar cursos na plataforma.
                    </div>
                  )}
                  {usuario?.role === 'admin' && (
                    <div className="pf-collab-banner ok">Você é administrador da plataforma.</div>
                  )}

                  {usuario?.role === 'user' && (
                    <>
                      <p style={{ color: '#888', fontSize: '0.875rem', margin: '0 0 16px' }}>
                        Colaboradores podem criar e submeter cursos para aprovação.
                      </p>
                      {statusSolic && (
                        <div className={`pf-collab-banner ${statusSolic.cls}`}>{statusSolic.texto}</div>
                      )}
                      {podeSolicitar && (
                        <form onSubmit={handleSolicitar}>
                          <textarea
                            className="pf-textarea"
                            value={justificativa}
                            onChange={e => setJustificativa(e.target.value)}
                            placeholder="Ex: Sou desenvolvedor há 3 anos e quero compartilhar meu conhecimento..."
                            rows={4}
                            maxLength={500}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                            <span style={{ color: '#555', fontSize: '0.78rem' }}>{justificativa.length}/500</span>
                            <button type="submit" className="pf-submit-btn" disabled={loading}>
                              {loading ? 'Enviando...' : 'Enviar Solicitação'}
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── Progresso ── */}
            {aba === 'progresso' && (
              <div className="pf-tab-fade">
              <div className="pf-card">
                <h3 className="pf-card-title"><IconBook /> Meu Progresso</h3>

                {stats && (
                  <div className="pf-overall">
                    <div className="pf-overall-row">
                      <span className="pf-overall-label">Progresso geral</span>
                      <span className="pf-overall-value">{stats.concluidos} de {stats.totalCursos} cursos</span>
                    </div>
                    <div className="pf-progress-track">
                      <div
                        className="pf-progress-fill"
                        style={{ width: stats.totalCursos > 0 ? `${Math.min((stats.concluidos / stats.totalCursos) * 100, 100)}%` : '0%' }}
                      />
                    </div>
                    <div className="pf-overall-meta">
                      <span style={{ color: '#34d399' }}>{stats.concluidos} concluídos</span>
                      <span>{Math.floor((stats.totalMinutos || 0) / 60)}h estudadas</span>
                    </div>
                  </div>
                )}

                {progressoLoading ? (
                  <div className="pf-empty"><p>Carregando...</p></div>
                ) : cursosProgresso.length === 0 ? (
                  <div className="pf-empty">
                    <IconBook />
                    <p>Nenhum curso concluído ainda.</p>
                    <span>Conclua um curso para ver seu progresso aqui.</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {cursosProgresso.map(p => (
                      <div key={p.id} className="pf-course-row" style={{ cursor: 'default' }}>
                        <div className="pf-course-icon" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}>
                          <IconCheck />
                        </div>
                        <div className="pf-course-info">
                          <p className="pf-course-title">{p.tituloCurso}</p>
                          <div className="pf-course-meta">
                            {p.categoriaCurso && <span className="pf-cat-badge">{p.categoriaCurso}</span>}
                            {p.duracaoCurso > 0 && <span style={{ color: '#555', fontSize: '0.72rem' }}>{formatDuration(p.duracaoCurso)}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>Concluído</div>
                          {p.dataConclusao && (
                            <div style={{ color: '#555', fontSize: '0.7rem' }}>
                              {new Date(p.dataConclusao).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </div>
            )}

            {/* ── Certificados ── */}
            {aba === 'certificados' && (
              <div className="pf-tab-fade">
                <CertificadosTab usuario={usuario} />
              </div>
            )}

            {/* ── Currículo ── */}
            {aba === 'curriculo' && (
              <div className="pf-tab-fade">
                <CurriculoTab usuario={usuario} certificados={certificados} stats={stats} />
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
