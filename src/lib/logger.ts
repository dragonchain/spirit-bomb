import colors from 'colors/safe';

export function getWorkerLogger(dragonchainId: string) {
  return (...args: any[]) => {
    if (process.env.NOCOLOR) console.log(...args);
    console.log(colors.yellow(dragonchainId.substring(0, 5)), '|', ...args);
  };
}

export function mainLog(...args: any[]) {
  if (process.env.NOCOLOR) console.log(...args);
  console.log(colors.blue('main'), ' |', ...args);
}
