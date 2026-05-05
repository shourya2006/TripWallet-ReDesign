import { SplitStrategy } from './SplitStrategy';

export class ExactSplitStrategy implements SplitStrategy {
  calculate(amount: number, participants: string[], details?: Record<string, number>): Map<string, number> {
    const splitMap = new Map<string, number>();

    if (!details || Object.keys(details).length === 0) {
      // Fallback to equal split if no exact amounts provided
      const splitAmount = Math.round((amount / participants.length) * 100) / 100;
      participants.forEach(userId => splitMap.set(userId, splitAmount));
      return splitMap;
    }

    let runningTotal = 0;
    for (const userId of participants) {
      const individualAmount = details[userId] || 0;
      runningTotal += individualAmount;
      splitMap.set(userId, individualAmount);
    }

    if (Math.abs(runningTotal - amount) > 0.01) {
      throw new Error('Sum of individual amounts must equal the total expense amount');
    }

    return splitMap;
  }
}
