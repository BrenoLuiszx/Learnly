import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Image, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usuariosAPI } from '../services/api';

const EditProfileScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const { theme, isDark } = useTheme();

  const [nome, setNome] = useState(user?.nome || '');
  const [fotoUrl, setFotoUrl] = useState(user?.foto || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const roleLabel =
    user?.role === 'admin' ? 'Administrador'
    : user?.role === 'colaborador' ? 'Instrutor'
    : 'Aluno';

  const showMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const salvar = async () => {
    if (!nome.trim()) { showMsg('O nome não pode estar vazio.'); return; }
    setSaving(true);
    try {
      const updates = {};

      if (nome.trim() !== user?.nome) {
        const res = await usuariosAPI.atualizarPerfil(user.id, { nome: nome.trim() });
        updates.nome = res.data?.nome ?? nome.trim();
      }

      if (fotoUrl.trim() !== (user?.foto || '')) {
        await usuariosAPI.atualizarFoto(user.id, fotoUrl.trim());
        updates.foto = fotoUrl.trim() || null;
      }

      if (Object.keys(updates).length > 0) {
        await updateUser(updates);
        showMsg('Perfil atualizado com sucesso!');
      } else {
        showMsg('Nenhuma alteração detectada.');
      }
    } catch {
      showMsg('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.nome
    ? user.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : 'ES';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.textSecondary} />
          <Text style={[styles.backText, { color: theme.textSecondary }]}>Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Editar Perfil</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Atualize seu nome e foto de perfil
        </Text>
      </View>

      {/* Avatar preview */}
      <View style={[styles.avatarSection, { backgroundColor: theme.surface }]}>
        <View style={styles.avatarWrap}>
          {fotoUrl ? (
            <Image source={{ uri: fotoUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
              <Text style={[styles.avatarInitials, { color: isDark ? '#000' : '#FFF' }]}>
                {initials}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>

        {/* Nome */}
        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Informações da Conta</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Nome</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome"
              placeholderTextColor={theme.textTertiary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>E-mail</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled, { backgroundColor: theme.border, borderColor: theme.border, color: theme.textTertiary }]}
              value={user?.email || ''}
              editable={false}
            />
            <Text style={[styles.hint, { color: theme.textTertiary }]}>O e-mail não pode ser alterado</Text>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Função</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled, { backgroundColor: theme.border, borderColor: theme.border, color: theme.textTertiary }]}
              value={roleLabel}
              editable={false}
            />
          </View>
        </View>

        {/* Foto */}
        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Foto de Perfil</Text>
          <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
            Cole a URL de uma imagem pública (JPG, PNG)
          </Text>
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>URL da foto</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
              value={fotoUrl}
              onChangeText={setFotoUrl}
              placeholder="https://..."
              placeholderTextColor={theme.textTertiary}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
          {fotoUrl ? (
            <TouchableOpacity onPress={() => setFotoUrl('')}>
              <Text style={[styles.removePhoto, { color: '#EF4444' }]}>Remover foto</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Feedback */}
        {msg ? (
          <Text style={[
            styles.msg,
            { color: msg.includes('sucesso') ? '#34D399' : msg.includes('alteração') ? theme.textSecondary : '#EF4444' },
          ]}>
            {msg}
          </Text>
        ) : null}

        {/* Save button */}
        <TouchableOpacity
          style={[styles.btnSave, { backgroundColor: theme.primary }, saving && { opacity: 0.7 }]}
          onPress={salvar}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator size="small" color={isDark ? '#000' : '#FFF'} />
            : <Text style={[styles.btnSaveText, { color: isDark ? '#000' : '#FFF' }]}>Salvar Alterações</Text>
          }
        </TouchableOpacity>
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
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 32, fontWeight: '700' },
  form: { padding: 16, gap: 16 },
  card: { borderRadius: 12, borderWidth: 1, padding: 20, gap: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardDesc: { fontSize: 13, marginTop: -8 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '500' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 15 },
  inputDisabled: { opacity: 0.6 },
  hint: { fontSize: 12 },
  removePhoto: { fontSize: 13, fontWeight: '600', textAlign: 'right' },
  msg: { textAlign: 'center', fontSize: 14, fontWeight: '500' },
  btnSave: {
    padding: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    minHeight: 52,
  },
  btnSaveText: { fontSize: 16, fontWeight: '700' },
});

export default EditProfileScreen;
