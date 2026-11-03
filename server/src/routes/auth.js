const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserRepository } = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: true,
        message: 'Password must be at least 6 characters.',
      });
    }

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: true,
        message: 'An account with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await UserRepository.create({
      name: name.trim(),
      email: email.trim(),
      passwordHash,
    });

    const secret = process.env.JWT_SECRET || 'marine_debris_jwt_secret_2026_super_secure_key';
    const userId = user._id ? user._id.toString() : user.id;

    const token = jwt.sign(
      {
        id: userId,
        email: user.email,
        name: user.name,
      },
      secret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Email and password are required.',
      });
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password.',
      });
    }

    const secret = process.env.JWT_SECRET || 'marine_debris_jwt_secret_2026_super_secure_key';
    const userId = user._id ? user._id.toString() : user.id;

    const token = jwt.sign(
      {
        id: userId,
        email: user.email,
        name: user.name,
      },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({
    user: req.user,
  });
});

module.exports = router;
