import { BaseService } from './BaseService';
import User, { IUser } from '../models/User';
import Trip from '../models/Trip';
import Expense from '../models/Expense';
import { SplitStrategyFactory } from '../strategies/SplitStrategyFactory';

class UserService extends BaseService<IUser> {
  constructor() {
    super(User);
  }

  async getBalance(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    const trips = await Trip.find({ participants: userId });

    let toPay = 0;
    let toReceive = 0;

    for (const trip of trips) {
      const expenses = await Expense.find({ tripId: trip._id });
      const participantsStr = trip.participants.map(p => p.toString());
      
      if (participantsStr.length === 0) continue;

      for (const expense of expenses) {
        // Use the factory to pick the right strategy per expense
        const strategy = SplitStrategyFactory.getStrategy(expense.splitType || 'equal');
        const details = expense.splitDetails || {};
        const splitMap = strategy.calculate(expense.amount, participantsStr, details);
        const userSplitAmount = splitMap.get(userId) || 0;

        if (expense.paidBy === user.username) {
          toReceive += (expense.amount - userSplitAmount);
        } else {
          toPay += userSplitAmount;
        }
      }
    }

    return {
      toPay: Math.round(toPay * 100) / 100,
      toReceive: Math.round(toReceive * 100) / 100
    };
  }

  async searchUsers(query: string, excludeUserId: string) {
    if (!query) return [];

    const users = await this.model.find({
      $and: [
        { _id: { $ne: excludeUserId } },
        {
          $or: [
            { email: { $regex: query, $options: 'i' } },
            { username: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).select('username email _id').limit(5);

    return users;
  }
}

export default UserService;
