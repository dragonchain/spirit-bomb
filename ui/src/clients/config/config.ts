const configuration: any = {
  "production": {
    "METRICS_API": "https://metrics.api.dragonchain.com",
    "MATCHMAKING_API": "https://matchmaking.api.dragonchain.com",
  },
  "staging": {
    "METRICS_API": "https://metrics-staging.api.dragonchain.com",
    "MATCHMAKING_API": "https://matchmaking-dev.api.dragonchain.com",
  },
  "local": {
    "METRICS_API": "https://metrics-staging.api.dragonchain.com",
    "MATCHMAKING_API": "https://matchmaking-dev.api.dragonchain.com",
  }
}

export default configuration;