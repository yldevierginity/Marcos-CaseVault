import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { awsConfig, validateEnvironment } from './aws-config';

// Validate environment variables
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error);
}

// Configure token storage to use localStorage
cognitoUserPoolsTokenProvider.setKeyValueStorage(window.localStorage);

// Configure Amplify
Amplify.configure(awsConfig);

export default Amplify;
