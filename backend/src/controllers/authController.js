const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Register User
exports.register = async (req, res) => {
  try {
    const { full_name, email, cnic, password } = req.body;

    // Check if user already exists
    const userExists = await db.query('SELECT * FROM users WHERE email = $1 OR cnic = $2', [email, cnic]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User with this Email or CNIC already exists!' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert User into DB
    const newUser = await db.query(
      'INSERT INTO users (full_name, email, cnic, password) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role, has_voted',
      [full_name, email, cnic, hashedPassword]
    );

    res.status(201).json({
      message: 'User registered successfully!',
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error during registration' });
  }
};

// 2. Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid Email or Password' });
    }

    // Compare Password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid Email or Password' });
    }

    // Create JWT Token
    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.rows[0].id,
        full_name: user.rows[0].full_name,
        email: user.rows[0].email,
        role: user.rows[0].role,
        has_voted: user.rows[0].has_voted,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error during login' });
  }
};