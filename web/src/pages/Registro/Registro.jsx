import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usuariosAPI } from '../../services/api';
import '../../styles/login.css';

const Registro = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = new URLSearchParams(location.search).get('returnTo') || '';
  const { isAuthenticated, loading: authLoading } = useAuth();

  if (!authLoading && isAuthenticated) {
    return <Navigate to="/cursos" replace />;
  }
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    foto: ''
  });
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.senha !== form.confirmarSenha) {
      setMensagem('As senhas não coincidem');
      return;
    }

    setLoading(true);
    setMensagem('');

    try {
      const { confirmarSenha, ...dadosUsuario } = form;
      await usuariosAPI.registrar(dadosUsuario);
      setMensagem('Usuário cadastrado com sucesso! Redirecionando para login...');
      setForm({ nome: '', email: '', senha: '', confirmarSenha: '', foto: '' });
      const loginUrl = returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login';
      setTimeout(() => navigate(loginUrl), 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erro ao cadastrar usuário';
      setMensagem(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <div className="logo-section">
              <span className="logo-icon">📚</span>
              <h1>Learnly</h1>
            </div>
            <p className="brand-subtitle">Junte-se à nossa comunidade de aprendizado</p>
          </div>
        </div>
        
        <div className="login-right">
          <div className="login-form">
            <h2>Criar sua conta</h2>
            <p className="login-subtitle">Preencha os dados para se cadastrar</p>
            
            {mensagem && (
              <div className={`alert ${mensagem.includes('sucesso') ? 'alert-success' : 'alert-error'}`}>
                {mensagem}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  placeholder="Nome completo"
                  className="login-input"
                />
              </div>

              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Seu melhor email"
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
                  placeholder="Crie uma senha (mín. 6 caracteres)"
                  className="login-input"
                  minLength="6"
                />
              </div>

              <div className="input-group">
                <input
                  type="password"
                  name="confirmarSenha"
                  value={form.confirmarSenha}
                  onChange={handleChange}
                  required
                  placeholder="Confirme sua senha"
                  className="login-input"
                />
              </div>

              <div className="input-group">
                <input
                  type="url"
                  name="foto"
                  value={form.foto}
                  onChange={handleChange}
                  placeholder="URL da sua foto (opcional)"
                  className="login-input"
                />
              </div>

              <button type="submit" disabled={loading} className="login-btn">
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>
            </form>

            <div className="login-footer">
              <p>Já tem uma conta? <a href={returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login'} className="register-link">Faça login aqui</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;