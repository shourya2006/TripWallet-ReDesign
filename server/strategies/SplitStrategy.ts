export interface SplitStrategy {
  calculate(amount: number, participants: string[]): Map<string, number>;
}
