const API_BASE_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const api = {
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health/`);
    return response.json();
  },

  async getCases() {
    const response = await fetch(`${API_BASE_URL}/cases/`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch cases');
    }
    
    return response.json();
  },
};
