// src/api.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// ================== AUTH ==================

// Login (migrant or doctor)
export const loginUser = (actor, email, password) => {
  return axios.post(`${BASE_URL}/auth/login/${actor}`, { email, password });
};

// Register (migrant or doctor)
export const registerUser = (actor, data) => {
  return axios.post(`${BASE_URL}/auth/register/${actor}`, data);
};

// ================== DOCTOR APIs ==================
export const getDoctorDetails = (token) =>
  axios.get(`${BASE_URL}/doctor/details`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

export const updateDoctorDetails = (token, data) =>
  axios.put(`${BASE_URL}/doctor/details`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const searchMigrantHealthRecords = (token, aadharNumber) => {
  if (!/^\d{12}$/.test(aadharNumber)) {
    return Promise.reject({
      response: { data: { msg: 'Invalid Aadhaar number (must be 12 digits)' } },
    });
  }

  return axios.get(`${BASE_URL}/doctor/search`, {
    params: { aadharNumber },
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Fetch all migrants
export const getAllMigrants = (token) =>
  axios.get(`${BASE_URL}/doctor/migrants`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ================== MIGRANT APIs ==================
export const getMigrantDetails = (token) =>
  axios.get(`${BASE_URL}/migrant/details`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getMigrantHealthRecords = (token) =>
  axios.get(`${BASE_URL}/migrant/health-records`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getGovtSchemes = (token) =>
  axios.get(`${BASE_URL}/migrant/govt-schemes`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateMigrantDetails = (token, data) =>
  axios.put(`${BASE_URL}/migrant/details`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addMigrantHealthRecord = (token, data) =>
  axios.post(`${BASE_URL}/migrant/health-record`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
