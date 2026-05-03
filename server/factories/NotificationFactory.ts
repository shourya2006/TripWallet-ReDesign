import Notification, { NotificationType } from '../models/Notification';
import { Types } from 'mongoose';

class NotificationFactory {
  public static async create(
    type: NotificationType,
    recipient: string | Types.ObjectId,
    sender: string | Types.ObjectId,
    tripId?: string | Types.ObjectId
  ) {
    const notification = new Notification({
      type,
      recipient,
      sender,
      tripId,
    });
    
    return await notification.save();
  }
}

export default NotificationFactory;
