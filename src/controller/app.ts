import { KubernetesClient } from './clients/kubernetes';
import { getTargetRate } from './clients/config';

const START_TIME = Number(process.env.START_TIME || Math.floor(Date.now() / 1000));
const intervalInMilliseconds = 30000;
const intervalInSeconds = intervalInMilliseconds / 1000;
const rateSampleCount = 6;
const scaleCooldownSeconds = intervalInSeconds * rateSampleCount;
const rateArray: number[] = [];
KubernetesClient.initialize();

const state = {
  total: 0,
  rate: 0
};

let lastScaleUpTime = START_TIME;
let lastScaleDownTime = START_TIME;

async function calculateRate() {
  // THIS FUNCTION MUST BE IMPLEMENTED AND MODIFY `state.total` and `state.rate`
}

export async function main() {
  try {
    console.log('---------------------------------------\nStarting rate check');
    await calculateRate();
    rateArray.push(state.rate);
    console.log(`Current rate ${state.rate.toLocaleString()}`);
    console.log(`Current total ${state.total.toLocaleString()}`);
    let rateSum = 0;
    if (rateArray.length <= rateSampleCount) return;
    for (let i: number = rateArray.length - 1; i >= rateArray.length - rateSampleCount; i--) {
      rateSum += rateArray[i];
    }
    const averageRate = rateSum / rateSampleCount;
    console.log(`Current rolling average rate: ${averageRate}`);
    const targetRate = await getTargetRate();
    console.log(`Current target rate: ${targetRate}`);
    if (averageRate < targetRate && Math.floor(Date.now() / 1000) - lastScaleUpTime > scaleCooldownSeconds) {
      await KubernetesClient.scaleUpDeployment();
      lastScaleUpTime = Math.floor(Date.now() / 1000);
    } else if (averageRate > targetRate * 1.75 && Math.floor(Date.now() / 1000) - lastScaleDownTime > scaleCooldownSeconds) {
      await KubernetesClient.scaleDownDeployment();
      lastScaleDownTime = Math.floor(Date.now() / 1000);
    }
  } catch (e) {
    console.error(e);
  }
}

console.log('Starting controller');
setInterval(main, intervalInMilliseconds);
main();
