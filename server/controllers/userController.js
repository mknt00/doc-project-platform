const bcrypt = require('bcryptjs');
const db = require('../models/database');
const { generateToken } = require('../middleware/auth');

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: err.message });
        }

        const token = generateToken({ id: this.lastID, username, role: 'member' });
        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: { id: this.lastID, username, email, role: 'member' }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user);
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取当前用户信息
exports.getCurrentUser = (req, res) => {
  db.get('SELECT id, username, email, role, created_at FROM users WHERE id = ?', 
    [req.user.id], 
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
};

// 获取所有用户（仅管理员）
exports.getAllUsers = (req, res) => {
  db.all('SELECT id, username, email, role, created_at FROM users', (err, users) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(users);
  });
};
