import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/api';
import './Admin.css';

const Admin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already authenticated
    if (adminAPI.isAuthenticated()) {
      // User is already logged in, could redirect to dashboard
      // For now we just show the dashboard
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await adminAPI.login(username, password);
      
      if (result.success) {
        // Login successful, page will show dashboard
        window.location.reload(); // Reload to show authenticated state
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
    window.location.reload();
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  // If authenticated, show dashboard
  if (adminAPI.isAuthenticated()) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="admin-header">
            <h1>PANEL DE ADMINISTRACIÓN</h1>
            <button onClick={handleLogout} className="btn-logout">
              🚪 CERRAR SESIÓN
            </button>
          </div>

          <div className="admin-grid">
            <div className="admin-card" onClick={() => handleNavigate('/admin/matchdays')}>
              <div className="card-icon">📅</div>
              <h3>GESTIONAR JORNADAS</h3>
              <p>Crear jornadas, agregar partidos y configurar horarios</p>
              <button className="card-button">IR →</button>
            </div>

            <div className="admin-card" onClick={() => handleNavigate('/admin/payments')}>
              <div className="card-icon">💰</div>
              <h3>VALIDAR PAGOS</h3>
              <p>Revisar y confirmar pagos de participantes</p>
              <button className="card-button">IR →</button>
            </div>

            <div className="admin-card disabled">
              <div className="card-icon">📊</div>
              <h3>ESTADÍSTICAS</h3>
              <p>Ver reportes y análisis de participación</p>
              <button className="card-button">PRÓXIMAMENTE</button>
            </div>

            <div className="admin-card disabled">
              <div className="card-icon">⚙️</div>
              <h3>CONFIGURACIÓN</h3>
              <p>Ajustes generales del sistema</p>
              <button className="card-button">PRÓXIMAMENTE</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show login form
  return (
    <div className="admin-page">
      <div className="container">
        <div className="login-container card">
          <h1>PANEL DE ADMINISTRACIÓN</h1>
          
          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label>USUARIO</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>CONTRASEÑA</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="form-input"
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary btn-login"
              disabled={loading}
            >
              {loading ? 'INICIANDO...' : 'INICIAR SESIÓN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Admin;
