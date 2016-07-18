FROM node

# Update and install packages
RUN echo "deb http://ftp.debian.org/debian jessie-backports main" >> /etc/apt/sources.list
RUN apt-get update
RUN apt-get -t jessie-backports install -y \
   build-essential \
   ffmpeg

# Create local-music-bot directory
RUN mkdir -p /usr/src/local-music-bot
WORKDIR /usr/src/local-music-bot

# Install app dependencies
COPY package.json /usr/src/local-music-bot/
RUN npm install

# Bundle local-music-bot source
COPY . /usr/src/local-music-bot

CMD [ "npm", "start" ]
