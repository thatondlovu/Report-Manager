import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ReportForm from './pages/ReportForm';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user)); 
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser'); 
  };

  const handleUserUpdate = (updatedUserData) => {
    setCurrentUser(updatedUserData);
    localStorage.setItem('currentUser', JSON.stringify(updatedUserData)); 
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route Protection */}
        <Route 
          path="/login" 
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Auth 
                onLoginSuccess={handleLoginSuccess} 
                onLogout={handleLogout} 
                user={currentUser} 
              />
            )
          } 
        />

        {/* Dashboard Protection */}
        <Route 
          path="/dashboard" 
          element={
            currentUser ? (
              <Dashboard 
                user={currentUser} 
                onLogout={handleLogout} 
                onUserUpdate={handleUserUpdate}
              />
            ) : ( 
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Create Report Protection */}
        <Route 
          path="/reports/new" 
          element={currentUser ? <ReportForm user={currentUser} /> : <Navigate to="/login" replace />} 
        />

        {/* Edit Report Protection */}
        <Route 
          path="/reports/edit/:id" 
          element={currentUser ? <ReportForm user={currentUser} /> : <Navigate to="/login" replace />} 
        />

        {/* Catch-All Fallback Route for Invalid URLs */}
        <Route 
          path="*" 
          element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;