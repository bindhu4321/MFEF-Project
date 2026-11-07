const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { getDemoUserByEmail, addDemoUser, buildUserPublicProfile, getDemoUserById } = require('../utils/demoStore');

// Sign JWT token helper
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    process.env.JWT_SECRET || 'sbfms_jwt_super_secure_secret_key_2026_antigravity',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const signInDemoUser = async (user, res) => {
  const userData = buildUserPublicProfile(user);
  const token = generateToken(userData);
  return res.status(200).json({
    success: true,
    message: 'Login successful.',
    token,
    user: userData
  });
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, business_name, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (!pool.isDatabaseAvailable()) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (getDemoUserByEmail(normalizedEmail)) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email address already exists.'
        });
      }

      const nextId = Date.now();
      const newUser = {
        id: nextId,
        name: name.trim(),
        email: normalizedEmail,
        password: await bcrypt.hash(password, 10),
        role: 'user',
        business_name: business_name ? business_name.trim() : null,
        phone: phone ? phone.trim() : null
      };

      addDemoUser(newUser);

      const token = generateToken(newUser);
      return res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        token,
        user: buildUserPublicProfile(newUser)
      });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userRole = 'user';

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, business_name, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        hashedPassword,
        userRole,
        business_name ? business_name.trim() : null,
        phone ? phone.trim() : null
      ]
    );

    const newUser = {
      id: result.insertId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: userRole,
      business_name: business_name || null,
      phone: phone || null
    };

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    if (!pool.isDatabaseAvailable()) {
      const demoUser = getDemoUserByEmail(email);
      if (!demoUser) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const isMatch = await bcrypt.compare(password, demoUser.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      return signInDemoUser(demoUser, res);
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, password, role, business_name, phone, created_at FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      business_name: user.business_name,
      phone: user.phone,
      created_at: user.created_at
    };

    const token = generateToken(userData);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: error.message
    });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, business_name, phone, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user: rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching profile.',
      error: error.message
    });
  }
};

// Update current user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, business_name, phone } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.'
      });
    }

    await pool.query(
      `UPDATE users 
       SET name = ?, business_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [name.trim(), business_name ? business_name.trim() : null, phone ? phone.trim() : null, req.user.id]
    );

    const [updated] = await pool.query(
      'SELECT id, name, email, role, business_name, phone, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating profile.',
      error: error.message
    });
  }
};

// Change user password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [newHashedPassword, req.user.id]);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error changing password.',
      error: error.message
    });
  }
};
