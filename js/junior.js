function Junior() {
  this.lives = 3;
  this.x = 0;
  this.y = 1;
  this.goingBackFromJumpInNextCycle = false;
  this.died = false;
  this.nextMoveCycle = 0;
  this.lastMove = 0;
  this.lifeState = 0;
  this.jumptick = 0;
  this.jumpOverEnemy = false;
}
Junior.collisionMap = {
  1: { forward: 'snapjaw1.6', up: 'spark1.2' },
  2: { forward: 'snapjaw1.5', left: 'snapjaw1.6', up: 'spark1.3' },
  3: { forward: 'snapjaw1.4', back: 'snapjaw1.5', up: 'spark1.4' },
  4: { forward: 'snapjaw1.3', back: 'snapjaw1.4', up: 'spark1.5' },
  5: { forward: 'spark1.6.9', back: 'snapjaw1.3' },
  6: { forward: 'spark1.6' },
  7: { forward: 'spark1.6', back: 'spark1.6' },
  8: { forward: 'spark1.5', back: 'spark1.6', up: 'spark2.2' },
  9: { forward: 'spark1.4', back: 'spark1.5', up: 'spark2.3' },
  10: { forward: 'spark1.3', back: 'spark1.4', up: 'spark2.4' },
  11: { forward: 'spark2.5.9', back: 'spark1.3' },
  13: { forward: 'snapjaw2.6', back: 'spark2.5' },
  14: { forward: 'snapjaw2.5', back: 'snapjaw2.6' },
  15: { forward: 'snapjaw2.4', back: 'snapjaw2.5' },
  16: { forward: 'snapjaw2.3', back: 'snapjaw2.4' },
  17: { back: 'snapjaw2.3' }
};
Junior.prototype = {
  getState: function () {
    return "junior-" + this.x + (this.y >= 2 ? ("-" + this.y) : "") + (this.died ? " died" : "") + ' ' + this.getLifeState() + ' ' + this.getViewportState();
  },
  getLifeState: function () {
    if (this.lifeState) return this.lifeState;
    var state = [];
    if (this.lives > 0 && this.x == 0) state.push("life-1");
    if (this.lives > 1) state.push("life-2");
    if (this.lives > 2) state.push("life-3");
    return state.join(' ');
  },
  getViewportState: function () {
    if (this.x == 13 || (this.x == 14 && this.y == 1)) return 'viewport-5';
    if (this.x >= 13) return 'viewport-6';
    if (this.x >= 12 && this.x < 13) return 'viewport-4';
    if (this.x >= 9 && this.x < 12) return 'viewport-3';
    if (this.x >= 7 && this.x < 9) return 'viewport-2';
    if (this.x < 7) return 'viewport-1';
    return
  },
  canMove: function () {
    if (cycle < this.nextMoveCycle) return false;
    return !this.died && !kong.isUnlocking && !kong.isFree && !key.isThrowing;
  },
  move: function (axis, amount, effect) {
    if (effect) sound.play(effect);
    var dir, performMove = true;
    if (axis == "x" && amount == 1) dir = "forward";
    if (axis == "x" && amount == -1) dir = "back";
    if (axis == "y" && amount == 1) dir = "up";
    if (axis == "y" && amount == -1) dir = "down";
    var collision = Junior.collisionMap[junior.x];
    var doMoveForwardOnDie = false;
    if (collision) collision = collision[dir];
    if (collision) {
      var enemyType = collision.split('.')[0];
      var enemyPos = collision.split('.')[1];
      doMoveForwardOnDie = collision.split('.')[2] == '9';
      stop = collision.split('.')[2] == 'stop';
      collision = dk.settings[enemyType].takenPositions[enemyPos];
    }
    if (godmode) collision = false;
    if (!collision || (collision && dir != 'forward') || (collision && doMoveForwardOnDie))
      this[axis] = this[axis] + amount;
    if (collision)
      this.die();
  },
  handleRepeat: function (dir) {
    // handle timeout between repeating similar moves
    var move = dir;
    if (move == this.lastMove) this.nextMoveCycle = cycle + 1;
    this.lastMove = move;
  },
  moveLeft: function () {
    if (!this.canMove()) return;
    if (this.y > 1) return;
    if (this.x >= 2 && this.x <= 5) this.move('x', -1, 'move');
    if (this.x >= 7 && this.x <= 10) this.move('x', 1, 'move');
    if (this.x >= 14 && this.x <= 17) this.move('x', -1, 'move');
    this.handleRepeat('left');
  },
  moveRight: function () {
    if (!this.canMove()) return;
    if (this.y > 1) return;
    if (this.x >= 1 && this.x <= 4) this.move('x', 1, 'move');
    if (this.x >= 8 && this.x <= 11) this.move('x', -1, 'move');
    if (this.x >= 13 && this.x <= 16) this.move('x', 1, 'move');
    this.handleRepeat('right');
  },
  moveUp: function () {
    if (!this.canMove()) return;
    if (this.x == 0) this.move('x', 1, 'move'); // start
    if (this.x == 6) this.move('x', 1, 'move'); // climb to upper row of lower screen
    if (this.x == 12) this.move('x', 1, 'move'); // climb to upper screen
    if (this.x >= 14 && this.x <= 17 && this.y == 4) kong.unlock(this.x - 13); // unlock
    if (this.x >= 14 && this.x <= 17 && this.y >= 2 && this.y <= 3) this.move('y', 1, 'move'); // climb up
    this.handleRepeat('up');
  },
  moveDown: function () {
    if (!this.canMove()) return;
    if (this.x == 6) this.move('x', -1, 'move'); // keep in this order
    if (this.x == 7) this.move('x', -1, 'move');
    if (this.x == 12) this.move('x', -1, 'move'); // fall down right after climbing to lower screen
    if (this.x == 13 && this.y == 1) this.move('x', -1, 'move'); // climb to lower screen
    if (this.x >= 14 && this.x <= 17 && this.y >= 2 && this.y <= 4) this.move('y', -1, 'move'); // climb down
    this.handleRepeat('down');
  },
  jump: function () {
    // helper method
    function doJump(axis, amount, effect) {
      junior.jumptick = tick;
      // detect if junior will jump over an enemy
      var collision = Junior.collisionMap[junior.x];
      if (collision) collision = collision['forward'];
      if (collision) {
        var enemyType = collision.split('.')[0];
        var enemyPos = collision.split('.')[1];
        collision = dk.settings[enemyType].takenPositions[enemyPos];
        if (collision) junior.jumpOverEnemy = true;
      }
      return junior.move(axis, amount, effect);
    }

    if (!this.x) return;
    if (!this.canMove()) return;
    if (this.y == 1) {
      if (this.x == 5) return doJump('x', 1, 'jump');
      if (this.x == 11) return doJump('x', 1, 'jump');
      if (this.x != 6 && this.x != 7 && this.x != 12) {
        doJump('y', 1, 'jump');
        if (this.x == 1) key.throwUp(1);
        if (this.x == 13) key.throwUp(3);
      }
    }
  },
  isJumping: function () {
    if (this.y != 2)
      return false;
    if (this.x >= 1 && this.x <= 4) return true;
    if (this.x >= 8 && this.x <= 10) return true;
    if (this.x == 13) return true;
    return false;
  },
  backFromJump: function () {
    // when going back from a jump, wait a few cycles to mimic original behavior
    if (!this.goingBackFromJumpInNextCycle) {
      this.goingBackFromJumpInNextCycle = cycle + 1;
      return;
    }
    if (cycle >= this.goingBackFromJumpInNextCycle) {
      this.goingBackFromJumpInNextCycle = 0;
      this.y = 1;
      if (this.jumpOverEnemy) {
        this.jumpOverEnemy = false;
        digits.addScore(1);
      }
    }
  },
  die: function () {
    if (godmode) return;
    sound.play('miss');
    this.diedCycle = cycle;
    this.died = true;
    digits.canThrowKeyUpWithoutMiss = false;
  },
  backFromDeath: function () {
    var delta = cycle - (this.diedCycle + 8 * 3);
    if (delta > 0) {
      switch (delta) {
        case 1:
          if (this.lives == 1) this.nextLife();
          if (this.lives == 2) this.lifeState = "life-2";
          if (this.lives == 3) this.lifeState = "life-2 life-3";
          break;
        case 2:
          if (this.lives == 2) this.nextLife();
          if (this.lives == 3) this.lifeState = "life-1 life-3";
          break;
        case 3: this.nextLife();
          break;
      }
    }
  },
  nextLife: function () {
    this.lives--;
    this.lifeState = 0;
    if (this.lives == 0) return dk.gameover();
    this.died = false;
    this.x = 0;
    this.y = 1;
    this.goingBackFromJumpInNextCycle = 0;
    key.reset();
  },
  reset: function () {
    this.lives = 3;
    this.lifeState = 0;
    this.died = false;
    this.x = 0;
    this.y = 1;
    this.goingBackFromJumpInNextCycle = 0;
    this.nextMoveCycle = 0;
    this.lastMove = 0;
    this.jumptick = 0;
  }
}