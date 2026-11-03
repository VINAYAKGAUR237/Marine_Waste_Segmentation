const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: true,
      message: 'Access denied. Missing or malformed Bearer token.',
    });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'marine_debris_jwt_secret_2026_super_secure_key';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { id, email, name }
    next();
  } catch (err) {
    return res.status(401).json({
      error: true,
      message: 'Invalid or expired authentication token. Please log in again.',
    });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'marine_debris_jwt_secret_2026_super_secure_key';
    try {
      req.user = jwt.verify(token, secret);
      return next();
    } catch (err) {
      // Fall through to guest
    }
  }
  req.user = { id: 'guest', name: 'Guest User', email: 'guest@marinedebris.ai' };
  next();
}

module.exports = { requireAuth, optionalAuth };
