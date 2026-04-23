import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Image, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { certificadosAPI, usuarioDashboardAPI } from '../services/api';

const TABS = ['Estatísticas', 'Certificados', 'Atividade'];

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [tab, setTab] = useState(0);

  const [loading, setLoading] = useState(true);
  
  const [dashboard, setDashboard] = useState(null);
  const [certificados, setCertificados] = useState([]);
  
  // Recarrega sempre que a tela ganha foco (volta de outra tela)
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
      setDashboard(dashRes.data || {});
      setCertificados(certRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados do perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const cursos = dashboard?.cursosDetalhes || [];
  const cursosConcluidos = cursos.filter(c => c.concluido);
  const cursosEmAndamento = [...cursos.filter(c => !c.concluido)].sort((a, b) => {
    const ta = a.ultimaAtividade ? new Date(a.ultimaAtividade).getTime() : 0;
    const tb = b.ultimaAtividade ? new Date(b.ultimaAtividade).getTime() : 0;
    return tb - ta;
  });
  const totalHoras = Math.floor((dashboard?.totalMinutos || 0) / 60);
  const certIds = new Set(certificados.map(c => c.cursoId));

  const emitirCertificado = async (cursoId) => {
    try {
      await certificadosAPI.emitir(cursoId);
      const certRes = await certificadosAPI.meusCertificados();
      setCertificados(certRes.data || []);
      setTab(1);
    } catch {
      Alert.alert('Erro', 'Não foi possível emitir o certificado.');
    }
  };

  const initials = user?.nome
    ? user.nome.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : 'ES';

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja desconectar da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  const renderStats = () => {
    const stats = [
      { 
        label: 'Cursos Concluídos', 
        value: cursosConcluidos.length, 
        total: 20, 
        icon: 'trophy', 
        color: theme.primary,
        onPress: () => {
          if (cursosConcluidos.length > 0) {
            Alert.alert(
              'Cursos Concluídos',
              cursosConcluidos.map(c => `• ${c.tituloCurso}`).join('\n'),
              [{ text: 'OK' }]
            );
          }
        }
      },
      { 
        label: 'Horas de Estudo', 
        value: totalHoras, 
        total: 100, 
        icon: 'time', 
        color: '#3B82F6',
        onPress: () => {
          const mins = (dashboard?.totalMinutos || 0) % 60;
          Alert.alert(
            'Tempo de Estudo',
            `Total: ${totalHoras}h ${mins}min\n\nBaseado em ${cursosConcluidos.length} curso(s) concluído(s)`,
            [{ text: 'OK' }]
          );
        }
      },
      { 
        label: 'Certificados', 
        value: certificados.length, 
        total: 20, 
        icon: 'ribbon', 
        color: '#10B981',
        onPress: () => setTab(1)
      },
    ];
    
    return (
      <View style={styles.tabContent}>
        {stats.map((s) => {
          const percent = s.total > 0 ? Math.round((s.value / s.total) * 100) : 0;
          return (
            <TouchableOpacity 
              key={s.label} 
              style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
              onPress={s.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.statRow}>
                <View style={[styles.statIcon, { backgroundColor: s.color + '33' }]}>
                  <Ionicons name={s.icon} size={24} color={s.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.statLabel, { color: theme.text }]}>{s.label}</Text>
                  <Text style={[styles.statSub, { color: theme.textSecondary }]}>{s.value} de {s.total}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.statPercent, { color: theme.text }]}>{percent}%</Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} style={{ marginTop: 4 }} />
                </View>
              </View>
              <View style={[styles.progressBg, { backgroundColor: theme.border }]}>
                <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: s.color }]} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderCertificados = () => {
    const disponiveis = cursosConcluidos.filter(c => !certIds.has(c.cursoId));
    if (certificados.length === 0 && disponiveis.length === 0) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.emptyState}>
            <Ionicons name="ribbon-outline" size={48} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nenhum certificado ainda</Text>
            <Text style={[styles.emptySub, { color: theme.textTertiary }]}>Complete cursos para emitir certificados</Text>
            <TouchableOpacity 
              style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('Courses')}
            >
              <Text style={[styles.emptyBtnText, { color: isDark ? '#000' : '#FFF' }]}>Explorar Cursos</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {disponiveis.length > 0 && disponiveis.map((curso) => (
          <TouchableOpacity
            key={`emit-${curso.cursoId}`}
            style={[styles.certCard, { backgroundColor: theme.cardBg, borderColor: theme.primary + '44' }]}
            onPress={() => Alert.alert(
              'Emitir Certificado',
              `Emitir certificado para "${curso.tituloCurso}"?`,
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Emitir', onPress: () => emitirCertificado(curso.cursoId) },
              ]
            )}
            activeOpacity={0.7}
          >
            <View style={[styles.certIcon, { backgroundColor: theme.primary + '1A' }]}>
              <Ionicons name="ribbon-outline" size={32} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.certTitle, { color: theme.text }]}>{curso.tituloCurso}</Text>
              <Text style={[styles.certDate, { color: theme.textSecondary }]}>Disponível para emissão</Text>
            </View>
            <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
        ))}
        {certificados.map((cert) => (
            <TouchableOpacity 
              key={cert.id} 
              style={[styles.certCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
              onPress={() => {
                Alert.alert(
                  cert.cursoTitulo || 'Certificado',
                  `Emitido em: ${new Date(cert.dataEmissao).toLocaleDateString('pt-BR')}\n` +
                  `Status: ${cert.publico ? 'Público' : 'Privado'}`,
                  [
                    { text: 'Ver Curso', onPress: () => navigation.navigate('CourseDetails', { id: cert.cursoId }) },
                    { text: 'Fechar', style: 'cancel' },
                  ]
                );
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.certIcon, { backgroundColor: theme.primary + '1A' }]}>
                <Ionicons name="ribbon" size={32} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.certTitle, { color: theme.text }]}>{cert.cursoTitulo || 'Certificado'}</Text>
                <Text style={[styles.certDate, { color: theme.textSecondary }]}>
                  Emitido em {new Date(cert.dataEmissao).toLocaleDateString('pt-BR')}
                </Text>
                {cert.publico && (
                  <View style={styles.publicBadge}>
                    <Ionicons name="eye" size={12} color="#10B981" />
                    <Text style={styles.publicText}>Público</Text>
                  </View>
                )}
              </View>
              <View style={{ alignItems: 'center', gap: 8 }}>
                <TouchableOpacity 
                  style={[styles.certBtn, { backgroundColor: theme.primary + '1A' }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    Alert.alert('Download', 'Funcionalidade de download em desenvolvimento');
                  }}
                >
                  <Ionicons name="download-outline" size={20} color={theme.primary} />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
              </View>
            </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderActivity = () => {
    if (cursosEmAndamento.length === 0) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nenhum curso em andamento</Text>
            <Text style={[styles.emptySub, { color: theme.textTertiary }]}>Comece um curso para ver seu progresso aqui</Text>
            <TouchableOpacity 
              style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('Courses')}
            >
              <Text style={[styles.emptyBtnText, { color: isDark ? '#000' : '#FFF' }]}>Explorar Cursos</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.tabContent}>
        {cursosEmAndamento.map((curso) => {
          const aulaId = curso.proximaAulaId || curso.ultimaAulaId;
          const aulaLabel = curso.proximaAulaTitulo
            ? `Próxima: ${curso.proximaAulaTitulo}`
            : curso.ultimaAulaTitulo
            ? `Última: ${curso.ultimaAulaTitulo}`
            : null;
          return (
            <TouchableOpacity
              key={curso.cursoId}
              style={[styles.activityCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
              onPress={() => navigation.navigate('CourseDetails', aulaId ? { id: curso.cursoId, aulaId } : { id: curso.cursoId })}
              activeOpacity={0.7}
            >
              <View style={[styles.activityIcon, { backgroundColor: theme.primary + '1A' }]}>
                <Ionicons name="book" size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.activityTitle, { color: theme.text }]} numberOfLines={1}>{curso.tituloCurso}</Text>
                {aulaLabel && (
                  <Text style={[styles.activityInstrutor, { color: theme.textSecondary }]} numberOfLines={1}>{aulaLabel}</Text>
                )}
                <View style={styles.activityProgress}>
                  <View style={[styles.progressBg, { backgroundColor: theme.border }]}>
                    <View style={[styles.progressFill, { width: `${Math.round(Number(curso.progresso) || 0)}%`, backgroundColor: theme.primary }]} />
                  </View>
                  <Text style={[styles.activityPercent, { color: theme.primary }]}>
                    {curso.aulasVistas ?? 0}/{curso.totalAulas ?? 0} aulas
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

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

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.cardBg + '80', borderColor: theme.border }]}>
          <View style={styles.profileTop}>
            <View style={styles.avatarContainer}>
              {user?.foto ? (
                <Image source={{ uri: user.foto }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
                  <Text style={[styles.avatarText, { color: isDark ? '#000' : '#FFF' }]}>{initials}</Text>
                </View>
              )}
              <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('EditProfile')}>
                <Ionicons name="camera" size={14} color={isDark ? '#000' : '#FFF'} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.userName, { color: theme.text }]}>{user?.nome || 'Estudante'}</Text>
                  <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email || ''}</Text>
                </View>
              </View>
              <View style={styles.badgesRow}>
                <View style={[styles.premiumBadge, { backgroundColor: theme.primary + '1A', borderColor: theme.primary + '33' }]}>
                  <Ionicons name="ribbon" size={12} color={theme.primary} />
                  <Text style={[styles.premiumText, { color: theme.primary }]}>Premium</Text>
                </View>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>Nível 1</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.statsRow, { borderTopColor: theme.border }]}>
            <View style={styles.miniStat}>
              <Text style={[styles.miniStatValue, { color: theme.text }]}>{cursosConcluidos.length}</Text>
              <Text style={[styles.miniStatLabel, { color: theme.textTertiary }]}>Cursos</Text>
            </View>
            <View style={styles.miniStat}>
              <Text style={[styles.miniStatValue, { color: theme.text }]}>{totalHoras}h</Text>
              <Text style={[styles.miniStatLabel, { color: theme.textTertiary }]}>Estudadas</Text>
            </View>
            <View style={styles.miniStat}>
              <Text style={[styles.miniStatValue, { color: theme.text }]}>{certificados.length}</Text>
              <Text style={[styles.miniStatLabel, { color: theme.textTertiary }]}>Certificados</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === i && { backgroundColor: theme.primary }]}
            onPress={() => setTab(i)}
          >
            <Text style={[styles.tabText, { color: tab === i ? (isDark ? '#000' : '#FFF') : theme.textSecondary }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingTab}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <>
          {tab === 0 && renderStats()}
          {tab === 1 && renderCertificados()}
          {tab === 2 && renderActivity()}
        </>
      )}

      {/* Menu */}
      <View style={styles.menu}>
        <Text style={[styles.menuTitle, { color: theme.text }]}>Configurações</Text>
        <View style={[styles.menuCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          {[
            { label: 'Editar Perfil', subtitle: 'Atualize suas informações', icon: 'create', danger: false, onPress: () => navigation.navigate('EditProfile') },
            { label: 'Configurações', subtitle: 'Preferências do app', icon: 'settings', danger: false, onPress: () => navigation.navigate('Settings') },
            { label: 'Sair', subtitle: 'Desconectar da conta', icon: 'log-out', danger: true, onPress: handleLogout },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.danger ? '#EF444410' : theme.border }]}>
                <Ionicons name={item.icon} size={20} color={item.danger ? '#EF4444' : theme.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: item.danger ? '#EF4444' : theme.text }]}>{item.label}</Text>
                <Text style={[styles.menuSub, { color: theme.textTertiary }]}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={item.danger ? '#EF4444' : theme.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 32 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  logoBox: {
    width: 40, height: 40, borderRadius: 8, 
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  logoText: { fontSize: 16, fontWeight: '600', letterSpacing: 2, flex: 1 },
  themeBtn: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  profileCard: {
    borderRadius: 12, borderWidth: 1, padding: 24,
  },
  profileTop: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '600' },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  userName: { fontSize: 18, fontWeight: '600' },
  userEmail: { fontSize: 14 },
  badgesRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  premiumBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1,
  },
  premiumText: { fontSize: 10, fontWeight: '600' },
  levelBadge: {
    backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)',
  },
  levelText: { color: '#3B82F6', fontSize: 10, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    borderTopWidth: 0.5, paddingTop: 16,
  },
  miniStat: { alignItems: 'center' },
  miniStatValue: { fontSize: 18, fontWeight: '600' },
  miniStatLabel: { fontSize: 12 },
  tabsContainer: {
    flexDirection: 'row', margin: 16,
    borderRadius: 8, borderWidth: 1, padding: 4,
  },
  tabBtn: { flex: 1, padding: 10, borderRadius: 6, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600' },
  tabContent: { paddingHorizontal: 16, gap: 12 },
  statCard: {
    borderRadius: 12, borderWidth: 1, padding: 20, gap: 16,
  },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  statIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 16, fontWeight: '600' },
  statSub: { fontSize: 14 },
  statPercent: { fontSize: 16, fontWeight: '600' },
  progressBg: { height: 8, borderRadius: 4 },
  progressFill: { height: 8, borderRadius: 4 },
  loadingTab: { padding: 40, alignItems: 'center' },
  emptyState: { alignItems: 'center', padding: 40, gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '600' },
  emptySub: { fontSize: 14, textAlign: 'center' },
  emptyBtn: { borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginTop: 8 },
  emptyBtnText: { fontSize: 14, fontWeight: '600' },
  certCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderRadius: 12, borderWidth: 1, padding: 16,
  },
  certIcon: {
    width: 56, height: 56, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  certTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  certDate: { fontSize: 13, marginBottom: 8 },
  publicBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start',
  },
  publicText: { color: '#10B981', fontSize: 11, fontWeight: '600' },
  certBtn: {
    width: 40, height: 40, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  activityCard: {
    flexDirection: 'row', gap: 16,
    borderRadius: 12, borderWidth: 1, padding: 16,
  },
  activityIcon: {
    width: 48, height: 48, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  activityTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  activityInstrutor: { fontSize: 13, marginBottom: 6 },
  activityMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  activityMetaText: { fontSize: 12 },
  activityDot: { width: 3, height: 3, borderRadius: 1.5, marginHorizontal: 4 },
  activityProgress: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activityPercent: { fontSize: 13, fontWeight: '600', minWidth: 40 },
  menu: { padding: 16, marginTop: 16 },
  menuTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  menuCard: {
    borderRadius: 12, borderWidth: 1,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
  menuIcon: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 16, fontWeight: '600' },
  menuSub: { fontSize: 12 },
});

export default ProfileScreen;
