import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { cursosAPI, acoesAPI } from '../services/api';

const TABS = ['Favoritos', 'Assistir Depois'];

const SavedCoursesScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [tab, setTab] = useState(0);
  const [cursos, setCursos] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [watchLater, setWatchLater] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const load = async () => {
    try {
      setLoading(true);
      const [cursosRes, favRes, wlRes] = await Promise.all([
        cursosAPI.listarTodos().catch(() => ({ data: [] })),
        acoesAPI.meusFavoritos().catch(() => ({ data: { favoritos: [] } })),
        acoesAPI.meusAssistirDepois().catch(() => ({ data: { assistirDepois: [] } })),
      ]);
      setCursos(cursosRes.data || []);
      setFavorites(new Set(favRes.data?.favoritos || []));
      setWatchLater(new Set(wlRes.data?.assistirDepois || []));
    } finally {
      setLoading(false);
    }
  };

  const toggleFav = async (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      const res = await acoesAPI.toggleFavorito(id);
      setFavorites(prev => {
        const next = new Set(prev);
        res.data.favorito ? next.add(id) : next.delete(id);
        return next;
      });
    } catch {
      load();
    }
  };

  const toggleWL = async (id) => {
    setWatchLater(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      const res = await acoesAPI.toggleAssistirDepois(id);
      setWatchLater(prev => {
        const next = new Set(prev);
        res.data.assistirDepois ? next.add(id) : next.delete(id);
        return next;
      });
    } catch {
      load();
    }
  };

  const lista = tab === 0
    ? cursos.filter(c => favorites.has(c.id))
    : cursos.filter(c => watchLater.has(c.id));

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
      onPress={() => navigation.navigate('CourseDetails', { id: item.id })}
      activeOpacity={0.8}
    >
      <View style={[styles.thumb, { backgroundColor: theme.border }]}>
        {item.imagem
          ? <Image source={{ uri: item.imagem }} style={styles.thumbImg} resizeMode="cover" />
          : <Ionicons name="book-outline" size={24} color={theme.textTertiary} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.titulo, { color: theme.text }]} numberOfLines={2}>{item.titulo}</Text>
        <Text style={[styles.instrutor, { color: theme.textSecondary }]} numberOfLines={1}>{item.instrutor}</Text>
        <View style={[styles.catBadge, { backgroundColor: theme.primary + '22' }]}>
          <Text style={[styles.catText, { color: theme.primary }]}>{item.categoria}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => toggleFav(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons
            name={favorites.has(item.id) ? 'heart' : 'heart-outline'}
            size={22}
            color={favorites.has(item.id) ? '#EF4444' : theme.textTertiary}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleWL(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons
            name={watchLater.has(item.id) ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={watchLater.has(item.id) ? theme.primary : theme.textTertiary}
          />
        </TouchableOpacity>
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
        <Text style={[styles.pageTitle, { color: theme.text }]}>Meus Cursos</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statVal, { color: theme.text }]}>{cursos.filter(c => favorites.has(c.id)).length}</Text>
            <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Favoritos</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statVal, { color: theme.text }]}>{cursos.filter(c => watchLater.has(c.id)).length}</Text>
            <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Assistir Depois</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === i && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
            onPress={() => setTab(i)}
          >
            <Ionicons
              name={i === 0 ? (tab === 0 ? 'heart' : 'heart-outline') : (tab === 1 ? 'bookmark' : 'bookmark-outline')}
              size={16}
              color={tab === i ? theme.primary : theme.textSecondary}
            />
            <Text style={[styles.tabText, { color: tab === i ? theme.primary : theme.textSecondary }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={lista}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name={tab === 0 ? 'heart-outline' : 'bookmark-outline'}
                size={48}
                color={theme.textTertiary}
              />
              <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>
                {tab === 0 ? 'Nenhum favorito ainda' : 'Nenhum curso salvo'}
              </Text>
              <Text style={[styles.emptySub, { color: theme.textTertiary }]}>
                {tab === 0
                  ? 'Toque no ❤ nos cursos para favoritar'
                  : 'Toque no 🔖 nos cursos para salvar'}
              </Text>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate('Courses')}
              >
                <Text style={[styles.emptyBtnText, { color: isDark ? '#000' : '#FFF' }]}>Explorar Cursos</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingBottom: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  logoBox: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  logoText: { fontSize: 16, fontWeight: '600', letterSpacing: 2 },
  pageTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stat: { alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 12 },
  statDivider: { width: 1, height: 32 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 },
  tabText: { fontSize: 14, fontWeight: '600' },
  list: { padding: 16, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, borderWidth: 1, padding: 12 },
  thumb: { width: 64, height: 64, borderRadius: 8, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  titulo: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  instrutor: { fontSize: 13, marginBottom: 6 },
  catBadge: { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  catText: { fontSize: 11, fontWeight: '600' },
  actions: { gap: 12, alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
  emptySub: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  emptyBtn: { borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginTop: 8 },
  emptyBtnText: { fontSize: 14, fontWeight: '600' },
});

export default SavedCoursesScreen;
