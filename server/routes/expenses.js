const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const Trip = require("../models/Trip");
const auth = require("../middleware/auth");

router.get("/:tripId", auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ tripId: req.params.tripId }).sort({
      date: -1,
    });
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/", auth, async (req, res) => {
  const { description, amount, paidBy, tripId, date } = req.body;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ msg: "Trip not found" });
    if (
      trip.createdBy.toString() !== req.user.user_id &&
      !trip.participants.includes(req.user.user_id)
    ) {
      return res.status(401).json({ msg: "Not authorized" });
    }
    if (trip.endDate) {
      const end = new Date(trip.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (end < today) {
        return res
          .status(400)
          .json({ msg: "Cannot add expense to a past trip" });
      }
    }

    const newExpense = new Expense({
      description,
      amount,
      paidBy,
      tripId,
      date: date || Date.now(),
      createdBy: req.user.user_id,
    });

    const expense = await newExpense.save();
    trip.total += Number(amount);
    await trip.save();

    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ msg: "Expense not found" });

    if (expense.createdBy.toString() !== req.user.user_id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    const trip = await Trip.findById(expense.tripId);
    if (trip) {
      trip.total -= expense.amount;
      await trip.save();
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.json({ msg: "Expense removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
