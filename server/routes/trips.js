const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");
const Notification = require("../models/Notification");
const Expense = require("../models/Expense");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "date",
      sortOrder = "desc",
      status = "all",
    } = req.query;

    const userCondition = {
      $or: [
        { createdBy: req.user.user_id },
        { participants: req.user.user_id },
      ],
    };

    const andConditions = [userCondition];

    if (search) {
      andConditions.push({ title: { $regex: search, $options: "i" } });
    }

    if (status !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (status === "ongoing") {
        andConditions.push({
          $or: [{ endDate: { $exists: false } }, { endDate: { $gte: today } }],
        });
      } else if (status === "past") {
        andConditions.push({ endDate: { $lt: today } });
      }
    }

    const query = { $and: andConditions };
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const trips = await Trip.find(query)
      .populate("participants", "username email")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Trip.countDocuments(query);

    const tripIds = trips.map((t) => t._id);
    const expenses = await Expense.find({ tripId: { $in: tripIds } });

    const tripsWithData = trips.map((trip) => {
      const tripExpenses = expenses.filter(
        (e) => e.tripId.toString() === trip._id.toString()
      );
      const total = tripExpenses.reduce((sum, e) => sum + e.amount, 0);

      return {
        ...trip,
        total,
      };
    });

    res.json({
      trips: tripsWithData,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalTrips: count,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("participants", "username email")
      .lean();

    if (!trip) {
      return res.status(404).json({ msg: "Trip not found" });
    }

    const isAuthorized =
      trip.createdBy.toString() === req.user.user_id ||
      trip.participants.some((p) => p._id.toString() === req.user.user_id);

    if (!isAuthorized) {
      return res.status(403).json({ msg: "Not authorized to view this trip" });
    }

    const expenses = await Expense.find({ tripId: trip._id });
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    trip.total = total;

    res.json(trip);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Trip not found" });
    }
    res.status(500).send("Server Error");
  }
});

// Create a new trip
router.post("/", auth, async (req, res) => {
  const { title, date, startDate, endDate, participants } = req.body;

  try {
    const existingTrip = await Trip.findOne({
      title: title,
      createdBy: req.user.user_id,
    });

    if (existingTrip) {
      return res
        .status(400)
        .json({ msg: "You already have a trip with this name." });
    }

    let tripImage;
    try {
      const unsplashResponse = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          title
        )}&orientation=landscape&per_page=1&client_id=acngLKDQjaIDcf_DPzuCvxzox_uusRJCI3ylzXX01B8`
      );
      if (unsplashResponse.ok) {
        const data = await unsplashResponse.json();
        if (data.results && data.results.length > 0) {
          tripImage = data.results[0].urls.regular;
        }
      }
    } catch (error) {
      console.error("Error fetching image from Unsplash:", error);
    }

    const newTrip = new Trip({
      title,
      date,
      startDate,
      endDate,
      participants: [req.user.user_id],
      createdBy: req.user.user_id,
      image: tripImage,
    });

    const trip = await newTrip.save();

    if (participants && participants.length > 0) {
      const notifications = participants.map((userId) => ({
        recipient: userId,
        sender: req.user.user_id,
        type: "TRIP_INVITE",
        tripId: trip._id,
      }));
      await Notification.insertMany(notifications);
    }

    res.json(trip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Update a trip
router.put("/:id", auth, async (req, res) => {
  const { title, date } = req.body;

  try {
    let trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ msg: "Trip not found" });
    if (trip.createdBy.toString() !== req.user.user_id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    trip.title = title || trip.title;
    trip.date = date || trip.date;

    await trip.save();
    res.json(trip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Delete a trip
router.delete("/:id", auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ msg: "Trip not found" });

    if (trip.createdBy.toString() !== req.user.user_id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await Expense.deleteMany({ tripId: req.params.id });
    await Notification.deleteMany({ tripId: req.params.id });
    await Trip.findByIdAndDelete(req.params.id);

    res.json({ msg: "Trip removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Leave a trip (for participants)
router.post("/:id/leave", auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ msg: "Trip not found" });

    if (trip.createdBy.toString() === req.user.user_id) {
      return res
        .status(400)
        .json({ msg: "Creator cannot leave the trip. Delete it instead." });
    }

    const isParticipant = trip.participants.some(
      (p) => p.toString() === req.user.user_id
    );
    if (!isParticipant) {
      return res.status(400).json({ msg: "User is not a participant" });
    }

    const initialCount = trip.participants.length;
    trip.participants = trip.participants.filter(
      (p) => p.toString() !== req.user.user_id
    );
    await trip.save();

    console.log(
      `User ${req.user.user_id} left trip ${trip._id}. Participants: ${initialCount} -> ${trip.participants.length}`
    );

    res.json({ msg: "Left trip successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Add a participant to a trip
router.post("/:id/participants", auth, async (req, res) => {
  const { userId } = req.body;

  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ msg: "Trip not found" });

    const isAuthorized =
      trip.createdBy.toString() === req.user.user_id ||
      trip.participants.some((p) => p.toString() === req.user.user_id);

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ msg: "Not authorized to add participants to this trip" });
    }

    if (trip.participants.includes(userId)) {
      return res.status(400).json({ msg: "User is already a participant" });
    }

    const existingInvite = await Notification.findOne({
      recipient: userId,
      tripId: trip._id,
      type: "TRIP_INVITE",
      status: "PENDING",
    });

    if (existingInvite) {
      return res
        .status(400)
        .json({ msg: "Invitation already sent to this user" });
    }

    const notification = new Notification({
      recipient: userId,
      sender: req.user.user_id,
      type: "TRIP_INVITE",
      tripId: trip._id,
    });
    await notification.save();

    res.json({ msg: "Invitation sent successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
