const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Register & login are POST only (GET returns 405 with message)
router.route('/register').post(register).get((req, res) => {
  res.status(405).json({ message: 'Use POST to register. Send JSON: username, email, password.' });
});
router.route('/login').post(login).get((req, res) => {
  res.status(405).json({ message: 'Use POST to login. Send JSON: email, password.' });
});

module.exports = router;
