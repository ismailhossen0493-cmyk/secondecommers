// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verifies JWT and attaches user to req.user
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'You are not logged in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('+role +isActive');
    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'User no longer exists.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ status: 'fail', message: 'Your account has been deactivated.' });
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ status: 'fail', message: 'Password recently changed. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ status: 'fail', message: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'fail', message: 'Token expired. Please log in again.' });
    }
    next(err);
  }
};

/**
 * Optional auth — attaches user if token present, but doesn't block
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch (_) {
    // Ignore token errors for optional auth
  }
  next();
};
