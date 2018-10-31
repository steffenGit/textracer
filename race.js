"use strict";

const RACE_STATE = {
  SETUP: 0,
  COUNTDOWN: 1,
  RACING: 2,

};

const MAX_APPROACH_TIME = 5000;
const MIN_APPROACH_TIME = 1000;

class Race {
  constructor(name, numberOfCorners) {
    this.name = name;
    this.corners = this.setupCorners(numberOfCorners);
    this.players = [];
    this.playerReady = [];
    this.playerFinished = [];
    this.startTime = undefined;
    this.state = RACE_STATE.SETUP;
  }


  joinRace(name, socket) {
    if(this.state === RACE_STATE.SETUP) {
      this.players.push(new Driver(name, socket, this));
      return true;
    }
    return false;
  }

  voteStart(player) {
    if(this.playerReady.indexOf(player) === -1) {
      this.playerReady.push(player);
    }
    if(this.playerReady.length === this.players.length) this.start();
  }

  start() {
    this.state = DRIVER_STATE.RACING;
    this.startTime = Math.round((new Date()).getTime() / 1000);
    this.players.forEach(p => p.start(this.startTime));
  }

  onPlayerFinish(player) {
    this.playerFinished.push(player);
  }

  onPlayerDead(player) {
    this.playerFinished.push(player);
  }

  getCorner(index) {
    return this.corners[index];
  }

  setupCorners(numberOfCorners) {
    let corners = [];
    for(let i = 1; i < numberOfCorners-1; i ++) {
      let direction = 'left';
      if(Math.random() > 0.5) direction = 'right';
      let approachTime = Math.random()*(MAX_APPROACH_TIME-MIN_APPROACH_TIME) + MIN_APPROACH_TIME;
      corners.push({
        direction: direction,
        approachTime: approachTime,
      });

    }

    corners[0] = { direction: 'start', approachTime:3000};
    corners[numberOfCorners-2] = { direction: 'finish', approachTime:3000};

    return corners;
  }
}