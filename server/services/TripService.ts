
import { Document } from 'mongoose';
import { BaseService } from './BaseService';

const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');

interface ITrip extends Document {
  title: string;
  date: string;
  startDate?: Date;
  endDate?: Date;
  total: number;
  image?: string;
  participants: any[];
  createdBy: any;
  createdAt: Date;
}

interface TripFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
}

class TripService extends BaseService<ITrip> {

  constructor() {
    super(Trip);
  }

  async getTrips(userId: string, filters: any) {
    const { page = 1, limit = 10, search = '', sortBy = 'date', sortOrder = 'desc', status = 'all' } = filters;

    const andConditions: any[] = [
      { $or: [{ createdBy: userId }, { participants: userId }] }
    ];

    if (search) {
      andConditions.push({ title: { $regex: search, $options: 'i' } });
    }

    if (status !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (status === 'ongoing') {
        andConditions.push({ $or: [{ endDate: { $exists: false } }, { endDate: { $gte: today } }] });
      } else if (status === 'past') {
        andConditions.push({ endDate: { $lt: today } });
      }
    }

    const query = { $and: andConditions };
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const trips = await this.model.find(query)
      .populate('participants', 'username email')
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const count = await this.model.countDocuments(query);

    const tripIds = trips.map((t: any) => t._id);
    const expenses = await Expense.find({ tripId: { $in: tripIds } });

    const tripsWithData = trips.map((trip: any) => {
      const tripExpenses = expenses.filter((e: any) => e.tripId.toString() === trip._id.toString());
      const total = tripExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
      return { ...trip, total };
    });

    return {
      trips: tripsWithData,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      totalTrips: count,
    };
  }

  async getTripById(tripId: string, userId: string) {
    const trip: any = await this.model.findById(tripId)
      .populate('participants', 'username email')
      .lean();

    if (!trip) {
      throw { status: 404, message: 'Trip not found' };
    }

    const isAuthorized =
      trip.createdBy.toString() === userId ||
      trip.participants.some((p: any) => p._id.toString() === userId);

    if (!isAuthorized) {
      throw { status: 403, message: 'Not authorized to view this trip' };
    }

    const expenses = await Expense.find({ tripId: trip._id });
    const total = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    trip.total = total;

    return trip;
  }

  async createTrip(data: { title: string; date: string; startDate?: Date; endDate?: Date; participants?: string[] }, userId: string) {
    const existingTrip = await this.model.findOne({ title: data.title, createdBy: userId });
    if (existingTrip) {
      throw { status: 400, message: 'You already have a trip with this name.' };
    }

    let tripImage: string | undefined;
    try {
      const unsplashResponse = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(data.title)}&orientation=landscape&per_page=1&client_id=acngLKDQjaIDcf_DPzuCvxzox_uusRJCI3ylzXX01B8`
      );
      if (unsplashResponse.ok) {
        const imgData: any = await unsplashResponse.json();
        if (imgData.results && imgData.results.length > 0) {
          tripImage = imgData.results[0].urls.regular;
        }
      }
    } catch (error) {
      console.error('Error fetching image from Unsplash:', error);
    }

    const newTrip = new Trip({
      title: data.title,
      date: data.date,
      startDate: data.startDate,
      endDate: data.endDate,
      participants: [userId],
      createdBy: userId,
      image: tripImage,
    });

    const trip = await newTrip.save();

    if (data.participants && data.participants.length > 0) {
      const notifications = data.participants.map((recipientId: string) => ({
        recipient: recipientId,
        sender: userId,
        type: 'TRIP_INVITE',
        tripId: trip._id,
      }));
      await Notification.insertMany(notifications);
    }

    return trip;
  }

  async updateTrip(tripId: string, data: { title?: string; date?: string }, userId: string) {
    const trip = await this.model.findById(tripId);
    if (!trip) throw { status: 404, message: 'Trip not found' };
    if (trip.createdBy.toString() !== userId) {
      throw { status: 401, message: 'Not authorized' };
    }

    trip.title = data.title || trip.title;
    trip.date = data.date || trip.date;
    await trip.save();

    return trip;
  }

  async deleteTrip(tripId: string, userId: string) {
    const trip = await this.model.findById(tripId);
    if (!trip) throw { status: 404, message: 'Trip not found' };
    if (trip.createdBy.toString() !== userId) {
      throw { status: 401, message: 'Not authorized' };
    }

    await Expense.deleteMany({ tripId });
    await Notification.deleteMany({ tripId });
    await this.model.findByIdAndDelete(tripId);

    return { msg: 'Trip removed' };
  }

  async leaveTrip(tripId: string, userId: string) {
    const trip = await this.model.findById(tripId);
    if (!trip) throw { status: 404, message: 'Trip not found' };

    if (trip.createdBy.toString() === userId) {
      throw { status: 400, message: 'Creator cannot leave the trip. Delete it instead.' };
    }

    const isParticipant = trip.participants.some((p: any) => p.toString() === userId);
    if (!isParticipant) {
      throw { status: 400, message: 'User is not a participant' };
    }

    trip.participants = trip.participants.filter((p: any) => p.toString() !== userId);
    await trip.save();

    return { msg: 'Left trip successfully' };
  }

  async addParticipant(tripId: string, targetUserId: string, senderId: string) {
    const trip = await this.model.findById(tripId);
    if (!trip) throw { status: 404, message: 'Trip not found' };

    const isAuthorized =
      trip.createdBy.toString() === senderId ||
      trip.participants.some((p: any) => p.toString() === senderId);

    if (!isAuthorized) {
      throw { status: 403, message: 'Not authorized to add participants to this trip' };
    }

    if (trip.participants.includes(targetUserId)) {
      throw { status: 400, message: 'User is already a participant' };
    }

    const existingInvite = await Notification.findOne({
      recipient: targetUserId,
      tripId: trip._id,
      type: 'TRIP_INVITE',
      status: 'PENDING',
    });

    if (existingInvite) {
      throw { status: 400, message: 'Invitation already sent to this user' };
    }

    const notification = new Notification({
      recipient: targetUserId,
      sender: senderId,
      type: 'TRIP_INVITE',
      tripId: trip._id,
    });
    await notification.save();

    return { msg: 'Invitation sent successfully' };
  }
}

export default TripService;
