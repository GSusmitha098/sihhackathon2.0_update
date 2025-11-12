const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Migrant = require('../models/Migrant');
const HealthRecord = require('../models/HealthRecord.js');
const authMiddleware = require('../middleware/authMiddleware');

// ================== DOCTOR PROFILE =================
// Get doctor details
router.get('/details', authMiddleware('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne().select('-password'); // return first doctor for demo
    if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    console.error('Error fetching doctor details:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update doctor details
router.put('/details', authMiddleware('doctor'), async (req, res) => {
  try {
    const updated = await Doctor.findOneAndUpdate({}, req.body, { new: true }).select('-password'); 
    res.json(updated);
  } catch (err) {
    console.error('Error updating doctor details:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ================== MIGRANT SEARCH =================
// Search migrant + health records by Aadhaar
router.get('/search', authMiddleware('doctor'), async (req, res) => {
  try {
    const { aadharNumber } = req.query;
    if (!aadharNumber) return res.status(400).json({ msg: 'Aadhaar number is required' });

    const migrant = await Migrant.findOne({ aadharNumber }).select('-password');
    if (!migrant) return res.status(404).json({ msg: 'Migrant not found' });

    const records = await HealthRecord.find({ migrantId: migrant._id });
    res.json({ migrant, records });
  } catch (err) {
    console.error('Error searching migrant records:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ================== FETCH ALL MIGRANTS =================
router.get('/migrants', authMiddleware('doctor'), async (req, res) => {
  try {
    const migrants = await Migrant.find().select('-password'); 
    res.json(migrants);
  } catch (err) {
    console.error('Error fetching all migrants:', err);
    res.status(500).json({ msg: 'Server error while fetching migrants' });
  }
});

module.exports = router;
