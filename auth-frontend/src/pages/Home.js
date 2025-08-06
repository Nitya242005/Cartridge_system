import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div id="radiant-bg">
      <div className="container text-center mt-5">
        <h2 className="mb-4 text-primary">IT Consumables Monitoring System</h2>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="d-grid gap-3">
              <button
                onClick={() => navigate('/login-user')}
                className="btn btn-outline-primary btn-lg" style={{ borderWidth: '3px' }}
              >
                🔑 User Login
              </button>
              <button
                onClick={() => navigate('/login-admin')}
                className="btn btn-outline-danger btn-lg" style={{ borderWidth: '3px' }}
              >
                🔐 Admin Login
              </button>
              <hr />
              <h5>First time using?</h5>
              <button
                onClick={() => navigate('/register-user')}
                className="btn" style={{ backgroundColor: 'lightgreen' }}
              >
                📝 Register as User
              </button>
              <button
                onClick={() => navigate('/register-admin')}
                className="btn btn-warning"
                style={{ backgroundColor: 'lightyellow' }}
              >
                🛠️ Register as Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
