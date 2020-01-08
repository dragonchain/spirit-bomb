import { isMainThread } from 'worker_threads';
import { main } from './main';
import { worker } from './worker';

(isMainThread ? main() : worker()).catch(console.error);
