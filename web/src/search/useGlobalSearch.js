import { useState, useEffect, useRef, useCallback } from 'react';
import { STATIC_INDEX, DYNAMIC_LOADERS } from './searchIndex';

const DEBOUNCE_MS = 150;
const MAX_RESULTS = 10;
const RECENT_KEY = 'gs_recent';
const MAX_RECENT = 5;

// Module-level cache — courses fetched once per page load
const dynamicCache = {};

const normalize = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const highlight = (text, query) => {
  if (!query || !text) return text;
  const q = normalize(query);
  const t = normalize(text);
  const idx = t.indexOf(q);
  if (idx === -1) return text;
  return {
    before: text.slice(0, idx),
    match:  text.slice(idx, idx + query.length),
    after:  text.slice(idx + query.length),
  };
};

const scoreEntry = (entry, query) => {
  const q = normalize(query);
  const label    = normalize(entry.label);
  const sublabel = normalize(entry.sublabel ?? '');
  const keywords = (entry.keywords ?? []).map(normalize).join(' ');

  if (label === q)           return 100;
  if (label.startsWith(q))   return 80;
  if (label.includes(q))     return 60;
  if (sublabel.includes(q))  return 40;
  if (keywords.includes(q))  return 30;

  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const hay = `${label} ${sublabel} ${keywords}`;
    if (words.every((w) => hay.includes(w))) return 20;
  }
  return 0;
};

const filterByAuth = (entries, usuario) =>
  entries.filter((e) => {
    if (!e.auth) return true;                                          // public
    if (!usuario) return false;                                        // must be logged in
    if (e.auth === 'user') return true;                                // any authenticated user
    if (e.auth === 'only-user') return usuario.role === 'user';        // plain users only
    if (e.auth === 'admin') return usuario.role === 'admin';           // admins only
    if (e.auth === 'colaborador')                                      // colaboradors + admins
      return ['admin', 'colaborador'].includes(usuario.role);
    return true;
  });

const runSearch = (query, allEntries) => {
  if (!query || query.trim().length < 2) return [];
  return allEntries
    .map((e) => ({ entry: e, score: scoreEntry(e, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map(({ entry }) => entry);
};

// ── Recent searches persistence ──────────────────────────────────────────────

const loadRecent = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
  catch { return []; }
};

const saveRecent = (entry) => {
  const prev = loadRecent().filter((r) => r.id !== entry.id);
  localStorage.setItem(RECENT_KEY, JSON.stringify([entry, ...prev].slice(0, MAX_RECENT)));
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useGlobalSearch = (usuario) => {
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const [recent, setRecent]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen]             = useState(false);

  const dynamicEntries = useRef([]);
  const debounceTimer  = useRef(null);
  const initialized    = useRef(false);
  const activeItemRef  = useRef(null);

  const ensureDynamic = useCallback(async () => {
    if (initialized.current) return;
    initialized.current = true;
    const loaded = await Promise.all(
      DYNAMIC_LOADERS.map(async (loader) => {
        if (dynamicCache[loader.id]) return dynamicCache[loader.id];
        const entries = await loader.load();
        dynamicCache[loader.id] = entries;
        return entries;
      })
    );
    dynamicEntries.current = loaded.flat();
  }, []);

  const doSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      setActiveIndex(-1);
      return;
    }
    setLoading(true);
    await ensureDynamic();
    const all = filterByAuth([...STATIC_INDEX, ...dynamicEntries.current], usuario);
    setResults(runSearch(q, all));
    setActiveIndex(-1);
    setLoading(false);
  }, [usuario, ensureDynamic]);

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    if (!query.trim()) {
      setResults([]);
      setActiveIndex(-1);
      setLoading(false);
      return;
    }
    debounceTimer.current = setTimeout(() => doSearch(query), DEBOUNCE_MS);
    return () => clearTimeout(debounceTimer.current);
  }, [query, doSearch]);

  // Scroll active item into view
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const openWithRecent = useCallback(() => {
    setRecent(loadRecent());
    setOpen(true);
  }, []);

  const handleKeyDown = useCallback((e, onSelect) => {
    if (!open) return;
    const list = results.length > 0 ? results : recent;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = activeIndex >= 0 ? list[activeIndex] : list[0];
      if (target) onSelect(target);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  }, [open, results, recent, activeIndex]);

  const selectResult = useCallback((result, onNavigate) => {
    saveRecent(result);
    setRecent(loadRecent());
    onNavigate(result);
    setQuery('');
    setOpen(false);
  }, []);

  return {
    query, setQuery,
    results, recent,
    loading,
    activeIndex, activeItemRef,
    open, setOpen,
    openWithRecent,
    handleKeyDown,
    selectResult,
    highlight,
  };
};
