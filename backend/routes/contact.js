const express = require('express');
const router = express.Router();
const { stmt } = require('../database/db');

// POST /api/contact — validate and save to DB
router.post('/', (req, res) => {
  const { name, email, message } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2)
    errors.push('Name must be at least 2 characters.');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email))
    errors.push('A valid email address is required.');

  if (!message || message.trim().length < 10)
    errors.push('Message must be at least 10 characters.');

  if (errors.length > 0)
    return res.status(400).json({ success: false, errors });

  try {
    const result = stmt.insertMessage.run({
      name: name.trim(),
      email: email.trim(),
      message: message.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Message received and saved.',
      id: result.lastInsertRowid
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save message.', error: err.message });
  }
});

// GET /api/contact — retrieve all messages (admin)
router.get('/', (req, res) => {
  const messages = stmt.getAllMessages.all();
  res.status(200).json({ success: true, count: messages.length, data: messages });
});

module.exports = router;