import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserDropdown from '../../components/UserDropdown';
import GlobalSearch from '../../components/GlobalSearch';
import '../../styles/header.css';

const Header = () => {
  const { usuario, isAuthenticated } = useAuth();

  return (
    <header>
      <div className="começo">
        {/* Logo */}
        <div className="header-logo-wrap">
          <div className="logo">
            <Link to="/">
              <img className="img" src="/img/imagemdaescola.jpg" alt="Logo" />
            </Link>
          </div>
        </div>

        {/* Center: nav + search placeholder */}
        <div className="header-center">
          <nav className="menu-desktop">
            <ul>
              <li><Link to="/cursos">Cursos</Link></li>
              {isAuthenticated && (
                <li><Link to="/progresso">Progresso</Link></li>
              )}
              {isAuthenticated && (
                <li><Link to="/planning">Planejamento</Link></li>
              )}
              <li><Link to="/plano-estudo">Plano de Estudo</Link></li>
              {isAuthenticated && usuario?.role === 'colaborador' && (
                <li><Link to="/colaborador">Instrutor</Link></li>
              )}
              {isAuthenticated && usuario?.role === 'admin' && (
                <li><Link to="/admin">Admin</Link></li>
              )}
            </ul>
          </nav>

          <GlobalSearch />
        </div>

        {/* Right: account widget */}
        <div className="header-right">
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;