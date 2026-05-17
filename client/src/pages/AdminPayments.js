import React, { useEffect, useState } from 'react';
import { adminAPI } from '../utils/api';
import './AdminPayments.css';

const AdminPayments = () => {
  const [pendingEntries, setPendingEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    loadPendingEntries();
  }, []);

  const loadPendingEntries = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getPendingEntries();
      setPendingEntries(data.pendingEntries || []);
    } catch (error) {
      console.error('Error loading pending entries:', error);
      alert('Error al cargar pagos pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (id) => {
    if (!window.confirm(`¿Confirmar pago de ${id}?`)) {
      return;
    }

    try {
      await adminAPI.markEntryAsPaid(id);
      alert('¡Pago confirmado! El participante ya aparece en el tablero.');
      loadPendingEntries();
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Error al confirmar pago');
    }
  };

  const handleSearch = () => {
    if (!searchId.trim()) {
      loadPendingEntries();
      return;
    }

    const filtered = pendingEntries.filter(entry => 
      entry.unique_id.toLowerCase().includes(searchId.toLowerCase())
    );
    setPendingEntries(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-payments-page">
        <div className="container">
          <div className="loading-section">
            <div className="loading"></div>
            <p>Cargando pagos pendientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-payments-page">
      <div className="container">
        <div className="page-header">
          <h1>Validar Pagos</h1>
          <button onClick={loadPendingEntries} className="btn-secondary">
            🔄 Recargar
          </button>
        </div>

        <div className="search-section card">
          <h3>Buscar por ID</h3>
          <div className="search-form">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.toUpperCase())}
              placeholder="Ej: ABCD-1234-WXYZ"
              className="search-input"
              maxLength={14}
            />
            <button onClick={handleSearch} className="btn-primary">
              🔍 Buscar
            </button>
            <button 
              onClick={() => {
                setSearchId('');
                loadPendingEntries();
              }} 
              className="btn-secondary"
            >
              ✖ Limpiar
            </button>
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-card card">
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{pendingEntries.length}</div>
            <div className="stat-label">Pagos Pendientes</div>
          </div>
        </div>

        {pendingEntries.length === 0 ? (
          <div className="empty-state card">
            <p className="empty-icon">✅</p>
            <h3>No hay pagos pendientes</h3>
            <p className="empty-text">
              Todos los registros han sido validados o no hay nuevas entradas
            </p>
          </div>
        ) : (
          <div className="payments-table-wrapper card">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>ID Único</th>
                  <th>Nombre</th>
                  <th>Jornada</th>
                  <th>Fecha de Registro</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pendingEntries.map((entry) => (
                  <tr key={entry.unique_id}>
                    <td>
                      <div className="entry-id">{entry.unique_id}</div>
                    </td>
                    <td>
                      <div className="entry-name">{entry.user_name}</div>
                    </td>
                    <td>
                      <div className="entry-matchday">{entry.matchday_name}</div>
                    </td>
                    <td>
                      <div className="entry-date">
                        {formatDate(entry.registration_date)}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleMarkAsPaid(entry.unique_id)}
                        className="btn-primary btn-confirm"
                      >
                        ✅ Confirmar Pago
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="instructions-section card">
          <h3>📋 Instrucciones</h3>
          <ol className="instructions-list">
            <li>
              <strong>Recibe el comprobante:</strong> El participante te envía su ID único junto con el comprobante de pago
            </li>
            <li>
              <strong>Verifica el pago:</strong> Confirma que el pago se haya realizado correctamente
            </li>
            <li>
              <strong>Busca el ID:</strong> Usa el buscador para encontrar el ID específico
            </li>
            <li>
              <strong>Confirma:</strong> Click en "Confirmar Pago" para activar la participación
            </li>
            <li>
              <strong>Listo:</strong> El participante aparecerá automáticamente en el tablero público
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
