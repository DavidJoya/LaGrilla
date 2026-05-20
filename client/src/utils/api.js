import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  setAuthHeader: (username, password) => {
    const token = btoa(`${username}:${password}`);
    api.defaults.headers.common['Authorization'] = `Basic ${token}`;
  },

  clearAuthHeader: () => {
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
