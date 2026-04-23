import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireInstrutor = false }) => {
  const { isAuthenticated, usuario } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`} replace />;
  }

  if (requireAdmin && usuario.role !== 'admin') {
    return <AcessoNegado mensagem="Apenas administradores podem acessar esta área." />;
  }

  if (requireInstrutor && !['admin', 'colaborador'].includes(usuario.role)) {
    return <AcessoNegado mensagem="Apenas instrutores podem acessar esta área." />;
  }

  return children;
};

const AcessoNegado = ({ mensagem }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#000', color: '#fff' }}>
    <h2 style={{ color: '#FFD700' }}>Acesso Negado</h2>
    <p style={{ color: '#999', marginTop: '8px' }}>{mensagem}</p>
    <button onClick={() => window.history.back()} style={{ background: '#FFD700', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginTop: '20px', fontWeight: 600 }}>
      Voltar
    </button>
  </div>
);

export default ProtectedRoute;
