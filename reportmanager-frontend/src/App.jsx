import React, { useState, useEffect } from 'react';
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
        {}
        <Route path="/login" 
          element={
            <Auth 
              onLoginSuccess={handleLoginSuccess} 
              onLogout={handleLogout} 
              user={currentUser} 
            />
          } 
        />

        {}
        <Route path="/dashboard" 
          element={
            currentUser ? (
              <Dashboard 
                user={currentUser} 
                onLogout={handleLogout} 
                onUserUpdate={handleUserUpdate}
        />) : ( <Navigate to="/login" replace />)}/>

        {}
        <Route path="/reports/new" element={  currentUser ? (<ReportForm user={currentUser} />) : ( <Navigate to="/login" replace />)} />

        {}
        <Route path="/reports/edit/:id" element={ currentUser ? (<ReportForm user={currentUser} />) : (<Navigate to="/login" replace />)} />

        {}
        <Route path="/"element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

