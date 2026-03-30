const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  total: { type: Number, default: 0 },

  image: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop",
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Trip", tripSchema);
