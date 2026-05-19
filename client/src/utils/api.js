const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000/api';

// Helper to get auth header
const getAuthHeader = () => {
  const authToken = localStorage.getItem('admin_auth_token');
  if (authToken) {
    return { 'Authorization': `Basic ${authToken}` };
  }
  return {};
};

// Public API calls
export const publicAPI = {
  getCurrentMatchday: async () => {
    const response = await fetch(`${API_BASE_URL}/matchday/current`);
    return response.json();
  },

  createPoolEntry: async (entryData) => {
    const response = await fetch(`${API_BASE_URL}/pool/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entryData),
    });
    return response.json();
  },

  checkPoolStatus: async (uniqueId) => {
    const response = await fetch(`${API_BASE_URL}/pool/status/${uniqueId}`);
    return response.json();
  },

  getMatchdayBoard: async (matchdayId) => {
    const response = await fetch(`${API_BASE_URL}/matchday/${matchdayId}/board`);
    return response.json();
  },

  getOverallStandings: async () => {
    const response = await fetch(`${API_BASE_URL}/standings/overall`);
    return response.json();
  },
};

// Admin API calls with auth
export const adminAPI = {
  login: async (username, password) => {
    const credentials = btoa(`${username}:${password}`);
    const response = await fetch(`${API_BASE_URL}/admin/matchdays`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    });

    if (response.ok) {
      // Save credentials in localStorage
      localStorage.setItem('admin_auth_token', credentials);
      return { success: true };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
  },

  logout: () => {
    localStorage.removeItem('admin_auth_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('admin_auth_token');
  },

  getMatchdays: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/matchdays`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  createMatchday: async (matchdayData) => {
    const response = await fetch(`${API_BASE_URL}/admin/matchday/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(matchdayData),
    });
    return response.json();
  },

  createMatch: async (matchData) => {
    const response = await fetch(`${API_BASE_URL}/admin/match/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(matchData),
    });
    return response.json();
  },

  getMatchdayMatches: async (matchdayId) => {
    const response = await fetch(`${API_BASE_URL}/admin/matchday/${matchdayId}/matches`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  updateMatchResult: async (matchId, homeGoals, awayGoals) => {
    const response = await fetch(`${API_BASE_URL}/admin/match/${matchId}/result`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ homeGoals, awayGoals }),
    });
    return response.json();
  },

  updateMatchdayStatus: async (matchdayId, status) => {
    const response = await fetch(`${API_BASE_URL}/admin/matchday/${matchdayId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });
    return response.json();
  },

  getPendingEntries: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/pools/pending`, {
      headers: getAuthHeader(),
    });
    return response.json();
  },

  markEntryAsPaid: async (uniqueId) => {
    const response = await fetch(`${API_BASE_URL}/admin/pool/${uniqueId}/mark-paid`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return response.json();
  },
};
