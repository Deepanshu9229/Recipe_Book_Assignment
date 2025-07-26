
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username) {
      login(username);
      navigate('/');
    }
  };

  return (
    <form className="max-w-md mx-auto mt-20 bg-white p-6 rounded shadow" onSubmit={handleLogin}>
      <h2 className="text-2xl font-bold mb-4">Login / Signup</h2>
      <input
        className="border rounded px-2 py-1 w-full mb-2"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <button className="bg-red-500 text-white px-4 py-2 rounded w-full">Login</button>
    </form>
  );
}