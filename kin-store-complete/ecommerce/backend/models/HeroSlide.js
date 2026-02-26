// backend/models/HeroSlide.js
const mongoose = require('mongoose');

const HeroSlideSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    ctaText: { type: String, default: 'Shop Now' },
    ctaLink: { type: String, default: '/shop' },
    imageUrl: { type: String, required: true },
    mobileImageUrl: String, // Optional mobile-optimized version
    overlayColor: { type: String, default: '#000000' },
    overlayOpacity: { type: Number, default: 0.4, min: 0, max: 1 },
    textColor: { type: String, default: '#ffffff' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    interval: { type: Number, default: 5000 }, // ms — default 5 seconds
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

HeroSlideSchema.index({ order: 1, isActive: 1 });

module.exports = mongoose.model('HeroSlide', HeroSlideSchema);
