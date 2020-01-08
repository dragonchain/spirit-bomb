import React, { useEffect, useReducer } from 'react';
import './App.scss';
import { AppState } from './@types';
import { gatherData } from './clients';
import { Line } from 'react-chartjs-2';
import { ChartOptions, Chart } from 'chart.js';
import { Panel, PanelRow, PanelContent, Title, Spinner } from '@dragonchain-dev/dragon-dashboard';

(Chart as any).defaults.global.animation.duration = '1';
const { START_TIME = "2020-01-06T17:00:00.000Z" } = process.env;

const App: React.FC = () => {
  const INTERVAL_MS = 60000;
  const INTERVAL_SEC = INTERVAL_MS / 1000;
  const MAX_DATA_POINTS = 60;

  function getStartingTimestamp() {
    const startTime = new Date(START_TIME);
    return Math.floor(startTime.getTime() / 1000);
  }

  function abbreviateNumber(num: number, digits?: number): string {
    let units = ['K', 'M', 'B', 'T', 'Q'],
        decimal;

    for (let i = units.length - 1; i >= 0; i--) {
      decimal = Math.pow(1000, i + 1);

      if(num <= -decimal || num >= decimal) {
        return +(num / decimal).toFixed(digits) + units[i];
      }
    }

    return String(num);
  }

  const initialState: AppState = {
    total: null,
    rate: null,
    elapsed: INTERVAL_SEC - 1,
    rateHistory: [],
    rateAverage: 0,
    totalHistory: [],
    misses: 0,
    loading: false,
  };

  function reducer(state: any, action: any): AppState {
    switch (action.type) {
      case 'update':
        if (!state.total) return { ...state, total: action.total, rate: 0 };
        const rateInterval = state.misses ? INTERVAL_SEC * (state.misses + 1) : INTERVAL_SEC;
        const rate = ((action.total - state.total) / (rateInterval));
        const time = Date.now();
        if (state.rateHistory.length > MAX_DATA_POINTS) state.rateHistory.shift();
        if (state.totalHistory.length > MAX_DATA_POINTS) state.rateHistory.shift();
        state.rateHistory.push({ value: rate, time });
        state.totalHistory.push({ value: action.total, time });
        const dataSum = Object.keys(state.rateHistory).reduce((accum: number, key: any) => state.rateHistory[key].value + accum, 0);
        const rateAverage = dataSum / Object.keys(state.rateHistory).length;

        return { ...state, total: action.total, rate, misses: 0, rateAverage };
      case 'tick':
        if (state.elapsed === INTERVAL_SEC) return { ...state, elapsed: 1 };
        return { ...state, elapsed: state.elapsed + 1 };
      case 'miss':
        return { ...state, misses: state.misses + 1 };
      case 'loading':
        return { ...state, loading: action.state };
      default:
        throw new Error('Unknown state action');
    }
  }

  function renderGraph() {
    const graphData: Chart.ChartData = {
      labels: state.rateHistory.map((item: any) => item.time) as any,
      datasets: [{
        label: 'Rate',
        fill: false,
        lineTension: 0.2,
        backgroundColor: '#1797e5',
        borderColor: '#1797e5',
        pointBorderColor: '#1797e5',
        pointHoverBorderColor: '#1797e5',
        pointHoverBackgroundColor: '#1797e5',
        borderCapStyle: 'butt',
        borderJoinStyle: 'miter',
        pointBorderWidth: 5,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: state.rateHistory.map((item: any) => item.value) as any,
      },{
        label: 'Average',
        fill: false,
        lineTension: 0,
        backgroundColor: '#c040f7',
        borderColor: '#c040f7',
        borderWidth: 2,
        pointBorderColor: '#c040f7',
        pointHoverBorderColor: '#c040f7',
        pointHoverBackgroundColor: '#c040f7',
        borderCapStyle: 'butt',
        borderJoinStyle: 'miter',
        pointBorderWidth: 0,
        pointHoverRadius: 0,
        pointHoverBorderWidth: 0,
        pointRadius: 0,
        pointHitRadius: 10,
        data: new Array(state.rateHistory.length).fill(state.rateAverage),
      }]
    };
    const graphOptions: ChartOptions = {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
            stepSize: 100,
            maxTicksLimit: 9,
            callback: (val: number) => abbreviateNumber(val, 2),
          }
        }],
        xAxes: [{
          gridLines: {
            color: "rgba(0,0,0,0)"
          },
          ticks: {
            autoSkip: true,
            stepSize: 100,
            maxTicksLimit: 12,
            display: false,
          }
        }]
      }
    };
    return (
      <div style={{ margin: '0px 20px 20px 20px'}}>
        <Line data={graphData} options={graphOptions} />
      </div>
    )
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function runEffect() {
      dispatch({ type: 'tick' });
    }
    runEffect();
    const interval = setInterval(runEffect, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function runEffect() {
      try {
        if (state.elapsed === INTERVAL_SEC) {
          dispatch({ type: 'loading', state: true });
          const { totalTransactions } = await gatherData(getStartingTimestamp());
          dispatch({ type: 'update', total: totalTransactions });
          dispatch({ type: 'loading', state: false });
        }
      } catch (e) {
        console.warn('Missed data point! Occurred at', Date.now());
        dispatch({ type: 'miss' });
        dispatch({ type: 'loading', state: false });
      }
    }
    runEffect();
  }, [state.elapsed, INTERVAL_SEC])


  return (
    <div className="App">
      <Panel>
        <PanelRow>
          <PanelContent>
            <span className="App-text App-flex">
              Time to next update (seconds): {INTERVAL_SEC - state.elapsed}
              {state.loading && <Spinner style={{ marginLeft: '20px', width: '20px', height:'20px' }} />}
            </span>
          </PanelContent>
        </PanelRow>
        <PanelRow>
          <PanelContent icon="transactions">
            <Title size="large" color="highlight">Transactions since {new Date(getStartingTimestamp() * 1000).toLocaleString('en-US', { month: 'short', hour: 'numeric', day: 'numeric', minute: 'numeric' })} PST</Title>
            <span className="App-text">{state && state.total && state.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </PanelContent>
        </PanelRow>
        <PanelRow>
          <PanelContent icon="nav-smart-contracts">
            <Title size="large" color="highlight">
              Average (last {state.rateHistory.length} {state.rateHistory.length === 1 ? 'minute' : 'minutes'})
            </Title>
            <span className="App-text">{state && state.rateAverage && state.rateAverage.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </PanelContent>
        </PanelRow>
        <PanelRow>
          <PanelContent icon="time">
            <Title size="large" color="highlight">Rate (transactions/second)</Title>
            <span className="App-text">{state && state.rate && state.rate.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </PanelContent>
        </PanelRow>
        <PanelRow>
          {renderGraph()}
        </PanelRow>
      </Panel>
    </div>
  );
}

export default App;
