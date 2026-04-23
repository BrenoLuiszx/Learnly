import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usuariosAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

const RegisterScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [foto, setFoto] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nome || !email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }
    if (senha !== confirmar) {
      Alert.alert('Erro', 'Senhas não coincidem');
      return;
    }
    setLoading(true);
    try {
      const dados = { nome, email, senha };
      if (foto) dados.foto = foto;
      await usuariosAPI.registrar(dados);
      Alert.alert('Sucesso', 'Conta criada! Faça login para continuar.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível criar a conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.textSecondary} />
          <Text style={[styles.backText, { color: theme.textSecondary }]}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.logo}>
          <View style={[styles.logoBox, { backgroundColor: theme.primary }]}>
            <Ionicons name="school" size={32} color={isDark ? '#000' : '#FFF'} />
          </View>
          <Text style={[styles.logoText, { color: theme.primary }]}>LEARNLY</Text>
        </View>

        <Text style={[styles.title, { color: theme.text }]}>Criar Conta</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Comece sua jornada de aprendizado</Text>

        {[
          { placeholder: 'Seu nome completo', value: nome, onChange: setNome },
          { placeholder: 'Seu e-mail', value: email, onChange: setEmail, keyboard: 'email-address', autoCapitalize: 'none' },
          { placeholder: 'Crie uma senha', value: senha, onChange: setSenha, secure: true },
          { placeholder: 'Confirme sua senha', value: confirmar, onChange: setConfirmar, secure: true },
          { placeholder: 'URL da foto (opcional)', value: foto, onChange: setFoto, keyboard: 'url', autoCapitalize: 'none' },
        ].map((field, i) => (
          <TextInput
            key={i}
            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
            placeholder={field.placeholder}
            placeholderTextColor={theme.textTertiary}
            value={field.value}
            onChangeText={field.onChange}
            secureTextEntry={field.secure}
            keyboardType={field.keyboard || 'default'}
            autoCapitalize={field.autoCapitalize || 'sentences'}
          />
        ))}

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={isDark ? '#000' : '#FFF'} />
            : <Text style={[styles.btnText, { color: isDark ? '#000' : '#FFF' }]}>Criar Conta</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.link, { color: theme.primary }]}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32, marginTop: 16 },
  backText: { fontSize: 16 },
  logo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 48 },
  logoBox: {
    width: 64, height: 64,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  logoText: { fontSize: 20, fontWeight: '600', letterSpacing: 2 },
  title: { fontSize: 24, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40 },
  input: {
    borderWidth: 1, borderRadius: 8, padding: 16,
    fontSize: 16, marginBottom: 16,
  },
  btn: {
    padding: 16, borderRadius: 8,
    alignItems: 'center', marginTop: 8,
  },
  btnText: { fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: {},
  link: { fontWeight: '600' },
});

export default RegisterScreen;
