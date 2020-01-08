import { MATCHMAKING_API } from './config';
// import {} from '../@types';

const { REACT_APP_STAGE } = process.env;

const chainLevelCache: any = {};

export default class MatchmakingApi {
  static baseUrl = MATCHMAKING_API;
  static defaultOptions = {
    method: 'GET'
  };


  static async getTotalMatchmaking(): Promise<{ startTime: number, transactionSum: number }> {
    const { startTime, transactionCounts } = await MatchmakingApi.get('/internal/v1/metrics');

    let transactionSum = 0;
    if (transactionCounts) {
      for (const chainID in transactionCounts) {
        let chainLevel = chainLevelCache[chainID];
        if (!chainLevel) {
          try {
            const registration = await MatchmakingApi.get(`/registration/${chainID}`);
            chainLevelCache[chainID] = registration.level;
            chainLevel = registration.level;
          } catch (e) {
            console.warn(`Error occurred while checking matchmaking registration. Skipping check and excluding. Chain ID: ${chainID}`)
          }
        }
        if (chainLevel === 1) transactionSum += transactionCounts[chainID];
      }
    }

    return { startTime, transactionSum };

  }

  static get(path: string) {
    return MatchmakingApi.makeRequest(path);
  }

  static async makeRequest(path: string) {
    const response = await fetch(`${MatchmakingApi.baseUrl}${path}`, MatchmakingApi.defaultOptions);
    if (!response.ok) throw new Error('Bad response from matchmaking service.');

    return await response.json();
  }
}
