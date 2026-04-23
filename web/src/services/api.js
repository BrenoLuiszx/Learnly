import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// Interceptor - adiciona token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor - desloga automaticamente se o token expirar.
// Only redirects when the failing request actually sent a token,
// meaning the session expired. Unauthenticated requests (no Authorization
// header) that get a 401 are silently rejected without touching the session.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestHadToken = !!error.config?.headers?.Authorization;
    const status = error.response?.status;
    if (requestHadToken && status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      // Only redirect to login if the request required authentication.
      // Public routes (GET /cursos, etc.) should silently clear the expired
      // token without bouncing the user away from the page they are on.
      const url = error.config?.url || '';
      const publicPrefixes = ['/cursos', '/avaliacoes', '/aulas/curso', '/certificados/usuario'];
      const isPublic = publicPrefixes.some(p => url.startsWith(p));
      if (!isPublic) {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

export const cursosAPI = {
  listarTodos: () => api.get('/cursos'),
  buscarPorId: (id) => api.get(`/cursos/${id}`),
  buscarPorCategoria: (categoria) => api.get(`/cursos/categoria/${categoria}`),
  buscarPorTitulo: (titulo) => api.get(`/cursos/buscar?titulo=${titulo}`),
  criar: (curso) => api.post('/cursos', curso),
  atualizar: (id, curso) => api.put(`/cursos/${id}`, curso),
  deletar: (id) => api.delete(`/cursos/${id}`),
  meusCursos: () => api.get('/cursos/meus'),
  listarPendentes: () => api.get('/cursos/pendentes'),
  aprovar: (id) => api.put(`/cursos/${id}/aprovar`),
  rejeitar: (id) => api.put(`/cursos/${id}/rejeitar`),
};

export const usuariosAPI = {
  listarTodos: () => api.get('/usuarios'),
  registrar: (usuario) => api.post('/usuarios/registrar', usuario),
  login: (credenciais) => api.post('/usuarios/login', credenciais),
  solicitarColaborador: (id, justificativa) => api.post(`/usuarios/${id}/solicitar-colaborador`, { justificativa }),
  listarSolicitacoesPendentes: () => api.get('/usuarios/solicitacoes/pendentes'),
  aprovarColaborador: (id) => api.put(`/usuarios/solicitacoes/${id}/aprovar`),
  recusarColaborador: (id) => api.put(`/usuarios/solicitacoes/${id}/recusar`),
};

export const progressoAPI = {
  marcarConcluido:    (cursoId) => api.post(`/progresso/cursos/${cursoId}/concluir`),
  desmarcarConcluido: (cursoId) => api.post(`/progresso/cursos/${cursoId}/desconcluir`),
  meuProgresso:       ()        => api.get('/matriculas/minhas'),
  meusConcluidos:     ()        => api.get('/matriculas/minhas'),
  statusCurso:        (cursoId) => api.get(`/matriculas/cursos/${cursoId}/status`),
};

export const avaliacoesAPI = {
  avaliar: (cursoId, dados) => api.post(`/avaliacoes/cursos/${cursoId}`, dados),
  listarPorCurso: (cursoId) => api.get(`/avaliacoes/cursos/${cursoId}`),
  minhaAvaliacao: (cursoId) => api.get(`/avaliacoes/cursos/${cursoId}/minha`),
};

export const aulasAPI = {
  listarPorCurso: (cursoId) => api.get(`/aulas/curso/${cursoId}`),
  salvarAulas: (cursoId, aulas) => api.post(`/aulas/curso/${cursoId}`, aulas),
  concluir: (aulaId) => api.post(`/aulas/${aulaId}/concluir`),
  desconcluir: (aulaId) => api.post(`/aulas/${aulaId}/desconcluir`),
  progresso: (cursoId) => api.get(`/aulas/curso/${cursoId}/progresso`),
  percentual: (cursoId) => api.get(`/aulas/curso/${cursoId}/percentual`),
};

export const matriculasAPI = {
  matricular: (cursoId) => api.post(`/matriculas/cursos/${cursoId}`),
  status: (cursoId) => api.get(`/matriculas/cursos/${cursoId}/status`),
  minhasMatriculas: () => api.get('/matriculas/minhas'),
  atualizarProgresso: (cursoId, progresso) => api.put(`/matriculas/cursos/${cursoId}/progresso`, { progresso }),
};

export const instrutorAPI = {
  // Instructor-scoped: backend enforces ownership via criador_id
  alunos: (cursoId) => api.get(`/instrutor/cursos/${cursoId}/alunos`),
  avaliacoes: (cursoId) => api.get(`/instrutor/cursos/${cursoId}/avaliacoes`),
};

// Colaborador alias keeps backward compat
export const colaboradorAPI = {
  alunos: (cursoId) => api.get(`/colaborador/cursos/${cursoId}/alunos`),
  avaliacoes: (cursoId) => api.get(`/colaborador/cursos/${cursoId}/avaliacoes`),
};

// Admin-scoped: same endpoints, admin role bypasses ownership check in backend
export const adminCursoAPI = {
  alunos: (cursoId) => api.get(`/instrutor/cursos/${cursoId}/alunos`),
  avaliacoes: (cursoId) => api.get(`/instrutor/cursos/${cursoId}/avaliacoes`),
};

export const certificadosAPI = {
  emitir: (cursoId, dados) => api.post(`/certificados/cursos/${cursoId}`, dados || {}),
  meusCertificados: () => api.get('/certificados/meus'),
  disponiveis: () => api.get('/certificados/disponiveis'),
  certificadosPublicos: (usuarioId) => api.get(`/certificados/usuario/${usuarioId}/publicos`),
  alternarVisibilidade: (id) => api.put(`/certificados/${id}/visibilidade`),
};

export const usuarioDashboardAPI = {
  dashboard: () => api.get('/usuarios/dashboard'),
  atualizarPerfil: (id, dados) => api.put(`/usuarios/${id}/perfil`, dados),
  atualizarFoto: (id, foto) => api.put(`/usuarios/${id}/foto`, { foto }),
  getPlanejamento: () => api.get('/usuarios/planejamento'),
  savePlanejamento: (cards, cols) => api.put('/usuarios/planejamento', { cards, cols }),
  getCurriculo: () => api.get('/usuarios/curriculo'),
  saveCurriculo: (curriculo) => api.put('/usuarios/curriculo', { curriculo }),
};

// Jornada request flow — dedicated endpoint that bypasses the role check.
export const jornadaRequestAPI = {
  enviar: (usuarioId, payload) =>
    api.post(`/usuarios/${usuarioId}/solicitar-jornada`, {
      justificativa: 'JORNADA_REQUEST:' + JSON.stringify(payload),
    }),
  // Edit request: same flow but payload includes editSlug so Admin knows it's an update
  enviarEdicao: (usuarioId, slug, payload) =>
    api.post(`/usuarios/${usuarioId}/solicitar-jornada`, {
      justificativa: 'JORNADA_REQUEST:' + JSON.stringify({ ...payload, editSlug: slug }),
    }),
};

export const acoesAPI = {
  // Favorites
  toggleFavorito: (cursoId) => api.post(`/acoes/favoritos/${cursoId}`),
  meusFavoritos: () => api.get('/acoes/favoritos/meus'),
  favoritosPorCurso: (cursoId) => api.get(`/acoes/favoritos/curso/${cursoId}`),
  todosFavoritos: () => api.get('/acoes/favoritos/todos'),
  // Watch Later
  toggleAssistirDepois: (cursoId) => api.post(`/acoes/assistir-depois/${cursoId}`),
  meusAssistirDepois: () => api.get('/acoes/assistir-depois/meus'),
  assistirDepoisPorCurso: (cursoId) => api.get(`/acoes/assistir-depois/curso/${cursoId}`),
  todosAssistirDepois: () => api.get('/acoes/assistir-depois/todos'),
};

export default api;
