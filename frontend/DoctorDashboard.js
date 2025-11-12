import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getDoctorDetails,
  updateDoctorDetails,
  searchMigrantHealthRecords,
  getAllMigrants,
} from '../api';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('menu'); // menu, edit, records, all
  const [details, setDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [searchAadhar, setSearchAadhar] = useState('');
  const [migrant, setMigrant] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [allMigrants, setAllMigrants] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctorDetails();
  }, []);

  const fetchDoctorDetails = async () => {
    try {
      const res = await getDoctorDetails();
      setDetails(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch doctor details');
    }
  };

  const fetchAllMigrants = async () => {
    setLoading(true);
    try {
      const res = await getAllMigrants();
      setAllMigrants(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch migrant list');
      setLoading(false);
    }
  };

  const handleDetailsChange = (e) => {
    setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveDetails = async () => {
    try {
      await updateDoctorDetails(details);
      setMessage('Details updated successfully');
      setEditMode(false);
      setError('');
    } catch (err) {
      console.error(err);
      setMessage('');
      setError('Failed to update details');
    }
  };

  const searchRecords = async () => {
    if (!searchAadhar) {
      setError('Please enter Aadhaar number');
      setMigrant(null);
      setHealthRecords([]);
      return;
    }
    try {
      const res = await searchMigrantHealthRecords(searchAadhar);
      setMigrant(res.data.migrant);
      setHealthRecords(res.data.records);
      setError('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch migrant data');
      setMigrant(null);
      setHealthRecords([]);
    }
  };

  const goBack = () => {
    if (activeTab === 'menu') {
      navigate(-1);
    } else {
      setActiveTab('menu');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'edit':
        return (
          <div>
            <h3 style={{ color: '#2c3e50' }}>Edit Doctor Details</h3>
            {details && (
              <div>
                {['firstName', 'lastName', 'aadharNumber', 'phoneNumber', 'hospitalName', 'hospitalPlace', 'email', 'dob'].map(field => (
                  <div key={field} style={{ marginBottom: 10 }}>
                    <label style={{ fontWeight: 'bold' }}>{field.replace(/([A-Z])/g, ' $1')}:</label><br />
                    <input
                      type={field === 'email' ? 'email' : field === 'dob' ? 'date' : 'text'}
                      name={field}
                      value={field === 'dob' && details.dob ? details.dob.split('T')[0] : details[field] || ''}
                      onChange={handleDetailsChange}
                      style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                    />
                  </div>
                ))}
                <button onClick={saveDetails} style={{ backgroundColor: '#27ae60', color: '#fff', padding: '8px 15px', border: 'none', borderRadius: 5, cursor: 'pointer' }}>Save</button>
                <button onClick={() => setActiveTab('menu')} style={{ marginLeft: 10, padding: '8px 15px', cursor: 'pointer' }}>Back</button>
                {message && <p style={{ color: 'green', marginTop: 10 }}>{message}</p>}
                {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
              </div>
            )}
          </div>
        );
      case 'records':
        return (
          <div>
            <h3 style={{ color: '#2980b9' }}>View Migrant Health Records</h3>
            <input
              type="text"
              placeholder="Enter Aadhaar"
              value={searchAadhar}
              onChange={e => setSearchAadhar(e.target.value)}
              style={{ padding: 5, borderRadius: 4, border: '1px solid #ccc', marginRight: 5 }}
            />
            <button onClick={searchRecords} style={{ backgroundColor: '#16a085', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Search</button>
            <button onClick={() => setActiveTab('menu')} style={{ marginLeft: 10, padding: '6px 12px', cursor: 'pointer' }}>Back</button>
            {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
            {migrant && (
              <div style={{ marginTop: 20, padding: 10, border: '1px solid #ccc', borderRadius: 5 }}>
                <h4>{migrant.firstName} {migrant.lastName}</h4>
                <p><strong>Aadhaar:</strong> {migrant.aadharNumber}</p>
                <p><strong>Phone:</strong> {migrant.phoneNumber}</p>
                <h5>Health Records:</h5>
                <ul>
                  {healthRecords.length === 0 && <li>No records</li>}
                  {healthRecords.map(r => (
                    <li key={r._id} style={{ marginBottom: 5 }}>
                      {r.reportName} | {r.hospitalName} | {r.doctorName} |{' '}
                      <a href={r.reportFileUrl} target="_blank" rel="noreferrer" style={{ color: '#2980b9' }}>View</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 'all':
        return (
          <div>
            <h3 style={{ color: '#8e44ad' }}>All Migrants</h3>
            <button onClick={() => setActiveTab('menu')} style={{ marginBottom: 10, padding: '8px 15px', cursor: 'pointer' }}>Back</button>
            {loading ? <p>Loading...</p> : (
              <table border="1" cellPadding="5" style={{ width: '100%', marginTop: 10, borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f1c40f' }}>
                  <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Aadhaar</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>From</th>
                    <th>Stay</th>
                    <th>DOB</th>
                  </tr>
                </thead>
                <tbody>
                  {allMigrants.map(m => (
                    <tr key={m._id}>
                      <td>{m.firstName}</td>
                      <td>{m.lastName}</td>
                      <td>{m.aadharNumber}</td>
                      <td>{m.phoneNumber}</td>
                      <td>{m.email}</td>
                      <td>{m.fromAddress}</td>
                      <td>{m.stay}</td>
                      <td>{m.dob ? m.dob.split('T')[0] : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      default:
        return (
          <div style={{ marginTop: 50, textAlign: 'center' }}>
            <h2 style={{ color: '#34495e' }}>Doctor Dashboard</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 30 }}>
              <button onClick={() => setActiveTab('edit')} style={{ backgroundColor: '#27ae60', color: '#fff', padding: '20px', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Edit Details</button>
              <button onClick={() => setActiveTab('records')} style={{ backgroundColor: '#16a085', color: '#fff', padding: '20px', border: 'none', borderRadius: 6, cursor: 'pointer' }}>View Records</button>
              <button onClick={() => { setActiveTab('all'); fetchAllMigrants(); }} style={{ backgroundColor: '#8e44ad', color: '#fff', padding: '20px', border: 'none', borderRadius: 6, cursor: 'pointer' }}>View All Migrants</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: 'auto', marginTop: 20 }}>
      <button onClick={goBack} style={{ marginBottom: 20, padding: '10px 20px', cursor: 'pointer' }}>Back</button>
      {renderContent()}
    </div>
  );
};

export default DoctorDashboard;
