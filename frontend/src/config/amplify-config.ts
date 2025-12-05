import { Amplify } from 'aws-amplify';
import { awsConfig, validateEnvironment } from './aws-config';

// Validate environment variables
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error);
  // In production, you might want to show an error page
}

// Configure Amplify
Amplify.configure(awsConfig);

export default Amplify;