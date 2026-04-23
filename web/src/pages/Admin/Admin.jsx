import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cursosAPI, usuariosAPI, aulasAPI, adminCursoAPI, acoesAPI } from '../../services/api';
import { getJornadas, saveJornadas, getMinhasJornadas } from '../../config/jornadas';
import Header from '../Header/Header';
import CourseFormPreview from '../../components/CourseFormPreview';
import LessonManager from '../../components/LessonManager';
import UserAvatar from '../../components/UserAvatar';
import '../../styles/admin-bigtech.css';

const Admin = () => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [cursosPendentes, setCursosPendentes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [activeTab, setActiveTab] = useState('cursos');
  const [form, setForm] = useState({
    titulo: '', descricao: '', url: '', categoria: '',
    instrutor: '', duracao: '', imagem: '', descricaoDetalhada: '',
    linksExternos: [], anexos: [],
  });
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Aulas
  const [cursoAulasId, setCursoAulasId] = useState(null);
  const [cursoAulasTitulo, setCursoAulasTitulo] = useState('');
  const [aulas, setAulas] = useState([]);
  const [showAulasForm, setShowAulasForm] = useState(false);
  const [aulasMsg, setAulasMsg] = useState('');

  // Dashboard
  const [dashData, setDashData] = useState({});
  const [loadingDash, setLoadingDash] = useState(false);
  const [dashExpanded, setDashExpanded] = useState({});
  const [dashSection, setDashSection] = useState({});
  const [favStats, setFavStats] = useState({ totalFav: 0, totalWL: 0, favLog: [], wlLog: [] });

  // Jornadas
  const [jornadas, setJornadas] = useState(getJornadas);
  const [jornadaForm, setJornadaForm] = useState(null); // null = closed, {} = new, {...} = editing
  const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado'];

  const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const salvarJornadas = (lista) => { saveJornadas(lista); setJornadas(lista); };

  const abrirNovaJornada = () => setJornadaForm({ titulo: '', descricao: '', icon: '', nivel: 'Iniciante', cursoIds: [] });

  const abrirEditarJornada = (j) => setJornadaForm({ ...j, cursoIds: [...j.cursoIds] });

  const fecharJornadaForm = () => setJornadaForm(null);

  const handleJornadaSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!jornadaForm.slug;
    const slug = isEdit ? jornadaForm.slug : slugify(jornadaForm.titulo) || ('jornada-' + Date.now());
    const nova = { slug, titulo: jornadaForm.titulo, descricao: jornadaForm.descricao, icon: jornadaForm.icon, nivel: jornadaForm.nivel, cursoIds: jornadaForm.cursoIds };
    // Preserve instrutorId if editing an instructor-owned jornada
    if (isEdit) {
      const existing = jornadas.find(j => j.slug === slug);
      if (existing?.instrutorId) nova.instrutorId = existing.instrutorId;
    }
    const lista = isEdit
      ? jornadas.map(j => j.slug === slug ? nova : j)
      : [...jornadas, nova];
    salvarJornadas(lista);
    if (jornadaForm._fromRequest) {
      await usuariosAPI.recusarColaborador(jornadaForm._fromRequest);
      carregarSolicitacoes();
      alert(`Jornada "${nova.titulo}" criada e solicitação encerrada!`);
    }
    fecharJornadaForm();
  };

  const deletarJornada = (slug) => {
    if (!window.confirm('Remover esta jornada?')) return;
    salvarJornadas(jornadas.filter(j => j.slug !== slug));
  };

  const toggleCursoNaJornada = (cursoId) => {
    const ids = jornadaForm.cursoIds.includes(cursoId)
      ? jornadaForm.cursoIds.filter(id => id !== cursoId)
      : [...jornadaForm.cursoIds, cursoId];
    setJornadaForm(f => ({ ...f, cursoIds: ids }));
  };

  const moverCursoJornada = (idx, dir) => {
    const ids = [...jornadaForm.cursoIds];
    const alvo = idx + dir;
    if (alvo < 0 || alvo >= ids.length) return;
    [ids[idx], ids[alvo]] = [ids[alvo], ids[idx]];
    setJornadaForm(f => ({ ...f, cursoIds: ids }));
  };

  // ── Jornada requests (reuse solicitacoes flow) ──
  // Requests are stored as justificativaColaborador = 'JORNADA_REQUEST:{...json}'
  // and use statusSolicitacao = 'pendente' on the user record.
  const jornadaRequests = solicitacoes.filter(
    s => s.justificativaColaborador?.startsWith('JORNADA_REQUEST:')
  );
  const colaboradorRequests = solicitacoes.filter(
    s => !s.justificativaColaborador?.startsWith('JORNADA_REQUEST:')
  );

  const parseJornadaRequest = (justificativa) => {
    try { return JSON.parse(justificativa.replace('JORNADA_REQUEST:', '')); }
    catch { return null; }
  };

  const aprovarJornadaRequest = async (usuario) => {
    const payload = parseJornadaRequest(usuario.justificativaColaborador);
    if (!payload) return;

    let lista;
    if (payload.editSlug) {
      // This is an edit request — apply changes to the existing jornada
      lista = jornadas.map(j =>
        j.slug === payload.editSlug
          ? { ...j, titulo: payload.titulo, descricao: payload.descricao, icon: payload.icon || j.icon, nivel: payload.nivel || j.nivel, cursoIds: payload.cursoIds || j.cursoIds }
          : j
      );
    } else {
      // New jornada — create and stamp instrutorId
      const slug = 'jornada-' + payload.titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
      const nova = { slug, titulo: payload.titulo, descricao: payload.descricao, icon: payload.icon || 'JR', nivel: payload.nivel || 'Intermediário', cursoIds: payload.cursoIds || [], instrutorId: Number(usuario.id) };
      lista = [...jornadas, nova];
    }

    salvarJornadas(lista);
    await usuariosAPI.recusarColaborador(usuario.id);
    const label = payload.editSlug ? `Alterações em "${payload.titulo}" aprovadas!` : `Jornada "${payload.titulo}" aprovada e publicada!`;
    alert(label);
    carregarSolicitacoes();
  };

  const rejeitarJornadaRequest = async (id) => {
    await usuariosAPI.recusarColaborador(id);
    alert('Solicitação de jornada rejeitada.');
    carregarSolicitacoes();
  };

  // Pending course preview
  const [previewPendente, setPreviewPendente] = useState(null);
  const [previewPendenteAulas, setPreviewPendenteAulas] = useState([]);

  useEffect(() => {
    carregarCursos();
    carregarUsuarios();
    carregarCursosPendentes();
    carregarSolicitacoes();
  }, []);

  const carregarCursos = async () => {
    try {
      const response = await cursosAPI.listarTodos();
      setCursos(response.data);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    }
  };

  const carregarCursosPendentes = async () => {
    try {
      const response = await cursosAPI.listarPendentes();
      setCursosPendentes(response.data);
    } catch (error) {
      console.error('Erro ao carregar cursos pendentes:', error);
    }
  };

  const carregarSolicitacoes = async () => {
    try {
      const response = await usuariosAPI.listarSolicitacoesPendentes();
      setSolicitacoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    }
  };

  const aprovarColaborador = async (id) => {
    try {
      await usuariosAPI.aprovarColaborador(id);
      alert('Colaborador aprovado!');
      carregarSolicitacoes();
      carregarUsuarios();
    } catch { alert('Erro ao aprovar'); }
  };

  const recusarColaborador = async (id) => {
    try {
      await usuariosAPI.recusarColaborador(id);
      alert('Solicitação recusada.');
      carregarSolicitacoes();
    } catch { alert('Erro ao recusar'); }
  };

  const aprovarCurso = async (id) => {
    try {
      await cursosAPI.aprovar(id);
      alert('Curso aprovado!');
      carregarCursosPendentes();
      carregarCursos();
    } catch { alert('Erro ao aprovar curso'); }
  };

  const rejeitarCurso = async (id) => {
    try {
      await cursosAPI.rejeitar(id);
      alert('Curso rejeitado.');
      carregarCursosPendentes();
    } catch { alert('Erro ao rejeitar curso'); }
  };

  const abrirPreviewPendente = async (curso) => {
    setPreviewPendente(curso);
    try {
      const res = await aulasAPI.listarPorCurso(curso.id);
      setPreviewPendenteAulas(res.data || []);
    } catch {
      setPreviewPendenteAulas([]);
    }
  };

  const fecharPreviewPendente = () => {
    setPreviewPendente(null);
    setPreviewPendenteAulas([]);
  };

  const aprovarDoPreview = async () => {
    if (!previewPendente) return;
    await aprovarCurso(previewPendente.id);
    fecharPreviewPendente();
  };

  const rejeitarDoPreview = async () => {
    if (!previewPendente) return;
    await rejeitarCurso(previewPendente.id);
    fecharPreviewPendente();
  };

  const carregarUsuarios = async () => {
    try {
      const response = await usuariosAPI.listarTodos();
      setUsuarios(response.data.usuarios || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  // Recarregar usuários a cada 5 segundos quando na aba usuários
  useEffect(() => {
    if (activeTab === 'usuarios') {
      const interval = setInterval(carregarUsuarios, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Dashboard
  useEffect(() => {
    if (activeTab === 'dashboard' && cursos.length > 0 && Object.keys(dashData).length === 0) {
      carregarDashboard();
    }
  }, [activeTab, cursos]);

  const carregarDashboard = async () => {
    setLoadingDash(true);
    const aprovados = cursos.filter(c => c.status === 'aprovado');
    const [entries, favRes, wlRes] = await Promise.all([
      Promise.all(aprovados.map(async (c) => {
        try {
          const [aRes, avRes] = await Promise.all([
            adminCursoAPI.alunos(c.id),
            adminCursoAPI.avaliacoes(c.id),
          ]);
          return [c.id, { alunos: aRes.data, avaliacoes: avRes.data }];
        } catch { return [c.id, null]; }
      })),
      acoesAPI.todosFavoritos().catch(() => ({ data: [] })),
      acoesAPI.todosAssistirDepois().catch(() => ({ data: [] })),
    ]);
    setDashData(Object.fromEntries(entries));
    const favLog = Array.isArray(favRes.data) ? favRes.data : [];
    const wlLog  = Array.isArray(wlRes.data)  ? wlRes.data  : [];
    setFavStats({ totalFav: favLog.length, totalWL: wlLog.length, favLog, wlLog });
    setLoadingDash(false);
  };

  const toggleDashCurso = (id) => {
    setDashExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    setDashSection(prev => ({ ...prev, [id]: prev[id] || 'alunos' }));
  };

  const dashTotals = () => {
    let totalAlunos = 0, totalReviews = 0, somaMedia = 0, countMedia = 0;
    Object.values(dashData).forEach(d => {
      if (!d) return;
      totalAlunos += d.alunos?.totalAlunos || 0;
      totalReviews += d.avaliacoes?.total || 0;
      if (d.avaliacoes?.media > 0) { somaMedia += d.avaliacoes.media; countMedia++; }
    });
    return { totalAlunos, totalReviews, mediaGeral: countMedia > 0 ? (somaMedia / countMedia).toFixed(1) : '—' };
  };

  // ── shared helper ─────────────────────────────────────────────
  const fmtAcaoDate = (dataAcao) => {
    if (!dataAcao) return '—';
    // backend returns LocalDateTime.toString() → "2024-01-15T10:30:00"
    return new Date(dataAcao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // ── tracking table renderer (reused for both fav and wl) ──────
  const TrackingTable = ({ entries, emptyMsg }) => {
    if (entries.length === 0) return <p className="adm-empty">{emptyMsg}</p>;
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
            <span className="adm-tracking-date">{fmtAcaoDate(entry.dataAcao)}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderStars = (nota) => {
    const n = Math.round(nota || 0);
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < n ? '#ffd700' : '#3a3a3c', fontSize: '0.85rem' }}>★</span>
    ));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const dadosCurso = {
      ...form,
      duracao: Math.round((parseFloat(form.duracao) || 0) * 60),
      linksExternos: JSON.stringify(form.linksExternos.filter(l => l.url.trim())),
      anexos: JSON.stringify(form.anexos.filter(a => a.url.trim())),
    };
    
    try {
      if (editando) {
        await cursosAPI.atualizar(editando, dadosCurso);
        alert('Curso atualizado com sucesso!');
        setEditando(null);
      } else {
        await cursosAPI.criar(dadosCurso);
        alert('Curso criado com sucesso!');
      }
      resetForm();
      carregarCursos();
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao salvar curso:', error);
      alert('Erro: ' + (error.response?.data?.error || error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ titulo: '', descricao: '', url: '', categoria: '', instrutor: '', duracao: '', imagem: '', descricaoDetalhada: '', linksExternos: [], anexos: [] });
    setEditando(null);
    setShowPreview(false);
  };

  const editar = (curso) => {
    const parseJSON = (str, fb) => { try { return str ? JSON.parse(str) : fb; } catch { return fb; } };
    setForm({
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
    setEditando(curso.id);
    setShowForm(true);
    setShowPreview(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deletar = async (id, titulo) => {
    if (window.confirm(`Tem certeza que deseja deletar o curso "${titulo}"?\n\nEsta ação não pode ser desfeita.`)) {
      setLoading(true);
      try {
        await cursosAPI.deletar(id);
        alert('Curso deletado com sucesso!');
        carregarCursos();
      } catch (error) {
        console.error('Erro ao deletar curso:', error);
        alert('Erro ao deletar curso');
      } finally {
        setLoading(false);
      }
    }
  };

  const gerenciarAulas = async (cursoId, cursoTitulo) => {
    setCursoAulasId(cursoId);
    setCursoAulasTitulo(cursoTitulo || '');
    setAulasMsg('');
    setShowAulasForm(true);
    try {
      const res = await aulasAPI.listarPorCurso(cursoId);
      const lista = res.data || [];
      setAulas(lista.length > 0 ? lista : [{ titulo: '', url: '', descricao: '', ordem: 1 }]);
    } catch {
      setAulas([{ titulo: '', url: '', descricao: '', ordem: 1 }]);
    }
  };

  const adicionarAula = () => {
    setAulas(prev => [...prev, { titulo: '', url: '', descricao: '', ordem: prev.length + 1 }]);
  };

  const removerAula = (index) => {
    setAulas(prev => prev.filter((_, i) => i !== index).map((a, i) => ({ ...a, ordem: i + 1 })));
  };

  const atualizarAula = (index, campo, valor) => {
    setAulas(prev => prev.map((a, i) => i === index ? { ...a, [campo]: valor } : a));
  };

  const moverAula = (idx, dir) => {
    setAulas(prev => {
      const lista = [...prev];
      const alvo = idx + dir;
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

  const salvarAulas = async () => {
    if (!cursoAulasId) return;
    const invalidas = aulas.filter(a => !a.titulo?.trim() || !a.url?.trim());
    if (invalidas.length > 0) { setAulasMsg('Todas as aulas precisam de título e URL.'); return; }
    setLoading(true);
    setAulasMsg('');
    try {
      await aulasAPI.salvarAulas(cursoAulasId, aulas.map((a, i) => ({
        titulo: a.titulo.trim(), url: a.url.trim(),
        descricao: a.descricao ? a.descricao.trim() : '', ordem: i + 1,
      })));
      setAulasMsg('Aulas salvas com sucesso!');
      setTimeout(() => {
        setShowAulasForm(false); setCursoAulasId(null);
        setCursoAulasTitulo(''); setAulas([]); setAulasMsg('');
        carregarCursos();
      }, 1200);
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Erro desconhecido';
      setAulasMsg('Erro ao salvar aulas: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredCursos = cursos.filter(curso => {
    const matchesSearch = curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         curso.instrutor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || curso.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categorias = [
    'Frontend', 'Backend', 'Data Science', 'Database', 'DevOps',
    'Mobile', 'Design', 'Marketing', 'Negócios', 'Idiomas',
    'Música', 'Violão', 'Canto', 'Fotografia', 'Saúde', 'Diversos',
  ];

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  return (
    <>
      <div>
        <Header />
        <div className="admin-container">
        <div className="admin-header">
          <div className="admin-title">
            <h1>Painel Administrativo</h1>
            <p>Gerencie os cursos da plataforma Learnly</p>
          </div>
          <div className="admin-stats">
            <div className="stat-card">
              <span className="stat-number">{cursos.length}</span>
              <span className="stat-label">Total de Cursos</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{cursosPendentes.length}</span>
              <span className="stat-label">Cursos Pendentes</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{usuarios.length}</span>
              <span className="stat-label">Usuários</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{colaboradorRequests.length}</span>
              <span className="stat-label">Solicitações</span>
            </div>
          </div>
        </div>

        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'cursos' ? 'active' : ''}`} onClick={() => setActiveTab('cursos')}>Cursos</button>
          <button className={`tab-btn ${activeTab === 'pendentes' ? 'active' : ''}`} onClick={() => setActiveTab('pendentes')}>
            Cursos Pendentes {cursosPendentes.length > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', padding: '1px 6px', fontSize: '11px', marginLeft: '6px' }}>{cursosPendentes.length}</span>}
          </button>
          <button className={`tab-btn ${activeTab === 'solicitacoes' ? 'active' : ''}`} onClick={() => setActiveTab('solicitacoes')}>
            Solicitações {colaboradorRequests.length > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', padding: '1px 6px', fontSize: '11px', marginLeft: '6px' }}>{colaboradorRequests.length}</span>}
          </button>
          <button className={`tab-btn ${activeTab === 'usuarios' ? 'active' : ''}`} onClick={() => setActiveTab('usuarios')}>Usuários</button>
          <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={`tab-btn ${activeTab === 'jornadas' ? 'active' : ''}`} onClick={() => setActiveTab('jornadas')}>Jornadas</button>
        </div>

        {activeTab === 'cursos' && (
          <div className="admin-actions">
            <button
              className="btn-new-course"
              onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); }}
            >
              {showForm ? 'Cancelar' : '+ Novo Curso'}
            </button>
          </div>
        )}

        {activeTab === 'cursos' && showForm && (
          <div className="course-form-container">
            <form onSubmit={handleSubmit} className="course-form">
              <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2>{editando ? 'Editar Curso' : 'Criar Novo Curso'}</h2>
                  <p style={{ color: '#34d399', fontSize: '0.82rem', margin: '4px 0 0' }}>
                    {editando
                      ? 'Alterações aplicadas imediatamente — sem necessidade de reaprovação.'
                      : 'Cursos criados pelo admin são publicados automaticamente.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  style={{
                    padding: '7px 16px', background: 'rgba(255,215,0,0.1)',
                    border: '1px solid rgba(255,215,0,0.3)', borderRadius: '8px',
                    color: '#ffd700', fontSize: '0.82rem', fontWeight: 600,
                    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  Preview
                </button>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Título do Curso *</label>
                  <input type="text" placeholder="Ex: React Completo" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Categoria *</label>
                  <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} required>
                    <option value="">Selecione uma categoria</option>
                    {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Descrição *</label>
                  <textarea placeholder="Descrição curta exibida nos cards e no topo da página..." value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} required rows={3} />
                </div>
                <div className="form-group full-width">
                  <label>Descrição Detalhada</label>
                  <textarea placeholder="Descrição completa: objetivos, pré-requisitos, conteúdo programático..." value={form.descricaoDetalhada} onChange={e => setForm({...form, descricaoDetalhada: e.target.value})} rows={5} />
                </div>
                <div className="form-group">
                  <label>URL Principal *</label>
                  <input type="url" placeholder="https://youtube.com/..." value={form.url} onChange={e => setForm({...form, url: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Instrutor</label>
                  <input type="text" placeholder="Nome do instrutor" value={form.instrutor} onChange={e => setForm({...form, instrutor: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Duração (horas)</label>
                  <div className="duration-input-group">
                    <input type="number" placeholder="8" value={form.duracao} onChange={e => setForm({...form, duracao: e.target.value})} min="0.5" step="0.5" />
                    <span className="duration-unit">horas</span>
                  </div>
                  <small className="duration-help">Ex: 8 para 8 horas</small>
                </div>
                <div className="form-group">
                  <label>URL da Imagem de Capa</label>
                  <input type="url" placeholder="https://..." value={form.imagem} onChange={e => setForm({...form, imagem: e.target.value})} />
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
                      value={form.descricaoDetalhada}
                      onChange={e => setForm({...form, descricaoDetalhada: e.target.value})}
                      rows={7}
                    />
                  </div>
                  <div className="form-group">
                    <label>Imagem da Página de Introdução</label>
                    <input
                      type="url"
                      placeholder="https://... — imagem exibida no hero da página de introdução"
                      value={form.imagem}
                      onChange={e => setForm({...form, imagem: e.target.value})}
                    />
                    {form.imagem && (
                      <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', maxHeight: 120, border: '1px solid #2c2c2e' }}>
                        <img src={form.imagem} alt="preview" style={{ width: '100%', objectFit: 'cover', maxHeight: 120, display: 'block' }}
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
                  <button type="button" className="cf-add-btn" onClick={() => setForm(f => ({ ...f, linksExternos: [...f.linksExternos, { titulo: '', url: '' }] }))}>+ Adicionar Link</button>
                </div>
                {form.linksExternos.length === 0 && <p className="cf-empty">Nenhum link adicionado. Links aparecem na página do curso para alunos matriculados.</p>}
                {form.linksExternos.map((link, i) => (
                  <div key={i} className="cf-resource-row">
                    <input className="cf-resource-input" placeholder="Título do link" value={link.titulo}
                      onChange={e => { const arr = [...form.linksExternos]; arr[i] = {...arr[i], titulo: e.target.value}; setForm(f => ({...f, linksExternos: arr})); }} />
                    <input className="cf-resource-input cf-resource-url" placeholder="https://..." value={link.url}
                      onChange={e => { const arr = [...form.linksExternos]; arr[i] = {...arr[i], url: e.target.value}; setForm(f => ({...f, linksExternos: arr})); }} />
                    <button type="button" className="cf-remove-btn" onClick={() => setForm(f => ({...f, linksExternos: f.linksExternos.filter((_,j) => j !== i)}))}>×</button>
                  </div>
                ))}
              </div>

              <div className="cf-section">
                <div className="cf-section-header">
                  <span className="cf-section-title">Anexos / Materiais</span>
                  <button type="button" className="cf-add-btn" onClick={() => setForm(f => ({ ...f, anexos: [...f.anexos, { nome: '', url: '' }] }))}>+ Adicionar Anexo</button>
                </div>
                {form.anexos.length === 0 && <p className="cf-empty">Nenhum anexo adicionado. Cole a URL de um arquivo (PDF, ZIP, etc.).</p>}
                {form.anexos.map((anexo, i) => (
                  <div key={i} className="cf-resource-row">
                    <input className="cf-resource-input" placeholder="Nome do arquivo" value={anexo.nome}
                      onChange={e => { const arr = [...form.anexos]; arr[i] = {...arr[i], nome: e.target.value}; setForm(f => ({...f, anexos: arr})); }} />
                    <input className="cf-resource-input cf-resource-url" placeholder="https://... (URL do arquivo)" value={anexo.url}
                      onChange={e => { const arr = [...form.anexos]; arr[i] = {...arr[i], url: e.target.value}; setForm(f => ({...f, anexos: arr})); }} />
                    <button type="button" className="cf-remove-btn" onClick={() => setForm(f => ({...f, anexos: f.anexos.filter((_,j) => j !== i)}))}>×</button>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Salvando...' : (editando ? 'Atualizar Curso' : 'Criar Curso')}
                </button>
                <button type="button" className="btn-cancel" onClick={() => { setShowForm(false); resetForm(); }}>Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {showPreview && (
          <CourseFormPreview
            form={form}
            aulas={aulas}
            onClose={() => setShowPreview(false)}
            role="admin"
          />
        )}

        {activeTab === 'cursos' && (
          <div className="courses-management">
          <div className="management-header">
            <h2>Cursos Cadastrados</h2>
            
            <div className="filters">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Buscar por título ou instrutor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="category-filter"
              >
                <option value="">Todas as categorias</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="courses-grid">
            {filteredCursos.map(curso => (
              <div key={curso.id} className="course-card">
                <div className="course-header">
                  <div className="course-category">
                    {curso.categoria}
                  </div>
                  <div className="course-duration">
                    {formatDuration(curso.duracao)}
                  </div>
                </div>
                
                <div className="course-content">
                  <h3 className="course-title">{curso.titulo}</h3>
                  <p className="course-description">{curso.descricao}</p>
                  <div className="course-instructor">
                    Instrutor: {curso.instrutor}
                  </div>
                </div>
                
                <div className="course-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => editar(curso)}
                    disabled={loading}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => deletar(curso.id, curso.titulo)}
                    disabled={loading}
                  >
                    Deletar
                  </button>
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/curso/${curso.id}`)}
                  >
                    Ver Curso
                  </button>
                  <button
                    className="btn-edit"
                    style={{ background: '#8b5cf6' }}
                    onClick={() => gerenciarAulas(curso.id, curso.titulo)}
                  >
                    Aulas
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredCursos.length === 0 && (
            <div className="no-courses">
              <div className="no-courses-icon"></div>
              <h3>Nenhum curso encontrado</h3>
              <p>Tente ajustar os filtros ou criar um novo curso</p>
            </div>
          )}
        </div>
        )}

        {showAulasForm && (
          <LessonManager
            curso={{ id: cursoAulasId, titulo: cursoAulasTitulo }}
            aulas={aulas}
            loading={loading}
            msg={aulasMsg}
            onSave={salvarAulas}
            onClose={() => { setShowAulasForm(false); setCursoAulasId(null); setCursoAulasTitulo(''); setAulas([]); setAulasMsg(''); }}
            onAdd={adicionarAula}
            onRemove={removerAula}
            onUpdate={atualizarAula}
            onMove={moverAula}
            onMoveToPos={moverAulaParaOrdem}
          />
        )}

        {activeTab === 'pendentes' && (
          <div className="courses-management">
            <div className="management-header">
              <h2>Cursos Aguardando Aprovação</h2>
            </div>
            <div className="courses-grid">
              {cursosPendentes.map(curso => (
                <div key={curso.id} className="course-card">
                  <div className="course-header">
                    <div className="course-category">{curso.categoria}</div>
                    <span style={{ background: '#fbbf24', color: '#000', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>Pendente</span>
                  </div>
                  <div className="course-content">
                    <h3 className="course-title">{curso.titulo}</h3>
                    <p className="course-description">{curso.descricao}</p>
                    <div className="course-instructor">Instrutor: {curso.instrutor}</div>
                  </div>
                  <div className="course-actions">
                    <button
                      className="btn-view"
                      onClick={() => abrirPreviewPendente(curso)}
                    >
                      Revisar
                    </button>
                    <button className="btn-edit" style={{ background: '#34d399', color: '#000' }} onClick={() => aprovarCurso(curso.id)}>Aprovar</button>
                    <button className="btn-delete" onClick={() => rejeitarCurso(curso.id)}>Rejeitar</button>
                  </div>
                </div>
              ))}
            </div>
            {cursosPendentes.length === 0 && (
              <div className="no-courses"><h3>Nenhum curso pendente</h3><p>Todos os cursos foram revisados!</p></div>
            )}
          </div>
        )}

        {activeTab === 'solicitacoes' && (
          <div className="users-management">
            <div className="management-header">
              <h2>Solicitações de Colaborador</h2>
            </div>
            <div className="users-grid">
              {colaboradorRequests.map((usuario) => (
                <div key={usuario.id} className="user-card">
                  <div className="user-avatar">
                    {usuario.foto
                      ? <img src={usuario.foto} alt={usuario.nome} />
                      : <div className="avatar-placeholder">{usuario.nome?.charAt(0).toUpperCase()}</div>
                    }
                  </div>
                  <div className="user-info">
                    <h3>{usuario.nome}</h3>
                    <p className="user-email">{usuario.email}</p>
                    {usuario.justificativaColaborador && (
                      <p style={{ color: '#ccc', fontSize: '0.85rem', margin: '8px 0', fontStyle: 'italic', background: '#111', padding: '8px', borderRadius: '6px', borderLeft: '3px solid #FFD700' }}>
                        "{usuario.justificativaColaborador}"
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button className="btn-edit" style={{ background: '#34d399', color: '#000', flex: 1 }} onClick={() => aprovarColaborador(usuario.id)}>Aprovar</button>
                      <button className="btn-delete" style={{ flex: 1 }} onClick={() => recusarColaborador(usuario.id)}>Recusar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {colaboradorRequests.length === 0 && (
              <div className="no-users"><h3>Nenhuma solicitação pendente</h3></div>
            )}
          </div>
        )}

        {activeTab === 'usuarios' && (
          <div className="users-management">
            <div className="management-header">
              <h2>Usuários Cadastrados</h2>
            </div>

            <div className="users-grid">
              {usuarios.map((usuario, index) => (
                <div key={index} className="user-card">
                  <div className="user-avatar">
                    {usuario.foto ? (
                      <img src={usuario.foto} alt={usuario.nome || usuario.email} />
                    ) : (
                      <div className="avatar-placeholder">
                        {(usuario.nome || usuario.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="user-info">
                    <h3>{usuario.nome || 'Nome não informado'}</h3>
                    <p className="user-email">{usuario.email}</p>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span className={`user-role ${usuario.role}`}>
                        {usuario.role === 'admin' ? 'Admin' : usuario.role === 'colaborador' ? 'Colaborador' : 'Usuário'}
                      </span>
                      {usuario.role === 'colaborador' && (
                        <span style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '12px', padding: '2px 10px', fontSize: '11px', fontWeight: 600 }}>
                          Pode criar cursos
                        </span>
                      )}
                      {usuario.statusSolicitacao === 'pendente' && (
                        <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '12px', padding: '2px 10px', fontSize: '11px', fontWeight: 600 }}>
                          Solicitação pendente
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {usuarios.length === 0 && (
              <div className="no-users">
                <div className="no-users-icon"></div>
                <h3>Nenhum usuário cadastrado</h3>
                <p>Os usuários aparecerão aqui quando se cadastrarem na plataforma</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'dashboard' && (() => {
          const aprovados = cursos.filter(c => c.status === 'aprovado');
          const totals = dashTotals();
          return (
            <div className="adm-dash">
              <div className="adm-dash-kpis">
                <div className="adm-kpi">
                  <span className="adm-kpi-value" style={{ color: '#ffd700' }}>{aprovados.length}</span>
                  <span className="adm-kpi-label">Cursos Ativos</span>
                </div>
                <div className="adm-kpi">
                  <span className="adm-kpi-value" style={{ color: '#60a5fa' }}>{totals.totalAlunos}</span>
                  <span className="adm-kpi-label">Total de Matrículas</span>
                </div>
                <div className="adm-kpi">
                  <span className="adm-kpi-value" style={{ color: '#34d399' }}>{totals.totalReviews}</span>
                  <span className="adm-kpi-label">Avaliações</span>
                </div>
                <div className="adm-kpi">
                  <span className="adm-kpi-value" style={{ color: '#f472b6' }}>{totals.mediaGeral}</span>
                  <span className="adm-kpi-label">Média Geral</span>
                </div>
                <div className="adm-kpi">
                  <span className="adm-kpi-value" style={{ color: '#a78bfa' }}>{usuarios.length}</span>
                  <span className="adm-kpi-label">Usuários</span>
                </div>
                <div className="adm-kpi">
                  <span className="adm-kpi-value" style={{ color: '#ef4444' }}>{favStats.totalFav}</span>
                  <span className="adm-kpi-label">Favoritos</span>
                </div>
                <div className="adm-kpi">
                  <span className="adm-kpi-value" style={{ color: '#fb923c' }}>{favStats.totalWL}</span>
                  <span className="adm-kpi-label">Assistir Depois</span>
                </div>
              </div>

              {loadingDash ? (
                <p className="adm-dash-loading">Carregando dados do dashboard...</p>
              ) : aprovados.length === 0 ? (
                <div className="no-courses"><h3>Nenhum curso aprovado ainda.</h3></div>
              ) : (
                <div className="adm-dash-list">
                  {aprovados.map(curso => {
                    const d = dashData[curso.id];
                    const expanded = dashExpanded[curso.id];
                    const section = dashSection[curso.id] || 'alunos';
                    const totalAlunos = d?.alunos?.totalAlunos ?? '—';
                    const totalAulas  = d?.alunos?.totalAulas  ?? 0;
                    const media       = d?.avaliacoes?.media   ?? 0;
                    const totalRev    = d?.avaliacoes?.total   ?? '—';
                    const alunos      = d?.alunos?.alunos      || [];
                    const avaliacoes  = d?.avaliacoes?.avaliacoes || [];
                    return (
                      <div key={curso.id} className={`adm-dash-row${expanded ? ' expanded' : ''}`}>
                        <div className="adm-dash-row-header" onClick={() => toggleDashCurso(curso.id)}>
                          <div className="adm-dash-row-left">
                            <span className="adm-dash-chevron">{expanded ? '▾' : '▸'}</span>
                            <div>
                              <div className="adm-dash-row-title">{curso.titulo}</div>
                              <div className="adm-dash-row-meta">
                                <span className="course-category" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>{curso.categoria}</span>
                                <span style={{ color: '#888', fontSize: '0.78rem' }}>por {curso.instrutor || '—'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="adm-dash-row-stats">
                            <div className="adm-dash-stat">
                              <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: '1.25rem' }}>{totalAlunos}</span>
                              <span>Matrículas</span>
                            </div>
                            <div className="adm-dash-stat">
                              <span style={{ color: '#ffd700', fontWeight: 700, fontSize: '1.25rem' }}>{totalAulas}</span>
                              <span>Aulas</span>
                            </div>
                            <div className="adm-dash-stat">
                              <span style={{ color: '#f472b6', fontWeight: 700, fontSize: '1.25rem' }}>{media > 0 ? media : '—'}</span>
                              <span>Média</span>
                            </div>
                            <div className="adm-dash-stat">
                              <span style={{ color: '#34d399', fontWeight: 700, fontSize: '1.25rem' }}>{totalRev}</span>
                              <span>Reviews</span>
                            </div>
                          </div>
                        </div>

                        {expanded && (
                          <div className="adm-dash-detail">
                            <div className="adm-dash-section-tabs">
                              <button className={`adm-section-btn${section === 'alunos' ? ' active' : ''}`} onClick={() => setDashSection(p => ({ ...p, [curso.id]: 'alunos' }))}>
                                Alunos &amp; Progresso ({alunos.length})
                              </button>
                              <button className={`adm-section-btn${section === 'avaliacoes' ? ' active' : ''}`} onClick={() => setDashSection(p => ({ ...p, [curso.id]: 'avaliacoes' }))}>
                                Avaliações ({avaliacoes.length})
                              </button>
                            </div>

                            {section === 'alunos' && (
                              <div className="adm-alunos-table">
                                {alunos.length === 0 ? (
                                  <p className="adm-empty">Nenhum aluno matriculado.</p>
                                ) : (
                                  <>
                                    <div className="adm-alunos-head">
                                      <span>Aluno</span>
                                      <span>Progresso</span>
                                      <span>Aulas</span>
                                      <span>Status</span>
                                      <span>Inscrito em</span>
                                    </div>
                                    {alunos.map((aluno, i) => {
                                      const concluidas = aluno.aulas?.filter(a => a.concluida).length || 0;
                                      const pct = totalAulas > 0 ? Math.round((concluidas / totalAulas) * 100) : (aluno.progresso || 0);
                                      return (
                                        <div key={i} className="adm-aluno-row">
                                          <div className="adm-aluno-nome">
                                            <UserAvatar foto={aluno.foto || null} nome={aluno.nome || ''} size={28} />
                                            <span>{aluno.nome}</span>
                                          </div>
                                          <div className="adm-progress-cell">
                                            <div className="adm-progress-bar">
                                              <div className="adm-progress-fill" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="adm-progress-pct">{pct}%</span>
                                          </div>
                                          <div className="adm-aulas-cell">
                                            {aluno.aulas?.map((a, ai) => (
                                              <span key={ai} className={`adm-aula-dot${a.concluida ? ' done' : ''}`} title={`Aula ${a.ordem}: ${a.titulo} — ${a.concluida ? 'Concluída' : 'Pendente'}`} />
                                            ))}
                                            {(!aluno.aulas || aluno.aulas.length === 0) && <span style={{ color: '#555', fontSize: '0.78rem' }}>—</span>}
                                          </div>
                                          <div>
                                            {aluno.concluido
                                              ? <span className="adm-badge-done">Concluído</span>
                                              : <span className="adm-badge-prog">Em progresso</span>
                                            }
                                          </div>
                                          <div style={{ color: '#888', fontSize: '0.8rem' }}>{formatDate(aluno.dataInscricao)}</div>
                                        </div>
                                      );
                                    })}
                                  </>
                                )}
                              </div>
                            )}

                            {section === 'avaliacoes' && (
                              <div className="adm-avaliacoes">
                                {avaliacoes.length === 0 ? (
                                  <p className="adm-empty">Nenhuma avaliação ainda.</p>
                                ) : (
                                  <>
                                    <div className="adm-av-summary">
                                      <div className="adm-av-score">
                                        <span className="adm-av-big">{media > 0 ? media : '—'}</span>
                                        <div>{renderStars(media)}</div>
                                        <span style={{ color: '#888', fontSize: '0.78rem' }}>{avaliacoes.length} avaliações</span>
                                      </div>
                                      <div className="adm-av-bars">
                                        {[5, 4, 3, 2, 1].map(star => {
                                          const count = avaliacoes.filter(a => Math.round(a.nota) === star).length;
                                          const pct = avaliacoes.length > 0 ? Math.round((count / avaliacoes.length) * 100) : 0;
                                          return (
                                            <div key={star} className="adm-av-bar-row">
                                              <span className="adm-av-star-label">{star}★</span>
                                              <div className="adm-av-bar-track">
                                                <div className="adm-av-bar-fill" style={{ width: `${pct}%` }} />
                                              </div>
                                              <span className="adm-av-bar-count">{count}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    <div className="adm-av-list">
                                      {avaliacoes.map((av, i) => (
                                        <div key={i} className="adm-av-item">
                                          <div className="adm-av-item-header">
                                            <div>{renderStars(av.nota)}</div>
                                            <span style={{ color: '#555', fontSize: '0.75rem' }}>{formatDate(av.dataCriacao || av.data)}</span>
                                          </div>
                                          {av.comentario && <p className="adm-av-comment">{av.comentario}</p>}
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

              {/* ── User-level Favorites & Watch Later tracking ── */}
              {(favStats.favLog.length > 0 || favStats.wlLog.length > 0) && (
                <div className="adm-tracking-section">
                  <div className="adm-tracking-tabs">
                    <div className="adm-tracking-block">
                      <div className="adm-tracking-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, color: '#ef4444', flexShrink: 0 }}>
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        <span>Favoritos por Usuário</span>
                        <span className="adm-tracking-count">{favStats.favLog.length}</span>
                      </div>
                      <TrackingTable entries={favStats.favLog} emptyMsg="Nenhum favorito registrado ainda." />
                    </div>
                    <div className="adm-tracking-block">
                      <div className="adm-tracking-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, color: '#ffd700', flexShrink: 0 }}>
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span>Assistir Depois por Usuário</span>
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
        {activeTab === 'jornadas' && (
          <div className="courses-management">
            <div className="management-header">
              <h2>Gerenciar Jornadas</h2>
              <button className="btn-new-course" onClick={abrirNovaJornada}>+ Nova Jornada</button>
            </div>

            {/* ── Jornada form ── */}
            {jornadaForm && (
              <div className="course-form-container">
                <form onSubmit={handleJornadaSubmit} className="course-form">
                  <div className="form-header" style={{ marginBottom: '1.5rem' }}>
                    <h2>{jornadaForm.slug ? 'Editar Jornada' : 'Nova Jornada'}</h2>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Título *</label>
                      <input value={jornadaForm.titulo} onChange={e => setJornadaForm(f => ({ ...f, titulo: e.target.value }))} required placeholder="Ex: Jornada Full Stack" />
                    </div>
                    <div className="form-group">
                      <label>Nível *</label>
                      <select value={jornadaForm.nivel} onChange={e => setJornadaForm(f => ({ ...f, nivel: e.target.value }))}>
                        {NIVEIS.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div className="form-group full-width">
                      <label>Descrição *</label>
                      <textarea value={jornadaForm.descricao} onChange={e => setJornadaForm(f => ({ ...f, descricao: e.target.value }))} required rows={2} placeholder="Descrição exibida no card da jornada" />
                    </div>
                    <div className="form-group">
                      <label>Ícone / Sigla</label>
                      <input value={jornadaForm.icon} onChange={e => setJornadaForm(f => ({ ...f, icon: e.target.value }))} placeholder="Ex: FS, 🚀" maxLength={4} />
                    </div>
                  </div>

                  {/* Course picker */}
                  <div className="cf-section">
                    <div className="cf-section-header">
                      <span className="cf-section-title">Cursos da Jornada ({jornadaForm.cursoIds.length} selecionados)</span>
                    </div>
                    <p className="cf-empty">Clique para adicionar/remover. Use as setas para reordenar.</p>

                    {/* Selected courses with ordering */}
                    {jornadaForm.cursoIds.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        {jornadaForm.cursoIds.map((id, idx) => {
                          const c = cursos.find(x => x.id === id);
                          return (
                            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '8px', marginBottom: '6px' }}>
                              <span style={{ color: '#ffd700', fontWeight: 700, minWidth: '22px', fontSize: '0.8rem' }}>{idx + 1}</span>
                              <span style={{ flex: 1, color: '#f2f2f7', fontSize: '0.85rem' }}>{c ? c.titulo : `Curso #${id}`}</span>
                              <button type="button" onClick={() => moverCursoJornada(idx, -1)} disabled={idx === 0} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem' }}>▲</button>
                              <button type="button" onClick={() => moverCursoJornada(idx, 1)} disabled={idx === jornadaForm.cursoIds.length - 1} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem' }}>▼</button>
                              <button type="button" onClick={() => toggleCursoNaJornada(id)} className="cf-remove-btn">×</button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Available courses to add */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px', maxHeight: '260px', overflowY: 'auto', padding: '4px' }}>
                      {cursos.filter(c => c.status === 'aprovado' && !jornadaForm.cursoIds.includes(c.id)).map(c => (
                        <div key={c.id} onClick={() => toggleCursoNaJornada(c.id)}
                          style={{ padding: '8px 12px', background: '#1c1c1e', border: '1px solid #3a3a3c', borderRadius: '8px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#ffd700'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#3a3a3c'}>
                          <div style={{ fontSize: '0.82rem', color: '#f2f2f7', fontWeight: 500 }}>{c.titulo}</div>
                          <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '2px' }}>{c.categoria}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-submit">{jornadaForm.slug ? 'Salvar Alterações' : 'Criar Jornada'}</button>
                    <button type="button" className="btn-cancel" onClick={fecharJornadaForm}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Jornada list ── */}
            <div className="courses-grid">
              {jornadas.map(j => (
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
                    <button className="btn-edit" onClick={() => abrirEditarJornada(j)}>Editar</button>
                    <button className="btn-view" onClick={() => window.open(`/jornada/${j.slug}`, '_blank')}>Ver</button>
                    <button className="btn-delete" onClick={() => deletarJornada(j.slug)}>Remover</button>
                  </div>
                </div>
              ))}
            </div>
            {jornadas.length === 0 && (
              <div className="no-courses"><h3>Nenhuma jornada cadastrada</h3><p>Clique em "+ Nova Jornada" para criar a primeira.</p></div>
            )}

            {/* ── Pending Jornada requests from Instructors ── */}
            {jornadaRequests.length > 0 && (
              <div style={{ marginTop: '2.5rem' }}>
                <div className="management-header">
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    Solicitações de Jornada
                    <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', padding: '1px 7px', fontSize: '12px', fontWeight: 700 }}>{jornadaRequests.length}</span>
                  </h2>
                </div>
                <div className="courses-grid">
                  {jornadaRequests.map(usuario => {
                    const req = parseJornadaRequest(usuario.justificativaColaborador);
                    if (!req) return null;
                    return (
                      <div key={usuario.id} className="course-card" style={{ borderColor: 'rgba(251,191,36,0.25)' }}>
                        <div className="course-header">
                          <span style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '12px', padding: '3px 10px', fontSize: '12px', fontWeight: 700 }}>
                            {req.editSlug ? 'Editar Jornada' : 'Nova Jornada'}
                          </span>
                          <span style={{ color: '#888', fontSize: '0.78rem' }}>por {usuario.nome}</span>
                        </div>
                        <div className="course-content">
                          <h3 className="course-title">{req.titulo}</h3>
                          <p className="course-description">{req.descricao}</p>
                          {req.nivel && <p style={{ color: '#ffd700', fontSize: '0.8rem', margin: '4px 0 0' }}>Nível: {req.nivel}</p>}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                            {(req.cursoIds || []).map((id, idx) => {
                              const c = cursos.find(x => x.id === id);
                              return <span key={id} style={{ background: '#2c2c2e', border: '1px solid #3a3a3c', borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem', color: '#aeaeb2' }}>{idx + 1}. {c ? c.titulo : `#${id}`}</span>;
                            })}
                          </div>
                        </div>
                        <div className="course-actions">
                          <button className="btn-edit" style={{ background: '#34d399', color: '#000' }} onClick={() => aprovarJornadaRequest(usuario)}>Aprovar</button>
                          <button className="btn-delete" onClick={() => rejeitarJornadaRequest(usuario.id)}>Rejeitar</button>
                          <button className="btn-edit" onClick={() => {
                            const r = parseJornadaRequest(usuario.justificativaColaborador);
                            setJornadaForm({ titulo: r.titulo, descricao: r.descricao, icon: r.icon || '', nivel: r.nivel || 'Intermediário', cursoIds: r.cursoIds || [], slug: r.editSlug || '', _fromRequest: usuario.id });
                          }}>Editar e Aprovar</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        </div>
      </div>

      {previewPendente && (
        <CourseFormPreview
          form={{
            titulo: previewPendente.titulo || '',
            descricao: previewPendente.descricao || '',
            descricaoDetalhada: previewPendente.descricaoDetalhada || '',
            categoria: previewPendente.categoria || '',
            instrutor: previewPendente.instrutor || '',
            duracao: previewPendente.duracao ? String(Math.round((previewPendente.duracao / 60) * 10) / 10) : '',
            imagem: previewPendente.imagem || '',
            url: previewPendente.url || '',
            linksExternos: previewPendente.linksExternos || '[]',
            anexos: previewPendente.anexos || '[]',
          }}
          aulas={previewPendenteAulas}
          onClose={fecharPreviewPendente}
          role="admin"
          onAprovar={aprovarDoPreview}
          onRejeitar={rejeitarDoPreview}
        />
      )}
    </>
  );
};

export default Admin;