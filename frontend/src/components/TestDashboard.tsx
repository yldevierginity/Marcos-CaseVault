import { useState, useEffect } from 'react';
import { authService } from '../services/auth-service';
import { apiService } from '../services/api-service';

export const TestDashboard = () => {
  const [authState, setAuthState] = useState(authService.getCurrentState());
  const [clients, setClients] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = authService.subscribe((state) => {
      setAuthState(state);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!authState.isAuthenticated) return;
      
      setLoading(true);
      try {
        const [clientsRes, casesRes] = await Promise.all([
          apiService.getClients(),
          apiService.getCases()
        ]);

        if (clientsRes.error) {
          setError(clientsRes.error);
        } else {
          setClients(clientsRes.data?.clients || []);
        }

        if (casesRes.error) {
          setError(casesRes.error);
        } else {
          setCases(casesRes.data?.cases || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authState.isAuthenticated]);

  const handleLogout = () => {
    authService.signOut();
  };

  if (authState.isLoading) {
    return <div className="p-4">Loading authentication...</div>;
  }

  if (!authState.isAuthenticated) {
    return <div className="p-4">Not authenticated</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div>Loading data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Clients ({clients.length})</h2>
            {clients.length > 0 ? (
              <ul>
                {clients.map((client, index) => (
                  <li key={index} className="border-b py-2">
                    {client.first_name} {client.last_name} - {client.email}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No clients found</p>
            )}
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Cases ({cases.length})</h2>
            {cases.length > 0 ? (
              <ul>
                {cases.map((case_, index) => (
                  <li key={index} className="border-b py-2">
                    {case_.case_title} - {case_.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No cases found</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 bg-gray-100 p-4 rounded">
        <h3 className="font-semibold">Auth State:</h3>
        <pre>{JSON.stringify(authState, null, 2)}</pre>
      </div>
    </div>
  );
};
