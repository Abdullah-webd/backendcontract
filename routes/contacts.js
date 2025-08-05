const express = require('express');
const Contact = require('../models/Contact');
const { sendContactEmail } = require('../config/email');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Submit contact form (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    // Create contact record
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      ipAddress: req.ip || req.connection.remoteAddress
    });

    await contact.save();

    // Send email notification to admin
    try {
      await sendContactEmail({
        name: contact.name,
        email: contact.email,
        message: contact.message
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({ 
      message: 'Contact form submitted successfully',
      id: contact._id
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all contacts (admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const contacts = await Contact.find({})
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single contact (admin only)
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Mark as read
    if (!contact.isRead) {
      contact.isRead = true;
      await contact.save();
    }

    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update contact status (admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { isRead } = req.body;
    
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    contact.isRead = isRead !== undefined ? isRead : contact.isRead;
    await contact.save();

    res.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete contact (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;