import mongoose, { Schema, Model, Document, Types } from 'mongoose';

export interface IExpense extends Document {
  _id: Types.ObjectId;
  description: string;
  amount: number;
  paidBy: string;
  date: Date;
  tripId: Types.ObjectId;
  createdBy: Types.ObjectId;
  splitType: 'equal' | 'percentage' | 'exact';
  splitDetails: Record<string, number>;
  createdAt: Date;
}

const expenseSchema = new Schema<IExpense>({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true },
  date: { type: Date, default: Date.now },
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  splitType: { type: String, enum: ['equal', 'percentage', 'exact'], default: 'equal' },
  splitDetails: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

const Expense: Model<IExpense> = mongoose.model<IExpense>('Expense', expenseSchema);

export default Expense;
