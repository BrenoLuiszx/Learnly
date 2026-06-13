import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { cursosAPI, aulasAPI } from '../services/api';

const POLL_INTERVAL = 60000;

const NotificationsContext = createContext({
  unreadCount: 0,
  notifications: [],
  markAllRead: () => {},
  markRead: () => {},
  load: () => {},
  setUserId: () => {},
});

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const pollRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const userIdRef = useRef(null);

  // Keep ref in sync so callbacks always see latest userId
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const storageKey = (uid) => `notifications_v2_user_${uid}`;

  const loadStored = async (uid) => {
    try {
      const raw = await AsyncStorage.getItem(storageKey(uid));
      return raw ? JSON.parse(raw) : { readIds: [], knownCourseIds: [], knownLessonIds: [] };
    } catch {
      return { readIds: [], knownCourseIds: [], knownLessonIds: [] };
    }
  };

  const saveStored = async (uid, data) => {
    try {
      await AsyncStorage.setItem(storageKey(uid), JSON.stringify(data));
    } catch {}
  };

  const load = useCallback(async () => {
    const uid = userIdRef.current;
    if (!uid) return;
    try {
      const stored = await loadStored(uid);
      const { readIds, knownCourseIds, knownLessonIds } = stored;

      const cursosRes = await cursosAPI.listarTodos().catch(() => ({ data: [] }));
      const cursos = cursosRes.data || [];

      const newNotifications = [];

      // — Course notifications —
      const newCourseIds = [];
      for (const c of cursos) {
        const isNew = !knownCourseIds.includes(c.id) && knownCourseIds.length > 0;
        newNotifications.push({
          id: `course_${c.id}`,
          type: 'course',
          title: 'Novo curso disponível',
          message: `"${c.titulo}" já está disponível na plataforma`,
          categoria: c.categoria || null,
          imagem: c.imagem || null,
          createdAt: c.dataCriacao || null,
          targetId: c.id,
          read: isNew ? false : readIds.includes(`course_${c.id}`),
        });
        newCourseIds.push(c.id);
      }

      // — Lesson notifications —
      const newLessonIds = [...knownLessonIds];
      for (const curso of cursos) {
        try {
          const aulasRes = await aulasAPI.listarPorCurso(curso.id).catch(() => ({ data: [] }));
          const aulas = aulasRes.data || [];
          for (const aula of aulas) {
            const lessonKey = `lesson_${aula.id}`;
            const isNew = !knownLessonIds.includes(aula.id) && knownLessonIds.length > 0;
            if (isNew) {
              newNotifications.push({
                id: lessonKey,
                type: 'lesson',
                title: 'Nova aula adicionada',
                message: `"${aula.titulo}" foi adicionada ao curso ${curso.titulo}`,
                categoria: curso.categoria || null,
                imagem: curso.imagem || null,
                createdAt: aula.dataCriacao || null,
                targetId: curso.id,
                read: readIds.includes(lessonKey),
              });
            }
            if (!newLessonIds.includes(aula.id)) newLessonIds.push(aula.id);
          }
        } catch {}
      }

      const sorted = newNotifications.sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });

      setNotifications(sorted);
      setUnreadCount(sorted.filter(n => !n.read).length);

      await saveStored(uid, { readIds, knownCourseIds: newCourseIds, knownLessonIds: newLessonIds });
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    const uid = userIdRef.current;
    if (!uid) return;
    const stored = await loadStored(uid);
    const allIds = notifications.map(n => n.id);
    const merged = [...new Set([...stored.readIds, ...allIds])];
    await saveStored(uid, { ...stored, readIds: merged });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifications]);

  const markRead = useCallback(async (id) => {
    const uid = userIdRef.current;
    if (!uid) return;
    const stored = await loadStored(uid);
    const merged = [...new Set([...stored.readIds, id])];
    await saveStored(uid, { ...stored, readIds: merged });
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      setUnreadCount(updated.filter(n => !n.read).length);
      return updated;
    });
  }, []);

  // Poll while app is active
  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(load, POLL_INTERVAL);
  }, [load]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Reset and reload when user changes (login/logout/switch account)
  useEffect(() => {
    setNotifications([]);
    setUnreadCount(0);
    stopPolling();
    if (userId) {
      load();
      startPolling();
    }
  }, [userId]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appStateRef.current.match(/inactive|background/) && next === 'active') {
        if (userIdRef.current) { load(); startPolling(); }
      } else if (next.match(/inactive|background/)) {
        stopPolling();
      }
      appStateRef.current = next;
    });
    return () => { stopPolling(); sub.remove(); };
  }, []);

  return (
    <NotificationsContext.Provider value={{ unreadCount, notifications, markAllRead, markRead, load, setUserId }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
