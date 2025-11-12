const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const HealthRecord = require('../models/HealthRecord.js');
const authMiddleware = require('../middleware/authMiddleware'); // authentication middleware

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Add health record
router.post('/add', authMiddleware(), upload.single('reportFile'), async (req, res) => {
  try {
    const { reportName, hospitalName, doctorName } = req.body;
    const migrantId = req.user.id;

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const record = new HealthRecord({
      migrantId,
      reportName,
      hospitalName,
      doctorName,
      reportFileUrl: `${req.protocol}://${req.get('host')}${record.reportFileUrl}`,
    });

    await record.save();
    res.status(201).json({ message: 'Health record saved', data: record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get health records of logged-in migrant
router.get('/', authMiddleware(), async (req, res) => {
  try {
    const migrantId = req.user.id;
    const records = await HealthRecord.find({ migrantId }).sort({ uploadedAt: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
