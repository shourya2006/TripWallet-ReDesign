const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Trip = require('../models/Trip');
const auth = require('../middleware/auth');

// Get all notifications for the current user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.user_id })
      .populate('sender', 'username email')
      .populate('tripId', 'title')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Accept a trip invite
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ msg: 'Notification not found' });

    if (notification.recipient.toString() !== req.user.user_id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    if (notification.type === 'TRIP_INVITE') {
      const trip = await Trip.findById(notification.tripId);
      if (trip) {
        // Add user to trip participants if not already there
        if (!trip.participants.includes(req.user.user_id)) {
          trip.participants.push(req.user.user_id);
          await trip.save();
        }
      }
    }

    notification.status = 'ACCEPTED';
    await notification.save();

    res.json({ msg: 'Invitation accepted', notification });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Reject a trip invite
router.post('/:id/reject', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ msg: 'Notification not found' });

    if (notification.recipient.toString() !== req.user.user_id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    notification.status = 'REJECTED';
    await notification.save();

    res.json({ msg: 'Invitation rejected', notification });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
