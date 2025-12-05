// Production AWS Configuration for Philippines
export const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
      loginWith: {
        email: true,
      },
    },
  },
  API: {
    REST: {
      'LawFirmAPI': {
        endpoint: import.meta.env.VITE_API_GATEWAY_URL,
        region: import.meta.env.VITE_AWS_REGION || 'ap-southeast-1',
      },
    },
  },
};

// Validate Gmail domain for user registration
export const validateGmailDomain = (email: string): boolean => {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1].toLowerCase();
  return domain === 'gmail.com';
};

// API Configuration
export const apiConfig = {
  baseURL: import.meta.env.VITE_API_GATEWAY_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Environment validation
export const validateEnvironment = () => {
  const requiredVars = [
    'VITE_USER_POOL_ID',
    'VITE_USER_POOL_CLIENT_ID',
    'VITE_IDENTITY_POOL_ID',
    'VITE_API_GATEWAY_URL',
    'VITE_AWS_REGION'
  ];

  const missing = requiredVars.filter(varName => !import.meta.env[varName]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
};