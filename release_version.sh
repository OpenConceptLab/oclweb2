#!/bin/bash
set -e

DOCKER_IMAGE_ID=${bamboo.docker.image.id}
DOCKER_IMAGE_NAME=${bamboo.docker.image.name}
SOURCE_COMMIT=$(git rev-parse HEAD)
export SOURCE_COMMIT=${SOURCE_COMMIT:0:8}

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

TAG="$PACKAGE_VERSION-$SOURCE_COMMIT"

./set_build_version.sh

git add config.json
git commit -m "Set build version"

git tag "$TAG"
git push --tags

docker pull $DOCKER_IMAGE_ID
docker tag $DOCKER_IMAGE_ID $DOCKER_IMAGE_NAME:$TAG
docker push $DOCKER_IMAGE_ID:$TAG
