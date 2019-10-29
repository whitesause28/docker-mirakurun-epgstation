#
# base build step
#
FROM ubuntu:19.10 as base
RUN apt update
RUN apt -y install build-essential wget

#
# fdk-aac build step
#
FROM base as fdk-aac
ARG FDKAAC_VERSION=2.0.1
ARG CPUCORE=2
RUN mkdir /tmp/fdk-aac && \
    cd /tmp/fdk-aac && \
    wget https://sourceforge.net/projects/opencore-amr/files/fdk-aac/fdk-aac-${FDKAAC_VERSION}.tar.gz -O fdk-aac.tar.gz && \
    tar zxf fdk-aac.tar.gz && \
    cd /tmp/fdk-aac/fdk-aac-* && \
    ./configure --prefix=/opt/fdk-aac && \
    make CFLAGS="-O3 -march=native" CXXFLAGS="-O3 -march=native" -j${CPUCORE} && \
    make install

#
# ffmpeg build step
#
FROM base as ffmpeg
RUN apt -y install libv4l-dev libpulse-dev libswresample-dev libass-dev libfreetype?-dev libsdl1.2-dev libtheora-dev libtool libvorbis-dev pkg-config texinfo zlib1g-dev yasm libssl-dev libpciaccess-dev libwebp-dev libvidstab-dev libpostproc-dev libx264-dev libx265-dev libmp3lame-dev libopus-dev libvpx-dev libva-dev libmfx-dev
ARG FFMPEG_VERSION=snapshot
ARG CPUCORE=2
COPY --from=fdk-aac /opt/fdk-aac/ /usr/local/
RUN mkdir /tmp/ffmpeg_sources && \
    cd /tmp/ffmpeg_sources && \
    wget http://ffmpeg.org/releases/ffmpeg-${FFMPEG_VERSION}.tar.bz2 -O ffmpeg.tar.bz2 && \
    tar xjvf ffmpeg.tar.bz2 && \
    cd /tmp/ffmpeg_sources/ffmpeg* && \
    ./configure \
      --prefix=/opt/ffmpeg \
      --enable-shared \
      --arch=native \
      --extra-cflags=-O3 \
      --extra-libs=-lpthread \
      --extra-libs=-ldl \
      --enable-vaapi \
      --enable-libmfx \
      --enable-swresample \
      --enable-gpl \
      --enable-libass \
      --enable-libfreetype \
      --enable-libvidstab \
      --enable-libmp3lame \
      --enable-libopus \
      --enable-libtheora \
      --enable-libvorbis \
      --enable-libvpx \
      --enable-libwebp \
      --enable-libx264 \
      --enable-libx265 \
      --enable-libv4l2 \
      --enable-libpulse \
      --enable-libfdk_aac \
      --enable-postproc \
      --enable-small \
      --enable-version3 \
      --enable-openssl \
      --enable-nonfree \
      --disable-debug \
      --disable-doc \
      --disable-ffplay \
    && \
    cd /tmp/ffmpeg_sources/ffmpeg* && \
    make -j${CPUCORE} && \
    make install
#
# EPGStation build step
#
FROM ubuntu:19.10 as epgstation
RUN apt update && apt -y upgrade
RUN apt -y install curl git make g++ iproute2 software-properties-common
RUN apt -y install alsa-base alsa-utils pulseaudio libv4l-? libpulse? libvpx? libwebp? libwebpmux? libmp3lame? libopus? libx264? libx265? openssl libvidstab? libxcb-shm? libxcb-xfixes? libxcb-shape? libpciaccess? libwebp? libpostproc?? libswresample? libasound? libass? libvorbisenc? libtheora? libmfx? libmfx-tools intel-media-va-driver-non-free libigfxcmrt?
# install node.js
#RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
#    apt -y install nodejs
RUN add-apt-repository -y -r ppa:chris-lea/node.js && \
    curl -sSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - && \
    VERSION=node_10.x && \
    DISTRO="disco" && \
    echo "deb https://deb.nodesource.com/$VERSION $DISTRO main" | tee /etc/apt/sources.list.d/nodesource.list && \
    echo "deb-src https://deb.nodesource.com/$VERSION $DISTRO main" | tee -a /etc/apt/sources.list.d/nodesource.list && \
    apt -y update && \
    apt -y install nodejs
# install EPGStation
RUN cd /usr/local/ && \
    git clone https://github.com/l3tnun/EPGStation.git && \
    cd /usr/local/EPGStation && \
    npm install && \
    npm run build
# copy ffmpeg
COPY --from=fdk-aac /opt/fdk-aac/lib/ /usr/local/lib/
COPY --from=ffmpeg /opt/ffmpeg/ /usr/local/
# cleanup
RUN apt -y remove make g++ ".*-dev" && \
    apt autoremove -y && \
    rm -rf /var/lib/apt/lists/*
# user & groups
RUN groupadd -g 1000 epgstation && \
    groupadd -g 115 render2 && \
    useradd -g epgstation -G audio,video,render,render2 epgstation && \
    chown epgstation /usr/local/EPGStation/recorded

USER epgstation

WORKDIR /usr/local/EPGStation

ENTRYPOINT npm start
