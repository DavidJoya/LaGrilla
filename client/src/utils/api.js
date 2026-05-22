import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token guardado en localStorage automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_auth_token');
  if (token) {
    config.headers['Authorization'] = `Basic ${token}`;
  }
  return config;
});

// Public API calls
export const publicAPI = {
  getCurrentMatchday: async () => {
    const response = await api.get('/public/matchday/current');
    return response.data;
  },

  createPoolEntry: async (entryData) => {
    const response = await api.post('/public/pool/create', entryData);
    return response.data;
  },

  checkPoolStatus: async (id) => {
    const response = await api.get(`/public/pool/status/${id}`);
    return response.data;
  },

  getMatchdayBoard: async (matchdayId) => {
    const response = await api.get(`/public/matchday/${matchdayId}/board`);
    return response.data;
  },

  getOverallStandings: async () => {
    const response = await api.get('/public/standings/overall');
    return response.data;
  },
};

// Admin API calls (requires authentication)
export const adminAPI = {
  login: async (username, password) => {
    try {
      const token = btoa(`${username}:${password}`);
      
      // Probar si las credenciales son válidas
      const response = await api.get('/admin/matchdays', {
        headers: {
          'Authorization': `Basic ${token}`,
        },
      });

      if (response.status === 200) {
        // Guardar token en localStorage
        localStorage.setItem('admin_auth_token', token);
        // También configurarlo en axios para peticiones inmediatas
        api.defaults.headers.common['Authorization'] = `Basic ${token}`;
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: 'Invalid credentials' };
    }
  },

  logout: () => {
    localStorage.removeItem('admin_auth_token');
    delete api.defaults.headers.common['Authorization'];
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('admin_auth_token');
  },

  setAuthHeader: (username, password) => {
    const token = btoa(`${username}:${password}`);
    localStorage.setItem('admin_auth_token', token);
    api.defaults.headers.common['Authorization'] = `Basic ${token}`;
  },

  clearAuthHeader: () => {
    localStorage.removeItem('admin_auth_token');
    delete api.defaults.headers.common['Authorization'];
  },

  createMatchday: async (data) => {
    const response = await api.post('/admin/matchday/create', data);
    return response.data;
  },

  createMatch: async (data) => {
    const response = await api.post('/admin/match/create', data);
    return response.data;
  },

  getMatchdays: async () => {
    const response = await api.get('/admin/matchdays');
    return response.data;
  },

  getPendingEntries: async () => {
    const response = await api.get('/admin/pools/pending');
    return response.data;
  },

  markEntryAsPaid: async (id) => {
    const response = await api.put(`/admin/pool/${id}/mark-paid`);
    return response.data;
  },

  cleanupPendingEntries: async (matchdayId) => {
    const response = await api.delete(`/admin/matchday/${matchdayId}/cleanup-pending`);
    return response.data;
  },

  updateMatchResult: async (matchId, homeGoals, awayGoals) => {
    const response = await api.put(`/admin/match/${matchId}/result`, {
      homeGoals,
      awayGoals,
    });
    return response.data;
  },

  updateMatchdayStatus: async (matchdayId, status) => {
    const response = await api.put(`/admin/matchday/${matchdayId}/status`, {
      status,
    });
    return response.data;
  },

  getMatchdayMatches: async (matchdayId) => {
    const response = await api.get(`/admin/matchday/${matchdayId}/matches`);
    return response.data;
  },
};

export default api;
