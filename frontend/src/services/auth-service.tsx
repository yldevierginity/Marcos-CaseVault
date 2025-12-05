import { signIn, signOut, getCurrentUser, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

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
    const user = await getCurrentUser();
    if (user) {
      updateState({
        isAuthenticated: true,
        user: {
          username: user.username,
          email: user.signInDetails?.loginId || user.username,
          firstName: (user as any).attributes?.given_name,
          lastName: (user as any).attributes?.family_name,
        },
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

// Listen to auth events
Hub.listen('auth', ({ payload }) => {
  switch (payload.event) {
    case 'signedIn':
      initializeAuth();
      break;
    case 'signedOut':
      updateState({ 
        isAuthenticated: false, 
        user: null, 
        isLoading: false,
        error: null,
      });
      break;
    case 'signInWithRedirect_failure':
      updateState({ 
        error: (payload.data as any)?.message || 'Authentication failed',
        isLoading: false,
      });
      break;
  }
});

export const authService = {
  async signIn({ email, password }: { email: string; password: string }) {
    try {
      updateState({ isLoading: true, error: null });
      
      // Check if user is already authenticated
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          await initializeAuth();
          return { success: true };
        }
      } catch {
        // User not authenticated, proceed with sign in
      }
      
      await signIn({ username: email, password });
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

  async signOut() {
    try {
      await signOut();
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
    try {
      await resetPassword({ username });
      return { success: true };
    } catch (error: any) {
      console.error('Forgot password error:', error);
      return { 
        success: false, 
        error: error.message || 'Forgot password failed' 
      };
    }
  },

  async forgotPasswordSubmit(username: string, confirmationCode: string, newPassword: string) {
    try {
      await confirmResetPassword({ username, confirmationCode, newPassword });
      return { success: true };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { 
        success: false, 
        error: error.message || 'Password reset failed' 
      };
    }
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
  }
};

// Initialize authentication on module load
initializeAuth();