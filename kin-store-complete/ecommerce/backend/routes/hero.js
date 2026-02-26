// backend/routes/hero.js
const express = require('express');
const router = express.Router();
const HeroSlide = require('../models/HeroSlide');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roles');

// Public: get active slides
router.get('/', async (req, res, next) => {
  try {
    const slides = await HeroSlide.find({ isActive: true }).sort('order');
    res.json({ status: 'success', data: { slides } });
  } catch (err) { next(err); }
});

// Admin: get all
router.get('/all', protect, adminOnly, async (req, res, next) => {
  try {
    const slides = await HeroSlide.find().sort('order');
    res.json({ status: 'success', data: { slides } });
  } catch (err) { next(err); }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const slide = await HeroSlide.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ status: 'success', data: { slide } });
  } catch (err) { next(err); }
});

router.patch('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const slide = await HeroSlide.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!slide) return res.status(404).json({ status: 'fail', message: 'Slide not found.' });
    res.json({ status: 'success', data: { slide } });
  } catch (err) { next(err); }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    await HeroSlide.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Slide deleted.' });
  } catch (err) { next(err); }
});

// Reorder slides
router.patch('/reorder', protect, adminOnly, async (req, res, next) => {
  try {
    const { order } = req.body; // [{ id, order }, ...]
    await Promise.all(order.map(({ id, order: o }) =>
      HeroSlide.findByIdAndUpdate(id, { order: o })
    ));
    res.json({ status: 'success', message: 'Slides reordered.' });
  } catch (err) { next(err); }
});

module.exports = router;
