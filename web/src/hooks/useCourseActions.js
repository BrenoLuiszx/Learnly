import { useState, useCallback, useEffect } from 'react';
import { acoesAPI } from '../services/api';

const favKey = (uid) => `learnly_favorites_${uid}`;
const wlKey  = (uid) => `learnly_watch_later_${uid}`;


const LEGACY_FAV_KEY = 'learnly_favorites';
const LEGACY_WL_KEY  = 'learnly_watch_later';

const EMPTY_SET = new Set();

const readSet = (key) => {
  try { return new Set(JSON.parse(localStorage.getItem(key)) || []); }
  catch { return new Set(); }
};

const writeSet = (key, set) => {
  localStorage.setItem(key, JSON.stringify([...set]));
  window.dispatchEvent(new StorageEvent('storage', { key }));
};

export const clearActionsCache = (uid) => {
  if (uid) {
    localStorage.removeItem(favKey(uid));
    localStorage.removeItem(wlKey(uid));
  }

  localStorage.removeItem(LEGACY_FAV_KEY);
  localStorage.removeItem(LEGACY_WL_KEY);
};

export const loadUserActions = async (uid) => {
  try {
    const [favRes, wlRes] = await Promise.all([
      acoesAPI.meusFavoritos(),
      acoesAPI.meusAssistirDepois(),
    ]);
    const favIds = new Set(favRes.data.favoritos || []);
    const wlIds  = new Set(wlRes.data.assistirDepois || []);
    if (uid) {
      writeSet(favKey(uid), favIds);
      writeSet(wlKey(uid),  wlIds);
    }
    return { favorites: favIds, watchLater: wlIds };
  } catch {
    return { favorites: new Set(), watchLater: new Set() };
  }
};

export const useCourseActions = () => {
  const [favorites,  setFavorites]  = useState(EMPTY_SET);
  const [watchLater, setWatchLater] = useState(EMPTY_SET);
  const [uid, setUid] = useState(() => {
    try { return JSON.parse(localStorage.getItem('usuario'))?.id ?? null; } catch { return null; }
  });


  useEffect(() => {
    const onStorage = (e) => {
      if (!uid) return;
      if (e.key === favKey(uid)) setFavorites(readSet(favKey(uid)));
      if (e.key === wlKey(uid))  setWatchLater(readSet(wlKey(uid)));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [uid]);


  useEffect(() => {
    const onLogin = () => {
      const newUid = (() => {
        try { return JSON.parse(localStorage.getItem('usuario'))?.id ?? null; } catch { return null; }
      })();
      setUid(newUid);
      loadUserActions(newUid).then(({ favorites: f, watchLater: w }) => {
        setFavorites(f);
        setWatchLater(w);
      });
    };
    const onClear = () => {
      setUid(null);
      setFavorites(new Set());
      setWatchLater(new Set());
    };
    window.addEventListener('auth:login',   onLogin);
    window.addEventListener('auth:logout',  onClear);
    window.addEventListener('auth:cleared', onClear);
    return () => {
      window.removeEventListener('auth:login',   onLogin);
      window.removeEventListener('auth:logout',  onClear);
      window.removeEventListener('auth:cleared', onClear);
    };
  }, []);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && uid) {
      localStorage.removeItem(LEGACY_FAV_KEY);
      localStorage.removeItem(LEGACY_WL_KEY);
      loadUserActions(uid).then(({ favorites: f, watchLater: w }) => {
        setFavorites(f);
        setWatchLater(w);
      });
    }
  }, []);

  const toggleFavorite = useCallback((id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      if (uid) writeSet(favKey(uid), next);
      return next;
    });
    acoesAPI.toggleFavorito(id).then(res => {
      setFavorites(prev => {
        const next = new Set(prev);
        res.data.favorito ? next.add(id) : next.delete(id);
        if (uid) writeSet(favKey(uid), next);
        return next;
      });
    }).catch(() => {
      loadUserActions(uid).then(({ favorites: f }) => setFavorites(f));
    });
  }, [uid]);

  const toggleWatchLater = useCallback((id) => {
    setWatchLater(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      if (uid) writeSet(wlKey(uid), next);
      return next;
    });
    acoesAPI.toggleAssistirDepois(id).then(res => {
      setWatchLater(prev => {
        const next = new Set(prev);
        res.data.assistirDepois ? next.add(id) : next.delete(id);
        if (uid) writeSet(wlKey(uid), next);
        return next;
      });
    }).catch(() => {
      loadUserActions(uid).then(({ watchLater: w }) => setWatchLater(w));
    });
  }, [uid]);

  return { favorites, watchLater, toggleFavorite, toggleWatchLater };
};
