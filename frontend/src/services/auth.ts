const API_BASE_URL = 'http://localhost:8000/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await fetch(`${API_BASE_URL}/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: credentials.email, // Backend expects 'username' field but we send email
        password: credentials.password,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    return data;
  },

  async register(userData: RegisterData) {
    const response = await fetch(`${API_BASE_URL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    return response.json();
  },

  async getProfile() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/profile/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get profile');
    }
    
    return response.json();
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getToken() {
    return localStorage.getItem('access_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },
};
