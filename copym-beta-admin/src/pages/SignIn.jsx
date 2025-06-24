import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';
import axios from '../services/axios';

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('/api/admin/signin', {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      if (response.data.success) {
        setSuccess(`🚀 Welcome ${response.data.data.user.firstName}! Admin Dashboard Access Granted`);
        console.log('✅ Login successful! User data:', response.data.data);
        
        // Store the JWT token and admin data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        localStorage.setItem('dashboardAccess', 'true');
        localStorage.setItem('userRole', response.data.data.user.userType);
        
        console.log('📝 Stored in localStorage:', {
          token: localStorage.getItem('token')?.substring(0, 20) + '...',
          userRole: localStorage.getItem('userRole'),
          dashboardAccess: localStorage.getItem('dashboardAccess')
        });
        
        // Redirect to admin dashboard after 1 second
        setTimeout(() => {
          console.log('🎯 Redirecting to Admin Dashboard...');
          console.log('🔄 Current URL:', window.location.href);
          navigate('/admin', { replace: true });
          console.log('✅ Navigation triggered to /admin');
        }, 1000);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.response?.data?.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    // Implement password reset flow
    alert("Password reset functionality coming soon!");
  };

  return (
    <div className="signin-container">
      {/* Background with geometric patterns */}
      <div className="background-pattern"></div>
      
      {/* Floating shapes */}
      <div className="floating-shape shape-1"></div>
      <div className="floating-shape shape-2"></div>
      <div className="shape-3"></div>
      <div className="shape-4"></div>

      {/* Main sign-in card */}
      <div className="signin-card">
        <div className="card-header">
          <h1 className="signin-title">
            Admin Dashboard 
            <span className="crypto-icon">♦</span>
          </h1>
          <p className="signin-subtitle">Blockchain Admin Portal - Authorized Access Only</p>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div style={{ 
            background: '#ffebee', 
            color: '#c62828', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ 
            background: '#e8f5e8', 
            color: '#2e7d32', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        <form className="signin-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
              />
              Remember me
            </label>
            <a href="#" onClick={handleForgotPassword} className="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" className="signin-btn" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        

      </div>
    </div>
  );
};

export default SignIn;