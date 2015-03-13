function Enemy(type) {
  this.id = dk.newId();
  this.position = 1;
  this.type = type;
}
Enemy.collisionMap = {
  snapjaw1: { 2: 5, 3: 4, 4: 3, 5: 2, 6: 1 },
  spark1: { 2: 11, 3: 10, 4: 9, 5: [6.9, 8], 6: 7 },
  spark2: { 4: 12.9, 5: 12 },
  snapjaw2: { 2: 17, 3:16, 4:15,5:14,6:13},
  bird: { 2:14.4, 3:15.4,4:16.4,5:17.4,7:17.3,8:16.3,9:15.3,10:14.3,12:14.2,13:15.2,14:16.2,15:17.2 }
};
Enemy.prototype = {
  destroy: function () {
    delete dk.enemies[this.type][this.id];
  },
  advance: function () {
    this.oldPosition = this.position;
    var forward = true;
    var collision = Enemy.collisionMap[this.type];
    if (collision) collision = collision[this.position];
    if (collision) {
      // test multiple collisions, such as spark1-5
      var cs = typeof collision == "number" ? [collision] : collision;
      for (var i = 0; i < cs.length; i++) {
        var c = cs[i], forwardOnCollision = false;
        var x = Math.floor(c);
        var y = c % x;
        y = !y ? 1 : Math.round(y * 10);
        if (y == 9) {
          y = 1;
          forwardOnCollision = true;
        }
        if (junior.x == x && junior.y == y) {
          if (!godmode && !forwardOnCollision) forward = false;
          junior.die();
          break;
        }
      }
    }
    if (forward) this.position++;
    if (this.position > dk.settings[this.type].max) return this.destroy();
  },
  getState: function () {
    return this.type.replace(/(\d+)$/g, "-$1") + "-" + this.position;
  }
}