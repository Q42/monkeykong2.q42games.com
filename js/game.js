var key = null;
var junior = null;
var kong = null;
var cycle = 0;
var tick = 0;
var nextCycle = 0;
var godmode = false;
var gameover = false;

// upon load, add device classname to html element for further styling
var device =
{
  "iphone" : (navigator.userAgent.indexOf("iPhone") != -1 || navigator.userAgent.indexOf("iPod") != -1),
  "ipad" : (navigator.userAgent.indexOf("iPad") != -1),
  "android" : (navigator.userAgent.indexOf("Android") != -1)
};
device.desktop = !device.iphone && !device.ipad && !device.android;
device.iOS = device.iphone || device.ipad;

//if (device.desktop) document.write('<script src="js/sound10.js"></script>');

for (var d in device)
  if (device[d]) document.documentElement.className += " " + d;

// our engine
  var dk =
{
  splash: function () {
    dk.onOrientationChange();
    window.addEventListener('orientationchange', dk.onOrientationChange, false);
    $('html').removeClass('loading');
    if (device.iOS && !navigator.standalone) {
      // don't allow moving, scrolling, etc
      $('body').bind('touchstart touchmove touchend', function (e) { e.preventDefault(); return false; });
      return;
    }
    sound.init();
    $('#splash').bind('touchstart, mousedown', dk.touchSplash);
    $('body').bind('keydown', dk.doKeyDown);
    $(window).resize(dk.resize);
    dk.resize();
  },
  resize: function () {
    if (device.desktop) {
      var offsetTop = Math.max(Math.round(($(window).height() - $('#game-and-watch').height()) / 2), 0);
      $('#game-and-watch').css('top', offsetTop);
      $('#controls').css('top', offsetTop);
    }
  },
  touchSplash: function (evt) {
    if (evt) {
      var el = $(evt.target)[0];
      if (el.nodeName.toLowerCase() == 'a') return;
    }
    // when splash screen is shown in portrait mode, don't start the game
    if (dk.started) return;
    document.body.className = 'game';
    dk.start();
  },
  start: function () {
    dk.started = true;
    junior = new Junior();
    key = new Key();
    kong = new Kong();

    dk.addEventListener(document, "keyup", dk.doKeyUp);
    dk.addEventListener(document, "touchstart", dk.onTouchStart);
    dk.addEventListener(document, "touchend", dk.onTouchEnd);
    dk.addEventListener(document, "touchmove", dk.onTouchMove);
    if (device.desktop) {
      dk.addEventListener(document, "mousedown", dk.onTouchStart);
      dk.addEventListener(document, "mouseup", dk.onTouchEnd);
    }
    dk.generateStateClassNames();
    dk.advance();
  },
  addEventListener: function (el, strEventName, listener) {
    if (el.addEventListener)
      el.addEventListener(strEventName, listener, true);
    else
      el.attachEvent("on" + strEventName, listener);
  },
  cancelEvent: function (evt) {
    if (evt.stopPropagation) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    else {
      evt.cancelBubble = true;
      evt.returnValue = 0;
    }
  },
  // dynamically add css to the page
  addCss: function (css) {
    var head = document.getElementsByTagName("head")[0];
    var style = document.createElement("style");
    style.type = "text/css";
    head.appendChild(style);
    if (style.styleSheet)
      style.styleSheet.cssText = css;
    else
      style.appendChild(document.createTextNode(css));
  },
  settings: {
    idcounter: 0,
    waitTime: 60,
    totalTime: 0,
    snapjaw1: { max: 7, chance: 0.2, every: 2, delay: 1, takenPositions: {} },
    spark1: { max: 7, chance: 0.2, every: 2, delay: 0, takenPositions: {} },
    spark2: { max: 5, chance: 0.2, every: 4, delay: 0, takenPositions: {} },
    snapjaw2: { max: 7, chance: 0.2, every: 2, delay: 0, takenPositions: {} },
    bird: { max: 16, chance: 0.2, every: 2, delay: 1, takenPositions: {} }
  },
  enemies: {
    snapjaw1: {},
    spark1: {},
    spark2: {},
    snapjaw2: {},
    bird: {}
  },
  keyPressed: 0,
  started: false,
  newId: function () {
    return ++dk.settings.idcounter;
  },
  restart: function () {
    kong.reset();
    key.reset();
    junior.reset();
    dk.enemies = {
      snapjaw1: {},
      spark1: {},
      spark2: {},
      snapjaw2: {},
      bird: {}
    };
    gameover = false;
    sound.play('key');
    digits.reset();
  },
  generateStateClassNames: function () {
    var cssText = [];
    var els = $("#game-and-watch div");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.className.indexOf("tile") == 0) {
        var type = el.getAttribute("id");
        var rule = "." + type + " #" + type + " { opacity: 1; filter:alpha(opacity:100); }\n";
        cssText.push(rule);
      }
    }
    dk.addCss(cssText.join(''));
  },
  advance: function () {
    var ms = new Date().getTime();
    dk.handleKeyPressed();
    if (ms > nextCycle && !gameover) {
      cycle++;
      if (cycle % 8 == 0) {
        tick++;
        if (kong.isFree)
          kong.freeKong();
        if (key.isThrowing)
          key.advance();

        /* tick sound */
        var playTickSound = !kong.isUnlocking && !kong.isFree && !junior.died && key.position != 2 && key.position != 4;
        if (playTickSound) {
          if (junior.x <= 12) {
            sound.play('tick_bottom');
          }
          else if (junior.x >= 13) {
            if (tick % 2 == 0)
              sound.play('tick_bottom');
            else
              sound.play('tick_top');
          }

        }
        var moveEnemies = !junior.died && !key.isThrowing && kong.isUnlocking == 0 && !kong.isFree;
        if (moveEnemies)
          dk.moveEnemies();
      }
      if (cycle % 3 == 0) {
        if (kong.isUnlocking > 0)
          kong.flash();
      }
      // when junior is set to go back from a jump, see if he needs to do so
      if (!junior.died && junior.goingBackFromJumpInNextCycle && tick > junior.jumptick - 1)
        junior.backFromJump();

      if (junior.died) junior.backFromDeath();

      dk.redraw();
      nextCycle = new Date().getTime() + dk.settings.waitTime;
    }
    setTimeout("dk.advance()", 0);
  },
  moveEnemies: function () {
    var allowJuniorBackFromJump = false;

    // set total time elapsed
    dk.settings.totalTime += dk.settings.waitTime;

    // go through all possible enemyTypes
    for (var enemyType in dk.enemies) {
      if (junior.died) break;
      var noNewEnemyYet = false;
      var enemySettings = dk.settings[enemyType];
      enemySettings.takenPositions = {};

      // see if this is the enemy's tick, based on delay and every
      var tick = dk.settings.totalTime % (dk.settings.waitTime * enemySettings.every);
      var thisIsMyTick = (tick == enemySettings.delay * dk.settings.waitTime);

      var anEnemyHalted = false;
      // go through all of this type of enemies instances
      for (var id in dk.enemies[enemyType]) {
        if (junior.died) break;
        var enemy = dk.enemies[enemyType][id];
        if (enemy.position < 2) noNewEnemyYet = true;

        // enemies except birds can only advance in their tick
        if (enemyType != "bird") {
          if (thisIsMyTick) enemy.advance();
        } else {
          // birds heading west shift their tick by one
          if ((enemy.position > 5) && (enemy.position < 11)) {
            if (tick == 0) enemy.advance();
          } else {
            if (thisIsMyTick) enemy.advance();
          }
        }
        enemySettings.takenPositions[enemy.position] = true;
        if (enemy && junior.died && enemy.position == enemy.oldPosition) anEnemyHalted = true;
      }

      if (!thisIsMyTick) continue;

      // anEnemyHalted prevents a new snapjaw1 upon death by first snapjaw1 all the way right
      if (!noNewEnemyYet && !anEnemyHalted) {
        var chance = 1 / dk.settings[enemyType].chance;
        if (Math.floor(Math.random() * chance) == 0) {
          // add new enemy
          var enemy = new Enemy(enemyType);
          dk.enemies[enemyType][enemy.id] = enemy;
          enemySettings.takenPositions[enemy.position] = true;
        }
      }

      // the time junior falls down from his jump depends on his y position and that enemy's tick
      switch (enemyType) {
        case "snapjaw1":
          if (junior.x <= 4)
            allowJuniorBackFromJump = true;
          break;
        case "spark1":
          if (junior.x >= 8 && junior.x <= 10)
            allowJuniorBackFromJump = true;
          break;
        case "snapjaw2":
          if (junior.x == 13)
            allowJuniorBackFromJump = true;
          break;
      }

      // if junior is jumping, and he is in this tick, let him fall down again
      if (junior.isJumping() && allowJuniorBackFromJump) {
        junior.backFromJump();
      }
    }
  },
  gameover: function () {
    junior.x = 0;
    junior.y = 1;
    gameover = true;
    dk.redraw();
    sound.play('over');
  },
  redraw: function () {
    var state = [];
    state.push("cycle-2-" + cycle % 2);
    state.push("cycle-3-" + cycle % 3);
    state.push("cycle-5-" + cycle % 5);
    state.push("tick-" + tick % 2);
    state.push('mario');
    state.push(kong.getState());
    state.push(key.getState());
    state.push(junior.getState());
    state.push(digits.getState());
    // add enemies
    for (var enemyType in dk.enemies) {
      for (var id in dk.enemies[enemyType]) {
        var enemy = dk.enemies[enemyType][id];
        state.push(enemy.getState());
      }
    }
    // for each in dk.enemies
    $("#game-and-watch")[0].className = state.join(' ');
  },
  doKeyDown: function (evt) {
    evt = evt ? evt : event;
    var key = evt.keyCode;

    if (document.body.className == 'splash') {
      switch (key) {
        case 37:
        case 39:
        case 38:
        case 40:
        case 17:
        case 32:
        case 27:
        case 13:
          dk.cancelEvent(evt);
          dk.touchSplash();
      }
      return;
    }

    dk.keyPressed = key;
    switch (dk.keyPressed) {
      case 37:
      case 39:
      case 38:
      case 40:
      case 17:
      case 32:
      case 27:
        dk.cancelEvent(evt);
    }
  },
  onTouchStart: function (evt) {
    var el = evt.srcElement || evt.target;
    if (el.className != "touch-area") return;
    var id = el.getAttribute("id");
    switch (id) {
      case "touch-area-left":
        dk.keyPressed = 37;
        break;
      case "touch-area-right":
        dk.keyPressed = 39;
        break;
      case "touch-area-up":
        dk.keyPressed = 38;
        break;
      case "touch-area-down":
        dk.keyPressed = 40;
        break;
      case "jump":
        dk.keyPressed = 32;
        break;
      case "start":
        dk.keyPressed = 27;
        break;
    }
  },
  onTouchMove: function (evt) {
    dk.cancelEvent(evt);
  },
  onTouchEnd: function (evt) {
    var ctrl = $('#controller');
    ctrl.className = '';
  },
  onOrientationChange: function (evt) {
    var ori = (window.orientation == 0 || window.orientation == 180) ? "portrait" : "landscape";
    if (dk.started && ori == 'landscape')
      document.body.className = 'game';
    else
      document.body.className = 'splash';
    $('html').removeClass('portrait landscape').addClass(ori);
  },
  handleKeyPressed: function () {
    var ctrl = $('#controller')[0];
    switch (dk.keyPressed) {
      case 37:
        ctrl.className = 'left';
        junior.moveLeft();
        break;
      case 39:
        ctrl.className = 'right';
        junior.moveRight();
        break;
      case 38:
        ctrl.className = 'up';
        junior.moveUp();
        break;
      case 40:
        ctrl.className = 'down';
        junior.moveDown();
        break;
      case 17:
      case 32:
        junior.jump();
        break;
      case 27:
        dk.restart();
        break;
    }
    dk.keyPressed = 0;
    dk.redraw();
  },
  doKeyUp: function (evt) {
    var ctrl = $('#controller')[0];
    ctrl.className = '';
  }
}
dk.addEventListener(window, "load", dk.splash);