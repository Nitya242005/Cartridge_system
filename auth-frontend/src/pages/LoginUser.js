import React, { useState, useEffect } from 'react';
import { loginUser } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Global styles

function LoginUser() {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  // ✅ Clear any old/wrong keys on load
  useEffect(() => {
    localStorage.removeItem('token');         // Remove wrongly used keys
    localStorage.removeItem('refresh');
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);

      if (res.data.role === 'user') {
        alert(`Welcome ${res.data.username}`);

        // ✅ Store with correct key names
        localStorage.setItem('username', res.data.username);
        localStorage.setItem('email', res.data.email);
        localStorage.setItem('role', 'user');
        localStorage.setItem('access_token', res.data.token);     // Correct key!
        localStorage.setItem('refresh_token', res.data.refresh);  // Correct key!

        navigate('/dashboard-user');
      } else {
        alert("Access denied: Not a user account.");
      }
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.non_field_errors || "Server error"));
    }
  };

  return (
    <div id="radiant-bg">
      <div className="container col-md-6">
        <h2 className="mb-4 text-primary text-center heading-bold">User Login</h2>
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

          <button type="submit" className="btn btn-primary w-100">
            Login as User
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginUser;
