import { METRICS_API } from './config';
// import {} from '../@types';

export default class MetricsApi {
  static baseUrl = METRICS_API;
  static defaultOptions = { method: 'GET' };

  static async getTotalNumberTransactions(startBound: number): Promise<number> {
    const { transactionSum } = await MetricsApi.get(`/v1/transactions/demo?start=${startBound}`);
    return transactionSum;
  }

  static get(path: string) {
    return MetricsApi.makeRequest(path);
  }

  static async makeRequest(path: string, options?: object) {
    const requestParams = { ...MetricsApi.defaultOptions, ...options };

    const response = await fetch(`${MetricsApi.baseUrl}${path}`, requestParams);
    if (!response.ok) throw new Error('Bad response from metrics service.');

    return await response.json();
  }
}
