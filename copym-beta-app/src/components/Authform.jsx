import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AuthForm = ({ type }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      const url = type === 'signup' ? 'http://localhost:5000/api/signup' : 'http://localhost:5000/api/login';
      const payload = type === 'signup'
        ? formData
        : { email: formData.email, password: formData.password };

      const response = await axios.post(url, payload);
      const { token, user } = response.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleSocialLogin = provider => {
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '80px auto', 
      padding: '20px', 
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {type === 'signup' ? 'Create Account' : 'Welcome'}
      </h2>

      <form onSubmit={handleSubmit}>
        {type === 'signup' && (
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <button 
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          {type === 'signup' ? 'Sign Up' : 'Log In'}
        </button>
      </form>

      {error && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button 
          onClick={() => handleSocialLogin('google')}
          style={{
            margin: '0 10px',
            padding: '10px 20px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔍 Google
        </button>
      </div>

      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        {type === 'signup' ? 'Already have an account?' : 'Don\'t have an account?'}{' '}
        <Link 
          to={type === 'signup' ? '/' : '/signup'} 
          style={{ color: '#1976d2', textDecoration: 'none' }}
        >
          {type === 'signup' ? 'Log In' : 'Sign Up'}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;