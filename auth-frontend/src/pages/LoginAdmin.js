import React, { useState } from 'react';
import { loginUser } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import '../App.css';


function LoginAdmin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);

      if (res.data.role === 'admin') {
        alert(`Welcome Admin, ${res.data.username}`);

        // ✅ Save everything including token
        localStorage.setItem('username', res.data.username);
        localStorage.setItem('email', res.data.email);
        localStorage.setItem('role', 'admin');
        localStorage.setItem('token', res.data.token);       // 🔐 JWT access token
        localStorage.setItem('refresh', res.data.refresh);   // (optional)

        // ✅ Navigate to dashboard
        navigate('/dashboard-admin');
      } else {
        alert("Access denied: Not an admin account.");
      }
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.non_field_errors || "Server error"));
    }
  };

  return (
   <div className="min-vh-100 d-flex justify-content-center align-items-center" id="radiant-bg">
  <div className="container col-md-6 mt-n5">
    <h2 className="mb-4 text-danger text-center heading-bold">Admin Login</h2>
    <form onSubmit={handleSubmit} className="border p-4 rounded bg-light shadow">
      <div className="mb-3">
        <label htmlFor="username" className="form-label">Username</label>
        <input
          type="text"
          name="username"
          className="form-control"
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">Password</label>
        <input
          type="password"
          name="password"
          className="form-control"
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className="btn btn-danger w-100">
        Login as Admin
      </button>
    </form>
  </div>
</div>

  );
}

export default LoginAdmin;

