const KEY = (uid) => `learnly_last_course_${uid}`;

export const saveLastCourse = (cursoId, aulaId = null, aulaTitle = null, usuarioId = null) => {
  try {
    const key = KEY(usuarioId ?? 'guest');
    localStorage.setItem(key, JSON.stringify({
      cursoId: Number(cursoId),
      aulaId:  aulaId ? Number(aulaId) : null,
      aulaTitle,
      usuarioId,
      ts: Date.now(),
    }));
  } catch {}
};

export const loadLastCourse = (usuarioId = null) => {
  try {
    const key = KEY(usuarioId ?? 'guest');
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearLastCourse = (usuarioId = null) => {
  try {
    localStorage.removeItem(KEY(usuarioId ?? 'guest'));
  } catch {}
};
