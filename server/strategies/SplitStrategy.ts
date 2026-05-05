export interface SplitStrategy {
  calculate(amount: number, participants: string[], details?: Record<string, number>): Map<string, number>;
}
