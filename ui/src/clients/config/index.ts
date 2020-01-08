import configuration from './config';

const env = process.env.REACT_APP_STAGE === undefined ? 'local' : process.env.REACT_APP_STAGE;
const config = configuration[env];
const { METRICS_API, MATCHMAKING_API } = config;

export { METRICS_API, MATCHMAKING_API };