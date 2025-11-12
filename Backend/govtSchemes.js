// backend/routes/govtSchemes.js
const express = require('express');
const router = express.Router();
const GovtScheme = require('../models/GovtScheme');

// @GET /api/govt-schemes
router.get('/', async (req, res) => {
  try {
    const schemes = await GovtScheme.find();
    res.json(schemes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while fetching schemes' });
  }
});

module.exports = router;
