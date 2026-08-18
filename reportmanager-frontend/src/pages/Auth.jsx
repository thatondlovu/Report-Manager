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
    if (ch >= 'A' && ch <= 'Z') hasUpper = true;
    else if (ch >= 'a' && ch <= 'z') hasLower = true;
    else if (ch >= '0' && ch <= '9') hasDigit = true;
    else hasSymbol = true;
  }

  if (!hasUpper) return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
  if (!hasLower) return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
  if (!hasDigit) return { isValid: false, message: 'Password must contain at least one number.' };
  if (!hasSymbol) return { isValid: false, message: 'Password must contain at least one special symbol (e.g. @, #, $, !).' };

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
        if (onLoginSuccess) {
          onLoginSuccess(user);
        }
        navigate('/dashboard');
      } else {
        await userService.register({
          username: formData.username,
          studentNumber: formData.studentNumber,
          department: formData.department.toUpperCase().trim(),
          password: formData.password,
        });
        setMessage({ text: 'Registration successful! You can now log in.', isError: false });
        setIsLogin(true);
      }
    } catch (error) {
      let errorText = 'An error occurred. Please try again.';

      if (error.response?.data) {
        const data = error.response.data;

        if (typeof data === 'string') {
          errorText = data;
        } else if (data.validationErrors && Object.keys(data.validationErrors).length > 0) {
          errorText = Object.values(data.validationErrors).join(', ');
        } else if (data.message) {
          errorText = data.message;
        } else if (data.error) {
          errorText = data.error;
        }
      } else if (error.message) {
        errorText = error.message;
      }

      setMessage({ text: errorText, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Banner */}
      <div className="auth-hero-panel">
        <div className="hero-body">
          <h1 className="hero-title">
            {isLogin ? 'Stay On Track!' : 'Start Your Journey!'}
          </h1>
          <p className="hero-description">
            Looking for a simple way to stay on top of your weekly tasks? You've come to the right place!
          </p>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="auth-form-panel">
        <div className="form-content-wrapper">
          <div className="brand-header-title">ReportHub</div>

          <h2 className="auth-main-title">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>

          <div className="auth-sub-link">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <button 
                  type="button" 
                  className="inline-toggle-btn" 
                  onClick={() => { setIsLogin(false); setMessage({ text: '', isError: false }); }}
                >
                  Create a new account now
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button 
                  type="button" 
                  className="inline-toggle-btn" 
                  onClick={() => { setIsLogin(true); setMessage({ text: '', isError: false }); }}
                >
                  Log in here
                </button>
              </>
            )}
          </div>

          {message.text && (
            <div className={`auth-alert-box ${message.isError ? 'error' : 'success'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <input 
              type="text" 
              name="username" 
              placeholder="Username Or Student Number" 
              required 
              value={formData.username} 
              onChange={handleChange}
              className="auth-input-styled"
            />

            {!isLogin && (
              <>
                <input 
                  type="text" 
                  name="studentNumber" 
                  placeholder="Student Number" 
                  required 
                  value={formData.studentNumber} 
                  onChange={handleChange}
                  className="auth-input-styled"
                />

                {}
                  <select
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className="auth-input-styled"
                  >
                    <option value="" disabled>Select Department</option>
                    <option value="MULTIMEDIA_COMPUTING">Multimedia Computing</option>
                    <option value="COMPUTER_SYSTEMS_ENGINEERING">Computer Systems Engineering</option>
                    <option value="INFORMATICS">Informatics</option>
                    <option value="INFORMATION_TECHNOLOGY">Information Technology</option>
                    <option value="COMPUTER_SCIENCE">Computer Science</option>
                  </select>
              </>
            )}

            <div className="input-field-wrapper">
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                placeholder="Password" 
                required 
                value={formData.password} 
                onChange={handleChange}
                className="auth-input-styled"
                style={{ paddingRight: '2.5rem' }}
              />
              <button 
                type="button" 
                className="toggle-pwd-icon" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {!isLogin && (
              <div className="input-field-wrapper">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  name="confirmPassword" 
                  placeholder="Confirm Password" 
                  required 
                  value={formData.confirmPassword} 
                  onChange={handleChange}
                  className="auth-input-styled"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button 
                  type="button" 
                  className="toggle-pwd-icon" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary-dark">
              {loading ? 'Processing...' : isLogin ? 'Login Now' : 'Register Now'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Auth;