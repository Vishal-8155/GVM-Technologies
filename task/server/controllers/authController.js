const User = require('../models/User');
const jwt = require('jsonwebtoken');

const genToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'miniblog-secret', { expiresIn: '7d' });

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password required' });
    }
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ username, email, password });
    res.status(201).json({ user: { _id: user._id, username: user.username }, token: genToken(user._id) });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const body = req.body || {};
    const email = (body.email || '').toString().trim();
    const password = body.password != null ? String(body.password) : '';
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ user: { _id: user._id, username: user.username }, token: genToken(user._id) });
  } catch (err) {
    next(err);
  }
};
