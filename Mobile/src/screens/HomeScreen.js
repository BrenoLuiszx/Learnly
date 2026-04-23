import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usuarioDashboardAPI, certificadosAPI } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      carregarDados();
    }, [])
  );

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [dashRes, certRes] = await Promise.all([
        usuarioDashboardAPI.dashboard().catch(() => ({ data: {} })),
        certificadosAPI.meusCertificados().catch(() => ({ data: [] })),
      ]);
      setDashboard({ ...dashRes.data, certificadosCount: (certRes.data || []).length });
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const cursos = dashboard?.cursosDetalhes || [];
  // Sort by most recently active, matching the web DashboardTab logic
  const emAndamento = [...cursos.filter(c => !c.concluido)].sort((a, b) => {
    const ta = a.ultimaAtividade ? new Date(a.ultimaAtividade).getTime() : 0;
    const tb = b.ultimaAtividade ? new Date(b.ultimaAtividade).getTime() : 0;
    return tb - ta;
  });
  const totalHoras = Math.floor((dashboard?.totalMinutos || 0) / 60);

  // Most recently active enrolled course for "Continue Learning"
  const ultimoCurso = emAndamento.length > 0 ? emAndamento[0] : null;

  const handleContinue = (curso) => {
    if (!curso) return;
    const aulaId = curso.proximaAulaId || curso.ultimaAulaId;
    if (aulaId) {
      navigation.navigate('CourseDetails', { id: curso.cursoId, aulaId });
    } else {
      navigation.navigate('CourseDetails', { id: curso.cursoId });
    }
  };

  const statsDisplay = [
    { label: 'Concluídos', value: (dashboard?.concluidos ?? 0).toString(), unit: 'cursos', icon: 'star', color: '#FACC15' },
    { label: 'Estudadas', value: totalHoras.toString(), unit: 'horas', icon: 'time', color: '#3B82F6' },
    { label: 'Certificados', value: (dashboard?.certificadosCount ?? 0).toString(), unit: 'emitidos', icon: 'ribbon', color: '#10B981' },
  ];

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <View style={styles.logoRow}>
          <View style={[styles.logoBox, { backgroundColor: theme.primary }]}>
            <Ionicons name="school" size={20} color={isDark ? '#000' : '#FFF'} />
          </View>
          <Text style={[styles.logoText, { color: theme.primary }]}>LEARNLY</Text>
          <TouchableOpacity
            style={[styles.themeBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.greeting, { color: theme.text }]}>Olá, {user?.nome?.split(' ')[0] || 'Estudante'}! 👋</Text>
        <Text style={[styles.greetingSub, { color: theme.textSecondary }]}>Que bom ter você de volta</Text>

        {/* Overall progress */}
        {dashboard && (dashboard.matriculas ?? 0) > 0 && (() => {
          const total = dashboard.matriculas ?? 0;
          const done = dashboard.concluidos ?? 0;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <View style={[styles.metaCard, { backgroundColor: theme.primary + '0D', borderColor: theme.primary + '33' }]}>
              <View style={styles.metaRow}>
                <View style={[styles.metaIcon, { backgroundColor: theme.primary + '33' }]}>
                  <Ionicons name="trending-up" size={20} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.metaTitle, { color: theme.text }]}>Progresso Geral</Text>
                  <Text style={[styles.metaSub, { color: theme.textSecondary }]}>{done} de {total} cursos concluídos</Text>
                </View>
                <Text style={[styles.metaPercent, { color: theme.primary }]}>{pct}%</Text>
              </View>
              <View style={[styles.progressBg, { backgroundColor: theme.border }]}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: theme.primary }]} />
              </View>
            </View>
          );
        })()}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {statsDisplay.map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={[styles.statIcon, { backgroundColor: s.color + '33' }]}>
              <Ionicons name={s.icon} size={16} color={s.color} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{s.value}</Text>
            <Text style={[styles.statUnit, { color: theme.textTertiary }]}>{s.unit}</Text>
          </View>
        ))}
      </View>

      {/* Continue Learning */}
      {ultimoCurso && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Continue Aprendendo</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
              <Text style={[styles.sectionLink, { color: theme.primary }]}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.continueCard, { backgroundColor: theme.cardBg, borderColor: theme.primary + '44' }]}
            onPress={() => handleContinue(ultimoCurso)}
            activeOpacity={0.8}
          >
            {/* Thumbnail */}
            <View style={[styles.continueThumbnail, { backgroundColor: theme.border }]}>
              {ultimoCurso.imagem ? (
                <Image source={{ uri: ultimoCurso.imagem }} style={styles.thumbnailImg} resizeMode="cover" />
              ) : (
                <Ionicons name="play-circle-outline" size={32} color={theme.primary} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.continueEyebrow}>
                <Ionicons name="play" size={12} color={theme.primary} />
                <Text style={[styles.continueEyebrowText, { color: theme.primary }]}>Continue de onde parou</Text>
              </View>
              <Text style={[styles.continueTitle, { color: theme.text }]} numberOfLines={2}>{ultimoCurso.tituloCurso}</Text>
              {(ultimoCurso.proximaAulaTitulo || ultimoCurso.ultimaAulaTitulo) && (
                <Text style={[styles.continueNext, { color: theme.textSecondary }]} numberOfLines={1}>
                  {ultimoCurso.proximaAulaTitulo
                    ? `Próxima: ${ultimoCurso.proximaAulaTitulo}`
                    : `Última: ${ultimoCurso.ultimaAulaTitulo}`}
                </Text>
              )}
              <View style={styles.progressRow}>
                <View style={[styles.progressBg, { backgroundColor: theme.border, flex: 1 }]}>
                  <View style={[styles.progressFill, { width: `${Math.round(Number(ultimoCurso.progresso) || 0)}%`, backgroundColor: theme.primary }]} />
                </View>
                <Text style={[styles.progressText, { color: theme.primary }]}>
                  {ultimoCurso.aulasVistas ?? 0}/{ultimoCurso.totalAulas ?? 0} aulas
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Other in-progress courses */}
          {emAndamento.slice(1, 3).map((curso) => (
            <TouchableOpacity
              key={curso.cursoId}
              style={[styles.continueCardSmall, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
              onPress={() => handleContinue(curso)}
            >
              <View style={[styles.continueThumbnailSm, { backgroundColor: theme.border }]}>
                {curso.imagem ? (
                  <Image source={{ uri: curso.imagem }} style={styles.thumbnailImg} resizeMode="cover" />
                ) : (
                  <Ionicons name="book-outline" size={20} color={theme.primary} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.continueTitle, { color: theme.text }]} numberOfLines={1}>{curso.tituloCurso}</Text>
                <View style={styles.progressRow}>
                  <View style={[styles.progressBg, { backgroundColor: theme.border, flex: 1 }]}>
                    <View style={[styles.progressFill, { width: `${Math.round(Number(curso.progresso) || 0)}%`, backgroundColor: theme.primary }]} />
                  </View>
                  <Text style={[styles.progressText, { color: theme.primary }]}>{Math.round(Number(curso.progresso) || 0)}%</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Recommended / All courses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Explorar Cursos</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
            <Text style={[styles.sectionLink, { color: theme.primary }]}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.exploreCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Courses')}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={24} color={theme.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.exploreTitle, { color: theme.text }]}>Descobrir novos cursos</Text>
            <Text style={[styles.exploreSub, { color: theme.textSecondary }]}>Explore todo o catálogo disponível</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={[styles.statsRow, { marginBottom: 24 }]}>
        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: theme.cardBg, borderColor: '#7C3AED33' }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="trending-up" size={24} color="#7C3AED" />
          <Text style={[styles.quickTitle, { color: theme.text }]}>Seu Progresso</Text>
          <Text style={[styles.quickSub, { color: theme.textSecondary }]}>Ver estatísticas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: theme.cardBg, borderColor: '#10B98133' }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="ribbon" size={24} color="#10B981" />
          <Text style={[styles.quickTitle, { color: theme.text }]}>Certificados</Text>
          <Text style={[styles.quickSub, { color: theme.textSecondary }]}>{dashboard?.certificadosCount ?? 0} emitidos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingBottom: 32 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  logoBox: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  logoText: { fontSize: 16, fontWeight: '600', letterSpacing: 2, flex: 1 },
  themeBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: 24, fontWeight: '600', marginBottom: 4 },
  greetingSub: { fontSize: 16, marginBottom: 24 },
  metaCard: { padding: 20, borderRadius: 12, borderWidth: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  metaIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  metaTitle: { fontSize: 16, fontWeight: '600' },
  metaSub: { fontSize: 14 },
  metaPercent: { fontSize: 16, fontWeight: '600' },
  progressBg: { height: 8, borderRadius: 4 },
  progressFill: { height: 8, borderRadius: 4 },
  statsRow: { flexDirection: 'row', padding: 16, gap: 8 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 16, alignItems: 'center', gap: 4 },
  statIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 18, fontWeight: '600' },
  statUnit: { fontSize: 12 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  sectionLink: { fontSize: 14 },
  continueCard: {
    flexDirection: 'row', borderRadius: 12,
    borderWidth: 1.5, padding: 16, marginBottom: 12, gap: 16,
  },
  continueCardSmall: {
    flexDirection: 'row', borderRadius: 12,
    borderWidth: 1, padding: 12, marginBottom: 8, gap: 12,
  },
  continueThumbnail: { width: 80, height: 72, borderRadius: 8, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  continueThumbnailSm: { width: 56, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbnailImg: { width: '100%', height: '100%' },
  continueEyebrow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  continueEyebrowText: { fontSize: 11, fontWeight: '600' },
  continueTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  continueNext: { fontSize: 12, marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressText: { fontSize: 12, fontWeight: '600', minWidth: 60 },
  exploreCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 16 },
  exploreTitle: { fontSize: 15, fontWeight: '600' },
  exploreSub: { fontSize: 13, marginTop: 2 },
  quickCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 16, gap: 8 },
  quickTitle: { fontSize: 14, fontWeight: '600' },
  quickSub: { fontSize: 12 },
});

export default HomeScreen;
