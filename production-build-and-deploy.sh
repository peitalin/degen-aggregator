#!/bin/sh

# Do the building and pushing
IMAGE_ID=degen-aggregator
GCR_ID=degen-production
# GCR_ID=gm-production-296501


# export DOCKER_DEFAULT_PLATFORM=linux/amd64
# DOCKER_DEFAULT_PLATFORM=linux/amd64
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
DOCKER_DEFAULT_PLATFORM=linux/arm64


# docker buildx build -t gcr.io/$GCR_ID/$IMAGE_ID:latest .
# DOCKER_DEFAULT_PLATFORM=linux/amd64 docker buildx build --platform=linux/amd64 -t gcr.io/$GCR_ID/$IMAGE_ID:latest . --build-arg ARCH=amd64
# docker buildx build --platform=linux/amd64,linux/arm64 -t gcr.io/$GCR_ID/$IMAGE_ID:latest --push .
docker build --platform=linux/arm64 -t gcr.io/gm-production-296501/degen-aggregator:latest . --push

# docker build -f ./release.dockerfile -t gcr.io/$GCR_ID/$IMAGE_ID:latest .
# docker push gcr.io/$GCR_ID/$IMAGE_ID

