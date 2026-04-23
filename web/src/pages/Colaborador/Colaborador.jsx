import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cursosAPI, aulasAPI, instrutorAPI, acoesAPI, jornadaRequestAPI } from '../../services/api';
import { getMinhasJornadas } from '../../config/jornadas';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../Header/Header';
import CourseFormPreview from '../../components/CourseFormPreview';
import LessonManager from '../../components/LessonManager';
import UserAvatar from '../../components/UserAvatar';
import '../../styles/admin-bigtech.css';
import '../../styles/colaborador.css';

const formatDuracao = (min) => {
  const h = Math.floor(min / 60), m = min % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
};

const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
};

const CATEGORIAS = [
  'Frontend', 'Backend', 'Data Science', 'Database', 'DevOps',
  'Mobile', 'Design', 'Marketing', 'Negócios', 'Idiomas',
  'Música', 'Violão', 'Canto', 'Fotografia', 'Saúde', 'Diversos',
];

const CURSO_VAZIO = {
  titulo: '', descricao: '', url: '', categoria: '',
  instrutor: '', duracao: '', imagem: '', descricaoDetalhada: '',
  linksExternos: [],  // [{ titulo, url }]
  anexos: [],         // [{ nome, url }]
};

const AULA_VAZIA = { titulo: '', url: '', descricao: '' };

