function Kong() {
  this.position = 1;
  this.isUnlocking = 0;
  this.flashNr = 0;
  this.isFree = false;
  this.locked = [true, true, true, true];
}
Kong.prototype = {
  getState: function () {
    var state = "kong-" + this.position + " flash-" + this.flashNr + " unlocking-" + this.isUnlocking;
    for (var i = 0; i < this.locked.length; i++)
      if (this.locked[i])
        state += " lock-" + (i + 1);
    if (this.isFree) state += " free";
    return state.replace(/^ | $/g, "");
  },
  advance: function () {
    this.position++;
    if (this.position == 4) {
      this.isFree = false;
      this.locked = [true, true, true, true];
    }
  },
  unlock: function (lockNr) {
    if (!this.locked[lockNr - 1]) return;
    if (key.position != (lockNr + 4)) return;
    sound.play('key');
    this.isUnlocking = lockNr;
    // should be variable between 5 and 15, time dependant
    digits.addScore(10);
  },
  flash: function () {
    this.flashNr++;
    sound.play('key');
    if (this.flashNr == 5) {
      this.locked[this.isUnlocking - 1] = false;
      this.flashNr = 0;
      this.isUnlocking = 0;
      key.reset();

      // kill enemies here
      for (var enemyType in { snapjaw2: true, bird: true }) {
        for (var id in dk.enemies[enemyType]) {
          var enemy = dk.enemies[enemyType][id];
          enemy.destroy();
        }
      }

      this.isFree = (!this.locked[0] && !this.locked[1] && !this.locked[2] && !this.locked[3]);
      if (this.isFree) key.position = 0;
    }
  },
  freeKong: function () {
    this.flashNr++;
    // move down
    if (junior.y > 1) {
      junior.y--;
      sound.play('key');
    }
    // move right
    else if (this.position == 1 && junior.x != 0 && junior.x < 17) {
      junior.x++;
      sound.play('key');
    }
    // kong jumps to freedom
    else if (this.position == 1 && junior.x != 0) {
      this.position = 2;
      sound.play('safe');
    }
    // junior catches kong
    else if (this.position == 2) {
      this.position = 3;
      junior.x = 0;
      digits.addScore(20);
      digits.canThrowKeyUpWithoutMiss = false;
    }
    // kong is put back to position 1 without locks
    else if (this.position == 3) {
      this.position = 4;
    }
    // locks are added again
    else if (this.position == 4) {
      sound.play('chain');
      this.position = 5;
      this.locked = [true, true, true, true];
    }
    // junior is back at position 1 and the key is at starting position again
    else if (this.position == 5) {
      junior.x = 0;
      this.reset();
      key.reset();
    }
  },
  reset: function () {
    this.flashNr = 0;
    this.position = 1;
    this.isFree = false;
    this.isUnlocking = 0;
    this.locked = [true, true, true, true];
  }
}