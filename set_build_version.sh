#!/bin/bash
#Sets project build version
set -e

CONFIG_FILE="config.json"
touch ${CONFIG_FILE}

SHA=${SOURCE_COMMIT:-'dev'}
SHA=${SHA:0:8}

echo "Setting build version to $SHA in ${CONFIG_FILE}"

echo "{ \"build\": \"$SHA\" }" > ${CONFIG_FILE}

