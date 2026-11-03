const mongoose = require('mongoose');
const { getIsConnected } = require('../config/db');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  detectedClasses: {
    type: [String],
    default: [],
  },
  coveragePercent: {
    type: Number,
    default: 0,
  },
  processingTimeMs: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

const MongooseAnalysis = mongoose.model('Analysis', analysisSchema);

// In-memory fallback
const inMemoryAnalyses = [];

class AnalysisRepository {
  static async create({ userId, fileName, detectedClasses, coveragePercent, processingTimeMs }) {
    if (getIsConnected()) {
      try {
        const doc = new MongooseAnalysis({
          userId: String(userId),
          fileName,
          detectedClasses,
          coveragePercent,
          processingTimeMs,
          createdAt: new Date(),
        });
        await doc.save();
        return doc;
      } catch (e) {
        console.warn('[Analysis] Falling back to in-memory create');
      }
    }

    const item = {
      _id: 'analysis_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId: String(userId),
      fileName,
      detectedClasses: Array.isArray(detectedClasses) ? detectedClasses : [],
      coveragePercent: Number(coveragePercent) || 0,
      processingTimeMs: Number(processingTimeMs) || 0,
      createdAt: new Date(),
    };
    inMemoryAnalyses.push(item);
    return item;
  }

  static async findByUserId(userId) {
    if (getIsConnected()) {
      try {
        return await MongooseAnalysis.find({ userId: String(userId) }).sort({ createdAt: -1 }).lean();
      } catch (e) {
        console.warn('[Analysis] Falling back to in-memory findByUserId');
      }
    }

    return inMemoryAnalyses
      .filter((a) => a.userId === String(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async findById(id) {
    if (getIsConnected()) {
      try {
        return await MongooseAnalysis.findById(id).lean();
      } catch (e) {
        console.warn('[Analysis] Falling back to in-memory findById');
      }
    }

    return inMemoryAnalyses.find((a) => a._id === id || a.id === id) || null;
  }
}

module.exports = {
  Analysis: MongooseAnalysis,
  AnalysisRepository,
};