const StatusBadge = ({ status }) => {
  const map = {
    aprovado:  { label: 'Aprovado',  color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    pendente:  { label: 'Pendente',  color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
    rejeitado: { label: 'Rejeitado', color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  };
  const s = map[status] || map.pendente;
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}40`,
      padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
      {s.label}
    </span>
  );
};

const Colaborador = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [cursos, setCursos] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(true);

  // Course form
  const [showCursoForm, setShowCursoForm] = useState(false);
  const [editandoCursoId, setEditandoCursoId] = useState(null);
  const [cursoForm, setCursoForm] = useState(CURSO_VAZIO);
  const [savingCurso, setSavingCurso] = useState(false);
  const [cursoMsg, setCursoMsg] = useState('');
  const [showFormPreview, setShowFormPreview] = useState(false);

  // Lesson manager modal
  const [aulasModal, setAulasModal] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [savingAulas, setSavingAulas] = useState(false);
  const [aulasMsg, setAulasMsg] = useState('');

  // Tabs
  const [activeTab, setActiveTab] = useState('cursos');

  // Dashboard
  const [dashboardData, setDashboardData] = useState({});
  const [loadingDash, setLoadingDash] = useState(false);
  const [dashExpanded, setDashExpanded] = useState({});
  const [dashSection, setDashSection] = useState({});
  const [favStats, setFavStats] = useState({ myFavs: 0, myWL: 0, favLog: [], wlLog: [] });

  // Preview modal
  const [previewCurso, setPreviewCurso] = useState(null);
  const [previewAulas, setPreviewAulas] = useState([]);
  const [previewAulaAtual, setPreviewAulaAtual] = useState(null);

  // Jornada request
  const [savingJornada, setSavingJornada] = useState(false);
  const NIVEIS_JR = ['Iniciante', 'Intermediário', 'Avançado'];

  const cursosAprovados = cursos.filter(c => c.status === 'aprovado');
  const podesolicitarJornada = cursosAprovados.length >= 3;
  const [minhasJornadas, setMinhasJornadas] = useState([]);

  // Refresh owned jornadas whenever the tab becomes active or cursos load
  useEffect(() => {
    if (activeTab === 'jornada' && usuario) {
      setMinhasJornadas(getMinhasJornadas(usuario.id));
    }
  }, [activeTab, usuario]);

  // Edit request state
  const [editandoJornada, setEditandoJornada] = useState(null); // jornada being edited
  const [jornadaEditForm, setJornadaEditForm] = useState(null);
  const [jornadaEditMsg, setJornadaEditMsg] = useState('');
  const [savingJornadaEdit, setSavingJornadaEdit] = useState(false);

  const abrirEditarJornadaInstrutor = (j) => {
    setJornadaEditForm({ titulo: j.titulo, descricao: j.descricao, icon: j.icon, nivel: j.nivel, cursoIds: [...j.cursoIds] });
    setEditandoJornada(j);
    setJornadaEditMsg('');
  };

  const fecharEditarJornadaInstrutor = () => {
    setEditandoJornada(null);
    setJornadaEditForm(null);
    setJornadaEditMsg('');
  };

  const toggleCursoJornadaEdit = (id) => {
    setJornadaEditForm(f => ({
      ...f,
      cursoIds: f.cursoIds.includes(id) ? f.cursoIds.filter(x => x !== id) : [...f.cursoIds, id],
    }));
  };

  const handleJornadaEditSubmit = async (e) => {
    e.preventDefault();
    if (jornadaEditForm.cursoIds.length === 0) { setJornadaEditMsg('Selecione ao menos um curso.'); return; }
    setSavingJornadaEdit(true);
    setJornadaEditMsg('');
    try {
      await jornadaRequestAPI.enviarEdicao(usuario.id, editandoJornada.slug, jornadaEditForm);
      setJornadaEditMsg('Solicitação de alteração enviada! Aguarde aprovação do admin.');
      setTimeout(() => { setJornadaEditForm(null); setEditandoJornada(null); setJornadaEditMsg(''); setMinhasJornadas(getMinhasJornadas(usuario.id)); }, 2000);
    } catch (err) {
      setJornadaEditMsg(err.response?.data?.error || 'Erro ao enviar solicitação.');
    }
    setSavingJornadaEdit(false);
  };

  const toggleCursoJR = (_id) => {}; // kept for compat, no longer used directly

  const handleJornadaReqSubmit = async (e) => {
    e.preventDefault();
    if (jornadaEditForm.cursoIds.length === 0) { setJornadaEditMsg('Selecione ao menos um curso.'); return; }
    setSavingJornada(true);
    setJornadaEditMsg('');
    try {
      await jornadaRequestAPI.enviar(usuario.id, jornadaEditForm);
      setJornadaEditMsg('Solicitação enviada! Aguarde aprovação do admin.');
      setTimeout(() => { setJornadaEditForm(null); setJornadaEditMsg(''); setMinhasJornadas(getMinhasJornadas(usuario.id)); }, 2000);
    } catch (err) {
      setJornadaEditMsg(err.response?.data?.error || 'Erro ao enviar solicitação.');
    }
    setSavingJornada(false);
  };
  useEffect(() => { carregarMeusCursos(); }, []);
  useEffect(() => {
    if (activeTab === 'dashboard' && cursos.length > 0 && Object.keys(dashboardData).length === 0)
      carregarDashboard();
  }, [activeTab, cursos]);

  const carregarMeusCursos = async () => {
    setLoadingCursos(true);
    try {
      const res = await cursosAPI.meusCursos();
      setCursos(res.data || []);
    } catch {}
    setLoadingCursos(false);
  };

  // ── Dashboard ────────────────────────────────────────────────
  const carregarDashboard = async () => {
    setLoadingDash(true);
    const aprovados = cursos.filter(c => c.status === 'aprovado');
    // Load course stats + per-course favorites/watch-later in parallel
    const [entries, ...acoesPorCurso] = await Promise.all([
      Promise.all(aprovados.map(async (c) => {
        try {
          const [aRes, avRes] = await Promise.all([
            instrutorAPI.alunos(c.id),
            instrutorAPI.avaliacoes(c.id),
          ]);
          return [c.id, { alunos: aRes.data, avaliacoes: avRes.data }];
        } catch { return [c.id, null]; }
      })),
      ...aprovados.map(c =>
        Promise.all([
          acoesAPI.favoritosPorCurso(c.id).catch(() => ({ data: [] })),
          acoesAPI.assistirDepoisPorCurso(c.id).catch(() => ({ data: [] })),
        ])
      ),
    ]);
    setDashboardData(Object.fromEntries(entries));
    // Flatten all per-course logs
    const favLog = acoesPorCurso.flatMap(([f]) => Array.isArray(f.data) ? f.data : []);
    const wlLog  = acoesPorCurso.flatMap(([, w]) => Array.isArray(w.data) ? w.data : []);
    setFavStats({ myFavs: favLog.length, myWL: wlLog.length, favLog, wlLog });
    setLoadingDash(false);
  };

  const toggleDashCurso = (id) => {
    setDashExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    setDashSection(prev => ({ ...prev, [id]: prev[id] || 'alunos' }));
  };

  const dashKPIs = () => {
    let matriculas = 0, reviews = 0, somaMedia = 0, countMedia = 0;
    Object.values(dashboardData).forEach(d => {
      if (!d) return;
      matriculas += d.alunos?.totalAlunos || 0;
      reviews    += d.avaliacoes?.total   || 0;
      if (d.avaliacoes?.media > 0) { somaMedia += d.avaliacoes.media; countMedia++; }
    });
    return { matriculas, reviews, media: countMedia > 0 ? (somaMedia / countMedia).toFixed(1) : '—' };
  };

  const renderStars = (nota) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`cd-star${i < Math.round(nota || 0) ? ' on' : ''}`}>★</span>
  ));

  const fmtDate = (s) => s
    ? new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  // backend returns nomeUsuario / tituloCurso / dataAcao
  const TrackingTable = ({ entries, emptyMsg }) => {
    if (entries.length === 0) return <p className="cd-empty">{emptyMsg}</p>;
    return (
      <div className="adm-tracking-table">
        <div className="adm-tracking-head">
          <span>Usuário</span>
          <span>Curso</span>
          <span>Data</span>
        </div>
        {entries.map((entry, i) => (
          <div key={i} className="adm-tracking-row">
            <div className="adm-tracking-user">
              <UserAvatar foto={entry.fotoUsuario || null} nome={entry.nomeUsuario || '?'} size={28} />
              <span>{entry.nomeUsuario || '—'}</span>
            </div>
            <span className="adm-tracking-course">{entry.tituloCurso || '—'}</span>
            <span className="adm-tracking-date">{fmtDate(entry.dataAcao)}</span>
          </div>
        ))}
      </div>
    );
  };

  // ── Course form ──────────────────────────────────────────────
  const abrirNovoCurso = () => {
    setCursoForm(CURSO_VAZIO);
    setEditandoCursoId(null);
    setCursoMsg('');
    setShowFormPreview(false);
    setShowCursoForm(true);
  };

  const abrirEditarCurso = (curso) => {
    const parseJSON = (str, fallback) => { try { return str ? JSON.parse(str) : fallback; } catch { return fallback; } };
    setCursoForm({
      titulo: curso.titulo || '',
      descricao: curso.descricao || '',
      url: curso.url || '',
      categoria: curso.categoria || '',
      instrutor: curso.instrutor || '',
      duracao: curso.duracao ? String(Math.round((curso.duracao / 60) * 10) / 10) : '',
      imagem: curso.imagem || '',
      descricaoDetalhada: curso.descricaoDetalhada || '',
      linksExternos: parseJSON(curso.linksExternos, []),
      anexos: parseJSON(curso.anexos, []),
    });
    setEditandoCursoId(curso.id);
    setCursoMsg('');
    setShowFormPreview(false);
    setShowCursoForm(true);
  };

  const handleCursoSubmit = async (e) => {
    e.preventDefault();
    setSavingCurso(true);
    setCursoMsg('');
    const dados = {
      ...cursoForm,
      duracao: Math.round((parseFloat(cursoForm.duracao) || 0) * 60),
      linksExternos: JSON.stringify(cursoForm.linksExternos.filter(l => l.url.trim())),
      anexos: JSON.stringify(cursoForm.anexos.filter(a => a.url.trim())),
    };
    try {
      if (editandoCursoId) {
        await cursosAPI.atualizar(editandoCursoId, dados);
        setCursoMsg('Curso atualizado! Aguardando aprovação do admin.');
      } else {
        await cursosAPI.criar(dados);
        setCursoMsg('Curso enviado para aprovação!');
      }
      carregarMeusCursos();
      setTimeout(() => { setShowCursoForm(false); setCursoMsg(''); }, 1800);
    } catch (err) {
      setCursoMsg(err.response?.data?.error || err.response?.data?.message || 'Erro ao salvar curso.');
    }
    setSavingCurso(false);
  };

  // ── Lesson manager ───────────────────────────────────────────
  const abrirAulas = async (curso) => {
    setAulasModal(curso);
    setAulasMsg('');
    try {
      const res = await aulasAPI.listarPorCurso(curso.id);
      const lista = (res.data || []).map(a => ({ ...a }));
      setAulas(lista.length > 0 ? lista : [{ ...AULA_VAZIA, ordem: 1 }]);
    } catch {
      setAulas([{ ...AULA_VAZIA, ordem: 1 }]);
    }
  };

  const adicionarAula = () => {
    setAulas(prev => [...prev, { ...AULA_VAZIA, ordem: prev.length + 1 }]);
  };

  const removerAula = (idx) => {
    setAulas(prev => prev.filter((_, i) => i !== idx).map((a, i) => ({ ...a, ordem: i + 1 })));
  };

  const atualizarAula = (idx, field, value) => {
    setAulas(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  };

  const moverAula = (idx, direcao) => {
    setAulas(prev => {
      const lista = [...prev];
      const alvo = idx + direcao;
      if (alvo < 0 || alvo >= lista.length) return lista;
      [lista[idx], lista[alvo]] = [lista[alvo], lista[idx]];
      return lista.map((a, i) => ({ ...a, ordem: i + 1 }));
    });
  };

  const moverAulaParaOrdem = (idx, novaOrdem) => {
    const alvo = Math.max(0, Math.min(aulas.length - 1, novaOrdem - 1));
    if (alvo === idx) return;
    setAulas(prev => {
      const lista = [...prev];
      const [item] = lista.splice(idx, 1);
      lista.splice(alvo, 0, item);
      return lista.map((a, i) => ({ ...a, ordem: i + 1 }));
    });
  };

  // ── Preview

  const salvarAulas = async () => {
    const invalidas = aulas.filter(a => !a.titulo.trim() || !a.url.trim());
    if (invalidas.length > 0) { setAulasMsg('Todas as aulas precisam de título e URL.'); return; }
    setSavingAulas(true);
    setAulasMsg('');
    try {
      await aulasAPI.salvarAulas(aulasModal.id, aulas.map((a, i) => ({
        titulo: a.titulo,
        url: a.url,
        descricao: a.descricao || '',
        ordem: i + 1,
      })));
      setAulasMsg('Aulas salvas com sucesso!');
      setTimeout(() => { setAulasModal(null); setAulasMsg(''); }, 1200);
    } catch (err) {
      setAulasMsg(err.response?.data?.error || 'Erro ao salvar aulas.');
    }
    setSavingAulas(false);
  };

  // ── Preview ──────────────────────────────────────────────────
  const abrirPreview = async (curso) => {
    setPreviewCurso(curso);
    setPreviewAulaAtual(null);
    try {
      const res = await aulasAPI.listarPorCurso(curso.id);
      const lista = res.data || [];
      setPreviewAulas(lista);
      if (lista.length > 0) setPreviewAulaAtual(lista[0]);
    } catch {
      setPreviewAulas([]);
    }
  };

  return (
    <div>
      <Header />
      <div className="admin-container">

        {/* Header */}
        <div className="admin-header">
          <div className="admin-title">
            <h1>Instrutor</h1>
            <p>Olá, {usuario?.nome}! Gerencie seus cursos e aulas.</p>
          </div>
          <div className="admin-stats">
            <div className="stat-card">
              <span className="stat-number">{cursos.length}</span>
              <span className="stat-label">Meus Cursos</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{cursos.filter(c => c.status === 'aprovado').length}</span>
              <span className="stat-label">Aprovados</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{cursos.filter(c => c.status === 'pendente').length}</span>
              <span className="stat-label">Pendentes</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="admin-actions">
          <button className="btn-new-course" onClick={abrirNovoCurso}>+ Novo Curso</button>
        </div>

        {/* Tab nav */}
        <div style={{ display: 'flex', gap: '8px', margin: '0 0 24px', borderBottom: '1px solid #2c2c2e', paddingBottom: '0' }}>
          {['cursos', 'dashboard', 'jornada'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px', background: 'none', border: 'none',
                borderBottom: activeTab === tab ? '2px solid #ffd700' : '2px solid transparent',
                color: activeTab === tab ? '#ffd700' : '#888',
                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                textTransform: 'capitalize', transition: 'color 0.2s',
              }}
            >
              {tab === 'cursos' ? 'Meus Cursos' : tab === 'dashboard' ? 'Dashboard' : 'Jornada'}
            </button>
          ))}
        </div>

        {activeTab === 'cursos' && showCursoForm && (
          <div className="course-form-container">
            <form onSubmit={handleCursoSubmit} className="course-form">
                <div className="form-header">
                  <div style={{ flex: 1 }}>
                    <h2>{editandoCursoId ? 'Editar Curso' : 'Novo Curso'}</h2>
                    <p style={{ color: '#fbbf24', fontSize: '0.82rem', margin: '6px 0 0' }}>
                      {editandoCursoId
                        ? 'Ao salvar, o curso volta para análise do admin até ser reaprovado.'
                        : 'O curso será enviado para aprovação do administrador antes de ser publicado.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFormPreview(true)}
                    style={{
                      padding: '6px 14px', background: 'rgba(255,215,0,0.1)',
                      border: '1px solid rgba(255,215,0,0.3)', borderRadius: '8px',
                      color: '#ffd700', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                      whiteSpace: 'nowrap', alignSelf: 'flex-start', marginTop: '4px',
                    }}
                  >
                    Preview
                  </button>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Título *</label>
                    <input value={cursoForm.titulo} onChange={e => setCursoForm({ ...cursoForm, titulo: e.target.value })} required placeholder="Ex: React Completo" />
                  </div>
                  <div className="form-group">
                    <label>Categoria *</label>
                    <select value={cursoForm.categoria} onChange={e => setCursoForm({ ...cursoForm, categoria: e.target.value })} required>
                      <option value="">Selecione</option>
                      {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Descrição *</label>
                    <textarea value={cursoForm.descricao} onChange={e => setCursoForm({ ...cursoForm, descricao: e.target.value })} required rows={3} placeholder="Descreva o conteúdo do curso..." />
                  </div>
                  <div className="form-group full-width">
                    <label>Descrição Detalhada</label>
                    <textarea value={cursoForm.descricaoDetalhada} onChange={e => setCursoForm({ ...cursoForm, descricaoDetalhada: e.target.value })} rows={5} placeholder="Descrição completa exibida na página do curso. Suporta texto longo com objetivos, pré-requisitos, conteúdo programado..." />
                  </div>
                  <div className="form-group">
                    <label>URL Principal *</label>
                    <input type="url" value={cursoForm.url} onChange={e => setCursoForm({ ...cursoForm, url: e.target.value })} required placeholder="https://youtube.com/..." />
                  </div>
                  <div className="form-group">
                    <label>Instrutor</label>
                    <input value={cursoForm.instrutor} onChange={e => setCursoForm({ ...cursoForm, instrutor: e.target.value })} placeholder="Nome do instrutor" />
                  </div>
                  <div className="form-group">
                    <label>Duração (horas)</label>
                    <input type="number" value={cursoForm.duracao} onChange={e => setCursoForm({ ...cursoForm, duracao: e.target.value })} min="0.5" step="0.5" placeholder="8" />
                  </div>
                  <div className="form-group">
                    <label>URL da Imagem de Capa</label>
                    <input type="url" value={cursoForm.imagem} onChange={e => setCursoForm({ ...cursoForm, imagem: e.target.value })} placeholder="https://..." />
                  </div>
                </div>

                {/* ── Intro Page Section ── */}
                <div className="cf-section cf-section-intro">
                  <div className="cf-section-header">
                    <span className="cf-section-title">Página de Introdução</span>
                    <span className="cf-section-badge">Intro</span>
                  </div>
                  <p className="cf-section-desc">
                    Este conteúdo aparece na página de apresentação do curso — a primeira página que o aluno vê antes de se matricular.
                    Use para apresentar a proposta, objetivos e valor do curso de forma persuasiva.
                  </p>
                  <div className="form-grid" style={{ marginTop: '12px' }}>
                    <div className="form-group full-width">
                      <label>Texto de Introdução</label>
                      <textarea
                        placeholder="Descreva o projeto e a proposta do curso. Explique o que o aluno vai aprender, por que vale a pena e qual problema este curso resolve..."
                        value={cursoForm.descricaoDetalhada}
                        onChange={e => setCursoForm({ ...cursoForm, descricaoDetalhada: e.target.value })}
                        rows={7}
                      />
                    </div>
                    <div className="form-group">
                      <label>Imagem da Página de Introdução</label>
                      <input
                        type="url"
                        placeholder="https://... — imagem exibida no hero da página de introdução"
                        value={cursoForm.imagem}
                        onChange={e => setCursoForm({ ...cursoForm, imagem: e.target.value })}
                      />
                      {cursoForm.imagem && (
                        <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', maxHeight: 120, border: '1px solid #2c2c2e' }}>
                          <img src={cursoForm.imagem} alt="preview" style={{ width: '100%', objectFit: 'cover', maxHeight: 120, display: 'block' }}
                            onError={e => e.target.style.display = 'none'} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Course Details Resources ── */}
                <div className="cf-section">
                  <div className="cf-section-header">
                    <span className="cf-section-title">Links Externos</span>
                    <button type="button" className="cf-add-btn" onClick={() => setCursoForm(f => ({ ...f, linksExternos: [...f.linksExternos, { titulo: '', url: '' }] }))}>+ Adicionar Link</button>
                  </div>
                  {cursoForm.linksExternos.length === 0 && <p className="cf-empty">Nenhum link adicionado. Links aparecerão na página do curso.</p>}
                  {cursoForm.linksExternos.map((link, i) => (
                    <div key={i} className="cf-resource-row">
                      <input className="cf-resource-input" placeholder="Título do link" value={link.titulo}
                        onChange={e => { const arr = [...cursoForm.linksExternos]; arr[i] = { ...arr[i], titulo: e.target.value }; setCursoForm(f => ({ ...f, linksExternos: arr })); }} />
                      <input className="cf-resource-input cf-resource-url" placeholder="https://..." value={link.url}
                        onChange={e => { const arr = [...cursoForm.linksExternos]; arr[i] = { ...arr[i], url: e.target.value }; setCursoForm(f => ({ ...f, linksExternos: arr })); }} />
                      <button type="button" className="cf-remove-btn" onClick={() => setCursoForm(f => ({ ...f, linksExternos: f.linksExternos.filter((_, j) => j !== i) }))}>×</button>
                    </div>
                  ))}
                </div>

                <div className="cf-section">
                  <div className="cf-section-header">
                    <span className="cf-section-title">Anexos / Materiais</span>
                    <button type="button" className="cf-add-btn" onClick={() => setCursoForm(f => ({ ...f, anexos: [...f.anexos, { nome: '', url: '' }] }))}>+ Adicionar Anexo</button>
                  </div>
                  {cursoForm.anexos.length === 0 && <p className="cf-empty">Nenhum anexo adicionado. Cole a URL de um arquivo (PDF, ZIP, etc.).</p>}
                  {cursoForm.anexos.map((anexo, i) => (
                    <div key={i} className="cf-resource-row">
                      <input className="cf-resource-input" placeholder="Nome do arquivo" value={anexo.nome}
                        onChange={e => { const arr = [...cursoForm.anexos]; arr[i] = { ...arr[i], nome: e.target.value }; setCursoForm(f => ({ ...f, anexos: arr })); }} />
                      <input className="cf-resource-input cf-resource-url" placeholder="https://... (URL do arquivo)" value={anexo.url}
                        onChange={e => { const arr = [...cursoForm.anexos]; arr[i] = { ...arr[i], url: e.target.value }; setCursoForm(f => ({ ...f, anexos: arr })); }} />
                      <button type="button" className="cf-remove-btn" onClick={() => setCursoForm(f => ({ ...f, anexos: f.anexos.filter((_, j) => j !== i) }))}>×</button>
                    </div>
                  ))}
                </div>

                {cursoMsg && (
                  <p className={`colab-msg ${cursoMsg.includes('Erro') ? 'erro' : 'sucesso'}`}>{cursoMsg}</p>
                )}
                <div className="form-actions">
                  <button type="submit" className="btn-submit" disabled={savingCurso}>
                    {savingCurso ? 'Salvando...' : (editandoCursoId ? 'Atualizar' : 'Enviar para Aprovação')}
                  </button>
                  <button type="button" className="btn-cancel" onClick={() => { setShowCursoForm(false); setShowFormPreview(false); }}>Cancelar</button>
                </div>
              </form>
          </div>
        )}

        {showFormPreview && (
          <CourseFormPreview
            form={cursoForm}
            aulas={aulas}
            onClose={() => setShowFormPreview(false)}
            role="colaborador"
          />
        )}

        {/* Dashboard tab */}
        {activeTab === 'dashboard' && (() => {
          const aprovados = cursos.filter(c => c.status === 'aprovado');
          const kpis = dashKPIs();
          return (
            <div className="cd-dash">

              {/* KPI bar */}
              <div className="cd-kpis">
                <div className="cd-kpi">
                  <span className="cd-kpi-val" style={{ color: '#ffd700' }}>{aprovados.length}</span>
                  <span className="cd-kpi-lbl">Cursos Ativos</span>
                </div>
                <div className="cd-kpi">
                  <span className="cd-kpi-val" style={{ color: '#60a5fa' }}>{kpis.matriculas}</span>
                  <span className="cd-kpi-lbl">Matrículas</span>
                </div>
                <div className="cd-kpi">
                  <span className="cd-kpi-val" style={{ color: '#f472b6' }}>{kpis.media}</span>
                  <span className="cd-kpi-lbl">Média Geral</span>
                </div>
                <div className="cd-kpi">
                  <span className="cd-kpi-val" style={{ color: '#34d399' }}>{kpis.reviews}</span>
                  <span className="cd-kpi-lbl">Avaliações</span>
                </div>
                <div className="cd-kpi">
                  <span className="cd-kpi-val" style={{ color: '#ef4444' }}>{favStats.myFavs}</span>
                  <span className="cd-kpi-lbl">Favoritos</span>
                </div>
                <div className="cd-kpi">
                  <span className="cd-kpi-val" style={{ color: '#fb923c' }}>{favStats.myWL}</span>
                  <span className="cd-kpi-lbl">Assistir Depois</span>
                </div>
              </div>

              {loadingDash ? (
                <p className="cd-loading">Carregando dashboard...</p>
              ) : aprovados.length === 0 ? (
                <div className="no-courses">
                  <h3>Nenhum curso aprovado ainda.</h3>
                  <p>Envie um curso e aguarde a aprovação do admin.</p>
                </div>
              ) : (
                <div className="cd-list">
                  {aprovados.map(curso => {
                    const d           = dashboardData[curso.id];
                    const expanded    = dashExpanded[curso.id];
                    const section     = dashSection[curso.id] || 'alunos';
                    const totalAlunos = d?.alunos?.totalAlunos ?? '—';
                    const totalAulas  = d?.alunos?.totalAulas  ?? 0;
                    const media       = d?.avaliacoes?.media   ?? 0;
                    const totalRev    = d?.avaliacoes?.total   ?? '—';
                    const alunos      = d?.alunos?.alunos      || [];
                    const avaliacoes  = d?.avaliacoes?.avaliacoes || [];

                    return (
                      <div key={curso.id} className={`cd-card${expanded ? ' expanded' : ''}`}>

                        {/* Header row — click to expand */}
                        <div className="cd-card-header" onClick={() => toggleDashCurso(curso.id)}>
                          <div className="cd-card-left">
                            <span className="cd-chevron">{expanded ? '▾' : '▸'}</span>
                            <div>
                              <div className="cd-card-title">{curso.titulo}</div>
                              <div className="cd-card-meta">
                                <span className="course-category" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>{curso.categoria}</span>
                                {media > 0 && (
                                  <span className="cd-meta-rating">
                                    {renderStars(media)}
                                    <span className="cd-meta-score">{media}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="cd-card-stats">
                            <div className="cd-stat"><span style={{ color: '#60a5fa' }}>{totalAlunos}</span><span>Matrículas</span></div>
                            <div className="cd-stat"><span style={{ color: '#ffd700' }}>{totalAulas}</span><span>Aulas</span></div>
                            <div className="cd-stat"><span style={{ color: '#f472b6' }}>{media > 0 ? media : '—'}</span><span>Média</span></div>
                            <div className="cd-stat"><span style={{ color: '#34d399' }}>{totalRev}</span><span>Reviews</span></div>
                          </div>
                        </div>

                        {/* Expanded detail */}
                        {expanded && (
                          <div className="cd-detail">
                            <div className="cd-subtabs">
                              <button
                                className={`cd-subtab${section === 'alunos' ? ' active' : ''}`}
                                onClick={() => setDashSection(p => ({ ...p, [curso.id]: 'alunos' }))}
                              >
                                Alunos & Progresso <span className="cd-subtab-count">{alunos.length}</span>
                              </button>
                              <button
                                className={`cd-subtab${section === 'avaliacoes' ? ' active' : ''}`}
                                onClick={() => setDashSection(p => ({ ...p, [curso.id]: 'avaliacoes' }))}
                              >
                                Avaliações <span className="cd-subtab-count">{avaliacoes.length}</span>
                              </button>
                            </div>

                            {/* Alunos */}
                            {section === 'alunos' && (
                              <div className="cd-alunos">
                                {alunos.length === 0 ? (
                                  <p className="cd-empty">Nenhum aluno matriculado ainda.</p>
                                ) : (
                                  <>
                                    <div className="cd-alunos-head">
                                      <span>Aluno</span>
                                      <span>Progresso</span>
                                      <span>Aulas</span>
                                      <span>Status</span>
                                      <span>Inscrito em</span>
                                    </div>
                                    {alunos.map((aluno, i) => {
                                      const concluidas = aluno.aulas?.filter(a => a.concluida).length || 0;
                                      const pct = totalAulas > 0
                                        ? Math.round((concluidas / totalAulas) * 100)
                                        : (aluno.progresso || 0);
                                      return (
                                        <div key={i} className="cd-aluno-row">
                                          <div className="cd-aluno-nome">
                                            <UserAvatar foto={aluno.foto || null} nome={aluno.nome || ''} size={28} />
                                            <span>{aluno.nome}</span>
                                          </div>
                                          <div className="cd-prog-cell">
                                            <div className="cd-prog-track">
                                              <div className="cd-prog-fill" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="cd-prog-pct">{pct}%</span>
                                          </div>
                                          <div className="cd-dots-cell">
                                            {aluno.aulas?.map((a, ai) => (
                                              <span
                                                key={ai}
                                                className={`cd-dot${a.concluida ? ' done' : ''}`}
                                                title={`Aula ${a.ordem}: ${a.titulo} — ${a.concluida ? 'Concluída' : 'Pendente'}`}
                                              />
                                            ))}
                                            {(!aluno.aulas || aluno.aulas.length === 0) && <span className="cd-no-aulas">—</span>}
                                          </div>
                                          <div>
                                            {aluno.concluido
                                              ? <span className="cd-badge-done">Concluído</span>
                                              : <span className="cd-badge-prog">Em progresso</span>
                                            }
                                          </div>
                                          <div className="cd-date">{fmtDate(aluno.dataInscricao)}</div>
                                        </div>
                                      );
                                    })}
                                  </>
                                )}
                              </div>
                            )}

                            {/* Avaliações */}
                            {section === 'avaliacoes' && (
                              <div className="cd-avaliacoes">
                                {avaliacoes.length === 0 ? (
                                  <p className="cd-empty">Nenhuma avaliação ainda.</p>
                                ) : (
                                  <>
                                    <div className="cd-av-summary">
                                      <div className="cd-av-score">
                                        <span className="cd-av-big">{media > 0 ? media : '—'}</span>
                                        <div className="cd-av-stars">{renderStars(media)}</div>
                                        <span className="cd-av-count">{avaliacoes.length} avaliações</span>
                                      </div>
                                      <div className="cd-av-bars">
                                        {[5, 4, 3, 2, 1].map(star => {
                                          const cnt = avaliacoes.filter(a => Math.round(a.nota) === star).length;
                                          const pct = avaliacoes.length > 0 ? Math.round((cnt / avaliacoes.length) * 100) : 0;
                                          return (
                                            <div key={star} className="cd-av-bar-row">
                                              <span className="cd-av-star-lbl">{star}★</span>
                                              <div className="cd-av-bar-track">
                                                <div className="cd-av-bar-fill" style={{ width: `${pct}%` }} />
                                              </div>
                                              <span className="cd-av-bar-cnt">{cnt}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    <div className="cd-av-list">
                                      {avaliacoes.map((av, i) => (
                                        <div key={i} className="cd-av-item">
                                          <div className="cd-av-item-top">
                                            <div>{renderStars(av.nota)}</div>
                                            <span className="cd-av-item-date">{fmtDate(av.dataCriacao || av.data)}</span>
                                          </div>
                                          {av.comentario && <p className="cd-av-comment">{av.comentario}</p>}
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── User-level tracking for instructor's courses ── */}
              {(favStats.favLog.length > 0 || favStats.wlLog.length > 0) && (
                <div className="adm-tracking-section">
                  <div className="adm-tracking-tabs">
                    <div className="adm-tracking-block">
                      <div className="adm-tracking-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, color: '#ef4444', flexShrink: 0 }}>
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        <span>Favoritos nos Meus Cursos</span>
                        <span className="adm-tracking-count">{favStats.favLog.length}</span>
                      </div>
                      <TrackingTable entries={favStats.favLog} emptyMsg="Nenhum favorito registrado ainda." />
                    </div>
                    <div className="adm-tracking-block">
                      <div className="adm-tracking-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, color: '#ffd700', flexShrink: 0 }}>
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span>Assistir Depois nos Meus Cursos</span>
                        <span className="adm-tracking-count">{favStats.wlLog.length}</span>
                      </div>
                      <TrackingTable entries={favStats.wlLog} emptyMsg="Nenhum item salvo ainda." />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Jornada tab — same UI as Admin, scoped to instructor-owned jornadas */}
        {activeTab === 'jornada' && (
          <div className="courses-management">
            <div className="management-header">
              <h2>Minhas Jornadas</h2>
              {podesolicitarJornada && (
                <button className="btn-new-course" onClick={() => {
                  setJornadaEditForm({ titulo: '', descricao: '', icon: '', nivel: 'Intermediário', cursoIds: [] });
                  setEditandoJornada(null);
                  setJornadaEditMsg('');
                }}>+ Solicitar Nova Jornada</button>
              )}
            </div>

            {/* Eligibility notice */}
            {!podesolicitarJornada && (
              <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem' }}>🔒</span>
                <span style={{ color: '#888', fontSize: '0.85rem' }}>Solicitar nova jornada requer <strong style={{ color: '#ffd700' }}>3 cursos aprovados</strong>. Você tem <strong style={{ color: '#34d399' }}>{cursosAprovados.length}</strong>/3.</span>
              </div>
            )}

            {/* ── Inline form (new request OR edit request) ── */}
            {jornadaEditForm && (
              <div className="course-form-container">
                <form onSubmit={editandoJornada ? handleJornadaEditSubmit : handleJornadaReqSubmit} className="course-form">
                  <div className="form-header" style={{ marginBottom: '1.5rem' }}>
                    <h2>{editandoJornada ? `Propor Alterações: ${editandoJornada.titulo}` : 'Nova Solicitação de Jornada'}</h2>
                    <p style={{ color: '#fbbf24', fontSize: '0.82rem', margin: '6px 0 0' }}>
                      {editandoJornada
                        ? 'As alterações serão enviadas para aprovação do admin antes de serem aplicadas.'
                        : 'A jornada será enviada para aprovação do administrador antes de ser publicada.'}
                    </p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Título *</label>
                      <input value={jornadaEditForm.titulo} onChange={e => setJornadaEditForm(f => ({ ...f, titulo: e.target.value }))} required placeholder="Ex: Jornada Full Stack" />
                    </div>
                    <div className="form-group">
                      <label>Nível *</label>
                      <select value={jornadaEditForm.nivel} onChange={e => setJornadaEditForm(f => ({ ...f, nivel: e.target.value }))}>
                        {NIVEIS_JR.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div className="form-group full-width">
                      <label>Descrição *</label>
                      <textarea value={jornadaEditForm.descricao} onChange={e => setJornadaEditForm(f => ({ ...f, descricao: e.target.value }))} required rows={3} placeholder="Descreva o objetivo e público-alvo desta jornada..." />
                    </div>
                    <div className="form-group">
                      <label>Ícone / Sigla</label>
                      <input value={jornadaEditForm.icon} onChange={e => setJornadaEditForm(f => ({ ...f, icon: e.target.value }))} placeholder="Ex: FS" maxLength={4} />
                    </div>
                  </div>

                  {/* Course picker — same as Admin: selected list with reorder + available tiles */}
                  <div className="cf-section">
                    <div className="cf-section-header">
                      <span className="cf-section-title">Cursos da Jornada ({jornadaEditForm.cursoIds.length} selecionados)</span>
                    </div>
                    <p className="cf-empty">Clique para adicionar/remover. Use as setas para reordenar.</p>

                    {jornadaEditForm.cursoIds.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        {jornadaEditForm.cursoIds.map((id, idx) => {
                          const c = cursos.find(x => x.id === id);
                          return (
                            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '8px', marginBottom: '6px' }}>
                              <span style={{ color: '#ffd700', fontWeight: 700, minWidth: '22px', fontSize: '0.8rem' }}>{idx + 1}</span>
                              <span style={{ flex: 1, color: '#f2f2f7', fontSize: '0.85rem' }}>{c ? c.titulo : `Curso #${id}`}</span>
                              <button type="button" onClick={() => setJornadaEditForm(f => { const ids=[...f.cursoIds]; if(idx>0){[ids[idx],ids[idx-1]]=[ids[idx-1],ids[idx]];} return {...f,cursoIds:ids}; })} disabled={idx===0} style={{ background:'none',border:'none',color:'#888',cursor:'pointer',fontSize:'0.8rem' }}>▲</button>
                              <button type="button" onClick={() => setJornadaEditForm(f => { const ids=[...f.cursoIds]; if(idx<ids.length-1){[ids[idx],ids[idx+1]]=[ids[idx+1],ids[idx]];} return {...f,cursoIds:ids}; })} disabled={idx===jornadaEditForm.cursoIds.length-1} style={{ background:'none',border:'none',color:'#888',cursor:'pointer',fontSize:'0.8rem' }}>▼</button>
                              <button type="button" onClick={() => setJornadaEditForm(f => ({ ...f, cursoIds: f.cursoIds.filter(x => x !== id) }))} className="cf-remove-btn">×</button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px', maxHeight: '260px', overflowY: 'auto', padding: '4px' }}>
                      {cursos.filter(c => c.status === 'aprovado' && !jornadaEditForm.cursoIds.includes(c.id)).map(c => (
                        <div key={c.id} onClick={() => setJornadaEditForm(f => ({ ...f, cursoIds: [...f.cursoIds, c.id] }))}
                          style={{ padding: '8px 12px', background: '#1c1c1e', border: '1px solid #3a3a3c', borderRadius: '8px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor='#ffd700'}
                          onMouseLeave={e => e.currentTarget.style.borderColor='#3a3a3c'}>
                          <div style={{ fontSize: '0.82rem', color: '#f2f2f7', fontWeight: 500 }}>{c.titulo}</div>
                          <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '2px' }}>{c.categoria}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {jornadaEditMsg && (
                    <p className={`colab-msg ${jornadaEditMsg.includes('Erro') || jornadaEditMsg.includes('Selecione') ? 'erro' : 'sucesso'}`}>{jornadaEditMsg}</p>
                  )}
                  <div className="form-actions">
                    <button type="submit" className="btn-submit" disabled={savingJornadaEdit || savingJornada}>
                      {(savingJornadaEdit || savingJornada) ? 'Enviando...' : (editandoJornada ? 'Enviar para Aprovação' : 'Enviar Solicitação')}
                    </button>
                    <button type="button" className="btn-cancel" onClick={() => { setJornadaEditForm(null); setEditandoJornada(null); setJornadaEditMsg(''); }}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Owned jornada list — same card layout as Admin ── */}
            <div className="courses-grid">
              {minhasJornadas.map(j => (
                <div key={j.slug} className="course-card">
                  <div className="course-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '8px', padding: '4px 10px', color: '#ffd700', fontWeight: 700, fontSize: '0.85rem' }}>{j.icon}</span>
                      <span className="course-category">{j.nivel}</span>
                    </div>
                    <span style={{ color: '#888', fontSize: '0.8rem' }}>{j.cursoIds.length} curso{j.cursoIds.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="course-content">
                    <h3 className="course-title">{j.titulo}</h3>
                    <p className="course-description">{j.descricao}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                      {j.cursoIds.map((id, idx) => {
                        const c = cursos.find(x => x.id === id);
                        return <span key={id} style={{ background: '#2c2c2e', border: '1px solid #3a3a3c', borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem', color: '#aeaeb2' }}>{idx + 1}. {c ? c.titulo : `#${id}`}</span>;
                      })}
                    </div>
                  </div>
                  <div className="course-actions">
                    <button className="btn-edit" onClick={() => {
                      setJornadaEditForm({ titulo: j.titulo, descricao: j.descricao, icon: j.icon, nivel: j.nivel, cursoIds: [...j.cursoIds] });
                      setEditandoJornada(j);
                      setJornadaEditMsg('');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}>Editar</button>
                    <button className="btn-view" onClick={() => window.open(`/jornada/${j.slug}`, '_blank')}>Ver</button>
                  </div>
                </div>
              ))}
            </div>

            {minhasJornadas.length === 0 && !jornadaEditForm && (
              <div className="no-courses">
                <h3>Nenhuma jornada aprovada ainda</h3>
                <p>{podesolicitarJornada ? 'Clique em "+ Solicitar Nova Jornada" para enviar sua primeira solicitação.' : 'Você precisa de 3 cursos aprovados para solicitar uma jornada.'}</p>
              </div>
            )}
          </div>
        )}

        {/* Course list */}
        {activeTab === 'cursos' && <div className="courses-management">
          <div className="management-header">
            <h2>Meus Cursos</h2>
          </div>
          {loadingCursos ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>Carregando...</p>
          ) : cursos.length === 0 ? (
            <div className="no-courses">
              <h3>Nenhum curso ainda</h3>
              <p>Clique em "Novo Curso" para enviar seu primeiro curso!</p>
            </div>
          ) : (
            <div className="courses-grid">
              {cursos.map(curso => (
                <div key={curso.id} className="course-card">
                  <div className="course-header">
                    <div className="course-category">{curso.categoria}</div>
                    <StatusBadge status={curso.status} />
                  </div>
                  <div className="course-content">
                    <h3 className="course-title">{curso.titulo}</h3>
                    <p className="course-description">{curso.descricao}</p>
                    {curso.duracao > 0 && (
                      <p style={{ color: '#888', fontSize: '0.8rem', margin: '4px 0 0' }}>
                        {formatDuracao(curso.duracao)}
                      </p>
                    )}
                  </div>
                  <div className="course-actions">
                    <button className="btn-edit" onClick={() => abrirEditarCurso(curso)}>Editar</button>
                    <button className="btn-aulas" onClick={() => abrirAulas(curso)}>
                      Gerenciar Aulas
                    </button>
                    <button className="btn-view" onClick={() => abrirPreview(curso)}>
                      Pré-visualizar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>}
      </div>

      {/* ── Lesson manager modal ── */}
      {aulasModal && (
        <LessonManager
          curso={aulasModal}
          aulas={aulas}
          loading={savingAulas}
          msg={aulasMsg}
          onSave={salvarAulas}
          onClose={() => { setAulasModal(null); setAulasMsg(''); }}
          onAdd={adicionarAula}
          onRemove={removerAula}
          onUpdate={atualizarAula}
          onMove={moverAula}
          onMoveToPos={moverAulaParaOrdem}
        />
      )}

      {/* ── Preview modal ── */}
      {previewCurso && (
        <div className="modal-overlay" onClick={() => setPreviewCurso(null)}>
          <div className="colab-preview-modal" onClick={e => e.stopPropagation()}>

            {/* Preview header */}
            <div className="colab-preview-header">
              <div>
                <span className="colab-preview-badge">PRÉ-VISUALIZAÇÃO</span>
                <h2>{previewCurso.titulo}</h2>
                <p style={{ color: '#888', fontSize: '0.85rem', margin: '4px 0 0' }}>
                  Esta é a visão do aluno. Progresso e matrículas não são afetados.
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setPreviewCurso(null)}>×</button>
            </div>

            <div className="colab-preview-body">
              {/* Video player */}
              <div className="colab-preview-player">
                {previewAulaAtual ? (
                  getYouTubeId(previewAulaAtual.url) ? (
                    <iframe
                      key={previewAulaAtual.id || previewAulaAtual.url}
                      src={`https://www.youtube.com/embed/${getYouTubeId(previewAulaAtual.url)}?rel=0`}
                      title={previewAulaAtual.titulo}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="colab-preview-no-video">
                      <p>URL não é um vídeo do YouTube.</p>
                      <a href={previewAulaAtual.url} target="_blank" rel="noopener noreferrer">Abrir link externo</a>
                    </div>
                  )
                ) : (
                  <div className="colab-preview-no-video">
                    <p>Nenhuma aula disponível para pré-visualizar.</p>
                  </div>
                )}

                {/* Current lesson info */}
                {previewAulaAtual && (
                  <div className="colab-preview-aula-info">
                    <span className="colab-preview-aula-badge">Aula {previewAulaAtual.ordem}</span>
                    <span className="colab-preview-aula-titulo">{previewAulaAtual.titulo}</span>
                    {previewAulaAtual.descricao && (
                      <p style={{ color: '#888', fontSize: '0.82rem', margin: '6px 0 0' }}>{previewAulaAtual.descricao}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar: course info + lesson list */}
              <div className="colab-preview-sidebar">
                <div className="colab-preview-curso-info">
                  <span className="course-category" style={{ fontSize: '0.7rem' }}>{previewCurso.categoria}</span>
                  <h3>{previewCurso.titulo}</h3>
                  <p>{previewCurso.descricao}</p>
                  {previewCurso.duracao > 0 && (
                    <p style={{ color: '#ffd700', fontSize: '0.82rem', fontWeight: 600 }}>
                      ⏱ {formatDuracao(previewCurso.duracao)}
                    </p>
                  )}
                </div>

                <div className="colab-preview-aulas-lista">
                  <p style={{ color: '#888', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                    {previewAulas.length} {previewAulas.length === 1 ? 'Aula' : 'Aulas'}
                  </p>
                  {previewAulas.length === 0 ? (
                    <p style={{ color: '#666', fontSize: '0.85rem' }}>Nenhuma aula cadastrada.</p>
                  ) : (
                    previewAulas.map(aula => (
                      <div
                        key={aula.id || aula.ordem}
                        className={`colab-preview-aula-item ${previewAulaAtual?.ordem === aula.ordem ? 'ativa' : ''}`}
                        onClick={() => setPreviewAulaAtual(aula)}
                      >
                        <span className="colab-preview-aula-num">{aula.ordem}</span>
                        <span className="colab-preview-aula-nome">{aula.titulo}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Colaborador;
