import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../utils/api';
import './Home.css';

const Home = () => {
  const [matchday, setMatchday] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentMatchday();
  }, []);

  const loadCurrentMatchday = async () => {
    try {
      setLoading(true);
      const data = await publicAPI.getCurrentMatchday();
      setMatchday(data.matchday);
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error loading matchday:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-line">¡BIENVENIDO A</span>
            <span className="title-highlight">LA GRILLA!</span>
          </h1>
          <p className="hero-description">
            La quiniela deportiva más emocionante. Predice los resultados,
            compite con amigos y gana increíbles premios.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn-primary btn-large">
              <span className="btn-icon">⚡</span>
              Participar Ahora
            </Link>
            <Link to="/standings" className="btn-secondary btn-large">
              <span className="btn-icon">📊</span>
              Ver Clasificación
            </Link>
          </div>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="loading-section">
            <div className="loading"></div>
            <p>Cargando jornada actual...</p>
          </div>
        ) : matchday ? (
          <div className="current-matchday-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">📅</span>
                {matchday.name}
              </h2>
              <span className={`badge badge-${matchday.status.toLowerCase()}`}>
                {matchday.status === 'Active' ? 'Activa' : 
                 matchday.status === 'In_Progress' ? 'En Curso' : 'Finalizada'}
              </span>
            </div>

            {matches.length > 0 ? (
              <div className="matches-grid">
                {matches.map((match) => (
                  <div key={match.id} className="match-card">
                    <div className="match-date">
                      {formatDate(match.match_date)}
                    </div>
                    <div className="match-teams">
                      <div className="team home-team">
                        <span className="team-name">{match.home_team}</span>
                        {match.home_goals !== null && (
                          <span className="team-score">{match.home_goals}</span>
                        )}
                      </div>
                      <div className="match-vs">VS</div>
                      <div className="team away-team">
                        {match.away_goals !== null && (
                          <span className="team-score">{match.away_goals}</span>
                        )}
                        <span className="team-name">{match.away_team}</span>
                      </div>
                    </div>
                    {match.final_result && (
                      <div className="match-result">
                        <span className="result-label">Resultado:</span>
                        <span className={`result-badge result-${match.final_result.toLowerCase()}`}>
                          {match.final_result === 'H' ? 'Local' :
                           match.final_result === 'D' ? 'Empate' : 'Visitante'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-icon">📭</p>
                <p className="empty-text">No hay partidos programados para esta jornada</p>
              </div>
            )}

            <div className="cta-section">
              <div className="cta-card">
                <h3>¿Listo para participar?</h3>
                <p>Registra tus predicciones antes de que inicie el primer partido</p>
                <Link to="/register" className="btn-primary">
                  Hacer mi Quiniela
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state card">
            <p className="empty-icon">🏟️</p>
            <h3>No hay jornada activa</h3>
            <p className="empty-text">Pronto se abrirá una nueva jornada. ¡Estate atento!</p>
          </div>
        )}

        <div className="info-section">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">📝</div>
              <h3>1. Registra tus pronósticos</h3>
              <p>Selecciona el resultado de cada partido: Local (H), Empate (D) o Visitante (A)</p>
            </div>
            <div className="info-card">
              <div className="info-icon">💰</div>
              <h3>2. Realiza tu pago</h3>
              <p>Guarda tu ID único y realiza el pago para activar tu participación</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🏆</div>
              <h3>3. Compite y gana</h3>
              <p>Suma puntos por cada acierto y escala en la clasificación general</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
