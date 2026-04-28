import mongoose, { Schema, Model, Document, Types } from 'mongoose';

export type NotificationType = 'TRIP_INVITE';
export type NotificationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  type: NotificationType;
  tripId: Types.ObjectId;
  status: NotificationStatus;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['TRIP_INVITE'], default: 'TRIP_INVITE' },
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip' },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now },
});

const Notification: Model<INotification> = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
