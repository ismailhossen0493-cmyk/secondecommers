// backend/controllers/userController.js
const User = require('../models/User');

exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ status: 'success', total, data: { users } });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found.' });
    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

/**
 * Super admin: promote/demote user role
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowed = ['customer', 'inventory_manager', 'super_admin'];
    if (!allowed.includes(role)) {
      return res.status(400).json({ status: 'fail', message: `Invalid role. Must be: ${allowed.join(', ')}` });
    }

    // Prevent self-demotion
    if (req.params.id === req.user._id.toString() && role !== 'super_admin') {
      return res.status(400).json({ status: 'fail', message: 'You cannot demote yourself.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found.' });

    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};
