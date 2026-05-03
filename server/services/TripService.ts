
import { BaseService } from './BaseService';
import Trip, { ITrip } from '../models/Trip';
import Expense from '../models/Expense';
import Notification from '../models/Notification';
import { ImageProviderAdapter } from '../adapters/ImageProviderAdapter';
import EventBus from '../events/EventBus';
import NotificationFactory from '../factories/NotificationFactory';

interface TripFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
}

class TripService extends BaseService<ITrip> {
  private imageProvider: ImageProviderAdapter;

  constructor(imageProvider: ImageProviderAdapter) {
    super(Trip);
    this.imageProvider = imageProvider;
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

    const tripImage = await this.imageProvider.fetchImage(data.title) || undefined;

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
      EventBus.getInstance().emit('trip.created', {
        tripId: trip._id,
        senderId: userId,
        participants: data.participants
      });
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

    if (trip.participants.some((p: any) => p.toString() === targetUserId)) {
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

    await NotificationFactory.create('TRIP_INVITE', targetUserId, senderId, trip._id.toString());

    return { msg: 'Invitation sent successfully' };
  }
}

export default TripService;
