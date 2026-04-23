import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationsContext';

const NotificationsScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { notifications, unreadCount, markAllRead, load } = useNotifications();

  // Reload on focus, then mark all read
  useEffect(() => {
    load().then(() => markAllRead());
  }, []);

  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.item,
        { backgroundColor: theme.cardBg, borderColor: theme.border },
        !item.unread && styles.itemRead,
      ]}
      onPress={() => navigation.navigate('CourseDetails', { id: item.id })}
      activeOpacity={0.75}
    >
      {/* Thumbnail or icon */}
      <View style={[styles.thumb, { backgroundColor: theme.border }]}>
        {item.imagem ? (
          <Image source={{ uri: item.imagem }} style={styles.thumbImg} resizeMode="cover" />
        ) : (
          <Ionicons name="book-outline" size={22} color={theme.primary} />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: item.unread ? theme.text : theme.textSecondary }]}
            numberOfLines={1}
          >
            {item.titulo}
          </Text>
          {item.unread && <View style={[styles.dot, { backgroundColor: theme.primary }]} />}
        </View>
        <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.message}
        </Text>
        <View style={styles.metaRow}>
          {item.categoria ? (
            <View style={[styles.catBadge, { backgroundColor: theme.primary + '22' }]}>
              <Text style={[styles.catText, { color: theme.primary }]}>{item.categoria}</Text>
            </View>
          ) : null}
          {item.dataCriacao ? (
            <Text style={[styles.time, { color: theme.textTertiary }]}>{formatDate(item.dataCriacao)}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <View style={styles.logoRow}>
          <View style={[styles.logoBox, { backgroundColor: theme.primary }]}>
            <Ionicons name="school" size={20} color={isDark ? '#000' : '#FFF'} />
          </View>
          <Text style={[styles.logoText, { color: theme.primary }]}>LEARNLY</Text>
        </View>
        <View style={styles.headerBottom}>
          <View>
            <Text style={[styles.pageTitle, { color: theme.text }]}>Notificações</Text>
            <Text style={[styles.pageSub, { color: theme.textSecondary }]}>
              Novos cursos na plataforma
            </Text>
          </View>
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
              <Text style={[styles.badgeText, { color: isDark ? '#000' : '#FFF' }]}>
                {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
              </Text>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Nenhum curso disponível ainda
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  logoBox: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  logoText: { fontSize: 16, fontWeight: '600', letterSpacing: 2 },
  headerBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pageTitle: { fontSize: 24, fontWeight: '600' },
  pageSub: { fontSize: 14, marginTop: 4 },
  badge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  lista: { padding: 16 },
  item: {
    flexDirection: 'row', gap: 14,
    borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12,
  },
  itemRead: { opacity: 0.65 },
  thumb: {
    width: 52, height: 52, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
  },
  thumbImg: { width: '100%', height: '100%' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: 14, fontWeight: '700', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8, flexShrink: 0 },
  message: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  catText: { fontSize: 11, fontWeight: '600' },
  time: { fontSize: 11 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
});

export default NotificationsScreen;
