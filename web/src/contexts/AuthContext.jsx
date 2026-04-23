import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearActionsCache, loadUserActions } from '../hooks/useCourseActions';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};

const readSession = () => {
  try {
    const usuarioSalvo = localStorage.getItem('usuario');
    const tokenSalvo = localStorage.getItem('token');
    if (usuarioSalvo && tokenSalvo) {
      return { usuario: JSON.parse(usuarioSalvo), token: tokenSalvo };
    }
  } catch {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  }
  return { usuario: null, token: null };
};

// Shared cleanup so both manual logout and token-expiry use the same path
const clearSession = (uid) => {
  localStorage.removeItem('usuario');
  localStorage.removeItem('token');
  clearActionsCache(uid);
  window.dispatchEvent(new CustomEvent('auth:cleared'));
};

export const AuthProvider = ({ children }) => {
  const initial = readSession();
  const [usuario, setUsuario] = useState(initial.usuario);
  const [token, setToken] = useState(initial.token);

  const navigate = useNavigate();

  const logout = () => {
    const uid = usuario?.id ?? null;
    setUsuario(null);
    setToken(null);
    clearSession(uid);
  };

  const login = (dadosUsuario, jwtToken) => {
    setUsuario(dadosUsuario);
    setToken(jwtToken);
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
    localStorage.setItem('token', jwtToken);
    loadUserActions(dadosUsuario.id).then(() => {
      window.dispatchEvent(new CustomEvent('auth:login'));
    });
  };

  // Axios interceptor fires 'auth:logout' when a token expires
  useEffect(() => {
    const handleExpiry = () => {
      const uid = usuario?.id ?? null;
      setUsuario(null);
      setToken(null);
      clearSession(uid);
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:logout', handleExpiry);
    return () => window.removeEventListener('auth:logout', handleExpiry);
  }, [navigate]);

  const isAdmin = () => usuario?.role === 'admin';
  const isInstrutor = () => usuario?.role === 'colaborador';
  const isColaborador = isInstrutor;
  const isUser = () => usuario?.role === 'user';

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      loading: false,
      login,
      logout,
      isAdmin,
      isInstrutor,
      isColaborador,
      isUser,
      isAuthenticated: !!usuario,
      syncUserData: () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
};
