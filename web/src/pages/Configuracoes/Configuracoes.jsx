import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { usuarioDashboardAPI } from '../../services/api';
import Header from '../Header/Header';
import '../../styles/configuracoes.css';

const NAV_ITEMS = [
  { id: 'perfil',        label: 'Perfil',        icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
  { id: 'aparencia',     label: 'Aparência',     icon: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z' },
  { id: 'acessibilidade',label: 'Acessibilidade',icon: 'M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z' },
  { id: 'conta',         label: 'Minha Conta',  icon: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z' },
];

const FONT_SIZES = ['Pequeno', 'Médio', 'Grande'];
const FONT_SIZE_VALUES = { 'Pequeno': '14px', 'Médio': '16px', 'Grande': '18px' };

const Configuracoes = () => {
  const { usuario, logout, syncUserData } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeSection, setActiveSection] = useState('perfil');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Perfil
  const [photoPreview, setPhotoPreview] = useState(usuario?.foto || '');
  const [nome, setNome] = useState(usuario?.nome || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Acessibilidade
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'Médio');
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('reducedMotion') === 'true');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('highContrast') === 'true');

  // Stats
  const [stats, setStats] = useState({ cursosAcessados: 0, concluidos: 0, totalMinutos: 0 });

  useEffect(() => {
    if (usuario) {
      usuarioDashboardAPI.dashboard().then(r => setStats(r.data)).catch(() => {});
    }
  }, [usuario]);

  // Apply accessibility settings
  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_VALUES[fontSize];
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion', reducedMotion);
    localStorage.setItem('reducedMotion', reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
    localStorage.setItem('highContrast', highContrast);
  }, [highContrast]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navTo = (id) => {
    setActiveSection(id);
    setMobileNavOpen(false);
  };

  return (
    <div className="cfg-page">
      <Header />

      <div className="cfg-layout">

        {/* ── Sidebar ── */}
        <aside className={`cfg-sidebar${mobileNavOpen ? ' open' : ''}`}>
          <div className="cfg-sidebar-header">
            <span className="cfg-sidebar-title">Configurações</span>
            <button className="cfg-mobile-close" onClick={() => setMobileNavOpen(false)}>×</button>
          </div>

          {/* User card */}
          <div className="cfg-user-card">
            <div className="cfg-user-avatar">
              {photoPreview
                ? <img src={photoPreview} alt={usuario?.nome} />
                : <span>{usuario?.nome?.charAt(0).toUpperCase()}</span>
              }
            </div>
            <div className="cfg-user-info">
              <p className="cfg-user-name">{usuario?.nome}</p>
              <p className="cfg-user-email">{usuario?.email}</p>
            </div>
          </div>

          <nav className="cfg-nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`cfg-nav-item${activeSection === item.id ? ' active' : ''}`}
                onClick={() => navTo(item.id)}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="cfg-nav-icon">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="cfg-sidebar-footer">
            <Link to="/perfil" className="cfg-footer-link">Ver Meu Perfil</Link>
            <button className="cfg-footer-logout" onClick={handleLogout}>Sair da Conta</button>
          </div>
        </aside>

        {/* Mobile nav toggle */}
        <button className="cfg-mobile-toggle" onClick={() => setMobileNavOpen(true)}>
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
          Configurações
        </button>

        {mobileNavOpen && <div className="cfg-overlay" onClick={() => setMobileNavOpen(false)} />}

        {/* ── Main content ── */}
        <main className="cfg-main">

          {/* ── PERFIL ── */}
          {activeSection === 'perfil' && (
            <section className="cfg-section">
              <div className="cfg-section-head">
                <h2>Perfil</h2>
                <p>Gerencie sua foto e informações pessoais</p>
              </div>

              {/* Photo */}
              <div className="cfg-card">
                <h3 className="cfg-card-title">Foto de Perfil</h3>
                <div className="cfg-photo-row">
                  <div className="cfg-photo-wrap">
                    {photoPreview
                      ? <img src={photoPreview} alt="Foto" className="cfg-photo-img" />
                      : <span className="cfg-photo-initial">{usuario?.nome?.charAt(0).toUpperCase()}</span>
                    }
                    <button className="cfg-photo-edit-btn" onClick={() => fileInputRef.current?.click()} title="Alterar foto">
                      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}>
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                  </div>
                  <div className="cfg-photo-actions">
                    <p className="cfg-photo-hint">JPG, PNG ou GIF · Máx. 5 MB</p>
                    <button className="cfg-btn-secondary" onClick={() => fileInputRef.current?.click()}>
                      Alterar Foto
                    </button>
                    {photoPreview && (
                      <button className="cfg-btn-ghost" onClick={() => setPhotoPreview('')}>
                        Remover Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="cfg-card">
                <h3 className="cfg-card-title">Informações da Conta</h3>
                <div className="cfg-field-grid">
                  <div className="cfg-field">
                    <label className="cfg-label">Nome</label>
                    <input
                      className="cfg-input"
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="cfg-field">
                    <label className="cfg-label">Email</label>
                    <input className="cfg-input" value={usuario?.email || ''} disabled />
                    <span className="cfg-field-hint">O email não pode ser alterado</span>
                  </div>
                  <div className="cfg-field">
                    <label className="cfg-label">Função</label>
                    <input
                      className="cfg-input"
                      value={usuario?.role === 'admin' ? 'Administrador' : usuario?.role === 'colaborador' ? 'Instrutor' : 'Aluno'}
                      disabled
                    />
                  </div>
                </div>
                <div className="cfg-card-actions">
                  <button className="cfg-btn-primary" onClick={handleSaveProfile}>
                    {profileSaved ? '✓ Salvo!' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="cfg-card">
                <h3 className="cfg-card-title">Atividade</h3>
                <div className="cfg-stats-row">
                  {[
                    { label: 'Cursos Acessados', value: stats.cursosAcessados || 0, color: '#ffd700' },
                    { label: 'Concluídos',        value: stats.concluidos || 0,      color: '#34d399' },
                    { label: 'Horas Estudadas',   value: `${Math.floor((stats.totalMinutos || 0) / 60)}h`, color: '#60a5fa' },
                  ].map(s => (
                    <div key={s.label} className="cfg-stat">
                      <span className="cfg-stat-value" style={{ color: s.color }}>{s.value}</span>
                      <span className="cfg-stat-label">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── APARÊNCIA ── */}
          {activeSection === 'aparencia' && (
            <section className="cfg-section">
              <div className="cfg-section-head">
                <h2>Aparência</h2>
                <p>Personalize a aparência visual da plataforma</p>
              </div>

              <div className="cfg-card">
                <h3 className="cfg-card-title">Tema</h3>
                <p className="cfg-card-desc">Escolha entre o tema escuro e o tema claro. O suporte completo ao tema claro está em desenvolvimento.</p>
                <div className="cfg-theme-grid">
                  {[
                    { id: 'dark',  label: 'Escuro',  badge: null },
                    { id: 'light', label: 'Claro',   badge: 'Em breve' },
                  ].map(t => (
                    <button
                      key={t.id}
                      className={`cfg-theme-card${theme === t.id ? ' active' : ''}${t.badge ? ' disabled' : ''}`}
                      onClick={() => !t.badge && setTheme(t.id)}
                      disabled={!!t.badge}
                    >
                      <div className={`cfg-theme-preview cfg-theme-${t.id}`}>
                        <div className="cfg-tp-bar" />
                        <div className="cfg-tp-body">
                          <div className="cfg-tp-line" />
                          <div className="cfg-tp-line short" />
                          <div className="cfg-tp-line shorter" />
                        </div>
                      </div>
                      <div className="cfg-theme-label">
                        <span>{t.label}</span>
                        {t.badge && <span className="cfg-badge">{t.badge}</span>}
                        {theme === t.id && !t.badge && <span className="cfg-badge active">Ativo</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="cfg-card">
                <h3 className="cfg-card-title">Cor de Destaque</h3>
                <p className="cfg-card-desc">A cor de destaque atual é o dourado da Learnly.</p>
                <div className="cfg-accent-row">
                  {['#ffd700', '#60a5fa', '#34d399', '#f472b6', '#a78bfa'].map(color => (
                    <button
                      key={color}
                      className={`cfg-accent-dot${color === '#ffd700' ? ' active' : ''}`}
                      style={{ background: color }}
                      title={color}
                      disabled={color !== '#ffd700'}
                    />
                  ))}
                  <span className="cfg-field-hint" style={{ marginLeft: 8 }}>Mais cores em breve</span>
                </div>
              </div>
            </section>
          )}

          {/* ── ACESSIBILIDADE ── */}
          {activeSection === 'acessibilidade' && (
            <section className="cfg-section">
              <div className="cfg-section-head">
                <h2>Acessibilidade</h2>
                <p>Ajuste a plataforma para melhor atender às suas necessidades</p>
              </div>

              <div className="cfg-card">
                <h3 className="cfg-card-title">Tamanho do Texto</h3>
                <p className="cfg-card-desc">Ajusta o tamanho base da fonte em toda a plataforma.</p>
                <div className="cfg-font-row">
                  {FONT_SIZES.map(size => (
                    <button
                      key={size}
                      className={`cfg-font-btn${fontSize === size ? ' active' : ''}`}
                      onClick={() => setFontSize(size)}
                    >
                      <span style={{ fontSize: size === 'Pequeno' ? '0.8rem' : size === 'Grande' ? '1.1rem' : '0.95rem' }}>Aa</span>
                      <span>{size}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="cfg-card">
                <h3 className="cfg-card-title">Preferências Visuais</h3>
                <div className="cfg-toggle-list">
                  <div className="cfg-toggle-row">
                    <div>
                      <p className="cfg-toggle-label">Reduzir Animações</p>
                      <p className="cfg-toggle-desc">Desativa transições e animações decorativas</p>
                    </div>
                    <button
                      className={`cfg-toggle${reducedMotion ? ' on' : ''}`}
                      onClick={() => setReducedMotion(p => !p)}
                      aria-label="Reduzir animações"
                    >
                      <span className="cfg-toggle-thumb" />
                    </button>
                  </div>
                  <div className="cfg-toggle-row">
                    <div>
                      <p className="cfg-toggle-label">Alto Contraste</p>
                      <p className="cfg-toggle-desc">Aumenta o contraste de cores para melhor legibilidade</p>
                    </div>
                    <button
                      className={`cfg-toggle${highContrast ? ' on' : ''}`}
                      onClick={() => setHighContrast(p => !p)}
                      aria-label="Alto contraste"
                    >
                      <span className="cfg-toggle-thumb" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── MINHA CONTA ── */}
          {activeSection === 'conta' && (
            <section className="cfg-section">
              <div className="cfg-section-head">
                <h2>Minha Conta</h2>
                <p>Acesse e gerencie todas as funções da sua conta</p>
              </div>

              {/* Quick links */}
              <div className="cfg-card">
                <h3 className="cfg-card-title">Navegação Rápida</h3>
                <div className="cfg-account-links">
                  <Link to="/perfil" className="cfg-account-link">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="cfg-account-link-icon">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    <div>
                      <span className="cfg-account-link-label">Meu Perfil</span>
                      <span className="cfg-account-link-desc">Veja seu perfil público e certificados</span>
                    </div>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="cfg-account-link-arrow">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                  </Link>

                  {usuario?.role === 'admin' && (
                    <Link to="/admin" className="cfg-account-link">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="cfg-account-link-icon">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                      </svg>
                      <div>
                        <span className="cfg-account-link-label">Painel Administrativo</span>
                        <span className="cfg-account-link-desc">Gerencie cursos, usuários e aprovações</span>
                      </div>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="cfg-account-link-arrow">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                      </svg>
                    </Link>
                  )}

                  {usuario?.role === 'colaborador' && (
                    <Link to="/colaborador" className="cfg-account-link">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="cfg-account-link-icon">
                        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                      </svg>
                      <div>
                        <span className="cfg-account-link-label">Área do Instrutor</span>
                        <span className="cfg-account-link-desc">Crie e gerencie seus cursos</span>
                      </div>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="cfg-account-link-arrow">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>

              {/* Session */}
              <div className="cfg-card">
                <h3 className="cfg-card-title">Sessão Atual</h3>
                <div className="cfg-session-info">
                  <div className="cfg-session-avatar">
                    {photoPreview
                      ? <img src={photoPreview} alt={usuario?.nome} />
                      : <span>{usuario?.nome?.charAt(0).toUpperCase()}</span>
                    }
                  </div>
                  <div>
                    <p className="cfg-session-name">{usuario?.nome}</p>
                    <p className="cfg-session-email">{usuario?.email}</p>
                    <span className="cfg-role-badge">
                      {usuario?.role === 'admin' ? 'Administrador' : usuario?.role === 'colaborador' ? 'Instrutor' : 'Aluno'}
                    </span>
                  </div>
                </div>
                <div className="cfg-card-actions">
                  <button className="cfg-btn-secondary" onClick={() => { syncUserData(); }}>
                    Sincronizar Dados
                  </button>
                  <button className="cfg-btn-secondary" onClick={handleLogout}>
                    Encerrar Sessão
                  </button>
                </div>
              </div>

              {/* Danger */}
              <div className="cfg-card cfg-danger-card">
                <h3 className="cfg-card-title cfg-danger-title">Zona de Perigo</h3>
                <p className="cfg-card-desc">Ações irreversíveis relacionadas à sua conta.</p>
                <div className="cfg-card-actions">
                  <button className="cfg-btn-danger">Deletar Conta</button>
                </div>
              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
};

export default Configuracoes;
