import { BaseService } from './BaseService';
import Notification, { INotification } from '../models/Notification';
import Trip from '../models/Trip';
import { Types } from 'mongoose';

class NotificationService extends BaseService<INotification> {
  constructor() {
    super(Notification);
  }

  async getNotifications(userId: string) {
    const notifications = await this.model.find({ recipient: userId })
      .populate('sender', 'username email')
      .populate('tripId', 'title')
      .sort({ createdAt: -1 });
    return notifications;
  }

  async acceptInvite(notificationId: string, userId: string) {
    const notification = await this.model.findById(notificationId);
    if (!notification) throw { status: 404, message: 'Notification not found' };

    if (notification.recipient.toString() !== userId) {
      throw { status: 401, message: 'Not authorized' };
    }

    if (notification.type === 'TRIP_INVITE') {
      const trip = await Trip.findById(notification.tripId);
      if (trip) {
        if (!trip.participants.some(p => p.toString() === userId)) {
          trip.participants.push(new Types.ObjectId(userId) as any);
          await trip.save();
        }
      }
    }

    notification.status = 'ACCEPTED';
    await notification.save();

    return { msg: 'Invitation accepted', notification };
  }

  async rejectInvite(notificationId: string, userId: string) {
    const notification = await this.model.findById(notificationId);
    if (!notification) throw { status: 404, message: 'Notification not found' };

    if (notification.recipient.toString() !== userId) {
      throw { status: 401, message: 'Not authorized' };
    }

    notification.status = 'REJECTED';
    await notification.save();

    return { msg: 'Invitation rejected', notification };
  }
}

export default NotificationService;
