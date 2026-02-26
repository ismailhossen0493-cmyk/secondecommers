require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();

app.use(helmet());
app.use(mongoSanitize());

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many requests from this IP.',
  })
);

app.use(express.json({ limit: '10kb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/hero', require('./routes/hero'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, _next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
});

const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

mongoose
  .connect(mongoURI, { dbName: 'kin_store' })
  .then(() => {
    const PORT = process.env.PORT || 10000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
