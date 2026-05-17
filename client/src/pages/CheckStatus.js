import React, { useState } from 'react';
import { publicAPI } from '../utils/api';
import './CheckStatus.css';

const CheckStatus = () => {
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchId.trim()) {
      setResult({
        success: false,
        message: 'Por favor ingresa un ID válido'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await publicAPI.checkPoolStatus(searchId.trim());
      
      if (response.success) {
        setResult({
          success: true,
          entry: response.entry
        });
      } else {
        setResult({
          success: false,
          message: response.error || 'No se encontró el registro'
        });
      }
    } catch (error) {
      console.error('Error checking status:', error);
      setResult({
        success: false,
        message: error.response?.status === 404 
          ? 'ID no encontrado. Verifica que sea correcto.' 
          : 'Error al consultar el estado'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="check-status-page">
      <div className="container">
        <div className="page-header">
          <h1>Consultar Estado de Pago</h1>
          <p className="page-subtitle">Verifica si tu quiniela está activa</p>
        </div>

        <div className="search-card card">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-group">
              <label htmlFor="searchId">ID de Quiniela</label>
              <input
                type="text"
                id="searchId"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                placeholder="Ej: ABCD-1234-WXYZ"
                maxLength={14}
                className="search-input"
              />
              <p className="input-hint">Ingresa el ID de 12 caracteres que recibiste al registrarte</p>
            </div>

            <button 
              type="submit" 
              className="btn-primary btn-large"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading"></span>
                  Consultando...
                </>
              ) : (
                <>
                  <span className="btn-icon">🔍</span>
                  Consultar Estado
                </>
              )}
            </button>
          </form>
        </div>

        {result && (
          <div className={`result-card card ${result.success ? 'success' : 'error'}`}>
            {result.success ? (
              <>
                <div className="result-header">
                  <div className={`status-badge status-${result.entry.payment_status.toLowerCase()}`}>
                    {result.entry.payment_status === 'Paid' ? (
                      <>
                        <span className="status-icon">✅</span>
                        <span>PAGO CONFIRMADO</span>
                      </>
                    ) : (
                      <>
                        <span className="status-icon">⏳</span>
                        <span>PAGO PENDIENTE</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="result-details">
                  <div className="detail-row">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value detail-id">{result.entry.unique_id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Nombre:</span>
                    <span className="detail-value">{result.entry.user_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Fecha de Registro:</span>
                    <span className="detail-value">{formatDate(result.entry.registration_date)}</span>
                  </div>
                </div>

                {result.entry.payment_status === 'Paid' ? (
                  <div className="status-message success-message">
                    <span className="message-icon">🎉</span>
                    <div>
                      <strong>¡Tu quiniela está activa!</strong>
                      <p>Ya apareces en el tablero oficial y estás participando por los premios.</p>
                    </div>
                  </div>
                ) : (
                  <div className="status-message pending-message">
                    <span className="message-icon">📢</span>
                    <div>
                      <strong>Tu pago aún no ha sido validado</strong>
                      <p>
                        Asegúrate de haber enviado tu comprobante de pago junto con tu ID.
                        Una vez validado, aparecerás en el tablero oficial.
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="error-content">
                <span className="error-icon">❌</span>
                <p className="error-text">{result.message}</p>
              </div>
            )}
          </div>
        )}

        <div className="info-section">
          <h3>¿Qué significa cada estado?</h3>
          <div className="status-explanations">
            <div className="explanation-card">
              <div className="explanation-icon paid">✅</div>
              <div className="explanation-content">
                <h4>Pago Confirmado</h4>
                <p>
                  Tu pago ha sido validado por el administrador. 
                  Ya estás participando oficialmente y apareces en el tablero.
                </p>
              </div>
            </div>
            <div className="explanation-card">
              <div className="explanation-icon pending">⏳</div>
              <div className="explanation-content">
                <h4>Pago Pendiente</h4>
                <p>
                  Tu quiniela está registrada pero aún no se ha validado el pago. 
                  Envía tu comprobante junto con tu ID para activar tu participación.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckStatus;
