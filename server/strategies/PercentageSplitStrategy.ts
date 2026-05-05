import { SplitStrategy } from './SplitStrategy';

export class PercentageSplitStrategy implements SplitStrategy {
  calculate(amount: number, participants: string[], details?: Record<string, number>): Map<string, number> {
    const splitMap = new Map<string, number>();

    if (!details || Object.keys(details).length === 0) {
      // Fallback to equal split if no percentages provided
      const splitAmount = Math.round((amount / participants.length) * 100) / 100;
      participants.forEach(userId => splitMap.set(userId, splitAmount));
      return splitMap;
    }

    let totalPercentage = 0;
    for (const userId of participants) {
      const percentage = details[userId] || 0;
      totalPercentage += percentage;

      const individualAmount = Math.round((amount * (percentage / 100)) * 100) / 100;
      splitMap.set(userId, individualAmount);
    }

    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error('Total percentage must equal 100');
    }

    return splitMap;
  }
}
