FROM debian:buster
EXPOSE 40772
ENV DOCKER="YES"
ENV DEV="libpcsclite-dev build-essential curl libssl-dev yasm libtool autoconf pkg-config gcc git g++ make automake"

RUN apt-get update && \
    apt-get -y install pcscd libpcsclite1 libccid pcsc-tools dvb-tools && \
    apt-get -y install $DEV

# https://github.com/Chinachu/dvbconf-for-isdb.git
RUN cd /usr/local && \
    git clone https://github.com/Chinachu/dvbconf-for-isdb.git

# nodejs
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get install -y nodejs

# pm2
RUN npm install pm2 -g

# arib-b25-stream-test
RUN npm install arib-b25-stream-test -g --unsafe

# mirakurun
RUN npm install mirakurun -g --unsafe --production

# 不要なパッケージを削除
RUN apt-get -y remove $DEV && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \

WORKDIR /usr/lib/node_modules/mirakurun

ENTRYPOINT /etc/init.d/pcscd start && \
    npm start

