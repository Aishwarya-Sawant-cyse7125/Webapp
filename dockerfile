
# Node image 16
FROM node:14 AS build-env
ADD . /webapp
WORKDIR /webapp
RUN rm -rf node_modules
RUN rm -rf package-lock.json
RUN npm cache clean --force
RUN npm i --production
# RUN npm install node-rdkafka --no-package-lock

## Copy application with its dependencies into distroless image
# FROM gcr.io/distroless/nodejs
# COPY --from=build-env /webapp /webapp
# WORKDIR /webapp
CMD ["server.js"]
