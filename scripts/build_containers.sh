#!/bin/sh
set -e

cd "$(cd "$(dirname "$0")"; pwd -P)"
$(aws ecr get-login --no-include-email --region us-west-2)
TAG=381978683274.dkr.ecr.us-west-2.amazonaws.com/spirit-bomb:"$(jq -r .version ../package.json)"
docker build .. -t "$TAG"
docker push "$TAG"
