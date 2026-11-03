const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const { FeedbackRepository } = require('../models/Feedback');

const router = express.Router();

router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { analysisId, correctClass, comment } = req.body;

    if (!analysisId || !correctClass) {
      return res.status(400).json({
        error: true,
        message: 'Both analysisId and correctClass are required to submit feedback.',
      });
    }

    const feedback = await FeedbackRepository.create({
      analysisId: String(analysisId),
      correctClass: String(correctClass),
      comment: comment ? String(comment) : '',
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted and logged successfully.',
      feedback,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
