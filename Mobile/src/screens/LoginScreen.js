import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), senha);
    } catch {
      Alert.alert('Erro', 'Email ou senha incorretos');
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
        <TouchableOpacity
          style={[styles.themeBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={theme.primary} />
        </TouchableOpacity>

        <View style={styles.logo}>
          <View style={[styles.logoBox, { backgroundColor: theme.primary }]}>
            <Ionicons name="school" size={32} color={isDark ? '#000' : '#FFF'} />
          </View>
          <Text style={[styles.logoText, { color: theme.primary }]}>LEARNLY</Text>
        </View>

        <Text style={[styles.title, { color: theme.text }]}>Bem-vindo de volta</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Entre para continuar aprendendo</Text>

        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
          placeholder="Seu e-mail"
          placeholderTextColor={theme.textTertiary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
          placeholder="Sua senha"
          placeholderTextColor={theme.textTertiary}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={isDark ? '#000' : '#FFF'} />
            : <Text style={[styles.btnText, { color: isDark ? '#000' : '#FFF' }]}>Entrar</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>Não tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.link, { color: theme.primary }]}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  themeBtn: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-end', marginBottom: 16,
  },
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

export default LoginScreen;
