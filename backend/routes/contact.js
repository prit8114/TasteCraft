const express = require('express');
const router = express.Router();

// POST /api/contact — validate and accept contact form submission
router.post('/', (req, res) => {
  const { name, email, message } = req.body;
  const errors = [];

  // Validate name
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters.');
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('A valid email address is required.');
  }

  // Validate message
  if (!message || message.trim().length < 10) {
    errors.push('Message must be at least 10 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // In Phase 3 this will save to DB — for now, echo it back
  res.status(201).json({
    success: true,
    message: 'Message received successfully.',
    data: { name: name.trim(), email: email.trim(), message: message.trim() }
  });
});

module.exports = router;