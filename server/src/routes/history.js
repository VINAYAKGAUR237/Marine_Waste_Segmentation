const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { AnalysisRepository } = require('../models/Analysis');

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const list = await AnalysisRepository.findByUserId(req.user.id);
    res.json({
      success: true,
      count: list.length,
      history: list,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
