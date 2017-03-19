FROM node:6.10.0

MAINTAINER xiz-tky

RUN useradd --user-group --create-home --shell /bin/false app

ENV HOME=/home/app

COPY package.json $HOME/bot/
RUN chown -R app:app $HOME/*

USER app
WORKDIR $HOME/bot
RUN npm install && npm cache clean
