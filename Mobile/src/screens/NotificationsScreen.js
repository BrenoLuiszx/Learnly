import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationsContext';

const TYPE_CONFIG = {
  course: { icon: 'book', label: 'Curso' },
  lesson: { icon: 'play-circle', label: 'Aula' },
};

const NotificationsScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { notifications, unreadCount, markAllRead, markRead, load } = useNotifications();

  useEffect(() => {
    load();
  }, []);

  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const handlePress = (item) => {
    markRead(item.id);
    navigation.navigate('CourseDetails', { id: item.targetId });
  };

  const renderItem = ({ item }) => {
    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.course;
    return (
      <TouchableOpacity
        style={[
          styles.item,
          { backgroundColor: theme.cardBg, borderColor: item.read ? theme.border : theme.primary + '55' },
          !item.read && { borderLeftWidth: 3, borderLeftColor: theme.primary },
        ]}
        onPress={() => handlePress(item)}
        activeOpacity={0.75}
      >
        <View style={[styles.thumb, { backgroundColor: item.read ? theme.border : theme.primary + '1A' }]}>
          {item.imagem ? (
            <Image source={{ uri: item.imagem }} style={styles.thumbImg} resizeMode="cover" />
          ) : (
            <Ionicons name={cfg.icon} size={22} color={theme.primary} />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, { color: item.read ? theme.textSecondary : theme.text }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!item.read && <View style={[styles.dot, { backgroundColor: theme.primary }]} />}
          </View>
          <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={2}>
            {item.message}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.typeBadge, { backgroundColor: theme.primary + '22' }]}>
              <Ionicons name={cfg.icon + '-outline'} size={10} color={theme.primary} />
              <Text style={[styles.typeText, { color: theme.primary }]}>{cfg.label}</Text>
            </View>
            {item.categoria ? (
              <View style={[styles.catBadge, { backgroundColor: theme.border }]}>
                <Text style={[styles.catText, { color: theme.textSecondary }]}>{item.categoria}</Text>
              </View>
            ) : null}
            {item.createdAt ? (
              <Text style={[styles.time, { color: theme.textTertiary }]}>{formatDate(item.createdAt)}</Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

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
              Cursos e aulas novos na plataforma
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={[styles.markBtn, { backgroundColor: theme.primary + '1A', borderColor: theme.primary + '44' }]}
              onPress={markAllRead}
            >
              <Ionicons name="checkmark-done" size={14} color={theme.primary} />
              <Text style={[styles.markBtnText, { color: theme.primary }]}>Marcar todas</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Nenhuma notificação ainda
            </Text>
            <Text style={[styles.emptySub, { color: theme.textTertiary }]}>
              Você será notificado quando novos cursos ou aulas forem publicados
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
  markBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6,
  },
  markBtnText: { fontSize: 12, fontWeight: '600' },
  lista: { padding: 16, paddingBottom: 32 },
  item: {
    flexDirection: 'row', gap: 14,
    borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10,
  },
  thumb: {
    width: 52, height: 52, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
  },
  thumbImg: { width: '100%', height: '100%' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: 14, fontWeight: '700', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8, flexShrink: 0 },
  message: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  typeText: { fontSize: 11, fontWeight: '600' },
  catBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  catText: { fontSize: 11 },
  time: { fontSize: 11 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12, paddingHorizontal: 32 },
  emptyText: { fontSize: 16, fontWeight: '600' },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});

export default NotificationsScreen;
