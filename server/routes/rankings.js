const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Ranking = require('../models/Ranking');
const User = require('../models/User');

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

// @route   POST /api/rankings
// @desc    Save or update a ranking entry
router.post('/', auth, async (req, res) => {
  try {
    const { resumeName, jdName, score } = req.body;
    if (resumeName == null || jdName == null || score == null) {
      return res.status(400).json({ msg: 'resumeName, jdName, and score are required' });
    }
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Check if an entry with the same resume and JD exists for this user
    let ranking = await Ranking.findOne({ 
      userId: req.user.id, 
      resumeName, 
      jdName 
    });

    if (ranking) {
      // Overwrite if same resume and JD
      ranking.score = score;
      ranking.name = user.name;
      ranking.college = user.college || "N/A";
      ranking.createdAt = Date.now();
      await ranking.save();
    } else {
      // Create new if either is different
      ranking = new Ranking({
        userId: req.user.id,
        name: user.name,
        college: user.college || "N/A",
        resumeName,
        jdName,
        score
      });
      await ranking.save();
    }

    res.json(ranking);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET /api/rankings
// @desc    Get global rankings (highest score per user)
router.get('/', auth, async (req, res) => {
  try {
    const rankings = await Ranking.aggregate([
      { $sort: { score: -1, createdAt: -1 } },
      {
        $group: {
          _id: "$userId",
          name: { $first: "$name" },
          college: { $first: "$college" },
          score: { $first: "$score" }
        }
      },
      {
        $project: {
          userId: "$_id",
          name: 1,
          college: 1,
          score: 1,
          _id: 0
        }
      },
      { $sort: { score: -1, name: 1 } }
    ]);

    res.json(rankings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;