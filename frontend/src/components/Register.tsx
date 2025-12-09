import { useState } from 'react';
import { authService } from '../services/auth';

export const Register = ({ onRegister }: { onRegister: () => void }) => {
  const [userData, setUserData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.register(userData);
      onRegister();
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl mb-4">Register</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Username"
          value={userData.username}
          onChange={(e) => setUserData({...userData, username: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div className="mb-4">
        <input
          type="email"
          placeholder="Email"
          value={userData.email}
          onChange={(e) => setUserData({...userData, email: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div className="mb-4">
        <input
          type="password"
          placeholder="Password"
          value={userData.password}
          onChange={(e) => setUserData({...userData, password: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
        Register
      </button>
    </form>
  );
};
