#!/bin/bash

ENV_FILE="/usr/share/nginx/html/env-config.js"

rm -f ${ENV_FILE}
touch ${ENV_FILE}

if [[ ! -z "${API_URL}" ]]; then
    echo "var API_URL = \"${API_URL}\";" >> ${ENV_FILE}
fi

echo "Using env-config.js:"
echo "----"
cat ${ENV_FILE}
echo "----"

echo "Starting the production server..."
nginx -g "daemon off;"