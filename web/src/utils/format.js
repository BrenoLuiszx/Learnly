/** Formats a duration in minutes to "Xh Ymin" or "Ymin". */
export const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
};

/** Extracts a YouTube video ID from any standard YouTube URL format. */
export const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
};

/** Formats a date string to pt-BR locale (e.g. "15 jan. 2024"). */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

/** Safely parses a JSON string, returning fallback on failure. */
export const parseJSON = (str, fallback = []) => {
  if (!str) return fallback;
  try { return JSON.parse(str) ?? fallback; } catch { return fallback; }
};
