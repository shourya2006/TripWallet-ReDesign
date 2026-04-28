import mongoose, { Schema, Model, Document, Types } from 'mongoose';

export interface ITrip extends Document {
  _id: Types.ObjectId;
  title: string;
  date: string;
  startDate?: Date;
  endDate?: Date;
  total: number;
  image: string;
  participants: Types.ObjectId[];
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const tripSchema = new Schema<ITrip>({
  title: { type: String, required: true },
  date: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  total: { type: Number, default: 0 },
  image: {
    type: String,
    default:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop',
  },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Trip: Model<ITrip> = mongoose.model<ITrip>('Trip', tripSchema);

export default Trip;
