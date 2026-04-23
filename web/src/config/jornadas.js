// Central definition of all Jornadas.
// Static seeds below are the defaults. Admin can override/extend via the Admin panel;
// overrides are persisted in localStorage under JORNADAS_STORAGE_KEY and merged at runtime.

const JORNADAS_STORAGE_KEY = 'learnly_jornadas_override';

const JORNADAS_SEED = [
  {
    slug: "jornada-frontend",
    titulo: "Jornada Frontend",
    descricao: "Domine a criação de interfaces modernas, responsivas e acessíveis",
    icon: "FE",
    nivel: "Iniciante",
    cursoIds: [4, 1, 8],
  },
  {
    slug: "jornada-backend",
    titulo: "Jornada Backend",
    descricao: "Construa APIs robustas e sistemas escaláveis do zero",
    icon: "BE",
    nivel: "Intermediário",
    cursoIds: [2, 5, 6],
  },
  {
    slug: "jornada-devops",
    titulo: "Jornada DevOps",
    descricao: "Automatize pipelines e domine a cultura de entrega contínua",
    icon: "DO",
    nivel: "Avançado",
    cursoIds: [7, 10],
  },
  {
    slug: "jornada-data-science",
    titulo: "Jornada Data Science",
    descricao: "Analise dados reais e construa modelos com Python",
    icon: "DS",
    nivel: "Intermediário",
    cursoIds: [3],
  },
];

/** Returns the live list of jornadas (seed + admin overrides). */
export const getJornadas = () => {
  try {
    const raw = localStorage.getItem(JORNADAS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return JORNADAS_SEED;
};

/** Persists the full jornada list (called by Admin panel). */
export const saveJornadas = (list) => {
  try { localStorage.setItem(JORNADAS_STORAGE_KEY, JSON.stringify(list)); } catch {}
};

/** Returns jornadas owned by a specific instructor. */
export const getMinhasJornadas = (instrutorId) =>
  getJornadas().filter(j => j.instrutorId != null && Number(j.instrutorId) === Number(instrutorId));

// Static export kept for backward-compat (Jornada.jsx uses JORNADAS at import time).
// Components that need live data should call getJornadas() instead.
export const JORNADAS = getJornadas();
