import { BaseService } from './BaseService';
import Expense, { IExpense } from '../models/Expense';
import Trip from '../models/Trip';

class ExpenseService extends BaseService<IExpense> {
  constructor() {
    super(Expense);
  }

  async getExpensesByTrip(tripId: string) {
    const expenses = await this.model.find({ tripId }).sort({ date: -1 }).exec();
    return expenses;
  }

  async addExpense(data: { description: string; amount: number; paidBy: string; tripId: string; date?: string; splitType?: string; splitDetails?: Record<string, number> }, userId: string) {
    const trip = await Trip.findById(data.tripId);
    if (!trip) throw { status: 404, message: 'Trip not found' };
    
    if (trip.createdBy.toString() !== userId && !trip.participants.some(p => p.toString() === userId)) {
      throw { status: 401, message: 'Not authorized' };
    }

    if (trip.endDate) {
      const end = new Date(trip.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (end < today) {
        throw { status: 400, message: 'Cannot add expense to a past trip' };
      }
    }

    const newExpense = new Expense({
      description: data.description,
      amount: data.amount,
      paidBy: data.paidBy,
      tripId: data.tripId,
      date: data.date || Date.now(),
      createdBy: userId,
      splitType: data.splitType || 'equal',
      splitDetails: data.splitDetails || {},
    });

    const expense = await newExpense.save();
    trip.total += Number(data.amount);
    await trip.save();

    return expense;
  }

  async deleteExpense(expenseId: string, userId: string) {
    const expense = await this.model.findById(expenseId);
    if (!expense) throw { status: 404, message: 'Expense not found' };

    if (expense.createdBy.toString() !== userId) {
      throw { status: 401, message: 'Not authorized' };
    }

    const trip = await Trip.findById(expense.tripId);
    if (trip) {
      trip.total -= expense.amount;
      await trip.save();
    }

    await this.model.findByIdAndDelete(expenseId);

    return { msg: 'Expense removed' };
  }
}

export default ExpenseService;
