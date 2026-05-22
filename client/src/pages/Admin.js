import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/api';
import './Admin.css';

const Admin = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(adminAPI.isAuthenticated());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await adminAPI.login(username, password);
      
      if (result.success) {
        setAuthenticated(true);
        setUsername('');
        setPassword('');
      } else {
        setError('Credenciales inválidas');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    adminAPI.logout();
    setAuthenticated(false);
    setUsername('');
    setPassword('');
    navigate('/admin');
  };

  if (!authenticated) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="login-card card">
            <h2>Panel de Administración</h2>
            <p className="login-subtitle">Acceso restringido</p>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Usuario</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-primary btn-large" disabled={loading}>
                {loading ? '⏳ Iniciando...' : '🔐 Iniciar Sesión'}
              </button>

              <p className="login-hint">
                Credenciales: admin / admin123456
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="page-header">
          <h1>Panel de Administración</h1>
          <button onClick={handleLogout} className="btn-secondary">
            🚪 Cerrar Sesión
          </button>
        </div>

        <div className="admin-grid">
          <div className="admin-card card" onClick={() => navigate('/admin/matchdays')}>
            <div className="card-icon">📅</div>
            <h3>Gestionar Jornadas</h3>
            <p>Crear jornadas, agregar partidos y configurar horarios</p>
            <div className="card-action">Ir →</div>
          </div>

          <div className="admin-card card" onClick={() => navigate('/admin/payments')}>
            <div className="card-icon">💰</div>
            <h3>Validar Pagos</h3>
            <p>Revisar y confirmar pagos de participantes</p>
            <div className="card-action">Ir →</div>
          </div>

          <div className="admin-card card">
            <div className="card-icon">📊</div>
            <h3>Estadísticas</h3>
            <p>Ver reportes y análisis de participación</p>
            <div className="card-action">Próximamente</div>
          </div>

          <div className="admin-card card">
            <div className="card-icon">⚙️</div>
            <h3>Configuración</h3>
            <p>Ajustes generales del sistema</p>
            <div className="card-action">Próximamente</div>
          </div>
        </div>

        <div className="quick-info card">
          <h3>Información del Sistema</h3>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Versión</div>
              <div className="info-value">1.0.0</div>
            </div>
            <div className="info-item">
              <div className="info-label">Estado</div>
              <div className="info-value">
                <span className="badge badge-active">Operativo</span>
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Base de Datos</div>
              <div className="info-value">PostgreSQL</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
