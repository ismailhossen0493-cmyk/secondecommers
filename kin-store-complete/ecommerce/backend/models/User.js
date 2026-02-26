// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password by default
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ['customer', 'inventory_manager', 'super_admin'],
        message: 'Role must be customer, inventory_manager, or super_admin',
      },
      default: 'customer',
    },
    address: {
      street: String,
      city: String,
      district: String,
      postalCode: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// ─── Virtual: orders ──────────────────────────────────────────────────────────
UserSchema.virtual('orders', {
  ref: 'Order',
  foreignField: 'user',
  localField: '_id',
});

// ─── Pre-save: Hash password ──────────────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// ─── Methods ──────────────────────────────────────────────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// ─── Role helpers ─────────────────────────────────────────────────────────────
UserSchema.methods.isAdmin = function () {
  return ['inventory_manager', 'super_admin'].includes(this.role);
};

UserSchema.methods.isSuperAdmin = function () {
  return this.role === 'super_admin';
};

UserSchema.methods.canManageProducts = function () {
  return ['inventory_manager', 'super_admin'].includes(this.role);
};

UserSchema.methods.canManageUsers = function () {
  return this.role === 'super_admin';
};

module.exports = mongoose.model('User', UserSchema);
