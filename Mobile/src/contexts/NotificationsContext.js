import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { cursosAPI } from '../services/api';

const STORAGE_KEY = 'notifications_last_seen_id';

const NotificationsContext = createContext({ unreadCount: 0, notifications: [], markAllRead: () => {} });

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const [cursosRes, lastSeenRaw] = await Promise.all([
        cursosAPI.listarTodos(),
        AsyncStorage.getItem(STORAGE_KEY),
      ]);

      const cursos = cursosRes.data || [];
      if (cursos.length === 0) return;

      const lastSeenId = lastSeenRaw ? Number(lastSeenRaw) : 0;

      // Build one notification per course newer than the last seen id.
      // Sort descending by id so newest appear first.
      const sorted = [...cursos].sort((a, b) => b.id - a.id);

      const items = sorted.map(c => ({
        id: c.id,
        titulo: 'Novo curso disponível',
        message: `"${c.titulo}" já está disponível na plataforma`,
        categoria: c.categoria,
        imagem: c.imagem || null,
        dataCriacao: c.dataCriacao || null,
        unread: c.id > lastSeenId,
      }));

      setNotifications(items);
      setUnreadCount(items.filter(n => n.unread).length);
    } catch {
      // silently fail — notifications are non-critical
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (notifications.length === 0) return;
    const maxId = Math.max(...notifications.map(n => n.id));
    await AsyncStorage.setItem(STORAGE_KEY, String(maxId));
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    setUnreadCount(0);
  }, [notifications]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, notifications, markAllRead, load }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
