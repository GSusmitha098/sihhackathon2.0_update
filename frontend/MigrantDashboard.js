import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMigrantDetails,
  updateMigrantDetails,
  getMigrantHealthRecords,
  addMigrantHealthRecord,
  getGovtSchemes,
} from '../api';

const MigrantDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [activeTab, setActiveTab] = useState('menu'); // menu, edit, health, schemes
  const [details, setDetails] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    reportName: '',
    hospitalName: '',
    doctorName: '',
    reportFile: null,
  });
  const [schemes, setSchemes] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDetails();
    fetchHealthRecords();
    fetchSchemes();
  }, [token]);

  // ================== FETCH FUNCTIONS ==================
  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getMigrantDetails(token);
      console.log('Fetched migrant details:', res.data); // Debug log
      setDetails(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching migrant details:', err); // Debug log
      setError('Failed to fetch migrant details');
      setLoading(false);
    }
  };
  const saveDetails = async () => {
    try {
      await updateMigrantDetails(token, details);
      setMessage('Details updated successfully ✅');
      setError('');
      setShowPopup(true); // ✅ Show popup

      // ✅ Hide popup after 3 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update details');
    }
  };

  const fetchHealthRecords = async () => {
    try {
      setLoading(true);
      const res = await getMigrantHealthRecords(token);
      setHealthRecords(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch health records');
      setLoading(false);
    }
  };

  const fetchSchemes = async () => {
    try {
      const res = await getGovtSchemes(token);
      setSchemes(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch schemes');
    }
  };

  // ================== HANDLERS ==================
  const handleDetailsChange = (e) =>
    setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleNewRecordChange = (e) => {
    const { name, files, value } = e.target;
    if (name === 'reportFile') {
      setNewRecord(prev => ({ ...prev, reportFile: files[0] }));
    } else {
      setNewRecord(prev => ({ ...prev, [name]: value }));
    }
  };

  

  const addRecord = async () => {
    if (!newRecord.reportName || !newRecord.hospitalName || !newRecord.doctorName || !newRecord.reportFile) {
      setError('Please fill all fields and upload a report');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('reportName', newRecord.reportName);
      formData.append('hospitalName', newRecord.hospitalName);
      formData.append('doctorName', newRecord.doctorName);
      formData.append('reportFile', newRecord.reportFile);

      await addMigrantHealthRecord(token, formData);

      setMessage('Health record added successfully');
      setNewRecord({ reportName: '', hospitalName: '', doctorName: '', reportFile: null });
      fetchHealthRecords(); // refresh records
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to add health record');
    }
  };

  // ================== RENDER ==================
  const renderContent = () => {
    switch (activeTab) {
      case 'edit':
        return (
          <div>
            <h3 style={{ color: '#2c3e50' }}>Edit Details</h3>
            {loading ? <p>Loading...</p> : details ? (
              <>
                {/* Removed debug JSON display */}

                {['firstName', 'lastName', 'aadharNumber', 'phoneNumber', 'fromAddress', 'stay', 'email', 'dob'].map(field => (
                  <div key={field} style={{ marginBottom: 10 }}>
                    <label style={{ fontWeight: 'bold' }}>{field.replace(/([A-Z])/g, ' $1')}:</label><br />
                    <input
                      type={field === 'dob' ? 'date' : field === 'email' ? 'email' : 'text'}
                      name={field}
                      value={field === 'dob' && details.dob ? details.dob.split('T')[0] : details[field] || ''}
                      onChange={handleDetailsChange}
                      style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                    />
                  </div>
                ))}
                <button onClick={saveDetails} style={{ backgroundColor: '#27ae60', color: '#fff', padding: '8px 15px', border: 'none', borderRadius: 5, cursor: 'pointer' }}>Save</button>
              </>
            ) : <p>No details found</p>}
          </div>
        );

      case 'health':
        return (
          <div>
            <h3 style={{ color: '#2980b9' }}>Health Records</h3>
            <div style={{ marginBottom: 15 }}>
              {['reportName', 'hospitalName', 'doctorName'].map(field => (
                <input
                  key={field}
                  placeholder={field.replace(/([A-Z])/g, ' $1')}
                  name={field}
                  value={newRecord[field]}
                  onChange={handleNewRecordChange}
                  style={{ padding: 5, marginRight: 5, borderRadius: 4, border: '1px solid #ccc' }}
                />
              ))}
              <input type="file" name="reportFile" accept="image/*" onChange={handleNewRecordChange} style={{ marginRight: 5 }} />
              <button onClick={addRecord} style={{ backgroundColor: '#16a085', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Add Record</button>
            </div>
            {loading ? <p>Loading...</p> : (
              <ul>
                {healthRecords.length === 0 && <li>No health records</li>}
                {healthRecords.map(r => (
                  <li key={r._id} style={{ marginBottom: 10, padding: 10, border: '1px solid #ccc', borderRadius: 5 }}>
                    <strong>{r.reportName}</strong> | {r.hospitalName} | {r.doctorName} <br />
                    {r.reportFileUrl && <img src={r.reportFileUrl} alt="Report" style={{ width: 200, marginTop: 5 }} />}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

      case 'schemes':
        return (
          <div>
            <h3 style={{ color: '#8e44ad' }}>Government Schemes</h3>
            <ul>
              {schemes.map(s => (
                <li key={s._id} style={{ marginBottom: 15, padding: 10, border: '1px solid #ccc', borderRadius: 6 }}>
                  <p><strong>Scheme Name:</strong> {s["Scheme Name"]}</p>
                  <p><strong>Eligibility:</strong> {s.Eligibility}</p>
                  <p><strong>Year of Implementation:</strong> {s["Year of Implementation"]}</p>
                  <p><strong>SDG:</strong> {s.SDG}</p>
                  <p><strong>Advantages:</strong> {s.Advantages}</p>
                </li>
              ))}
            </ul>
          </div>
        );

      default:
        return (
          <div style={{ marginTop: 50, textAlign: 'center' }}>
            <h2 style={{ color: '#34495e' }}>Migrant Dashboard</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 30 }}>
              <button onClick={() => setActiveTab('edit')} style={{ backgroundColor: '#27ae60', color: '#fff', padding: '20px', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Edit Details</button>
              <button onClick={() => setActiveTab('health')} style={{ backgroundColor: '#16a085', color: '#fff', padding: '20px', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Health Records</button>
              <button onClick={() => setActiveTab('schemes')} style={{ backgroundColor: '#8e44ad', color: '#fff', padding: '20px', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Government Schemes</button>
            </div>
            {message && <p style={{ color: 'green', marginTop: 10 }}>{message}</p>}
            {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
          </div>
        );
    }
  };

  const goBack = () => {
    if (activeTab === 'menu') {
      navigate(-1);
    } else {
      setActiveTab('menu');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: 'auto', marginTop: 20 }}>
      <button onClick={goBack} style={{ marginBottom: 20, padding: '10px 20px', cursor: 'pointer' }}>Back</button>
      {/* ✅ POPUP MESSAGE */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          backgroundColor: '#2ecc71',
          color: 'white',
          padding: '15px 25px',
          borderRadius: 10,
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          fontWeight: 'bold',
          zIndex: 1000,
          animation: 'fadeInOut 3s ease-in-out',
        }}>
          🎉 {message}
        </div>
      )}
      {renderContent()}
    </div>
  );
};

export default MigrantDashboard;
