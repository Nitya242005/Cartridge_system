import React, { useState } from 'react';
import { registerUser } from '../api/auth';
import '../App.css';

function RegisterAdmin() {
  const [form, setForm] = useState({ email: '', username: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser({ ...form, role: 'admin' });

      if (res?.data?.message) {
        alert(res.data.message);
        // Optionally redirect: navigate('/login-admin');
      } else {
        alert("Registration succeeded, but no message received.");
      }
    } catch (err) {
      console.error("Registration Error:", err);
      const msg = err?.response?.data || "Unknown error occurred";
      alert("Registration Failed: " + JSON.stringify(msg));
    }
  };

  return (
    <div id="radiant-bg">
      <div className="form-container col-md-6">
        <h2 className="mb-4 text-danger text-center heading-bold">Admin Registration</h2>
        <form onSubmit={handleSubmit} className="border p-4 rounded bg-light shadow">
          <div className="mb-3">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label>Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <button className="btn btn-danger w-100">Register</button>
        </form>
      </div>
    </div>
  );
}

export default RegisterAdmin;
