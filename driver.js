"use strict";

const DRIVER_STATE = {
  SETUP: 0,
  READY: 1,
  COUNTDOWN: 2,
  FINISH: 3,
  APPROACH: 4,
  USER_INPUT: 5,
  DEAD: 6,
  CELEBRATING: 7,
};

class Driver {
  constructor(name, socket, race) {
    this.name = name;
    this.socket = socket;
    this.race = race;
    this.state = DRIVER_STATE.SETUP;
    this.currentCornerCt = 0;
    this.currentCorner = undefined;
    this.startTime = undefined;
    this.finishTime = undefined;
    this.approachTimer = undefined;

    socket.on('player_ready', (msg) => {
      this.onReady();
    });

    socket.on('user_input', (msg) => {
      this.onUserInput(msg)
    });


  }


  onReady() {
    this.state = DRIVER_STATE.READY;
    this.race.voteStart(this);
  }

  start(startTime) {
    this.startTime = startTime;
    // TODO emit countdown message
    this.approach(this.currentCornerCt);

  }

  onUserInput(message) {
    try {
      let tokens = message.split(' ');
      let command = tokens[0];

      switch (command) {
        case 'go':
          this.onPlayerGo();
          break;
        case 'turn':
          this.onPlayerTurn(tokens[1]);
          break;
        case 'celebrate':
          this.onPlayerCelebrate();
          break;
        default:
          this.die('made a mistake')
      }
    } catch (e) {
      this.die('made a mistake');
    }
  }


  onPlayerGo() {
    if (this.currentCornerCt === 0 && this.state === DRIVER_STATE.APPROACH) {
      this.currentCornerCt++;
      this.approach(this.currentCornerCt);
    } else {
      this.die('made a mistake');
    }

  }

  approach(cornerIndex) {
    this.state = DRIVER_STATE.APPROACH;
    this.currentCorner = this.race.getCorner(cornerIndex);
    this.approachTimer = setTimeout(() => {
      this.state = DRIVER_STATE.USER_INPUT;
      let cornerDirection = this.currentCorner.direction;
      if (cornerDirection === 'finish') {
        this.reachFinish();
      } else if (cornerDirection === 'start') {
        // TODO: emit start message
      }
      // TODO EMIT TO CLIENT
    }, this.currentCorner.approachTime);

  }

  onPlayerTurn(direction) {
    if (this.state !== DRIVER_STATE.USER_INPUT) {
      this.die('turned on the straight.');
      return;
    }

    let targetDirection = this.currentCorner.direction;
    if (direction !== targetDirection) {
      this.die('turned into the wrong direction');
      return;
    }

    // TODO emit success message
    this.currentCornerCt++;
    this.approach(this.currentCornerCt);
  }

  die(message) {
    this.state = DRIVER_STATE.DEAD;
    // TODO emit to client
    this.race.onPlayerDead(this);
  }

  reachFinish() {
    this.state = DRIVER_STATE.FINISH;
    // TODO set finish time
    // emit to client
    this.race.onPlayerFinish(this);
  }


  onPlayerCelebrate() {
    if (this.state === DRIVER_STATE.FINISH) {
      this.state = DRIVER_STATE.CELEBRATING;
      // TODO emit
    } else {
      this.die('made a mistake');
    }

  }

  emitToAll(msg) {

  }
}