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
if [[ ! -z "${ERRBIT_URL}" ]]; then
    echo "var ERRBIT_URL = \"${ERRBIT_URL}\";" >> ${ENV_FILE}
fi
if [[ ! -z "${ERRBIT_KEY}" ]]; then
    echo "var ERRBIT_KEY = \"${ERRBIT_KEY}\";" >> ${ENV_FILE}
fi
if [[ ! -z "${HOTJAR_ID}" ]]; then
    echo "var HOTJAR_ID = \"${HOTJAR_ID}\";" >> ${ENV_FILE}
fi
if [[ ! -z "${LOGIN_REDIRECT_URL}" ]]; then
    echo "var LOGIN_REDIRECT_URL = \"${LOGIN_REDIRECT_URL}\";" >> ${ENV_FILE}
fi
if [[ ! -z "${OIDC_RP_CLIENT_ID}" ]]; then
    echo "var OIDC_RP_CLIENT_ID = \"${OIDC_RP_CLIENT_ID}\";" >> ${ENV_FILE}
fi
if [[ ! -z "${OIDC_RP_CLIENT_SECRET}" ]]; then
    echo "var OIDC_RP_CLIENT_SECRET = \"${OIDC_RP_CLIENT_SECRET}\";" >> ${ENV_FILE}
fi
if [[ ! -z "${OIDC_REALM}" ]]; then
    echo "var OIDC_REALM = \"${OIDC_REALM}\";" >> ${ENV_FILE}
fi

echo "Adjusting nginx configuration"
envsubst '$WEB_PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Starting up the production server"
nginx -g "daemon off;"
