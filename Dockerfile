FROM node:14.11
ENV NPM_CONFIG_LOGLEVEL warn
RUN mkdir /app
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/
COPY start.sh /app/
COPY start-prod.sh /app/
COPY webpack.config.js /app/
ADD . /app/
CMD ["sh", "-c", "./start.sh"]
