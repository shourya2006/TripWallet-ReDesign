const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET;

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!(email && password && username)) {
      return res.status(400).send('All input is required');
    }

    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send('User Already Exist. Please Login');
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });

    const token = jwt.sign(
      { user_id: user._id, email },
      SECRET_KEY,
      {
        expiresIn: '1d',
      }
    );
    
    const refreshToken = jwt.sign(
      { user_id: user._id, email },
      REFRESH_SECRET_KEY,
      {
        expiresIn: '30d',
      }
    );
    user.token = token;

    res.status(201).json({ user, token, refreshToken });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).send('All input is required');
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email },
        SECRET_KEY,
        {
          expiresIn: '1d',
        }
      );
      
      const refreshToken = jwt.sign(
        { user_id: user._id, email },
        REFRESH_SECRET_KEY,
        {
          expiresIn: '30d',
        }
      );

      user.token = token;

      return res.status(200).json({ user, token, refreshToken });
    }
    res.status(400).send('Invalid Credentials');
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).send('Refresh Token Required');
    }
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
        const token = jwt.sign(
            { user_id: decoded.user_id, email: decoded.email },
            SECRET_KEY,
            { expiresIn: '1d' }
        );
        res.status(200).json({ token });
    } catch (err) {
        return res.status(403).send('Invalid Refresh Token');
    }
});

router.post('/change-password', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).send('Access Denied');

        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.user_id;

        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).send('User not found');

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).send('Invalid current password');

        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        user.password = encryptedPassword;
        await user.save();

        res.status(200).send('Password updated successfully');
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
