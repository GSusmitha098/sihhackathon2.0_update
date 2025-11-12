import React, { useState } from 'react';
import axios from 'axios';

const RegisterForm = ({ actor, onBack, onRegisterSuccess }) => {
  const initialMigrantState = { firstName: '', lastName: '', aadharNumber: '', phoneNumber: '', fromAddress: '', stay: '', email: '', dob: '', password: '', confirmPassword: '' };
  const initialDoctorState = { firstName: '', lastName: '', aadharNumber: '', phoneNumber: '', hospitalName: '', hospitalPlace: '', email: '', dob: '', password: '', confirmPassword: '' };

  const [formData, setFormData] = useState(actor === 'migrant' ? initialMigrantState : initialDoctorState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const displayActor = actor ? (actor.charAt(0).toUpperCase() + actor.slice(1)) : 'User';

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validateForm = () => {
    for (const key in formData) {
      if (formData[key] === '') {
        setError(`Please enter ${key}`);
        return false;
      }
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const dataToSend = { ...formData };
    delete dataToSend.confirmPassword;

    try {
      const endpoint =
        actor === 'migrant'
          ? 'http://localhost:5000/api/auth/register/migrant'
          : 'http://localhost:5000/api/auth/register/doctor';

      await axios.post(endpoint, dataToSend);

      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Register as {displayActor}</h2>

      <form onSubmit={handleSubmit} style={formStyle}>
        <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
        <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
        <InputField label="Aadhar Number" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} />
        <InputField label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />

        {actor === 'migrant' ? (
          <>
            <InputField label="From Address" name="fromAddress" value={formData.fromAddress} onChange={handleChange} />
            <InputField label="Stay" name="stay" value={formData.stay} onChange={handleChange} />
          </>
        ) : (
          <>
            <InputField label="Hospital Name" name="hospitalName" value={formData.hospitalName} onChange={handleChange} />
            <InputField label="Hospital Place" name="hospitalPlace" value={formData.hospitalPlace} onChange={handleChange} />
          </>
        )}

        <InputField label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />
        <InputField label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} />

        <PasswordField label="Password" name="password" value={formData.password} show={showPassword} onChange={handleChange} toggleShow={() => setShowPassword(!showPassword)} />
        <PasswordField label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} show={showConfirmPassword} onChange={handleChange} toggleShow={() => setShowConfirmPassword(!showConfirmPassword)} />

        {error && <p style={errorStyle}>{error}</p>}

        <div style={buttonContainerStyle}>
          <button type="submit" style={submitButtonStyle}>Register</button>
          <button type="button" onClick={onBack} style={backButtonStyle}>Back</button>
        </div>
      </form>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = 'text' }) => (
  <div>
    <label>{label}:</label>
    <input name={name} value={value} onChange={onChange} type={type} style={inputStyle} />
  </div>
);

const PasswordField = ({ label, name, value, show, onChange, toggleShow }) => (
  <div style={{ position: 'relative' }}>
    <label>{label}:</label>
    <input type={show ? 'text' : 'password'} name={name} value={value} onChange={onChange} style={inputStyle} />
    <button type="button" onClick={toggleShow} style={toggleButtonStyle}>{show ? 'Hide' : 'Show'}</button>
  </div>
);

// Styles
const containerStyle = { maxWidth: 500, margin: '50px auto', padding: 40, backgroundColor: '#f5f6fa', borderRadius: 12, boxShadow: '0 8px 20px rgba(0,0,0,0.15)', fontFamily: 'Arial, sans-serif' };
const titleStyle = { textAlign: 'center', marginBottom: 30, color: '#2c3e50' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: 15 };
const inputStyle = { width: '100%', padding: '10px 12px', marginTop: 5, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 };
const toggleButtonStyle = { position: 'absolute', right: 10, top: 32, padding: '5px 10px', border: 'none', borderRadius: 6, backgroundColor: '#2980b9', color: '#fff', cursor: 'pointer', fontSize: 12 };
const submitButtonStyle = { flex: 1, padding: 12, border: 'none', borderRadius: 6, backgroundColor: '#27ae60', color: '#fff', fontSize: 16, cursor: 'pointer' };
const backButtonStyle = { flex: 1, marginLeft: 10, padding: 12, border: 'none', borderRadius: 6, backgroundColor: '#c0392b', color: '#fff', fontSize: 16, cursor: 'pointer' };
const buttonContainerStyle = { display: 'flex', justifyContent: 'space-between', marginTop: 20 };
const errorStyle = { color: 'red', textAlign: 'center' };

export default RegisterForm;
