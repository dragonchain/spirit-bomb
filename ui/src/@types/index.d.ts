export interface PerfDemoData {
  totalTransactions: number
}

export interface AppState {
  total: number | null;
  rate: number | null;
  elapsed: number;
  rateHistory: number[];
  totalHistory: number[];
  misses: number;
  loading: boolean;
  rateAverage: number;
}