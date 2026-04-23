import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usuariosAPI } from '../../services/api';
import '../../styles/login.css';

const LOGIN_ROUTES = ['/login', '/registro'];
const ADMIN_ROUTES = ['/admin', '/cadastro'];

const getRedirectDest = (returnTo, role) => {
  // Never redirect back to login/registro pages
  if (!returnTo || LOGIN_ROUTES.some(r => returnTo.startsWith(r))) {
    if (role === 'admin') return '/admin';
    if (role === 'colaborador') return '/colaborador';
    return '/';
  }
  // Non-admin users must not land on admin-only routes
  if (role !== 'admin' && ADMIN_ROUTES.some(r => returnTo.startsWith(r))) {
    return '/';
  }
  return returnTo;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading, usuario } = useAuth();
  const returnTo = decodeURIComponent(new URLSearchParams(location.search).get('returnTo') || '/');

  const [form, setForm] = useState({ email: '', senha: '' });
  const [submitting, setSubmitting] = useState(false);
  const [mensagem, setMensagem] = useState('');

  // Guard: already authenticated — redirect away from login page.
  // Skip during submission: state may not have flushed yet even though
  // localStorage is already written, so isAuthenticated could briefly be
  // true from a previous session while the new login is in-flight.
  if (!loading && !submitting && isAuthenticated) {
    return <Navigate to={getRedirectDest(returnTo, usuario?.role)} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMensagem('');
    try {
      const response = await usuariosAPI.login(form);
      const { usuario: u, token } = response.data;
      // Persist to localStorage BEFORE calling login() so that if the
      // Navigate guard re-renders before React state flushes, readSession()
      // already sees the valid session and won't redirect back to /login.
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(u));
      login(u, token);
      navigate(getRedirectDest(returnTo, u.role), { replace: true });
    } catch (error) {
      setMensagem(error.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <div className="logo-section">
              <span className="logo-icon">📚</span>
              <h1>Learnly</h1>
            </div>
            <p className="brand-subtitle">Sua plataforma de cursos gratuitos</p>
          </div>
        </div>
        
        <div className="login-right">
          <div className="login-form">
            <h2>Bem-vindo de volta!</h2>
            <p className="login-subtitle">Faça login para continuar</p>
            
            {mensagem && (
              <div className={`alert ${mensagem.includes('sucesso') ? 'alert-success' : 'alert-error'}`}>
                {mensagem}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Digite seu email"
                  className="login-input"
                />
              </div>

              <div className="input-group">
                <input
                  type="password"
                  name="senha"
                  value={form.senha}
                  onChange={handleChange}
                  required
                  placeholder="Digite sua senha"
                  className="login-input"
                />
              </div>

              <button type="submit" disabled={submitting} className="login-btn">
                {submitting ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="login-footer">
              <p>Não tem uma conta? <a href="/registro" className="register-link">Cadastre-se aqui</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;