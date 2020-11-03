FROM node:14.11
ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_ENV=${NODE_ENV:-development}
RUN mkdir /app
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

ADD package.json /app/
ADD package-lock.json /app/

RUN npm install
RUN npm install serve -g

ADD webpack.config.js /app/
ADD .babelrc /app/
ADD src /app/src/
ADD public /app/public/
ADD package.json /app/
ADD package-lock.json /app/

ADD start.sh /app/
ADD start-prod.sh /app/
RUN chmod +x start.sh
RUN chmod +x start-prod.sh

RUN npm run build
RUN cp public/bootstrap.min.css dist/
RUN cp public/favicon.ico dist/
CMD ["bash", "-c", "./start-prod.sh"]
