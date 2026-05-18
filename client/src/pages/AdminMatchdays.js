import React, { useEffect, useState } from 'react';
import { adminAPI } from '../utils/api';
import './AdminMatchdays.css';

const AdminMatchdays = () => {
  const [matchdays, setMatchdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMatchday, setSelectedMatchday] = useState(null);
  const [matches, setMatches] = useState([]);
  
  // Form states
  const [matchdayName, setMatchdayName] = useState('');
  const [matchdayDate, setMatchdayDate] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [homeGoals, setHomeGoals] = useState('');
  const [awayGoals, setAwayGoals] = useState('');

  useEffect(() => {
    loadMatchdays();
  }, []);

  const loadMatchdays = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getMatchdays();
      setMatchdays(data.matchdays || []);
    } catch (error) {
      console.error('Error loading matchdays:', error);
      alert('Error al cargar jornadas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatchday = async (e) => {
    e.preventDefault();
    
    if (!matchdayName || !matchdayDate) {
      alert('Por favor llena todos los campos');
      return;
    }

    try {
      await adminAPI.createMatchday({
        name: matchdayName,
        startDate: matchdayDate
      });
      
      alert('¡Jornada creada exitosamente!');
      setMatchdayName('');
      setMatchdayDate('');
      setShowCreateForm(false);
      loadMatchdays();
    } catch (error) {
      console.error('Error creating matchday:', error);
      alert('Error al crear jornada');
    }
  };

  const handleSelectMatchday = async (matchday) => {
    setSelectedMatchday(matchday);
    
    try {
      const data = await adminAPI.getMatchdayMatches(matchday.id);
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error loading matches:', error);
      alert('Error al cargar partidos');
    }
  };

  const handleAddMatch = async (e) => {
    e.preventDefault();
    
    if (!homeTeam || !awayTeam || !matchDate) {
      alert('Por favor llena todos los campos');
      return;
    }

    try {
      // Convertir fecha local a UTC manteniendo la hora que el usuario ingresó
      const localDate = new Date(matchDate);
      
      await adminAPI.createMatch({
        matchdayId: selectedMatchday.id,
        homeTeam,
        awayTeam,
        matchDate: localDate.toISOString()
      });
      
      alert('¡Partido agregado exitosamente!');
      setHomeTeam('');
      setAwayTeam('');
      setMatchDate('');
      handleSelectMatchday(selectedMatchday);
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Error al agregar partido');
    }
  };

  const handleUpdateResult = async (matchId) => {
    if (homeGoals === '' || awayGoals === '') {
      alert('Por favor ingresa ambos resultados');
      return;
    }

    try {
      await adminAPI.updateMatchResult(matchId, parseInt(homeGoals), parseInt(awayGoals));
      alert('¡Resultado actualizado! Los puntos se han recalculado automáticamente.');
      setHomeGoals('');
      setAwayGoals('');
      handleSelectMatchday(selectedMatchday);
    } catch (error) {
      console.error('Error updating result:', error);
      alert('Error al actualizar resultado');
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('¿Estás seguro de eliminar este partido? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`https://la-grilla-api.onrender.com/api/admin/match/${matchId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa('admin:admin123456')}`
        },
      });

      if (response.ok) {
        alert('Partido eliminado exitosamente');
        handleSelectMatchday(selectedMatchday);
      } else {
        alert('Error al eliminar partido');
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('Error al eliminar partido');
    }
  };

  const handleUpdateStatus = async (matchdayId, newStatus) => {
    try {
      await adminAPI.updateMatchdayStatus(matchdayId, newStatus);
      alert('Estado actualizado');
      loadMatchdays();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar estado');
    }
  };

  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="admin-matchdays-page">
        <div className="container">
          <div className="loading-section">
            <div className="loading"></div>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-matchdays-page">
      <div className="container">
        <div className="page-header">
          <h1>Gestionar Jornadas</h1>
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary">
            {showCreateForm ? '❌ Cancelar' : '➕ Nueva Jornada'}
          </button>
        </div>

        {showCreateForm && (
          <div className="card form-card">
            <h3>Crear Nueva Jornada</h3>
            <form onSubmit={handleCreateMatchday} className="admin-form">
              <div className="form-group">
                <label>Nombre de la Jornada</label>
                <input
                  type="text"
                  value={matchdayName}
                  onChange={(e) => setMatchdayName(e.target.value)}
                  placeholder="Ej: Jornada 1 - Liga MX"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Fecha de Inicio</label>
                <input
                  type="datetime-local"
                  value={matchdayDate}
                  onChange={(e) => setMatchdayDate(e.target.value)}
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-primary">
                Crear Jornada
              </button>
            </form>
          </div>
        )}

        <div className="matchdays-grid">
          {matchdays.map((matchday) => (
            <div key={matchday.id} className="matchday-card card">
              <div className="matchday-header">
                <h3>{matchday.name}</h3>
                <span className={`badge badge-${matchday.status.toLowerCase()}`}>
                  {matchday.status}
                </span>
              </div>
              <div className="matchday-info">
                <p>📅 {new Date(matchday.start_date).toLocaleDateString('es-MX')}</p>
                <p>👥 {matchday.total_entries || 0} registros ({matchday.paid_entries || 0} pagados)</p>
              </div>
              <div className="matchday-actions">
                <button 
                  onClick={() => handleSelectMatchday(matchday)} 
                  className="btn-secondary"
                >
                  📝 Gestionar Partidos
                </button>
                <select 
                  value={matchday.status} 
                  onChange={(e) => handleUpdateStatus(matchday.id, e.target.value)}
                  className="status-select"
                >
                 <option value="Inactive">Inactiva</option>
                 <option value="Active">Activa</option>
                 <option value="In_Progress">En Curso</option>
                 <option value="Finished">Finalizada</option>
               </select>
              </div>
            </div>
          ))}
        </div>

        {selectedMatchday && (
          <div className="matches-section card">
            <div className="section-header">
              <h2>Partidos: {selectedMatchday.name}</h2>
              <button onClick={() => setSelectedMatchday(null)} className="btn-secondary">
                ✖ Cerrar
              </button>
            </div>

            <div className="add-match-form">
              <h3>Agregar Partido</h3>
              <form onSubmit={handleAddMatch} className="match-form">
                <input
                  type="text"
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                  placeholder="Equipo Local"
                  className="form-input"
                />
                <input
                  type="text"
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  placeholder="Equipo Visitante"
                  className="form-input"
                />
                <input
                  type="datetime-local"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="form-input"
                />
                <button type="submit" className="btn-primary">
                  ➕ Agregar
                </button>
              </form>
            </div>

            <div className="matches-list">
              <h3>Partidos Programados</h3>
              {matches.length === 0 ? (
                <p className="empty-text">No hay partidos agregados</p>
              ) : (
                <table className="matches-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Local</th>
                      <th>Visitante</th>
                      <th>Resultado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((match) => (
                      <tr key={match.id}>
                        <td>{formatDateForDisplay(match.match_date)}</td>
                        <td>{match.home_team}</td>
                        <td>{match.away_team}</td>
                        <td>
                          {match.home_goals !== null ? (
                            `${match.home_goals} - ${match.away_goals}`
                          ) : (
                            'Pendiente'
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleDeleteMatch(match.id)}
                              className="btn-secondary btn-small"
                              title="Eliminar partido"
                            >
                              🗑️
                            </button>
                            <div className="result-form">
                              <input
                                type="number"
                                min="0"
                                placeholder="L"
                                className="result-input"
                                onChange={(e) => setHomeGoals(e.target.value)}
                              />
                              <span>-</span>
                              <input
                                type="number"
                                min="0"
                                placeholder="V"
                                className="result-input"
                                onChange={(e) => setAwayGoals(e.target.value)}
                              />
                              <button
                                onClick={() => handleUpdateResult(match.id)}
                                className="btn-primary btn-small"
                                title="Guardar resultado"
                              >
                                💾
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMatchdays;
