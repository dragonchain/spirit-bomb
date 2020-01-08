import ini from 'ini';
import fs from 'fs';
import path from 'path';
import { redis } from '../redis';

export const creds = ini.parse(fs.readFileSync(path.join(process.env.HOME || '', '.dragonchain', 'credentials'), 'utf-8'));

export function getLockKey(id: string) {
  return `loadTest:inUse:${id}`;
}

export async function lockChain(dragonchainId: string) {
  return redis.set(getLockKey(dragonchainId), 'inUse!', 'EX', 40, 'NX');
}

export async function resetTTL(id: string, time: number) {
  return redis.expire(getLockKey(id), time);
}

export async function getNumberOfAvailableChains() {
  let i = 0;
  for (const id in creds) {
    const isInUse = await redis.get(getLockKey(id));
    if (!isInUse) i++;
  }
  return i;
}

function shuffle(array: Array<any>) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

export async function getDragonchainId() {
  let idList = [];
  for (const id in creds) {
    idList.push(id);
  }
  idList = shuffle(idList);
  for (const id of idList) {
    const isLocked = await lockChain(id);
    if (isLocked) return id;
  }
  throw new Error('all dragonchains are currently in use');
}
