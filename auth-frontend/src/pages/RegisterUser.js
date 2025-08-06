import React, { useState } from 'react';
import { registerUser } from '../api/auth';
import '../App.css';

function RegisterUser() {
  const [form, setForm] = useState({ email: '', username: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser({ ...form, role: 'user' });
      alert(res.data.message);
    } catch (err) {
      alert("Registration Failed: " + JSON.stringify(err.response.data));
    }
  };

  return (
    <div id="radiant-bg">
      <div className="form-container col-md-6">
        <h2 className="mb-4 text-success text-center heading-bold">User Registration</h2>
        <form onSubmit={handleSubmit} className="border p-4 rounded bg-light shadow">
          <div className="mb-3">
            <label>Email</label>
            <input name="email" onChange={handleChange} className="form-control" required />
          </div>
          <div className="mb-3">
            <label>Username</label>
            <input name="username" onChange={handleChange} className="form-control" required />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input type="password" name="password" onChange={handleChange} className="form-control" required />
          </div>
          <button className="btn btn-success w-100">Register</button>
        </form>
      </div>
    </div>
  );
}

export default RegisterUser;
