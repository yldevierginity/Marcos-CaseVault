const API_BASE_URL = 'http://localhost:8000/api';

export interface User {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
};

let currentState: AuthState = { ...initialState };
const subscribers: ((state: AuthState) => void)[] = [];

const updateState = (newState: Partial<AuthState>) => {
  currentState = { ...currentState, ...newState };
  subscribers.forEach((callback) => callback(currentState));
};

// Initialize authentication
const initializeAuth = async () => {
  try {
    updateState({ isLoading: true });
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      updateState({ 
        isAuthenticated: false, 
        user: null, 
        isLoading: false,
        error: null,
      });
      return;
    }

    // Get user profile from Django backend
    const response = await fetch(`${API_BASE_URL}/profile/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const userData = await response.json();
      updateState({
        isAuthenticated: true,
        user: {
          username: userData.username,
          email: userData.email,
        },
        isLoading: false,
        error: null,
      });
    } else {
      // Token invalid, clear it
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      updateState({ 
        isAuthenticated: false, 
        user: null, 
        isLoading: false,
        error: null,
      });
    }
  } catch (error) {
    console.log('User not authenticated:', error);
    updateState({ 
      isAuthenticated: false, 
      user: null, 
      isLoading: false,
      error: null,
    });
  }
};

export const authService = {
  async signIn({ email, password }: { email: string; password: string }) {
    try {
      updateState({ isLoading: true, error: null });
      
      const response = await fetch(`${API_BASE_URL}/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email, // Backend expects 'username' field but we send email
          password: password,
        }),
      });
      
      if (!response.ok) {
        updateState({ 
          error: 'Incorrect username or password',
          isLoading: false,
        });
        return { success: false, error: 'Incorrect username or password' };
      }
      
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      await initializeAuth();
      return { success: true };
    } catch (error: any) {
      console.error('Sign in error:', error);
      updateState({ 
        error: error.message || 'Sign in failed',
        isLoading: false,
      });
      return { 
        success: false, 
        error: error.message || 'Sign in failed' 
      };
    }
  },

  async confirmNewPassword({ newPassword }: { newPassword: string }) {
    // Not needed for Django backend
    return { success: true };
  },

  async signOut() {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      updateState({ 
        isAuthenticated: false, 
        user: null, 
        isLoading: false,
        error: null,
      });
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { 
        success: false, 
        error: error.message || 'Sign out failed' 
      };
    }
  },

  async forgotPassword(username: string) {
    // Placeholder for Django implementation
    return { success: true };
  },

  async forgotPasswordSubmit(username: string, confirmationCode: string, newPassword: string) {
    // Placeholder for Django implementation
    return { success: true };
  },

  subscribe(callback: (state: AuthState) => void) {
    subscribers.push(callback);
    callback(currentState);
    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  },

  getCurrentState() {
    return currentState;
  },

  initialize() {
    return initializeAuth();
  }
};

// Initialize on load
initializeAuth();
