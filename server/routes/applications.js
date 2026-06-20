const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Application = require('../models/Application');

// Middleware to protect routes
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// @route   GET /api/applications
// @desc    Get all applications for a user
router.get('/', auth, async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(apps);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST /api/applications
// @desc    Create an application
router.post('/', auth, async (req, res) => {
  try {
    const { company, role, status, salary, notes } = req.body;
    const newApp = new Application({
      userId: req.user.id,
      company,
      role,
      status,
      salary,
      notes
    });
    const app = await newApp.save();
    res.json(app);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT /api/applications/:id
// @desc    Update an application
router.put('/:id', auth, async (req, res) => {
  try {
    let app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ msg: 'Application not found' });
    if (app.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    app = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(app);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   DELETE /api/applications/:id
// @desc    Delete an application
router.delete('/:id', auth, async (req, res) => {
  try {
    let app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ msg: 'Application not found' });
    if (app.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await Application.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Application removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
