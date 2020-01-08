<div align="center">

![spiritbomb](/spiritbomb.gif)

# Spirit Bomb (Dragonchain Performance Demonstration)

This is the repository containing the code that controlled a pool of Dragonchains during [our 24 hour performance demo](https://www.youtube.com/watch?v=8poOdvAIIWA) to maintain a constant transaction rate in Dragon Net.

</div>

## Goal

The goal of this program is to load real dragonchains with realistic transaction data in order to simulate and demonstrate a real business-load on Dragonchain/Dragonnet.

We used the [faker](https://www.npmjs.com/package/faker) npm package in order to generate fake business data to be included in every single transaction that was posted to the Dragonchains during this test.

See `./src/lib/fakePayload.ts` to see/modify exactly what was included in the Dragonchain transaction payloads.

## Design/Architecture

This program is deployed to kubernetes with a controller and worker component.

The controller component monitors the rate, and compares against the desired rate in order to scale up/down workers to maintain the desired rate over an extended period of time.

The worker component pulls from a list of Dragonchains mounted in credentials, and picks/locks a few to perform transactions against as long as its running.

Redis is used for cross-pod locks to ensure that a chain is only ever assigned to 1 worker at a time.

## Using

In order to use this tool, simply provide a [Dragonchain credentials file](https://python-sdk-docs.dragonchain.com/latest/configuration.html#id1) in `./spiritbomb/files/`

Additionally, the code to calculate the current rate must be implemented (`calculateRate` function in `./src/controller/app.ts`).

This code was not provided implemented because we were using some private internal services to do these calculations during the demo.

If you just wanted to test the transaction ingestion rate for a Dragonchain (instead of the Dragonnet throughput), you could have the workers report how many transactions they performed for this function instead.

### Configuration

In order to tune configuration (such as desired rate, specifying number of chains, etc), change the variables in the helm chart's values file (`./spiritbomb/values.yaml`).

### Deploying

In order to deploy this application once the above requirements are met, build and push a docker container (using the `Dockerfile` at the root of this repo), and specify it's url in `./spiritbomb/values.yaml`, then simply use [helm](https://helm.sh/) to deploy the helm chart (in `./spiritbomb`) in a namespace named `spiritbomb` to a kubernetes cluster.

Once this is all complete, the load should start running and ramp up from 0 as appropriate.
