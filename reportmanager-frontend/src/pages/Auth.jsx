import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import './Auth.css';

const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }

  let hasUpper = false;
  let hasLower = false;
  let hasDigit = false;
  let hasSymbol = false;

  for (let i = 0; i < password.length; i++) {
    const ch = password[i];

    if (ch >= 'A' && ch <= 'Z') {
      hasUpper = true;
    } else if (ch >= 'a' && ch <= 'z') {
      hasLower = true;
    } else if (ch >= '0' && ch <= '9') {
      hasDigit = true;
    } else {
      hasSymbol = true;
    }
  }

  if (!hasUpper) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!hasLower) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
  }
  if (!hasDigit) {
    return { isValid: false, message: 'Password must contain at least one number.' };
  }
  if (!hasSymbol) {
    return { isValid: false, message: 'Password must contain at least one special symbol (e.g. @, #, $, !).' };
  }

  return { isValid: true, message: '' };
};

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const Auth = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    studentNumber: '',
    department: '',
  });
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

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setMessage({ text: 'Passwords do not match.', isError: true });
        return;
      }

      const passwordCheck = validatePassword(formData.password);
      if (!passwordCheck.isValid) {
        setMessage({ text: passwordCheck.message, isError: true });
        return;
      }
    }


    setLoading(true);

    try {
      if (isLogin) {
        const credentials = { username: formData.username, password: formData.password };
        const user = await userService.login(credentials);
        setMessage({ text: 'Login successful!', isError: false });
        onLoginSuccess(user);
        navigate('/dashboard');
      } else {
        await userService.register(formData);
        setMessage({ text: 'Registration successful! You can now log in.', isError: false });
        setIsLogin(true);
      }
    } catch (error) {
      setMessage({ text: error.response?.data || 'Error in the backend.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{isLogin ? 'Student Login' : 'Register Account'}</h2>

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
              type={showPassword ? 'text' : 'password'} 
              name="password" 
              required 
              value={formData.password} 
              onChange={handleChange}
              className="auth-input"
              placeholder="••••••••"
            />
              <button 
                type="button" 
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <div className="password-wrapper">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    name="confirmPassword" 
                    required 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="auth-input"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    className="toggle-password-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

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