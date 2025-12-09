import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const ApiTest = () => {
  const [health, setHealth] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    const testApi = async () => {
      try {
        const healthData = await api.healthCheck();
        setHealth(healthData);
        
        const casesData = await api.getCases();
        setCases(casesData);
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    testApi();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">API Connection Test</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold">Health Check:</h3>
        <pre className="bg-gray-100 p-2 rounded">
          {JSON.stringify(health, null, 2)}
        </pre>
      </div>

      <div>
        <h3 className="font-semibold">Cases:</h3>
        <pre className="bg-gray-100 p-2 rounded">
          {JSON.stringify(cases, null, 2)}
        </pre>
      </div>
    </div>
  );
};
