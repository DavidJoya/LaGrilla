import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <Link to="/" className="logo">
            <div className="logo-icon">⚽</div>
            <div className="logo-text">
              <span className="logo-main">LA GRILLA</span>
              <span className="logo-sub">Quiniela Deportiva</span>
            </div>
          </Link>
        </div>

        <nav className="main-nav">
          {!isAdmin ? (
            <>
              <Link 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                <span className="nav-icon">🏠</span>
                <span>Inicio</span>
              </Link>
              <Link 
                to="/register" 
                className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
              >
                <span className="nav-icon">📝</span>
                <span>Participar</span>
              </Link>
              <Link 
                to="/board" 
                className={`nav-link ${location.pathname === '/board' ? 'active' : ''}`}
              >
                <span className="nav-icon">📊</span>
                <span>Tablero</span>
              </Link>
              <Link 
                to="/standings" 
                className={`nav-link ${location.pathname === '/standings' ? 'active' : ''}`}
              >
                <span className="nav-icon">🏆</span>
                <span>Clasificación</span>
              </Link>
              <Link 
                to="/check-status" 
                className={`nav-link ${location.pathname === '/check-status' ? 'active' : ''}`}
              >
                <span className="nav-icon">🔍</span>
                <span>Consultar</span>
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/admin" 
                className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
              >
                <span className="nav-icon">⚙️</span>
                <span>Panel</span>
              </Link>
              <Link 
                to="/admin/matchdays" 
                className={`nav-link ${location.pathname === '/admin/matchdays' ? 'active' : ''}`}
              >
                <span className="nav-icon">📅</span>
                <span>Jornadas</span>
              </Link>
              <Link 
                to="/admin/payments" 
                className={`nav-link ${location.pathname === '/admin/payments' ? 'active' : ''}`}
              >
                <span className="nav-icon">💰</span>
                <span>Pagos</span>
              </Link>
              <Link 
                to="/" 
                className="nav-link nav-link-exit"
              >
                <span className="nav-icon">🚪</span>
                <span>Salir</span>
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="scoreboard-lights">
        <div className="light"></div>
        <div className="light"></div>
        <div className="light"></div>
        <div className="light"></div>
        <div className="light"></div>
      </div>
    </header>
  );
};

export default Header;
