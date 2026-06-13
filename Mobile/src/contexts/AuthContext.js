import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usuariosAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
          setUser(JSON.parse(stored));
          console.log(' Sessão restaurada do AsyncStorage');
        }
      } catch (error) {
        console.error(' Erro ao restaurar sessão:', error);
      }
      setLoading(false);
    };
    restore();
  }, []);

  const login = async (email, senha) => {
    try {
      console.log(' AuthContext - Iniciando login');
      console.log(' Email:', email);
      
      // Envia credenciais no mesmo formato que o web: { email, senha }
      const response = await usuariosAPI.login({ email, senha });
      
      console.log(' Resposta recebida');
      console.log(' Status:', response.status);
      
      const { token, usuario } = response.data;
      
      if (!token) {
        console.error(' Token não encontrado na resposta');
        throw new Error('Token não retornado pelo servidor');
      }
      
      if (!usuario) {
        console.error(' Usuario não encontrado na resposta');
        throw new Error('Usuário não retornado pelo servidor');
      }
      
      console.log(' Salvando token e usuário no AsyncStorage');
      console.log(' Usuário:', usuario.nome, '- Role:', usuario.role);
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(usuario));
      
      setUser(usuario);
      console.log(' Login concluído com sucesso!');
      
      return usuario;
    } catch (error) {
      console.error(' Erro no login (AuthContext)');
      console.error(' Message:', error.message);
      
      if (error.response) {
        console.error(' Status HTTP:', error.response.status);
        console.error(' Dados:', JSON.stringify(error.response.data));
      } else if (error.request) {
        console.error(' Request feito mas sem resposta do servidor');
      } else {
        console.error(' Erro ao configurar request');
      }
      
      throw error;
    }
  };

  const logout = async () => {
    console.log(' Fazendo logout');
    await AsyncStorage.multiRemove(['token', 'user']);
    setUser(null);
  };

  const updateUser = async (updated) => {
    const merged = { ...user, ...updated };
    await AsyncStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      usuario: user, // Alias para compatibilidade com código que usa 'usuario'
      loading, 
      login, 
      logout, 
      updateUser,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
