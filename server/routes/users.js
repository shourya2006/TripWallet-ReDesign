const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// Get user balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const trips = await Trip.find({ participants: req.user.user_id });
    
    let toPay = 0;
    let toReceive = 0;

    for (const trip of trips) {
      const expenses = await Expense.find({ tripId: trip._id });
      const splitCount = trip.participants.length;
      
      if (splitCount === 0) continue;

      for (const expense of expenses) {
        const splitAmount = expense.amount / splitCount;

        if (expense.paidBy === user.username) {
          toReceive += (expense.amount - splitAmount);
        } else {
          toPay += splitAmount;
        }
      }
    }

    res.json({ 
      toPay: Math.round(toPay * 100) / 100, 
      toReceive: Math.round(toReceive * 100) / 100 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);

  try {
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.user_id } },
        {
          $or: [
            { email: { $regex: query, $options: 'i' } },
            { username: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).select('username email _id').limit(5);

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
