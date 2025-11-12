// backend/routes/migrant.js
const express = require('express');
const router = express.Router();
const Migrant = require('../models/Migrant');
const HealthRecord = require('../models/HealthRecord.js');
const GovtScheme = require('../models/GovtScheme');
const authMiddleware = require('../middleware/authMiddleware'); // authentication middleware
const multer = require('multer');
const path = require('path');

// Configure multer storage for uploaded reports
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Get migrant details
router.get('/details', authMiddleware('migrant'), async (req, res) => {
  try {
    const migrant = await Migrant.findById(req.user.id).select('-password');
    res.json(migrant);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update migrant details
router.put('/details', authMiddleware('migrant'), async (req, res) => {
  try {
    const updateData = req.body;
    await Migrant.findByIdAndUpdate(req.user.id, updateData);
    res.json({ msg: 'Details updated' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Add health record (accept file upload 'reportFile')
router.post('/health-record', authMiddleware('migrant'), upload.single('reportFile'), async (req, res) => {
  try {
    const { reportName, hospitalName, doctorName } = req.body;

    // If frontend sent a file, multer will populate req.file
    let reportFileUrl = req.body.reportFileUrl || null;
    if (req.file) {
      // serve uploaded files from /uploads via server.js static middleware
      reportFileUrl = `/uploads/${req.file.filename}`;
    }

    const record = new HealthRecord({
      migrantId: req.user.id,
      reportName,
      hospitalName,
      doctorName,
      reportFileUrl,
    });
    await record.save();
    res.status(201).json({ msg: 'Health record added', data: record });
  } catch (err) {
    console.error('Error saving health record:', err);
    res.status(500).send('Server error');
  }
});

// Get all health records of migrant
router.get('/health-records', authMiddleware('migrant'), async (req, res) => {
  try {
    const records = await HealthRecord.find({ migrantId: req.user.id });
    res.json(records);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get govt schemes (optionally filter by eligibility)
router.get('/govt-schemes', authMiddleware('migrant'), async (req, res) => {
  try {
    // For simplicity, return all schemes
    const schemes = await GovtScheme.find();
    res.json(schemes);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;