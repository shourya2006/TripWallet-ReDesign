import { SplitStrategy } from './SplitStrategy';

export class ExactSplitStrategy implements SplitStrategy {
  private exactAmounts: Map<string, number>;

  constructor(exactAmounts: Map<string, number>) {
    this.exactAmounts = exactAmounts;
  }

  calculate(amount: number, participants: string[]): Map<string, number> {
    const splitMap = new Map<string, number>();
    
    let runningTotal = 0;
    for (const userId of participants) {
      const individualAmount = this.exactAmounts.get(userId) || 0;
      runningTotal += individualAmount;
      splitMap.set(userId, individualAmount);
    }

    if (Math.abs(runningTotal - amount) > 0.01) {
      throw new Error('Sum of individual amounts must equal the total expense amount');
    }

    return splitMap;
  }
}
