# Stage-1 Build and Development Environment
FROM node:14.11 as build
ARG NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL warn
ENV PORT=${PORT:-4000}
ENV API_URL=${API_URL:-http://127.0.0.1:8000}
RUN mkdir /app
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

ADD package.json /app/
ADD package-lock.json /app/

RUN npm install --production=false

ADD webpack.config.js /app/
ADD .babelrc /app/
ADD src /app/src/
ADD public /app/public/
ADD package.json /app/
ADD package-lock.json /app/

ADD start.sh /app/
RUN chmod +x start.sh

RUN npm run build
RUN cp public/bootstrap.min.css dist/
RUN cp public/favicon.ico dist/

EXPOSE ${PORT}

CMD ["bash", "-c", "./start.sh"]

# Stage-2 Production Environment
FROM nginx:1.12-alpine

# Add bash
RUN apk add --no-cache bash

ADD start-prod.sh /
RUN chmod +x start-prod.sh

# Copy the tagged files from the build to the production environmnet of the nginx server
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Copy nginx configuration
ADD ngnix /etc/nginx/conf.d/

# Make port 80 available to the world outside the container
EXPOSE 8080

# Start the server
CMD ["bash", "-c", "/start-prod.sh"]