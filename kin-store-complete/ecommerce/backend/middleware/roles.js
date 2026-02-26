// backend/middleware/roles.js

/**
 * Restricts route access to specific roles.
 * Usage: restrictTo('super_admin', 'inventory_manager')
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
    }
    next();
  };
};

/**
 * Convenience: Admin-only (inventory_manager OR super_admin)
 */
exports.adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ status: 'fail', message: 'Not authenticated.' });
  }
  if (!['inventory_manager', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ status: 'fail', message: 'Admin access required.' });
  }
  next();
};

/**
 * Convenience: Super admin only
 */
exports.superAdminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ status: 'fail', message: 'Not authenticated.' });
  }
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ status: 'fail', message: 'Super admin access required.' });
  }
  next();
};
