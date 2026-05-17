import React, { useEffect, useState } from 'react';
import { publicAPI } from '../utils/api';
import './Board.css';

const Board = () => {
  const [matchday, setMatchday] = useState(null);
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoard();
  }, []);

  const loadBoard = async () => {
    try {
      setLoading(true);
      const matchdayData = await publicAPI.getCurrentMatchday();
      
      if (!matchdayData.matchday) {
        return;
      }

      setMatchday(matchdayData.matchday);
      
      const boardData = await publicAPI.getMatchdayBoard(matchdayData.matchday.id);
      setBoard(boardData.board || []);
    } catch (error) {
      console.error('Error loading board:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultClass = (prediction, finalResult) => {
    if (!finalResult) return '';
    return prediction === finalResult ? 'correct' : 'incorrect';
  };

  const getResultLabel = (value) => {
    if (value === 'H') return 'L';
    if (value === 'D') return 'E';
    if (value === 'A') return 'V';
    return value;
  };

  if (loading) {
    return (
      <div className="board-page">
        <div className="container">
          <div className="loading-section">
            <div className="loading"></div>
            <p>Cargando tablero...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!matchday) {
    return (
      <div className="board-page">
        <div className="container">
          <div className="empty-state card">
            <p className="empty-icon">🏟️</p>
            <h3>No hay jornada activa</h3>
            <p className="empty-text">El tablero estará disponible cuando haya una jornada en curso</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="board-page">
      <div className="container">
        <div className="page-header">
          <h1>Tablero de Jornada</h1>
          <p className="page-subtitle">{matchday.name}</p>
          <span className={`badge badge-${matchday.status.toLowerCase()}`}>
            {matchday.status === 'Active' ? 'Activa' : 
             matchday.status === 'In_Progress' ? 'En Curso' : 'Finalizada'}
          </span>
        </div>

        {board.length === 0 ? (
          <div className="empty-state card">
            <p className="empty-icon">📊</p>
            <h3>Sin participantes pagados</h3>
            <p className="empty-text">
              Aún no hay quinielas con pago confirmado para esta jornada
            </p>
          </div>
        ) : (
          <div className="board-container">
            <div className="board-stats">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-value">{board.length}</div>
                <div className="stat-label">Participantes</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚽</div>
                <div className="stat-value">
                  {board[0]?.predictions?.length || 0}
                </div>
                <div className="stat-label">Partidos</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-value">
                  {Math.max(...board.map(b => b.total_points || 0))}
                </div>
                <div className="stat-label">Mejor Puntaje</div>
              </div>
            </div>

            <div className="board-scroll-wrapper">
              <table className="board-table">
                <thead>
                  <tr>
                    <th className="rank-col">#</th>
                    <th className="name-col">Participante</th>
                    {board[0]?.predictions?.map((pred, idx) => (
                      <th key={pred.matchId} className="match-col">
                        <div className="match-header">
                          <div className="match-number">P{idx + 1}</div>
                          <div className="match-teams-mini">
                            <div className="team-mini">{pred.homeTeam}</div>
                            <div className="vs-mini">vs</div>
                            <div className="team-mini">{pred.awayTeam}</div>
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className="total-col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {board.map((entry, index) => (
                    <tr key={entry.unique_id} className={index === 0 ? 'leader-row' : ''}>
                      <td className="rank-col">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </td>
                      <td className="name-col">
                        <div className="participant-name">{entry.user_name}</div>
                        <div className="participant-id">{entry.unique_id}</div>
                      </td>
                      {entry.predictions.map((pred) => (
                        <td 
                          key={pred.matchId} 
                          className={`prediction-cell ${getResultClass(pred.prediction, pred.finalResult)}`}
                        >
                          <div className="prediction-value">
                            {getResultLabel(pred.prediction)}
                          </div>
                          {pred.points === 1 && <div className="points-badge">+1</div>}
                        </td>
                      ))}
                      <td className="total-col">
                        <div className="total-score">{entry.total_points || 0}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="legend">
              <h4>Leyenda:</h4>
              <div className="legend-items">
                <div className="legend-item">
                  <span className="legend-symbol correct">✓</span>
                  <span>Acierto (+1 punto)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-symbol incorrect">✗</span>
                  <span>Fallo (0 puntos)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-symbol">L/E/V</span>
                  <span>Local / Empate / Visitante</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Board;
