require('dotenv').config();

const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// Try to start with HTTPS using self-signed certificate.
// In production, HTTPS should ALWAYS be used — never serve over plain HTTP in a live environment.
const certPath = path.join(__dirname, 'cert.pem');
const keyPath = path.join(__dirname, 'key.pem');

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  const sslOptions = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
  };

  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Server running on port ${PORT} (HTTPS)`);
  });
} else {
  // Fall back to plain HTTP if certificate files are missing
  console.warn('Warning: SSL certificate files not found. Running on plain HTTP. Do NOT use this in production!');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
