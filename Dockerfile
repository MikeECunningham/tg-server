FROM node:13.8.0-alpine3.10

WORKDIR /server/

COPY / /server/

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make python && \
  npm install --quiet node-gyp -g &&\
  npm install --quiet && \
  npm install -g nodemon

RUN npm install