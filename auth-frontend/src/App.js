import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import RegisterUser from './pages/RegisterUser';
import RegisterAdmin from './pages/RegisterAdmin';
import LoginUser from './pages/LoginUser';
import LoginAdmin from './pages/LoginAdmin';
import Home from './pages/Home';
import UserDashboard from './pages/UserDashboard'; // ✅ Add this import
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register-user" element={<RegisterUser />} />
        <Route path="/register-admin" element={<RegisterAdmin />} />
        <Route path="/login-user" element={<LoginUser />} />
        <Route path="/login-admin" element={<LoginAdmin />} />
        <Route path="/dashboard-user" element={<UserDashboard />} /> {/* ✅ New route */}
        <Route path="/dashboard-admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
