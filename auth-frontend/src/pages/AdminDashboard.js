import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import defaultProfile from '../assets/default-profile.png';
import './AdminDashboard.css';
import { BASE_URL } from '../api/config';

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedItem, setEditedItem] = useState({ make: '', model: '', quantity: '' });
  const [newStockItem, setNewStockItem] = useState({ make: '', model: '', quantity: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [activeTab, setActiveTab] = useState('cartridge');

  const username = localStorage.getItem('username') || 'Admin';
  const token = localStorage.getItem('token');

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfileImage(URL.createObjectURL(file));
  };

  const fetchRequests = useCallback(() => {
    axios.get(`${BASE_URL}admin/requests/`, { headers })

      .then(res => setRequests(res.data))
      .catch(err => console.error(err));
  }, [headers]);

  const fetchAcceptedRequests = useCallback(() => {
    axios.get(`${BASE_URL}admin/requests/accepted/`, { headers })

      .then(res => setAcceptedRequests(res.data))
      .catch(err => console.error(err));
  }, [headers]);

  const fetchStock = useCallback(() => {
    axios.get(`${BASE_URL}admin/stock/`, { headers })

      .then(res => setStockItems(res.data))
      .catch(err => console.error(err));
  }, [headers]);

  const fetchStockLogs = useCallback(() => {
    axios.get(`${BASE_URL}admin/stock-updates/`, { headers })

      .then(res => setStockLogs(res.data))
      .catch(err => console.error(err));
  }, [headers]);

  useEffect(() => {
    fetchRequests();
    fetchAcceptedRequests();
    fetchStock();
    fetchStockLogs();
  }, [fetchRequests, fetchAcceptedRequests, fetchStock, fetchStockLogs]);

  const toggleTab = (tabName) => {
    setActiveTab(prev => (prev === tabName ? null : tabName));
  };

  const handleAccept = (requestId) => {
    axios.post(`${BASE_URL}admin/requests/${requestId}/accept/`, {}, { headers })

      .then(() => {
        alert('✅ Request Accepted!');
        fetchRequests();
        fetchAcceptedRequests();
        fetchStock();
      })
      .catch(err => {
        alert('❌ Failed to accept request: ' + (err.response?.data?.error || 'Server error'));
      });
  };

  const handleEditClick = (item) => {
    setEditingItemId(item.id);
    setEditedItem({ make: item.make, model: item.model, quantity: item.quantity });
  };

  const handleEditChange = (e) => {
    setEditedItem({ ...editedItem, [e.target.name]: e.target.value });
  };

  const handleEditSave = (id) => {
    axios.patch(`${BASE_URL}admin/stock/${id}/update/`, {
      make: editedItem.make,
      model: editedItem.model,
      quantity: parseInt(editedItem.quantity)
    }, { headers })
      .then((res) => {
        alert(res.data.message);
        setEditingItemId(null);
        fetchStock();
        fetchStockLogs();
      })
      .catch(err => {
        alert('❌ Failed to update stock item: ' + (err.response?.data?.error || 'Server Error'));
      });
  };

  const handleAddStock = () => {
    if (!newStockItem.make || !newStockItem.model || !newStockItem.quantity) {
      alert("All fields are required.");
      return;
    }

    axios.post(`${BASE_URL}admin/stock/add/`, {
      make: newStockItem.make,
      model: newStockItem.model,
      quantity: parseInt(newStockItem.quantity)
    }, { headers })
      .then(() => {
        alert("✅ New stock added!");
        setNewStockItem({ make: '', model: '', quantity: '' });
        fetchStock();
        fetchStockLogs();
      })
      .catch(() => alert("❌ Failed to add stock."));
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="text-center">
          <img src={profileImage || defaultProfile} alt="Admin Profile" className="profile-img mb-2" />
          <input type="file" accept="image/*" onChange={handleImageChange} className="form-control mt-2" />
          <h5 className="mt-3">{username}</h5>
          <button
            className="btn btn-outline-danger mt-2"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            🚪 Logout
          </button>
        </div>
        <hr />
        <p className={`sidebar-option ${activeTab === 'cartridge' ? 'active' : ''}`} onClick={() => toggleTab('cartridge')}>
          📁 Cartridge Requested
        </p>
        <p className={`sidebar-option ${activeTab === 'stock' ? 'active' : ''}`} onClick={() => toggleTab('stock')}>
          🛢️ Stock
        </p>
        <p className={`sidebar-option ${activeTab === 'accepted' ? 'active' : ''}`} onClick={() => toggleTab('accepted')}>
          ✅ Accepted Requests
        </p>
      </div>

      <div className="admin-main">
        {activeTab === 'cartridge' && (
          <>
            <h3 className="heading-bold mb-3">Cartridge Requests</h3>
            {requests.length === 0 ? <p>No requests found.</p> : (
              requests.map((req, idx) => (
                <div key={idx} className="card-shadow">
                  <div className="d-flex flex-wrap align-items-center gap-3">
                    <span><strong>{req.name}</strong></span>
                    <span><strong>Department:</strong> {req.department}</span>
                    <span><strong>Printer:</strong> {req.printer_model} ({req.printer_id})</span>
                    <span><strong>Cartridge:</strong> {req.cartridge_model}</span>
                    <span><strong>Date:</strong> {req.date_of_requisition}</span>
                    <button className="btn btn-success btn-sm" onClick={() => handleAccept(req.id)}>Accept Request</button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'accepted' && (
          <>
            <h3 className="heading-bold mb-3">Accepted Requests</h3>
            {acceptedRequests.length === 0 ? <p>No request accepted.</p> : (
              acceptedRequests.map((req, idx) => (
                <div key={idx} className="card-shadow">
                  <div className="d-flex flex-wrap align-items-center gap-3">
                    <span><strong>{req.name}</strong></span>
                    <span><strong>Cartridge:</strong> {req.cartridge_model}</span>
                    <span><strong>Status:</strong> Issued</span>
                    <span><strong>Issued Date:</strong> {req.issued_date}</span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'stock' && (
          <>
            <h3 className="heading-bold mb-3">Cartridge Stock</h3>

            <div className="mb-4">
              <h5>Add New Stock</h5>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <input
                  type="text"
                  placeholder="Make"
                  className="form-control"
                  style={{ maxWidth: '150px' }}
                  value={newStockItem.make}
                  onChange={(e) => setNewStockItem({ ...newStockItem, make: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Model"
                  className="form-control"
                  style={{ maxWidth: '150px' }}
                  value={newStockItem.model}
                  onChange={(e) => setNewStockItem({ ...newStockItem, model: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  className="form-control"
                  style={{ maxWidth: '120px' }}
                  value={newStockItem.quantity}
                  onChange={(e) => setNewStockItem({ ...newStockItem, quantity: e.target.value })}
                />
                <button className="btn btn-success" onClick={handleAddStock}>➕ Add Record</button>
              </div>
            </div>

            {stockItems.length === 0 ? <p>No stock available.</p> : (
              <table className="table table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Make</th>
                    <th>Model</th>
                    <th>Quantity</th>
                    <th>Modify</th>
                  </tr>
                </thead>
                <tbody>
                  {stockItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {editingItemId === item.id ? (
                          <input name="make" value={editedItem.make} onChange={handleEditChange} className="form-control" />
                        ) : item.make}
                      </td>
                      <td>
                        {editingItemId === item.id ? (
                          <input name="model" value={editedItem.model} onChange={handleEditChange} className="form-control" />
                        ) : item.model}
                      </td>
                      <td>
                        {editingItemId === item.id ? (
                          <input name="quantity" type="number" value={editedItem.quantity} onChange={handleEditChange} className="form-control" />
                        ) : item.quantity}
                      </td>
                      <td>
                        {editingItemId === item.id ? (
                          <button className="btn btn-primary btn-sm" onClick={() => handleEditSave(item.id)}>Save</button>
                        ) : (
                          <button className="btn btn-warning btn-sm" onClick={() => handleEditClick(item)}>Modify</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {stockLogs.filter(log => log.quantity_added > 0).length > 0 && (
              <div className="mt-5">
                <h5 className="mb-3">📌 Updated Quantity Logs</h5>
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Make</th>
                      <th>Model</th>
                      <th>Quantity Added</th>
                      <th>Date</th>
                      <th>PO Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockLogs
                      .filter(log => log.quantity_added > 0)
                      .map((log, idx) => (
                        <tr key={idx}>
                          <td>{log.make}</td>
                          <td>{log.model}</td>
                          <td>{log.quantity_added}</td>
                          <td>{log.updated_on}</td>
                          <td>{log.po_number || "N/A"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
