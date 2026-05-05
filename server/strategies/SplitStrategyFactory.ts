import { SplitStrategy } from './SplitStrategy';
import { EqualSplitStrategy } from './EqualSplitStrategy';
import { PercentageSplitStrategy } from './PercentageSplitStrategy';
import { ExactSplitStrategy } from './ExactSplitStrategy';

export class SplitStrategyFactory {
  private static strategies: Map<string, SplitStrategy> = new Map([
    ['equal', new EqualSplitStrategy()],
    ['percentage', new PercentageSplitStrategy()],
    ['exact', new ExactSplitStrategy()],
  ]);

  static getStrategy(splitType: string): SplitStrategy {
    const strategy = this.strategies.get(splitType);
    if (!strategy) {
      // Default to equal split for unknown types
      return this.strategies.get('equal')!;
    }
    return strategy;
  }
}
