import mongoose, { Schema, Model, Document, Types } from 'mongoose';

export interface IExpense extends Document {
  _id: Types.ObjectId;
  description: string;
  amount: number;
  paidBy: string;
  date: Date;
  tripId: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const expenseSchema = new Schema<IExpense>({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true },
  date: { type: Date, default: Date.now },
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const Expense: Model<IExpense> = mongoose.model<IExpense>('Expense', expenseSchema);

export default Expense;
