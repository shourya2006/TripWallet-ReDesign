import { SplitStrategy } from './SplitStrategy';

export class EqualSplitStrategy implements SplitStrategy {
  calculate(amount: number, participants: string[]): Map<string, number> {
    const splitMap = new Map<string, number>();
    
    if (participants.length === 0) {
      return splitMap;
    }

    const splitAmount = Math.round((amount / participants.length) * 100) / 100;
    
    participants.forEach(userId => {
      splitMap.set(userId, splitAmount);
    });

    return splitMap;
  }
}
