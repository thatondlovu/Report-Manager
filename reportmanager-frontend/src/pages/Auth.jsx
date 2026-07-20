import React, { useState } from 'react';
import { authService } from '../services/api';
import './Auth.css';

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    studentNumber: '',
    department: '',
  });

  const [message, setMessage] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', isError: false });
    setLoading(true);

    try {
      if (isLogin) {
        const credentials = { username: formData.username, password: formData.password };
        const user = await authService.login(credentials);
        setMessage({ text: 'Login successful!', isError: false });
        onLoginSuccess(user);
      } else {
        await authService.register(formData);
        setMessage({ text: 'Registration successful! You can now log in.', isError: false });
        setIsLogin(true);
      }
    } catch (error) {
      setMessage({ text: error.response?.data || 'An error occurred.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{isLogin ? 'Student Login' : 'Register Account'}</h2>
        <p className="auth-subtitle"></p>

        {message.text && (
          <div className={`auth-alert ${message.isError ? 'error' : 'success'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Username</label>
            <input 
              type="text" 
              name="username" 
              required 
              value={formData.username} 
              onChange={handleChange}
              className="auth-input"
              
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              value={formData.password} 
              onChange={handleChange}
              className="auth-input"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <>
              <div className="input-group">
                <label className="input-label">Student Number</label>
                <input 
                  type="text" 
                  name="studentNumber" 
                  required 
                  value={formData.studentNumber} 
                  onChange={handleChange}
                  className="auth-input"
                  
                />
              </div>
              <div className="input-group">
                <label className="input-label">Department</label>
                <input 
                  type="text" 
                  name="department" 
                  required 
                  value={formData.department} 
                  onChange={handleChange}
                  className="auth-input"
                  
                />
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>

        <div className="auth-toggle-container">
          <button 
            onClick={() => { setIsLogin(!isLogin); setMessage({ text: '', isError: false }); }}
            className="auth-toggle-btn"
          >
            {isLogin ? "Need an account? Register here" : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;