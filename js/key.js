function Key() {
  this.isThrowing = false;
  this.position = 1;
}
Key.prototype = {
  throwUp: function (requiredPosition) {
    if (this.position == requiredPosition) {
      this.isThrowing = true;
      if (this.position == 1 && digits.canThrowKeyUpWithoutMiss) {
        digits.addScore(5);
      }
    }
  },
  advance: function () {
    this.position++;
    tick = 0; junior.jumptick = 1;
    switch (this.position) {
      case 2:
      case 4:
        sound.play('key');
        break;
      case 3:
        this.isThrowing = false;
        junior.jumptick = 0;
        break;
      case 5:
        this.isThrowing = false;
        this.throwInLock();
        junior.jumptick = 1;
        break;
    }
  },
  throwInLock: function () {
    var places = [];
    for (var i = 0; i < kong.locked.length; i++)
      if (kong.locked[i]) places.push(i);

    var lockNr = places[Math.floor(Math.random() * places.length)] + 1;
    this.position = 4 + lockNr;
    digits.canThrowKeyUpWithoutMiss = true;
  },
  reset: function () {
    this.position = 1;
  },
  getState: function () {
    return "key-" + this.position;
  }
}