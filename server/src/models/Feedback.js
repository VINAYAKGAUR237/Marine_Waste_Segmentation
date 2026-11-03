const mongoose = require('mongoose');
const { getIsConnected } = require('../config/db');

const feedbackSchema = new mongoose.Schema({
  analysisId: {
    type: String,
    required: true,
    index: true,
  },
  correctClass: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    default: '',
  },
  userId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MongooseFeedback = mongoose.model('Feedback', feedbackSchema);

// In-memory fallback
const inMemoryFeedbacks = [];

class FeedbackRepository {
  static async create({ analysisId, correctClass, comment, userId }) {
    if (getIsConnected()) {
      try {
        const doc = new MongooseFeedback({
          analysisId,
          correctClass,
          comment: comment || '',
          userId: userId || null,
          createdAt: new Date(),
        });
        await doc.save();
        return doc;
      } catch (e) {
        console.warn('[Feedback] Falling back to in-memory create');
      }
    }

    const item = {
      _id: 'feedback_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      analysisId,
      correctClass,
      comment: comment || '',
      userId: userId || null,
      createdAt: new Date(),
    };
    inMemoryFeedbacks.push(item);
    return item;
  }

  static async findByAnalysisId(analysisId) {
    if (getIsConnected()) {
      try {
        return await MongooseFeedback.find({ analysisId }).lean();
      } catch (e) {
        console.warn('[Feedback] Falling back to in-memory findByAnalysisId');
      }
    }
    return inMemoryFeedbacks.filter((f) => f.analysisId === analysisId);
  }
}

module.exports = {
  Feedback: MongooseFeedback,
  FeedbackRepository,
};
