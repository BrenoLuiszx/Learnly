import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usuarioDashboardAPI } from '../../services/api';
import Header from '../Header/Header';
import DashboardTab from '../../components/DashboardTab';
import UserAvatar from '../../components/UserAvatar';
import '../../styles/perfil.css';
import '../../styles/user-dashboard.css';

const ROLE_LABEL = { admin: 'Administrador', colaborador: 'Colaborador', user: 'Usuário' };

const IconBook  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IconClock = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconAward = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
const IconArrow = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>;

const STAT_CARDS = (stats, horasLabel) => [
  { icon: <IconBook />,  value: stats.matriculas ?? stats.cursosAcessados ?? 0, label: 'Matrículas',      color: '#60a5fa' },
  { icon: <IconCheck />, value: stats.concluidos ?? 0,                           label: 'Concluídos',      color: '#34d399' },
  { icon: <IconAward />, value: stats.certificados ?? 0,                         label: 'Certificados',    color: '#ffd700' },
  { icon: <IconClock />, value: horasLabel,                                      label: 'Horas estudadas', color: '#a78bfa' },
];

const QUICK_LINKS = [
  { label: 'Explorar cursos',   to: '/cursos'        },
  { label: 'Meus certificados', to: '/perfil'        },
  { label: 'Plano de Estudo',   to: '/plano-estudo'  },
  { label: 'Planejamento',      to: '/planning'      },
  { label: 'Meu perfil',        to: '/perfil'        },
];

const UserDashboard = () => {
  const { usuario } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (usuario) {
      usuarioDashboardAPI.dashboard().then(r => setStats(r.data)).catch(() => {});
    }
  }, [usuario]);

  const firstName  = usuario?.nome?.split(' ')[0] ?? '';
  const roleLabel  = ROLE_LABEL[usuario?.role] ?? 'Usuário';
  const totalHoras = Math.floor((stats?.totalMinutos || 0) / 60);
  const totalMin   = (stats?.totalMinutos || 0) % 60;
  const horasLabel = `${totalHoras}h${totalMin > 0 ? ` ${totalMin}min` : ''}`;

  const matriculas  = stats?.matriculas ?? stats?.cursosAcessados ?? 0;
  const concluidos  = stats?.concluidos ?? 0;
  const totalCursos = stats?.totalCursos ?? matriculas;
  const pctGeral    = totalCursos > 0 ? Math.min(Math.round((concluidos / totalCursos) * 100), 100) : 0;

  const initial = firstName.charAt(0).toUpperCase();

  return (
    <div className="ud-page">
      <Header />

      {/* ── Page header ── */}
      <div className="ud-header">
        <div className="ud-header-inner">
          <UserAvatar foto={usuario?.foto} nome={firstName} size={52} radius="14px" className="ud-avatar" />
          <div className="ud-greeting">
            <h1 className="ud-greeting-name">Olá, <span>{firstName}</span></h1>
            <span className="ud-greeting-sub">{usuario?.email}</span>
          </div>
          <div className="ud-header-badges">
            <span className="ud-role-badge">{roleLabel}</span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="ud-body">

        {/* Main */}
        <main className="ud-main">
          <DashboardTab stats={stats} usuario={usuario} />
        </main>

        {/* Sidebar */}
        <aside className="ud-sidebar">

          {/* Stats */}
          <div className="ud-sidebar-card">
            <p className="ud-sidebar-label">Resumo</p>
            {stats ? (
              <div className="ud-stat-grid">
                {STAT_CARDS(stats, horasLabel).map(s => (
                  <div key={s.label} className="ud-stat-card">
                    <div className="ud-stat-icon" style={{ background: `${s.color}14`, color: s.color }}>
                      {s.icon}
                    </div>
                    <span className="ud-stat-val" style={{ color: s.color }}>{s.value}</span>
                    <span className="ud-stat-lbl">{s.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ud-stat-grid">
                {[0,1,2,3].map(i => <div key={i} className="ud-skeleton" style={{ height: 80 }} />)}
              </div>
            )}
          </div>

          {/* Completion ring */}
          {stats && (
            <div className="ud-sidebar-card">
              <p className="ud-sidebar-label">Conclusão</p>
              <div className="ud-ring-wrap">
                <div className="ud-ring">
                  <svg viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke="#34d399" strokeWidth="3"
                      strokeDasharray={`${pctGeral} 100`}
                      strokeLinecap="round"
                      transform="rotate(-90 18 18)"
                    />
                  </svg>
                  <span className="ud-ring-label">{pctGeral}%</span>
                </div>
                <div className="ud-ring-info">
                  <p className="ud-ring-main">{concluidos} concluídos</p>
                  <p className="ud-ring-sub">{matriculas - concluidos} em andamento</p>
                  <p className="ud-ring-sub">{horasLabel} estudadas</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="ud-sidebar-card">
            <p className="ud-sidebar-label">Acesso rápido</p>
            <div className="ud-quick-links">
              {QUICK_LINKS.map(l => (
                <Link key={l.label} to={l.to} className="ud-quick-link">
                  <span>{l.label}</span>
                  <IconArrow />
                </Link>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
};

export default UserDashboard;
