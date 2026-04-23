import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/userDropdown-bigtech.css';

const ROLE_LABEL = { admin: 'Administrador', colaborador: 'Instrutor' };

/* ── shared hook: close on outside click ── */
const useOutsideClose = (ref, onClose) => {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose]);
};

/* ─────────────────────────────────────────
   ProfileDropdown — photo + info only
───────────────────────────────────────── */
const ProfileDropdown = ({ usuario }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, () => setOpen(false));

  return (
    <div className="ud-wrap" ref={ref}>
      <button className="ud-avatar-btn" onClick={() => setOpen(p => !p)} aria-label="Perfil">
        {usuario.foto
          ? <img src={usuario.foto} alt={usuario.nome} className="ud-avatar-img" />
          : <span className="ud-avatar-initial">{usuario.nome.charAt(0).toUpperCase()}</span>
        }
      </button>

      {open && (
        <div className="ud-panel ud-profile-panel">
          <div className="ud-profile-hero">
            <div className="ud-profile-hero-avatar">
              {usuario.foto
                ? <img src={usuario.foto} alt={usuario.nome} />
                : <span>{usuario.nome.charAt(0).toUpperCase()}</span>
              }
            </div>
            <div className="ud-profile-hero-info">
              <span className="ud-profile-hero-name">{usuario.nome}</span>
              <span className="ud-profile-hero-email">{usuario.email}</span>
              {ROLE_LABEL[usuario.role] && (
                <span className="ud-role-badge">{ROLE_LABEL[usuario.role]}</span>
              )}
            </div>
          </div>
          <div className="ud-divider" />
          <Link to="/perfil" className="ud-profile-link" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            Ver Meu Perfil
          </Link>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   AccountDropdown — all actions
───────────────────────────────────────── */
const AccountDropdown = ({ usuario }) => {
  const { logout, syncUserData } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, () => setOpen(false));

  const close = () => setOpen(false);

  const handleLogout = () => {
    close();
    logout();
    navigate('/login');
  };

  return (
    <div className="ud-wrap" ref={ref}>
      <button className="ud-account-btn" onClick={() => setOpen(p => !p)} aria-label="Minha Conta">
        <span className="ud-account-label">Minha Conta</span>
        <svg viewBox="0 0 24 24" fill="currentColor" className={`ud-account-chevron${open ? ' open' : ''}`}>
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>

      {open && (
        <div className="ud-panel ud-account-panel">
          {/* Header */}
          <div className="ud-account-header">
            <span className="ud-account-header-label">Minha Conta</span>
          </div>

          {/* Navigation group */}
          <div className="ud-group">
            <span className="ud-group-label">Navegação</span>
            <Link to="/perfil" className="ud-item" onClick={close}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              Meu Perfil
            </Link>
            <Link to="/meus-cursos" className="ud-item" onClick={close}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              Meus Cursos
            </Link>
            <Link to="/configuracoes" className="ud-item" onClick={close}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
              Configurações
            </Link>
            <Link to="/suporte" className="ud-item" onClick={close}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
              Suporte
            </Link>
          </div>

          {/* Workspace group — role-gated */}
          {(usuario.role === 'admin' || usuario.role === 'colaborador') && (
            <>
              <div className="ud-divider" />
              <div className="ud-group">
                <span className="ud-group-label">Área de Trabalho</span>
                {usuario.role === 'admin' && (
                  <Link to="/admin" className="ud-item" onClick={close}>
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                    Painel Administrativo
                  </Link>
                )}
                {usuario.role === 'colaborador' && (
                  <Link to="/colaborador" className="ud-item" onClick={close}>
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
                    Área do Instrutor
                  </Link>
                )}
              </div>
            </>
          )}

          {/* Session group */}
          <div className="ud-divider" />
          <div className="ud-group">
            <span className="ud-group-label">Sessão</span>
            <button className="ud-item" onClick={() => { syncUserData(); close(); }}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
              Sincronizar Dados
            </button>
            <button className="ud-item ud-item-danger" onClick={handleLogout}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
              Sair da Conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   UserDropdown — unauthenticated fallback
───────────────────────────────────────── */
const GuestDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, () => setOpen(false));

  return (
    <div className="ud-wrap" ref={ref}>
      <button className="ud-avatar-btn ud-guest-btn" onClick={() => setOpen(p => !p)} aria-label="Menu">
        <div className="ud-guest-icon">
          <span /><span /><span />
        </div>
      </button>
      {open && (
        <div className="ud-panel ud-guest-panel">
          <Link to="/login" className="ud-item" onClick={() => setOpen(false)}>Entrar</Link>
          <Link to="/registro" className="ud-item" onClick={() => setOpen(false)}>Criar Conta</Link>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   Main export — header widget
───────────────────────────────────────── */
const UserDropdown = () => {
  const { usuario, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <GuestDropdown />;

  return (
    <div className="ud-header-widget">
      <AccountDropdown usuario={usuario} />
      <ProfileDropdown usuario={usuario} />
    </div>
  );
};

export default UserDropdown;
