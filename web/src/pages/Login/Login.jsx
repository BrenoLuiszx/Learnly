import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usuariosAPI } from '../../services/api';
import '../../styles/login.css';

const LOGIN_ROUTES = ['/login', '/registro'];
const ADMIN_ROUTES = ['/admin', '/cadastro'];

const getRedirectDest = (returnTo, role) => {

  if (!returnTo || LOGIN_ROUTES.some(r => returnTo.startsWith(r))) {
    if (role === 'admin') return '/admin';
    if (role === 'colaborador') return '/colaborador';
    return '/';
  }

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
              <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor" width="32" height="32"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
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