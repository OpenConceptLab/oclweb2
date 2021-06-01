#!/bin/bash

WEB_PORT=${WEB_PORT:-4000}

echo "Adding env-config.js"
ENV_FILE="/usr/share/nginx/html/env-config.js"

rm -f ${ENV_FILE}
touch ${ENV_FILE}

if [[ ! -z "${API_URL}" ]]; then
    echo "var API_URL = \"${API_URL}\";" >> ${ENV_FILE}
fi
if [[ ! -z "${GA_ACCOUNT_ID}" ]]; then
    echo "var GA_ACCOUNT_ID = \"${GA_ACCOUNT_ID}\";" >> ${ENV_FILE}
fi
if [[ ! -z "${RECAPTCHA_SITE_KEY}" ]]; then
    echo "var RECAPTCHA_SITE_KEY = \"${RECAPTCHA_SITE_KEY}\";" >> ${ENV_FILE}
fi
if [[ ! -z "${WEB_VERSION}" ]]; then
    echo "var WEB_VERSION = \"${WEB_VERSION}\";" >> ${ENV_FILE}
fi
if [[ ! -z "${WEB_BUILD}" ]]; then
    echo "var WEB_BUILD = \"${WEB_BUILD}\";" >> ${ENV_FILE}
fi

echo "Adjusting nginx configuration"
envsubst '$WEB_PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Starting up the production server"
nginx -g "daemon off;"
