import { Worker } from 'worker_threads';
import { CONCURRENCY, BULK, COUNT } from './globals';
import path from 'path';
import { mainLog } from './lib/logger';
import { getNumberOfAvailableChains } from './lib/getDragonchainId';
import { redis } from './redis';

let exited = 0;

export async function main() {
  const availableChains = await getNumberOfAvailableChains();

  mainLog(`------Dragonchain Performance Worker------`);
  mainLog('CONCURRENCY MAX:', CONCURRENCY);
  mainLog('BULK:', BULK);
  mainLog('COUNT:', COUNT);
  mainLog('AVAILABLE CHAINS:', availableChains);

  if (CONCURRENCY > availableChains) throw new Error(`Concurrency ${CONCURRENCY} must not be greater than number of available Dragonchains ${availableChains}.`);
  let globalFailCount = 0;
  let globalSuccessCount = 0;

  for (let i = 0; i < CONCURRENCY; i++) {
    const worker = new Worker(path.join(__dirname, 'index.js'), { workerData: { workerId: i } });

    worker.on('message', x => {
      globalFailCount += x.failCount;
      globalSuccessCount += x.successCount;
    });

    worker.on('error', console.error);
    worker.on('exit', async code => {
      exited += 1;
      if (exited === CONCURRENCY) {
        if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
        mainLog('---RESULT---');
        mainLog('Total Failures:', globalFailCount);
        mainLog('Total Successful:', globalSuccessCount);
        await redis.quit();
        mainLog('done');
      }
    });
  }
}
