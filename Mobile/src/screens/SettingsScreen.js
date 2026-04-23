import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Switch, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usuarioDashboardAPI } from '../services/api';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    usuarioDashboardAPI.dashboard()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  const roleLabel =
    user?.role === 'admin' ? 'Administrador'
    : user?.role === 'colaborador' ? 'Instrutor'
    : 'Aluno';

  const totalHoras = Math.floor((stats?.totalMinutos || 0) / 60);

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja desconectar da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.textSecondary} />
          <Text style={[styles.backText, { color: theme.textSecondary }]}>Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Configurações</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Preferências e informações da conta
        </Text>
      </View>

      <View style={styles.content}>

        {/* ── Aparência ── */}
        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Aparência</Text>

          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: theme.primary + '22' }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: theme.text }]}>
                {isDark ? 'Tema Escuro' : 'Tema Claro'}
              </Text>
              <Text style={[styles.rowSub, { color: theme.textSecondary }]}>
                Alternar entre tema escuro e claro
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary + '88' }}
              thumbColor={isDark ? theme.primary : theme.textTertiary}
            />
          </View>
        </View>

        {/* ── Minha Conta ── */}
        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Minha Conta</Text>

          {/* Session info */}
          <View style={[styles.sessionBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <View style={[styles.sessionAvatar, { backgroundColor: theme.primary }]}>
              <Text style={[styles.sessionInitials, { color: isDark ? '#000' : '#FFF' }]}>
                {user?.nome?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sessionName, { color: theme.text }]}>{user?.nome}</Text>
              <Text style={[styles.sessionEmail, { color: theme.textSecondary }]}>{user?.email}</Text>
              <View style={[styles.roleBadge, { backgroundColor: theme.primary + '22', borderColor: theme.primary + '44' }]}>
                <Text style={[styles.roleText, { color: theme.primary }]}>{roleLabel}</Text>
              </View>
            </View>
          </View>

          {/* Activity stats */}
          {loadingStats ? (
            <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 12 }} />
          ) : stats ? (
            <View style={[styles.statsRow, { borderTopColor: theme.border, borderBottomColor: theme.border }]}>
              {[
                { label: 'Cursos', value: stats.matriculas ?? 0, color: theme.primary },
                { label: 'Concluídos', value: stats.concluidos ?? 0, color: '#34D399' },
                { label: 'Horas', value: `${totalHoras}h`, color: '#3B82F6' },
              ].map(s => (
                <View key={s.label} style={styles.statItem}>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: theme.textTertiary }]}>{s.label}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Edit profile shortcut */}
          <TouchableOpacity
            style={[styles.row, styles.rowBorder, { borderTopColor: theme.border }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={[styles.rowIcon, { backgroundColor: theme.border }]}>
              <Ionicons name="create-outline" size={20} color={theme.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: theme.text }]}>Editar Perfil</Text>
              <Text style={[styles.rowSub, { color: theme.textSecondary }]}>Nome e foto de perfil</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* ── Sessão ── */}
        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Sessão</Text>

          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <View style={[styles.rowIcon, { backgroundColor: '#EF444415' }]}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: '#EF4444' }]}>Encerrar Sessão</Text>
              <Text style={[styles.rowSub, { color: theme.textSecondary }]}>Desconectar da conta</Text>
            </View>
          </TouchableOpacity>
        </View>

      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 20 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  backText: { fontSize: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14 },
  content: { padding: 16, gap: 16 },
  card: { borderRadius: 12, borderWidth: 1, padding: 20, gap: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowBorder: { paddingTop: 16, borderTopWidth: 1 },
  rowIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 13, marginTop: 2 },
  sessionBox: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 10, borderWidth: 1, padding: 14,
  },
  sessionAvatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  sessionInitials: { fontSize: 18, fontWeight: '700' },
  sessionName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  sessionEmail: { fontSize: 13, marginBottom: 6 },
  roleBadge: {
    alignSelf: 'flex-start', borderRadius: 4, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  roleText: { fontSize: 11, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 14,
  },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 12 },
});

export default SettingsScreen;
