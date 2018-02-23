FROM node:latest

# Install dependencies
WORKDIR /app/src

ADD package.json /app

RUN npm install

RUN npm install --global nodemon

#RUN npm install --global docker-nodemon

VOLUME /app/src

# Expose the app port
EXPOSE 6024

# Start the app
CMD npm test