const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../Config/db.js');
 
const SECRET = process.env.JWT_SECRET || 'your_secret_key';
 
// ── SIGNUP ──────────────────────────────────
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
 
    // 1. Check all fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
 
    // 2. Check password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
 
    // 3. Check if username already taken
    const [existingUsername] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    if (existingUsername.length > 0) {
      return res.status(409).json({ message: 'Username already taken.' });
    }
 
    // 4. Check if email already registered
    const [existingEmail] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existingEmail.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
 
    // 5. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
 
    // 6. Save user to MySQL
    await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
 
    return res.status(201).json({ message: 'Account created successfully!' });
 
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};
 
// ── LOGIN ────────────────────────────────────
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
 
    // 1. Check fields
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
 
    // 2. Find user in MySQL
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
 
    // 3. If user not found
    if (rows.length === 0) {
      return res.status(401).json({ message: 'User not found.' });
    }
 
    const user = rows[0];
 
    // 4. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong password.' });
    }
 
    // 5. Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET,
      { expiresIn: '7d' }
    );
 
    // 6. Send back response
    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
 
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};
 
// ── EXPORT BOTH FUNCTIONS ────────────────────
module.exports = { signup, login };