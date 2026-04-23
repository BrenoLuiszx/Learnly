import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { cursosAPI, acoesAPI } from '../services/api';

const CATEGORIAS = [
  'Todos', 'Frontend', 'Backend', 'Data Science', 'Database', 'DevOps',
  'Mobile', 'Design', 'Marketing', 'Negócios', 'Idiomas',
  'Música', 'Violão', 'Canto', 'Fotografia', 'Saúde', 'Diversos',
];

const CoursesScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [favorites, setFavorites] = useState(new Set());
  const [watchLater, setWatchLater] = useState(new Set());

  useEffect(() => {
    Promise.all([
      cursosAPI.listarTodos(),
      acoesAPI.meusFavoritos().catch(() => ({ data: { favoritos: [] } })),
      acoesAPI.meusAssistirDepois().catch(() => ({ data: { assistirDepois: [] } })),
    ]).then(([cursosRes, favRes, wlRes]) => {
      setCursos(cursosRes.data || []);
      setFavorites(new Set(favRes.data?.favoritos || []));
      setWatchLater(new Set(wlRes.data?.assistirDepois || []));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleFav = async (id) => {
    setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    try { const r = await acoesAPI.toggleFavorito(id); setFavorites(prev => { const n = new Set(prev); r.data.favorito ? n.add(id) : n.delete(id); return n; }); } catch {}
  };

  const toggleWL = async (id) => {
    setWatchLater(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    try { const r = await acoesAPI.toggleAssistirDepois(id); setWatchLater(prev => { const n = new Set(prev); r.data.assistirDepois ? n.add(id) : n.delete(id); return n; }); } catch {}
  };

  const filtrados = cursos.filter((c) => {
    const matchBusca =
      c.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      c.descricao?.toLowerCase().includes(busca.toLowerCase());
    const matchCat = categoria === 'Todos' || c.categoria === categoria;
    return matchBusca && matchCat;
  });

  const renderCurso = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
      onPress={() => navigation.navigate('CourseDetails', { id: item.id })}
    >
      {/* Cover image */}
      <View style={[styles.cover, { backgroundColor: theme.border }]}>
        {item.imagem ? (
          <Image source={{ uri: item.imagem }} style={styles.coverImg} resizeMode="cover" />
        ) : (
          <View style={[styles.coverFallback, { backgroundColor: theme.surface }]}>
            <Ionicons name="book-outline" size={32} color={theme.textTertiary} />
          </View>
        )}
        <View style={[styles.coverBadge, { backgroundColor: theme.primary }]}>
          <Text style={[styles.badgeText, { color: isDark ? '#000' : '#FFF' }]}>{item.categoria}</Text>
        </View>
        {/* Action buttons overlay */}
        <View style={styles.coverActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: 'rgba(0,0,0,0.55)' }]}
            onPress={() => toggleFav(item.id)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Ionicons name={favorites.has(item.id) ? 'heart' : 'heart-outline'} size={18} color={favorites.has(item.id) ? '#EF4444' : '#FFF'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: 'rgba(0,0,0,0.55)' }]}
            onPress={() => toggleWL(item.id)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Ionicons name={watchLater.has(item.id) ? 'bookmark' : 'bookmark-outline'} size={18} color={watchLater.has(item.id) ? theme.primary : '#FFF'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={[styles.duracao, { color: theme.textSecondary }]}>{Math.floor(item.duracao / 60)}h {item.duracao % 60}min</Text>
        </View>
        <Text style={[styles.titulo, { color: theme.text }]}>{item.titulo}</Text>
        <Text style={[styles.descricao, { color: theme.textSecondary }]} numberOfLines={2}>{item.descricao}</Text>
        <Text style={[styles.instrutor, { color: theme.textTertiary }]}>Instrutor: {item.instrutor}</Text>
        <TouchableOpacity
          style={[styles.btnIniciar, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('CourseDetails', { id: item.id })}
        >
          <Text style={[styles.btnIniciarText, { color: isDark ? '#000' : '#FFF' }]}>Começar Curso</Text>
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
        <Text style={[styles.pageTitle, { color: theme.text }]}>Catálogo de Cursos</Text>
        <Text style={[styles.pageSub, { color: theme.textSecondary }]}>
          A plataforma de cursos mais avançada do Brasil.
        </Text>
        <View style={[styles.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.textTertiary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Buscar seu próximo aprendizado..."
            placeholderTextColor={theme.textTertiary}
            value={busca}
            onChangeText={setBusca}
          />
        </View>
      </View>

      {/* Filtros */}
      <View style={[styles.filtros, { borderBottomColor: theme.border }]}>
        <Ionicons name="filter" size={16} color={theme.textSecondary} style={{ marginRight: 8 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, { borderColor: theme.border }, categoria === cat && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setCategoria(cat)}
            >
              <Text style={[styles.chipText, { color: theme.textSecondary }, categoria === cat && { color: isDark ? '#000' : '#FFF' }]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filtrados}
          renderItem={renderCurso}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.textTertiary }]}>Nenhum curso encontrado.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  logoBox: {
    width: 40, height: 40, borderRadius: 8, 
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  logoText: { fontSize: 16, fontWeight: '600', letterSpacing: 2 },
  pageTitle: { fontSize: 24, fontWeight: '600', marginBottom: 8 },
  pageSub: { fontSize: 14, marginBottom: 24 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filtros: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderBottomWidth: 1,
  },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, marginRight: 8,
  },
  chipText: { fontSize: 12, fontWeight: '500' },
  lista: { padding: 16 },
  card: {
    borderRadius: 12, borderWidth: 1, marginBottom: 16, overflow: 'hidden',
  },
  cover: { width: '100%', height: 160 },
  coverImg: { width: '100%', height: '100%' },
  coverFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  coverBadge: {
    position: 'absolute', top: 12, left: 12,
    borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4,
  },
  coverActions: {
    position: 'absolute', top: 8, right: 8,
    flexDirection: 'row', gap: 6,
  },
  actionBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  badge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  duracao: { fontSize: 14 },
  titulo: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  descricao: { fontSize: 14, marginBottom: 12 },
  instrutor: { fontSize: 14, marginBottom: 16 },
  btnIniciar: {
    borderRadius: 8, padding: 12, alignItems: 'center',
  },
  btnIniciarText: { fontSize: 14, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40 },
});

export default CoursesScreen;
