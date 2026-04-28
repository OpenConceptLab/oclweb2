# Stage-1 Build and Development Environment
FROM node:14.11 as build
ARG NODE_ENV=production
ARG NODE_OPTIONS=--max_old_space_size=700
ENV NPM_CONFIG_LOGLEVEL warn
ENV WEB_PORT=${WEB_PORT:-4000}
ENV API_URL=${API_URL:-http://127.0.0.1:8000}
ENV RECAPTCHA_SITE_KEY=${RECAPTCHA_SITE_KEY:-6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI}
ENV GA_ACCOUNT_ID=${GA_ACCOUNT_ID:-UA-000000-01}
ENV ERRBIT_URL=${ERRBIT_URL}
ENV ERRBIT_KEY=${ERRBIT_KEY}
ENV HOTJAR_ID=${HOTJAR_ID}
ENV LOGIN_REDIRECT_URL=${LOGIN_REDIRECT_URL}
ENV OIDC_RP_CLIENT_ID=${OIDC_RP_CLIENT_ID}
ENV OIDC_RP_CLIENT_SECRET=${OIDC_RP_CLIENT_SECRET}
RUN mkdir /app
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

ADD package.json /app/
ADD package-lock.json /app/

RUN npm ci --production=false

ADD webpack.config.js /app/
ADD .babelrc /app/
ADD src /app/src/
ADD public /app/public/

ADD start.sh /app/
RUN chmod +x start.sh

ADD set_build_version.sh /app/
RUN chmod +X set_build_version.sh

ARG SOURCE_COMMIT
RUN ["bash", "-c", "./set_build_version.sh"]

RUN npm run build
RUN cp public/bootstrap.min.css dist/
RUN cp public/favicon.ico dist/
RUN cp public/fhir.svg dist/
RUN cp public/openmrs_logo_white.gif dist/
RUN cp -rf public/fontello dist/

EXPOSE ${WEB_PORT}

CMD ["bash", "-c", "./start.sh"]

# Stage-2 Production Environment
FROM nginx:1.29.5-alpine

ENV WEB_PORT=${WEB_PORT:-4000}

# Add bash
RUN apk add --no-cache bash

ADD start-prod.sh /
RUN chmod +x start-prod.sh

# Copy the tagged files from the build to the production environmnet of the nginx server
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Copy nginx configuration
ADD nginx /etc/nginx/templates/

# Make port available to the world outside the container
EXPOSE ${WEB_PORT}

# Start the server
CMD ["bash", "-c", "/start-prod.sh"]
