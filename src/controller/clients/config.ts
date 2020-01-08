import { readFile } from 'fs';
import { promisify } from 'util';
import * as path from 'path';

const readFileAsync = promisify(readFile);

const CONFIG_FILE_PATH = process.env.CONFIG_MOUNT || '';
const targetRateKey = 'targetRate';
const maxWorkersKey = 'maxWorkers';

async function readConfigNumber(key: string): Promise<number> {
  return Number(await readFileAsync(path.join(CONFIG_FILE_PATH, key), 'utf8'));
}

export async function getTargetRate() {
  return readConfigNumber(targetRateKey);
}

export async function getMaxWorkers() {
  return readConfigNumber(maxWorkersKey);
}
