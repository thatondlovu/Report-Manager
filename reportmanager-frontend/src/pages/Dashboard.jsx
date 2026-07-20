import React, { useEffect, useState } from 'react';
import { reportService } from '../services/api';
import './Dashboard.css';

const Dashboard = ({ user, onLogout, onSelectReport, onCreateNew }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchReports();
  }, [user.id]);

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

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div className="profile-card">
          <div className="profile-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h3 className="profile-name">{user.username}</h3>
          <p className="profile-meta">Student ID: {user.studentNumber}</p>
          <p className="profile-dept">{user.department}</p>
        </div>

        <nav className="sidebar-nav">
          <button className="sidebar-btn active">My Reports</button>
          <button onClick={onLogout} className="sidebar-btn logout">
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
          <button onClick={onCreateNew} className="primary-btn">
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
                          onClick={() => onSelectReport(report.id)}
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