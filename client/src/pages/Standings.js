import React, { useEffect, useState } from 'react';
import { publicAPI } from '../utils/api';
import './Standings.css';

const Standings = () => {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStandings();
  }, []);

  const loadStandings = async () => {
    try {
      setLoading(true);
      const data = await publicAPI.getOverallStandings();
      setStandings(data.standings || []);
    } catch (error) {
      console.error('Error loading standings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  if (loading) {
    return (
      <div className="standings-page">
        <div className="container">
          <div className="loading-section">
            <div className="loading"></div>
            <p>Cargando clasificación...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="standings-page">
      <div className="container">
        <div className="page-header">
          <h1>Clasificación General</h1>
          <p className="page-subtitle">Tabla Acumulada del Torneo</p>
        </div>

        {standings.length === 0 ? (
          <div className="empty-state card">
            <p className="empty-icon">🏆</p>
            <h3>Sin datos de clasificación</h3>
            <p className="empty-text">
              La clasificación general aparecerá cuando se completen jornadas con pagos confirmados
            </p>
          </div>
        ) : (
          <>
            <div className="podium-section">
              {standings.slice(0, 3).map((entry, index) => (
                <div key={entry.unique_id} className={`podium-card podium-${index + 1}`}>
                  <div className="podium-rank">{getMedalIcon(index + 1)}</div>
                  <div className="podium-avatar">
                    {entry.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="podium-name">{entry.user_name}</div>
                  <div className="podium-stats">
                    <div className="podium-points">{entry.total_points}</div>
                    <div className="podium-label">Puntos</div>
                  </div>
                  <div className="podium-matchdays">
                    {entry.matchdays_participated} jornada{entry.matchdays_participated !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>

            <div className="standings-table-wrapper card">
              <table className="standings-table">
                <thead>
                  <tr>
                    <th className="rank-header">Posición</th>
                    <th className="name-header">Participante</th>
                    <th className="matchdays-header">Jornadas</th>
                    <th className="points-header">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((entry, index) => (
                    <tr 
                      key={entry.unique_id} 
                      className={`standings-row ${index < 3 ? 'top-three' : ''}`}
                    >
                      <td className="rank-cell">
                        <div className="rank-number">{getMedalIcon(index + 1)}</div>
                      </td>
                      <td className="name-cell">
                        <div className="player-info">
                          <div className="player-avatar">
                            {entry.user_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="player-details">
                            <div className="player-name">{entry.user_name}</div>
                            <div className="player-id">{entry.unique_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="matchdays-cell">
                        <div className="matchdays-value">{entry.matchdays_participated}</div>
                      </td>
                      <td className="points-cell">
                        <div className="points-value">{entry.total_points}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="standings-footer">
              <div className="footer-stats">
                <div className="footer-stat">
                  <span className="footer-icon">👥</span>
                  <span className="footer-value">{standings.length}</span>
                  <span className="footer-label">Participantes Totales</span>
                </div>
                <div className="footer-stat">
                  <span className="footer-icon">⚡</span>
                  <span className="footer-value">
                    {standings.length > 0 ? Math.max(...standings.map(s => s.total_points)) : 0}
                  </span>
                  <span className="footer-label">Puntuación Máxima</span>
                </div>
                <div className="footer-stat">
                  <span className="footer-icon">📊</span>
                  <span className="footer-value">
                    {standings.length > 0 ? (standings.reduce((sum, s) => sum + parseInt(s.total_points), 0) / standings.length).toFixed(1) : 0}
                  </span>
                  <span className="footer-label">Promedio</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Standings;
