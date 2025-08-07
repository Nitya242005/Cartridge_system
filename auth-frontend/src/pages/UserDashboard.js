import React, { useState, useEffect, useCallback } from 'react';
import './UserDashboard.css';
import defaultProfile from '../assets/default-profile.png';
import { BASE_URL } from '../api/config'; // ✅ Add this


function UserDashboard() {
  const [storedUsername, setStoredUsername] = useState('');
  const [storedEmail, setStoredEmail] = useState('');
  const token = localStorage.getItem('access_token');

  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: '',
    printerId: '',
    printerModel: '',
    cartridgeModel: '',
    date: ''
  });

  const [userRequests, setUserRequests] = useState([]);

  // 🔸 Mapping for autofill
  const printerToCartridgeMap = {
    'hp m202dw': '88X',
    'hp p1566': '78A',
    'hp laser jet p1566': 'HP CE 278A 78A',
    'hp laserjet pro m202dw': '88 A(R)',
    'hp laserjet p2055d': '505A (R)',
    'hp laserjet m202dw': '88XC (R)',
    'hp 1566': 'HP 78A (R)'
  };

  // 🔸 Normalize string (case + space insensitive)
  const normalize = (str) => str.toLowerCase().replace(/\s+/g, '');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfileImage(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Autofill cartridge model when printer model changes
    if (name === 'printerModel') {
      const normalizedPrinter = normalize(value);
      const matchedKey = Object.keys(printerToCartridgeMap).find(key => normalize(key) === normalizedPrinter);
      const matchedCartridge = matchedKey ? printerToCartridgeMap[matchedKey] : '';
      setFormData(prev => ({
        ...prev,
        [name]: value,
        cartridgeModel: matchedCartridge || prev.cartridgeModel  // only overwrite if match found
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const fetchUserRequests = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}user/requests/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      setUserRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      setUserRequests([]);
    }
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      const res = await fetch(`${BASE_URL}user/requests/${id}/delete/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert("Request deleted successfully!");
        fetchUserRequests();
      } else {
        alert("Failed to delete request.");
      }
    } catch {
      alert("Error deleting request.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      designation: formData.designation,
      department: formData.department,
      printer_id: formData.printerId,
      printer_model: formData.printerModel,
      cartridge_model: formData.cartridgeModel,
      date_of_requisition: formData.date
    };

    try {
      const res = await fetch(`${BASE_URL}save-request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Request submitted successfully!');
        setFormData({
          name: '',
          designation: '',
          department: '',
          printerId: '',
          printerModel: '',
          cartridgeModel: '',
          date: ''
        });
        fetchUserRequests();
      } else {
        alert('Failed: ' + JSON.stringify(data));
      }
    } catch {
      alert('Error connecting to backend.');
    }
  };

  useEffect(() => {
    setStoredUsername(localStorage.getItem('username') || '');
    setStoredEmail(localStorage.getItem('email') || '');
    fetchUserRequests();
  }, [fetchUserRequests]);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="profile-section">
          <img src={profileImage || defaultProfile} alt="Profile" className="profile-pic" />
          <input type="file" accept="image/*" onChange={handleImageChange} className="form-control mt-2" />
          <h5 className="mt-3">{storedUsername || 'Username not found'}</h5>
          <p>{storedEmail || 'Email not found'}</p>
          <button className="btn btn-outline-danger mt-2" onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <h3 className="mb-4 text-primary heading-bold">🖨️ Cartridge Request Form</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
          <input name="designation" value={formData.designation} onChange={handleChange} placeholder="Designation" required />
          <input name="department" value={formData.department} onChange={handleChange} placeholder="Department" required />
          <input name="printerId" value={formData.printerId} onChange={handleChange} placeholder="Printer ID" required />
          <input name="printerModel" value={formData.printerModel} onChange={handleChange} placeholder="Printer Model" required />
          <input name="cartridgeModel" value={formData.cartridgeModel} onChange={handleChange} placeholder="Cartridge Model" required />
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          <button type="submit" className="btn btn-success">Submit Request</button>
        </form>

        <hr className="my-5" />

        <h4 className="text-secondary heading-bold">📦 Submitted Requests</h4>
        {userRequests.length === 0 ? (
          <p>No requests submitted yet.</p>
        ) : (
          userRequests.map((req) => (
            <div key={req.id} className="card-shadow mb-3 p-3">
              <div className="d-flex flex-wrap gap-3">
                <span><strong>Name:</strong> {req.name}</span>
                <span><strong>Designation:</strong> {req.designation}</span>
                <span><strong>Department:</strong> {req.department}</span>
                <span><strong>Printer ID:</strong> {req.printer_id}</span>
                <span><strong>Printer Model:</strong> {req.printer_model}</span>
                <span><strong>Cartridge:</strong> {req.cartridge_model}</span>
                <span><strong>Date:</strong> {req.date_of_requisition}</span>
                <span><strong>Status:</strong> {req.status}</span>
                {req.status === 'Issued' && <span><strong>Issued Date:</strong> {req.issued_date}</span>}
                {req.status === 'Pending' && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(req.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default UserDashboard;
