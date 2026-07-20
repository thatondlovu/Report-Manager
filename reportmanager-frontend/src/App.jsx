import React, { useState } from 'react';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ReportForm from './pages/ReportForm';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('DASHBOARD');
  const [selectedReportId, setSelectedReportId] = useState(null);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('DASHBOARD');
  };

  const handleSelectReport = (id) => {
    setSelectedReportId(id);
    setView('FORM');
  };

  const handleCreateNewReport = () => {
    setSelectedReportId(null);
    setView('FORM');
  };

  return (
    <div>
      {!currentUser ? (
        <Auth onLoginSuccess={handleLoginSuccess} />
      ) : view === 'DASHBOARD' ? (
        <Dashboard 
          user={currentUser} 
          onLogout={handleLogout} 
          onSelectReport={handleSelectReport}
          onCreateNew={handleCreateNewReport}
        />
      ) : (
        <ReportForm 
          user={currentUser}
          reportId={selectedReportId}
          onBack={() => setView('DASHBOARD')}
        />
      )}
    </div>
  );
}

export default App;