import MetricsApi from './metrics';
import MatchmakingApi from './matchmaking';
import { PerfDemoData } from '../@types';

export async function gatherData(startTime: number): Promise<PerfDemoData> {
  const { transactionSum: totalMatchmakingTransactions } = await MatchmakingApi.getTotalMatchmaking();
  const totalMetricsTransactions = await MetricsApi.getTotalNumberTransactions(Math.floor(startTime));
  const totalTransactions = totalMatchmakingTransactions + totalMetricsTransactions;

  return { totalTransactions };
}