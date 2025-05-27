import React, { useState, useEffect } from 'react';

/**
 * Simple authentication gate for demo purposes.
 * Checks a password stored in REACT_APP_PASSWORD environment variable.
 * If not set, defaults to 'demo'.
 */
export default function AuthGate({ children }) {
  const stored = localStorage.getItem('authorized');
  const [authorized, setAuthorized] = useState(stored === 'true');
  const [password, setPassword] = useState('');
  const correctPassword = process.env.REACT_APP_PASSWORD || 'demo';

  useEffect(() => {
    localStorage.setItem('authorized', authorized);
  }, [authorized]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      setAuthorized(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded shadow-md">
          <h2 className="text-xl mb-4">Member Login</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="p-2 rounded w-full text-black mb-4"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full">
            Enter
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
