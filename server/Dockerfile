FROM node:latest

# Install dependencies
WORKDIR /app/src

ADD package.json /app

RUN npm install

VOLUME /app/src

# Expose the app port
EXPOSE 6024

# Start the app
CMD npm start
