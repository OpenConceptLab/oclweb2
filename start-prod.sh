#!/bin/bash

echo "Adding env-config.js"
ENV_FILE="/usr/share/nginx/html/env-config.js"

rm -f ${ENV_FILE}
touch ${ENV_FILE}

if [[ ! -z "${API_URL}" ]]; then
    echo "var API_URL = \"${API_URL}\";" >> ${ENV_FILE}
fi

echo "Adjusting nginx configuration"
envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Starting up the production server"
nginx -g "daemon off;"