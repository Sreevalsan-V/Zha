const express = require('express');
const router = express.Router();
const path = require('path');

// Serve HTML pages
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/home.html'));
});

router.get('/uploads', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/uploads.html'));
});

router.get('/stats', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/stats.html'));
});

router.get('/upload/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/upload-detail.html'));
});

router.get('/users', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/users.html'));
});

module.exports = router;
