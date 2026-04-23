const KEY = 'learnly_last_course';

/**
 * Persist the last course/lesson the user accessed.
 * Call this whenever the user opens or switches to a lesson.
 *
 * @param {number} cursoId
 * @param {number|null} aulaId   — null when only the course page was opened
 * @param {string|null} aulaTitle — optional, stored for display in the dashboard
 */
export const saveLastCourse = (cursoId, aulaId = null, aulaTitle = null) => {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      cursoId: Number(cursoId),
      aulaId:  aulaId  ? Number(aulaId)  : null,
      aulaTitle,
      ts: Date.now(),
    }));
  } catch {}
};

/**
 * Read the last-accessed course record.
 * Returns null if nothing has been stored yet.
 *
 * @returns {{ cursoId: number, aulaId: number|null, aulaTitle: string|null, ts: number } | null}
 */
export const loadLastCourse = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
