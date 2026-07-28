import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService, userService } from '../services/api';
import './Dashboard.css';

const Dashboard = ({ user, onLogout, onUserUpdate }) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };
  const [isEditingProfile, setIsEditingProfile] = useState(false);
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
      } catch (error) {
        alert('Failed to delete report.');
      }
    }
  };

const handleSaveProfile = async (e) => {
    window.alert('Your profile has been updated')
    setProfileMsg('');

    const isAttemptingPasswordChange = 
      profileData.oldPassword || profileData.newPassword || profileData.confirmNewPassword;

    if (isAttemptingPasswordChange) {
      if (!profileData.oldPassword) {
        setProfileMsg('Please confirm your previous password.');
        return;
      }
      if (!profileData.newPassword) {
        setProfileMsg('Please enter a new password.');
        return;
      }
      if (profileData.newPassword !== profileData.confirmNewPassword) {
        setProfileMsg('New passwords do not match.');
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
      setProfileMsg('Profile updated!');
      
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      
      setTimeout(() => {
        setIsEditingProfile(false);
        setProfileMsg('');
        setProfileData((prev) => ({
          ...prev,
          oldPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        }));
      }, 3200);
    } catch (err) {
      setProfileMsg(err.response?.data || err.message || 'Failed to update profile');
    }
  };


  return (
    <div className="dashboard-container">
      {}
      <aside className="dashboard-sidebar">
        <div className="profile-card">
          <div className="profile-avatar">
            {user?.username?.charAt(0).toUpperCase()} 
          </div>

          {!isEditingProfile ? (
            <>
              <h3 className="profile-name">{user?.username}</h3>
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="action-edit-btn edit"
                style={{ marginTop: '0.75rem', width: '100%', }}
              >
                Edit Profile
              </button>
              
            </>
          ) : (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {profileMsg && <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{profileMsg} </span>}
              
              <input
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
                placeholder="Username"
                className="field-input"
                style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                required
              />
              <input
                type="text"
                name="studentNumber"
                value={profileData.studentNumber}
                onChange={handleProfileChange}
                placeholder="Student Number"
                className="field-input"
                style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                required
              />
              <input
                type="text"
                name="department"
                value={profileData.department}
                onChange={handleProfileChange}
                placeholder="Department"
                className="field-input"
                style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                required
              />
               <input
                type="password"
                name="oldPassword"
                value={profileData.oldPassword}
                onChange={handleProfileChange}
                placeholder="Current Password"
                className="field-input"
                style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                autoComplete="current-password"
              />
              <input
                type="password"
                name="newPassword"
                value={profileData.newPassword}
                onChange={handleProfileChange}
                placeholder="Enter New Password"
                className="field-input"
                style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                autoComplete="new-password"
              />
              <input
                type="password"
                name="confirmNewPassword"
                value={profileData.confirmNewPassword}
                onChange={handleProfileChange}
                placeholder="Confirm New Password"
                className="field-input"
                style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                autoComplete="new-password"
              />

              <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
                <button type="submit" className="primary-btn" style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', flex: 1 }}>
                  Save
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEditingProfile(false)} 
                  className="action-btn edit"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <nav className="sidebar-nav">
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
            <p className="page-subtitle"></p>
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
            <p>Get started by creating your first weekly log entry.</p>
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