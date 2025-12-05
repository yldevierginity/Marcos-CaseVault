import { signIn, signOut, getCurrentUser, resetPassword, confirmResetPassword, confirmSignIn } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { Amplify } from 'aws-amplify';
import { awsConfig, validateEnvironment } from '../config/aws-config';

// Ensure Amplify is configured before using auth services
try {
  validateEnvironment();
  Amplify.configure(awsConfig);
} catch (error) {
  console.error('Failed to configure Amplify:', error);
}

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
  challengeName?: string;
  challengeParameters?: any;
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
      const result = await signIn({ username: email, password });
      
      if (result.isSignedIn) {
        await initializeAuth();
        return { success: true };
      } else if (result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        updateState({ 
          challengeName: 'NEW_PASSWORD_REQUIRED',
          challengeParameters: result.nextStep.missingAttributes,
          isLoading: false 
        });
        return { 
          success: false, 
          requiresNewPassword: true,
          error: 'New password required' 
        };
      }
      
      return { success: false, error: 'Sign in incomplete' };
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
    try {
      updateState({ isLoading: true, error: null });
      await confirmSignIn({ challengeResponse: newPassword });
      await initializeAuth();
      return { success: true };
    } catch (error: any) {
      console.error('Confirm new password error:', error);
      updateState({ 
        error: error.message || 'Password confirmation failed',
        isLoading: false,
      });
      return { 
        success: false, 
        error: error.message || 'Password confirmation failed' 
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
