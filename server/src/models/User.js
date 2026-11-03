const mongoose = require('mongoose');
const { getIsConnected } = require('../config/db');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseUser = mongoose.model('User', userSchema);

// In-memory fallback collection
const inMemoryUsers = new Map();

class UserRepository {
  static async findByEmail(email) {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (getIsConnected()) {
      try {
        return await MongooseUser.findOne({ email: cleanEmail });
      } catch (e) {
        console.warn('[User] Falling back to in-memory findByEmail');
      }
    }
    return inMemoryUsers.get(cleanEmail) || null;
  }

  static async findById(id) {
    if (getIsConnected()) {
      try {
        return await MongooseUser.findById(id);
      } catch (e) {
        console.warn('[User] Falling back to in-memory findById');
      }
    }
    for (const user of inMemoryUsers.values()) {
      if (user._id === id || user.id === id) {
        return user;
      }
    }
    return null;
  }

  static async create({ name, email, passwordHash }) {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (getIsConnected()) {
      try {
        const doc = new MongooseUser({ name, email: cleanEmail, passwordHash });
        await doc.save();
        return doc;
      } catch (e) {
        console.warn('[User] Falling back to in-memory create');
      }
    }
    const memUser = {
      _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      id: undefined,
      name,
      email: cleanEmail,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memUser.id = memUser._id;
    inMemoryUsers.set(cleanEmail, memUser);
    return memUser;
  }
}

module.exports = {
  User: MongooseUser,
  UserRepository,
};
