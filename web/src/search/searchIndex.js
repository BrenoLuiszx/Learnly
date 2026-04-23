/**
 * LEARNLY — Global Search Index
 *
 * HOW TO ADD NEW ENTRIES:
 *   1. Static pages/sections → add to STATIC_INDEX below.
 *   2. Dynamic content (courses, lessons, etc.) → add a loader to DYNAMIC_LOADERS.
 *
 * Result shape:
 *   {
 *     id:       string          — unique key
 *     type:     string          — 'page' | 'section' | 'course' | 'jornada' | 'lesson' | 'setting'
 *     label:    string          — primary display text
 *     sublabel: string          — secondary line (description / path hint)
 *     route:    string          — where to navigate on select
 *     keywords: string[]        — extra terms that trigger this result
 *     icon:     string          — emoji or short text badge
 *     auth:     null|'user'|'admin'|'colaborador'  — null = public
 *   }
 */

import { JORNADAS } from '../config/jornadas';

// ─── Static index ────────────────────────────────────────────────────────────

export const STATIC_INDEX = [

  // ── Pages ──────────────────────────────────────────────────────────────────
  {
    id: 'page-home',
    type: 'page',
    label: 'Início',
    sublabel: 'Página inicial da plataforma',
    route: '/',
    keywords: ['home', 'inicio', 'principal', 'learnly'],
    icon: '🏠',
    auth: null,
  },
  {
    id: 'page-cursos',
    type: 'page',
    label: 'Cursos',
    sublabel: 'Explorar todos os cursos disponíveis',
    route: '/cursos',
    keywords: ['cursos', 'catalogo', 'explorar', 'aprender', 'aulas', 'videos'],
    icon: '📚',
    auth: null,
  },
  {
    id: 'page-jornadas',
    type: 'page',
    label: 'Jornadas',
    sublabel: 'Trilhas de aprendizado estruturadas',
    route: '/cursos',
    keywords: ['jornada', 'trilha', 'caminho', 'track', 'learning path'],
    icon: '🗺️',
    auth: null,
  },
  {
    id: 'page-progresso',
    type: 'page',
    label: 'Meu Progresso',
    sublabel: 'Dashboard de aprendizado e estatísticas',
    route: '/progresso',
    keywords: ['progresso', 'dashboard', 'estatisticas', 'historico', 'atividade', 'desempenho'],
    icon: '📊',
    auth: 'user',
  },
  {
    id: 'page-meus-cursos',
    type: 'page',
    label: 'Meus Cursos',
    sublabel: 'Cursos em que você está matriculado',
    route: '/meus-cursos',
    keywords: ['meus cursos', 'matriculado', 'inscrito', 'em andamento', 'concluido'],
    icon: '🎓',
    auth: 'user',
  },
  {
    id: 'page-planning',
    type: 'page',
    label: 'Planejamento',
    sublabel: 'Quadro kanban de metas de aprendizado',
    route: '/planning',
    keywords: ['planejamento', 'planning', 'kanban', 'metas', 'tarefas', 'organizar', 'board'],
    icon: '📋',
    auth: 'user',
  },
  {
    id: 'page-plano-estudo',
    type: 'page',
    label: 'Plano de Estudo',
    sublabel: 'Gerar um caminho de aprendizado personalizado',
    route: '/plano-estudo',
    keywords: ['plano de estudo', 'plano', 'estudo', 'recomendacoes', 'recomendações', 'personalizado', 'trilha', 'caminho', 'sugestao', 'sugestões', 'aprendizado'],
    icon: '🗺️',
    auth: 'user',
  },
  {
    id: 'page-perfil',
    type: 'page',
    label: 'Meu Perfil',
    sublabel: 'Informações da sua conta',
    route: '/perfil',
    keywords: ['perfil', 'profile', 'conta', 'account', 'foto', 'nome', 'dados'],
    icon: '👤',
    auth: 'user',
  },
  {
    id: 'page-configuracoes',
    type: 'page',
    label: 'Configurações',
    sublabel: 'Preferências e configurações da conta',
    route: '/configuracoes',
    keywords: ['configuracoes', 'settings', 'preferencias', 'tema', 'dark mode', 'notificacoes', 'senha', 'privacidade'],
    icon: '⚙️',
    auth: 'user',
  },
  {
    id: 'page-admin',
    type: 'page',
    label: 'Painel Admin',
    sublabel: 'Gerenciar cursos, usuários e solicitações',
    route: '/admin',
    keywords: ['admin', 'administrador', 'painel', 'gerenciar', 'usuarios', 'aprovar', 'rejeitar'],
    icon: '🛡️',
    auth: 'admin',
  },
  {
    id: 'page-colaborador',
    type: 'page',
    label: 'Área do Instrutor',
    sublabel: 'Gerenciar seus cursos e alunos',
    route: '/colaborador',
    keywords: ['instrutor', 'colaborador', 'meus cursos', 'alunos', 'criar curso', 'aulas'],
    icon: '🎙️',
    auth: 'colaborador',
  },
  {
    id: 'section-admin-usuarios',
    type: 'section',
    label: 'Gerenciar Usuários',
    sublabel: 'Listar e administrar contas → Painel Admin',
    route: '/admin',
    keywords: ['usuarios', 'contas', 'gerenciar usuarios', 'admin'],
    icon: '👥',
    auth: 'admin',
  },
  {
    id: 'section-admin-cursos',
    type: 'section',
    label: 'Aprovar Cursos',
    sublabel: 'Revisar e aprovar cursos pendentes → Painel Admin',
    route: '/admin',
    keywords: ['aprovar cursos', 'pendentes', 'revisar', 'admin'],
    icon: '✅',
    auth: 'admin',
  },
  {
    id: 'page-registro',
    type: 'page',
    label: 'Criar Conta',
    sublabel: 'Registrar-se na plataforma',
    route: '/registro',
    keywords: ['registro', 'cadastro', 'criar conta', 'sign up', 'registrar'],
    icon: '✍️',
    auth: null,
  },
  {
    id: 'page-login',
    type: 'page',
    label: 'Entrar',
    sublabel: 'Fazer login na plataforma',
    route: '/login',
    keywords: ['login', 'entrar', 'sign in', 'acessar', 'senha'],
    icon: '🔑',
    auth: null,
  },

  // ── Sections inside pages ──────────────────────────────────────────────────
  {
    id: 'section-favoritos',
    type: 'section',
    label: 'Favoritos',
    sublabel: 'Cursos salvos como favoritos → Meus Cursos',
    route: '/meus-cursos',
    keywords: ['favoritos', 'salvos', 'curtidos', 'lista'],
    icon: '❤️',
    auth: 'user',
  },
  {
    id: 'section-assistir-depois',
    type: 'section',
    label: 'Assistir Depois',
    sublabel: 'Lista de cursos para ver mais tarde → Meus Cursos',
    route: '/meus-cursos',
    keywords: ['assistir depois', 'watch later', 'salvar', 'lista'],
    icon: '🔖',
    auth: 'user',
  },
  {
    id: 'section-certificados',
    type: 'section',
    label: 'Certificados',
    sublabel: 'Seus certificados de conclusão → Meu Perfil',
    route: '/perfil',
    keywords: ['certificado', 'diploma', 'conclusao', 'conquista'],
    icon: '🏆',
    auth: 'user',
  },
  {
    id: 'section-avaliacoes',
    type: 'section',
    label: 'Avaliações',
    sublabel: 'Notas e comentários de cursos',
    route: '/meus-cursos',
    keywords: ['avaliacao', 'nota', 'comentario', 'review', 'estrela', 'feedback'],
    icon: '⭐',
    auth: 'user',
  },
  {
    id: 'section-tema',
    type: 'setting',
    label: 'Tema / Aparência',
    sublabel: 'Alternar entre modo escuro e claro → Configurações',
    route: '/configuracoes',
    keywords: ['tema', 'dark mode', 'light mode', 'aparencia', 'cor', 'escuro', 'claro'],
    icon: '🌙',
    auth: 'user',
  },
  {
    id: 'section-senha',
    type: 'setting',
    label: 'Alterar Senha',
    sublabel: 'Segurança da conta → Configurações',
    route: '/configuracoes',
    keywords: ['senha', 'password', 'seguranca', 'alterar senha', 'trocar senha'],
    icon: '🔒',
    auth: 'user',
  },
  {
    id: 'section-notificacoes',
    type: 'setting',
    label: 'Notificações',
    sublabel: 'Preferências de notificação → Configurações',
    route: '/configuracoes',
    keywords: ['notificacao', 'alerta', 'aviso', 'email', 'push'],
    icon: '🔔',
    auth: 'user',
  },
  {
    id: 'section-solicitar-colaborador',
    type: 'section',
    label: 'Tornar-se Instrutor',
    sublabel: 'Solicitar acesso de colaborador → Configurações',
    route: '/configuracoes',
    keywords: ['instrutor', 'colaborador', 'solicitar', 'tornar', 'criar curso', 'ensinar'],
    icon: '🎙️',
    auth: 'only-user',
  },

  // ── Future pages (pre-indexed, routes TBD) ────────────────────────────────
  {
    id: 'page-suporte',
    type: 'page',
    label: 'Suporte',
    sublabel: 'Central de ajuda e dúvidas frequentes',
    route: '/suporte',
    keywords: ['suporte', 'ajuda', 'help', 'faq', 'duvida', 'dúvida', 'problema', 'contato', 'certificado', 'jornada', 'como funciona'],
    icon: '💬',
    auth: null,
  },
  {
    id: 'future-sobre',
    type: 'page',
    label: 'Sobre Nós',
    sublabel: 'Conheça a Learnly — em breve',
    route: '/',
    keywords: ['sobre', 'about', 'empresa', 'missao', 'equipe', 'learnly'],
    icon: 'ℹ️',
    auth: null,
  },

  // ── Jornadas (generated from config) ──────────────────────────────────────
  ...JORNADAS.map((j) => ({
    id: `jornada-${j.slug}`,
    type: 'jornada',
    label: j.titulo,
    sublabel: j.descricao,
    route: `/jornada/${j.slug}`,
    keywords: ['jornada', 'trilha', j.titulo.toLowerCase(), j.nivel.toLowerCase(), j.icon.toLowerCase()],
    icon: j.icon,
    auth: null,
  })),
];

// ─── Dynamic loaders ─────────────────────────────────────────────────────────
// Each loader receives the raw query string and returns an array of result objects.
// Add new loaders here to support future dynamic content (lessons, users, etc.)

import { cursosAPI } from '../services/api';

export const DYNAMIC_LOADERS = [
  {
    id: 'courses',
    // Called once per search session; results are cached for the session
    load: async () => {
      try {
        const res = await cursosAPI.listarTodos();
        const cursos = Array.isArray(res.data) ? res.data : [];
        return cursos.map((c) => ({
          id: `course-${c.id}`,
          type: 'course',
          label: c.titulo,
          sublabel: `${c.categoria} · ${c.instrutor}`,
          route: `/curso/${c.id}`,
          keywords: [
            c.titulo.toLowerCase(),
            c.categoria?.toLowerCase() ?? '',
            c.instrutor?.toLowerCase() ?? '',
            c.descricao?.toLowerCase() ?? '',
          ],
          icon: '🎬',
          auth: null,
          _raw: c,
        }));
      } catch {
        return [];
      }
    },
  },
];
