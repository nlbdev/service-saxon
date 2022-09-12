FROM node:14.19 as build
LABEL MAINTAINER Gaute Rønningen <Gaute.Ronningen@nlb.no> <http://www.nlb.no/>

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./

# Install dependencies for production
RUN yarn

# Bundle app source
COPY ./src .

FROM node:14.19
COPY --from=build /usr/src/app .
EXPOSE 443
HEALTHCHECK --interval=30s --timeout=10s --start-period=1m CMD http_proxy="" https_proxy="" curl --fail http://${HOST-0.0.0.0}:${PORT:-443}/health || exit 1
CMD [ "node", "index.js" ]
