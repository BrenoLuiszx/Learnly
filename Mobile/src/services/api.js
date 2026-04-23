import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// CONFIGURAÇÃO DA API
// ============================================
// Ajuste o IP conforme sua máquina:
// - Windows: ipconfig  |  Mac/Linux: ifconfig
// ============================================

const API_URL = 'http://192.168.0.2:8080/api'; // ← AJUSTE ESTE IP

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  }
);

export const cursosAPI = {
  listarTodos: () => api.get('/cursos'),
  buscarPorId: (id) => api.get(`/cursos/${id}`),
  buscarPorCategoria: (categoria) => api.get(`/cursos/categoria/${categoria}`),
  buscarPorTitulo: (titulo) => api.get(`/cursos/buscar?titulo=${titulo}`),
};

export const usuariosAPI = {
  login: (email, senha) => api.post('/usuarios/login', { email, senha }),
  registrar: (dados) => api.post('/usuarios/registrar', dados),
  atualizarFoto: (id, foto) => api.put(`/usuarios/${id}/foto`, { foto }),
  atualizarPerfil: (id, dados) => api.put(`/usuarios/${id}/perfil`, dados),
  dashboard: () => api.get('/usuarios/dashboard'),
};

// Single endpoint that returns everything: stats + cursosDetalhes (sorted by ultimaAtividade)
export const usuarioDashboardAPI = {
  dashboard: () => api.get('/usuarios/dashboard'),
};

export const matriculasAPI = {
  matricular: (cursoId) => api.post(`/matriculas/cursos/${cursoId}`),
  status: (cursoId) => api.get(`/matriculas/cursos/${cursoId}/status`),
  minhasMatriculas: () => api.get('/matriculas/minhas'),
  atualizarProgresso: (cursoId, progresso) =>
    api.put(`/matriculas/cursos/${cursoId}/progresso`, { progresso }),
};

// Keep progressoAPI for backward compat with CourseDetailsScreen etc.
export const progressoAPI = {
  marcarConcluido: (cursoId) => api.post(`/progresso/cursos/${cursoId}/concluir`),
  desmarcarConcluido: (cursoId) => api.post(`/progresso/cursos/${cursoId}/desconcluir`),
  meuProgresso: () => api.get('/matriculas/minhas'),
  statusCurso: (cursoId) => api.get(`/matriculas/cursos/${cursoId}/status`),
};

export const aulasAPI = {
  listarPorCurso: (cursoId) => api.get(`/aulas/curso/${cursoId}`),
  concluir: (aulaId) => api.post(`/aulas/${aulaId}/concluir`),
  desconcluir: (aulaId) => api.post(`/aulas/${aulaId}/desconcluir`),
  progresso: (cursoId) => api.get(`/aulas/curso/${cursoId}/progresso`),
  percentual: (cursoId) => api.get(`/aulas/curso/${cursoId}/percentual`),
};

export const avaliacoesAPI = {
  avaliar: (cursoId, dados) => api.post(`/avaliacoes/cursos/${cursoId}`, dados),
  listarPorCurso: (cursoId) => api.get(`/avaliacoes/cursos/${cursoId}`),
  minhaAvaliacao: (cursoId) => api.get(`/avaliacoes/cursos/${cursoId}/minha`),
};

export const certificadosAPI = {
  emitir: (cursoId) => api.post(`/certificados/cursos/${cursoId}`, {}),
  meusCertificados: () => api.get('/certificados/meus'),
  disponiveis: () => api.get('/certificados/disponiveis'),
  alternarVisibilidade: (id) => api.put(`/certificados/${id}/visibilidade`),
};

export const acoesAPI = {
  toggleFavorito: (cursoId) => api.post(`/acoes/favoritos/${cursoId}`),
  meusFavoritos: () => api.get('/acoes/favoritos/meus'),
  toggleAssistirDepois: (cursoId) => api.post(`/acoes/assistir-depois/${cursoId}`),
  meusAssistirDepois: () => api.get('/acoes/assistir-depois/meus'),
};

export const planejamentoAPI = {
  get: () => api.get('/usuarios/planejamento'),
  save: (cards, cols) => api.put('/usuarios/planejamento', { cards, cols }),
};

export default api;
