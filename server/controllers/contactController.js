/**
 * Contact form – Public submission, no auth
 */
const Contact = require('../models/Contact');

exports.submit = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json({ message: 'Thank you! We will get back to you soon.', id: contact._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Owner: list contact messages
exports.getAll = async (req, res) => {
  try {
    const list = await Contact.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
