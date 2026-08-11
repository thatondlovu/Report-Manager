import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { reportService, userService } from '../services/api';
import './Dashboard.css';

const validatePasswordStrength = (password) => {
  if (password.length < 8) {
    return 'New password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'New password must contain at least one uppercase letter.';
  }
  if (!/[a-z]/.test(password)) {
    return 'New password must contain at least one lowercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'New password must contain at least one number.';
  }
  return null;
};

const validateStudentNumber = (studentNumber) => {
  if (!studentNumber) return 'Student Number is required.';
  if (studentNumber.startsWith('0')) {
    return 'Student Number cannot begin with 0.';
  }
  if (!/^\d+$/.test(studentNumber)) {
    return 'Student Number must contain numbers only.';
  }
  if (studentNumber.length !== 9) {
    return 'Student Number must be exactly 9 digits long.';
  }
  return null;
};

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const Dashboard = ({ user, onLogout, onUserUpdate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    if (location.state?.toastMessage) {
      showToast(location.state.toastMessage, location.state.toastType || 'success');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    studentNumber: user?.studentNumber || '',
    department: user?.department || '',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username,
        studentNumber: user.studentNumber,
        department: user.department,
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    }
  }, [user]);

  const [profileMsg, setProfileMsg] = useState('');

  const fetchReports = async () => {
    try {
      const data = await reportService.getReportsByUser(user.id);
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchReports();
    }
  }, [user?.id]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        const API_BASE_URL = 'http://localhost:8090/api';
        await fetch(`${API_BASE_URL}/reports/${id}`, { method: 'DELETE' });
        setReports(reports.filter((report) => report.id !== id));
        
        showToast('Report deleted successfully.', 'success');
      } catch (error) {
        showToast('Failed to delete report.', 'error');
      }
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');

    const studentNumError = validateStudentNumber(profileData.studentNumber);
    if (studentNumError) {
      setProfileMsg(studentNumError);
      return;
    }

    const isAttemptingPasswordChange = 
      profileData.oldPassword || profileData.newPassword || profileData.confirmNewPassword;

    if (isAttemptingPasswordChange) {
      if (!profileData.oldPassword) {
        setProfileMsg('Please enter your current password.');
        return;
      }
      if (!profileData.newPassword) {
        setProfileMsg('Please enter a new password.');
        return;
      }
      
      const passwordStrengthError = validatePasswordStrength(profileData.newPassword);
      if (passwordStrengthError) {
        setProfileMsg(passwordStrengthError);
        return;
      }

      if (profileData.newPassword !== profileData.confirmNewPassword) {
        setProfileMsg('New passwords do not match.');
        return;
      }

      if (profileData.oldPassword === profileData.newPassword) {
        setProfileMsg('New password cannot be the same as your current password.');
        return;
      }
    }

    const payload = {
      username: profileData.username,
      studentNumber: profileData.studentNumber,
      department: profileData.department,
    };

    if (isAttemptingPasswordChange) {
      payload.oldPassword = profileData.oldPassword;
      payload.newPassword = profileData.newPassword;
    }

    try {
      const updatedUser = await userService.updateProfile(user.id, payload);
      
      showToast('Profile updated successfully!', 'success');
      
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      
      setIsEditingProfile(false);
      setProfileMsg('');
      setProfileData((prev) => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }));
    } catch (err) {
      const errorText = err.response?.data || err.message || 'Failed to update profile';
      setProfileMsg(errorText);
      showToast(errorText, 'error');
    }
  };

  return (
    <div className="dashboard-container">
      
      {}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '0.9rem',
          fontWeight: '500',
          zIndex: 9999,
          transition: 'all 0.3s ease-in-out',
        }}>
          {toast.message}
        </div>
      )}

      <aside className="dashboard-sidebar">
        <div className="profile-card">
          <div className="profile-avatar">
            {user?.username?.charAt(0).toUpperCase()} 
          </div>

          {!isEditingProfile ? (
            <>
              <h3 className="profile-name">{user?.username}</h3>
              <p className="profile-meta">{user?.studentNumber}</p>
              <p className="profile-dept">{user?.department}</p>
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="action-edit-btn"
                style={{ marginTop: '1rem', width: '100%' }}
              >
                Edit Profile
              </button>
            </>
          ) : (
            <form onSubmit={handleSaveProfile} className="profile-edit-form">
              {profileMsg && <div className="profile-error-banner">{profileMsg}</div>}
              
              <div className="profile-section-divider">Details</div>
              <input
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
                placeholder="Username"
                className="field-input"
                required
              />
              <input
                type="text"
                name="studentNumber"
                value={profileData.studentNumber}
                onChange={handleProfileChange}
                placeholder="Student Number"
                className="field-input"
                required
              />
              <input
                type="text"
                name="department"
                value={profileData.department}
                onChange={handleProfileChange}
                placeholder="Department"
                className="field-input"
                required
              />

              <div className="profile-section-divider">Change Password</div>

              {/* Current Password */}
              <div className="password-input-group">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  name="oldPassword"
                  value={profileData.oldPassword}
                  onChange={handleProfileChange}
                  placeholder="Current Password"
                  className="field-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="password-toggle-btn"
                >
                  {showOldPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* New Password */}
              <div className="password-input-group">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={profileData.newPassword}
                  onChange={handleProfileChange}
                  placeholder="Enter New Password"
                  className="field-input"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="password-toggle-btn"
                >
                  {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Confirm New Password */}
              <div className="password-input-group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmNewPassword"
                  value={profileData.confirmNewPassword}
                  onChange={handleProfileChange}
                  placeholder="Confirm New Password"
                  className="field-input"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle-btn"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <div className="profile-form-actions">
                <button type="submit" className="btn-save-profile">
                  Save
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileMsg('');
                  }} 
                  className="btn-cancel-profile"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <nav className="sidebar-nav">
          <button className="sidebar-btn active">My Reports</button>
          <button onClick={handleLogoutClick} className="sidebar-btn logout">
            Log Out
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Manage and track your weekly report submissions.</p>
          </div>
          <button onClick={() => navigate('/reports/new')} className="primary-btn">
            + Create Report
          </button>
        </header>

        {loading ? (
          <p style={{ color: 'var(--gray-500)' }}>Loading reports...</p>
        ) : reports.length === 0 ? (
          <div className="empty-card">
            <h3>No reports submitted yet</h3>
            <p>Click "+ Create Report" to log your first weekly entry.</p>
          </div>
        ) : (
          <div className="table-card">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="week-cell">Week {report.weekNumber}</td>
                    <td>
                      {report.startDate} to {report.endDate}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          report.status === 'SUBMITTED' ? 'submitted' : 'draft'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-group">
                        <button
                          onClick={() => navigate(`/reports/edit/${report.id}`)}
                          className="action-btn edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDelete(report.id, e)}
                          className="action-btn delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;