#!/bin/sh

# Do the building and pushing
IMAGE_ID=degen-aggregator
GCR_ID=degen-production

export DOCKER_DEFAULT_PLATFORM=linux/amd64
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
DOCKER_DEFAULT_PLATFORM=linux/amd64


DOCKER_DEFAULT_PLATFORM=linux/amd64 docker buildx build --platform=linux/amd64 -f ./release.dockerfile -t gcr.io/$GCR_ID/$IMAGE_ID:latest .
#  --progress=plain

# docker build -f ./release.dockerfile -t gcr.io/$GCR_ID/$IMAGE_ID:latest .
# docker push gcr.io/$GCR_ID/$IMAGE_ID

