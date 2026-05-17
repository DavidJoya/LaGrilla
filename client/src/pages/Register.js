import React, { useEffect, useState } from 'react';
import { publicAPI } from '../utils/api';
import './Register.css';

const Register = () => {
  const [matchday, setMatchday] = useState(null);
  const [matches, setMatches] = useState([]);
  const [userName, setUserName] = useState('');
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [captchaToken, setCaptchaToken] = useState('');

  useEffect(() => {
    loadCurrentMatchday();
  }, []);

  const loadCurrentMatchday = async () => {
    try {
      setLoading(true);
      const data = await publicAPI.getCurrentMatchday();
      
      if (!data.matchday) {
        setResult({
          success: false,
          message: 'No hay jornada activa en este momento'
        });
        return;
      }

      setMatchday(data.matchday);
      setMatches(data.matches || []);

      // Initialize predictions
      const initialPredictions = {};
      data.matches?.forEach(match => {
        initialPredictions[match.id] = null;
      });
      setPredictions(initialPredictions);
    } catch (error) {
      console.error('Error loading matchday:', error);
      setResult({
        success: false,
        message: 'Error al cargar la jornada actual'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePredictionChange = (matchId, value) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: value
    }));
  };

  const validateForm = () => {
    if (!userName.trim()) {
      return 'Por favor ingresa tu nombre o alias';
    }

    const allPredicted = matches.every(match => predictions[match.id] !== null);
    if (!allPredicted) {
      return 'Por favor completa todas las predicciones';
    }

    if (!captchaToken) {
      return 'Por favor completa el CAPTCHA';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setResult({ success: false, message: error });
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const predictionsArray = Object.entries(predictions).map(([matchId, value]) => ({
        matchId: parseInt(matchId),
        predictedValue: value
      }));

      const response = await publicAPI.createPoolEntry({
        userName: userName.trim(),
        predictions: predictionsArray,
        matchdayId: matchday.id,
        captchaToken
      });

      if (response.success) {
        setResult({
          success: true,
          uniqueId: response.uniqueId,
          message: '¡Registro exitoso!'
        });
        
        // Reset form
        setUserName('');
        setPredictions({});
        setCaptchaToken('');
      } else {
        setResult({
          success: false,
          message: response.error || 'Error al registrar la quiniela'
        });
      }
    } catch (error) {
      console.error('Error submitting entry:', error);
      setResult({
        success: false,
        message: error.response?.data?.error || 'Error al registrar la quiniela'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCompletionPercentage = () => {
    const total = matches.length;
    const completed = Object.values(predictions).filter(p => p !== null).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="register-page">
        <div className="container">
          <div className="loading-section">
            <div className="loading"></div>
            <p>Cargando formulario...</p>
          </div>
        </div>
      </div>
    );
  }

  if (result?.success) {
    return (
      <div className="register-page">
        <div className="container">
          <div className="success-card card">
            <div className="success-icon">🎉</div>
            <h2>¡Registro Exitoso!</h2>
            <p className="success-message">Tu quiniela ha sido registrada correctamente</p>
            
            <div className="unique-id-display">
              <label>Tu ID Único:</label>
              <div className="unique-id-value">{result.uniqueId}</div>
              <p className="id-instructions">
                <strong>¡IMPORTANTE!</strong> Guarda este ID. Lo necesitarás para:
              </p>
              <ul className="id-uses">
                <li>✓ Realizar tu pago</li>
                <li>✓ Consultar el estado de tu pago</li>
                <li>✓ Ver tus resultados</li>
              </ul>
            </div>

            <div className="payment-info">
              <h3>Siguiente Paso: Realizar el Pago</h3>
              <p>
                Realiza tu pago y envía tu ID único junto con el comprobante.
                Una vez validado tu pago, aparecerás en el tablero oficial.
              </p>
            </div>

            <div className="success-actions">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(result.uniqueId);
                  alert('ID copiado al portapapeles');
                }}
                className="btn-primary"
              >
                📋 Copiar ID
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                Hacer Otra Quiniela
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!matchday || matches.length === 0) {
    return (
      <div className="register-page">
        <div className="container">
          <div className="empty-state card">
            <p className="empty-icon">🏟️</p>
            <h3>No Disponible</h3>
            <p className="empty-text">{result?.message || 'No hay jornada activa para participar'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="container">
        <div className="page-header">
          <h1>Registrar Quiniela</h1>
          <p className="page-subtitle">{matchday.name}</p>
        </div>

        {result && !result.success && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {result.message}
          </div>
        )}

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${getCompletionPercentage()}%` }}></div>
          <div className="progress-text">{getCompletionPercentage()}% Completado</div>
        </div>

        <form onSubmit={handleSubmit} className="register-form card">
          <div className="form-group">
            <label htmlFor="userName">Nombre o Alias *</label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Ej: El Toro, Juanito, Los Tigres..."
              maxLength={100}
              required
              className="form-input"
            />
            <p className="input-hint">Este nombre aparecerá en el tablero público</p>
          </div>

          <div className="predictions-section">
            <h3>Tus Predicciones</h3>
            <p className="section-description">
              Selecciona el resultado de cada partido: <strong>H</strong> (Local), 
              <strong> D</strong> (Empate), o <strong>A</strong> (Visitante)
            </p>

            <div className="matches-list">
              {matches.map((match, index) => (
                <div key={match.id} className="prediction-card">
                  <div className="match-number">Partido {index + 1}</div>
                  <div className="match-info">
                    <div className="match-date-small">{formatDate(match.match_date)}</div>
                    <div className="match-teams-small">
                      <span className="team-name-small">{match.home_team}</span>
                      <span className="vs-small">VS</span>
                      <span className="team-name-small">{match.away_team}</span>
                    </div>
                  </div>
                  <div className="prediction-options">
                    {['H', 'D', 'A'].map(option => (
                      <button
                        key={option}
                        type="button"
                        className={`prediction-btn ${predictions[match.id] === option ? 'active' : ''}`}
                        onClick={() => handlePredictionChange(match.id, option)}
                      >
                        <span className="option-label">
                          {option === 'H' ? 'Local' : option === 'D' ? 'Empate' : 'Visitante'}
                        </span>
                        <span className="option-value">{option}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="captcha-section">
            <label>Verificación Anti-Spam *</label>
            <div className="captcha-mock">
              <input
                type="checkbox"
                id="captcha"
                checked={!!captchaToken}
                onChange={(e) => setCaptchaToken(e.target.checked ? 'demo-captcha-token-' + Date.now() : '')}
                className="captcha-checkbox"
              />
              <label htmlFor="captcha" className="captcha-label">
                No soy un robot
              </label>
              <div className="captcha-icon">🤖</div>
            </div>
            <p className="input-hint">
              En producción, aquí iría reCAPTCHA v2 o Cloudflare Turnstile
            </p>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary btn-large"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="loading"></span>
                  Registrando...
                </>
              ) : (
                <>
                  <span className="btn-icon">⚡</span>
                  Registrar Mi Quiniela
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
