import { SplitStrategy } from './SplitStrategy';

export class PercentageSplitStrategy implements SplitStrategy {
  private percentages: Map<string, number>;

  constructor(percentages: Map<string, number>) {
    this.percentages = percentages;
  }

  calculate(amount: number, participants: string[]): Map<string, number> {
    const splitMap = new Map<string, number>();
    
    let totalPercentage = 0;
    for (const userId of participants) {
      const percentage = this.percentages.get(userId) || 0;
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
