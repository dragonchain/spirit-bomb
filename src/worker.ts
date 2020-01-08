import { BULK } from './globals';
import { getFakePayload } from './lib/fakePayload';
import * as dragonchain from 'dragonchain-sdk';
import { getWorkerLogger } from './lib/logger';
import { getDragonchainId, resetTTL } from './lib/getDragonchainId';

export async function worker() {
  const transactionListBase = [...Array(BULK)].map(() => ({ transactionType: 'loadtest', payload: getFakePayload() }));
  const dragonchainId = await getDragonchainId();
  const dcClient = await dragonchain.createClient({ dragonchainId });
  const workerLogger = getWorkerLogger(dragonchainId);

  // Basic check to see if the creds are valid
  const status = await dcClient.getStatus();
  workerLogger('DC webserver status:', status.ok ? 'OK' : 'NOT OK');

  // Set an interval to keep the chain from being selected by other threads.
  setInterval(async () => resetTTL(dragonchainId, 40), 30000);

  let i = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const jitterBulkCount = Math.floor(Math.random() * 10) + 1;
    const jitterBulk = [...Array(jitterBulkCount)].map(() => ({ transactionType: 'loadtest', payload: getFakePayload() }));
    const transactionList = transactionListBase.concat(jitterBulk);
    i++;
    try {
      workerLogger('req-id:', i, '> bulk(', BULK, ')');
      const response: any = await dcClient.createBulkTransaction({ transactionList });
      workerLogger('req-id:', i, '< successCount:', response.response[201].length);
    } catch (e) {
      workerLogger('req-id:', i, 'exception thrown');
    }
  }
}
