var sound = {
  enabled: (document.location.protocol != 'file:' && typeof (webkitAudioContext) != "undefined"),
  context: null,
  bufferLoader: null,
  onload: null,
  currentGain: 0,
  effects: [
    { fxname: "chain", type: "effect", url: 'sound/snd_chain.mp3', buffer: null, source: null },
    { fxname: "chance", type: "effect", url: 'sound/snd_chance.mp3', buffer: null, source: null },
    { fxname: "jump", type: "effect", url: 'sound/snd_jump.mp3', buffer: null, source: null },
    { fxname: "key", type: "effect", url: 'sound/snd_key.mp3', buffer: null, source: null },
    { fxname: "miss", type: "effect", url: 'sound/snd_miss.mp3', buffer: null, source: null },
    { fxname: "move", type: "effect", url: 'sound/snd_move.mp3', buffer: null, source: null },
    { fxname: "over", type: "effect", url: 'sound/snd_over.mp3', buffer: null, source: null },
    { fxname: "safe", type: "effect", url: 'sound/snd_safe.mp3', buffer: null, source: null },
    { fxname: "tick_bottom", type: "effect", url: 'sound/snd_tick_bottom.mp3', buffer: null, source: null },
    { fxname: "tick_top", type: "effect", url: 'sound/snd_tick_top.mp3', buffer: null, source: null }
  ],
  init: function (loadComplete) {
    if (!sound.enabled) return;

    this.context = new webkitAudioContext();

    this.onload = loadComplete;

    this.nodes = {
      destination: this.context.destination,
      masterGain: this.context.createGainNode(),
      backgroundMusicGain: this.context.createGainNode(),
      ambienceGain: this.context.createGainNode(),
      effectsGain: this.context.createGainNode()
    };

    this.nodes.masterGain.connect(this.nodes.destination);
    this.nodes.backgroundMusicGain.connect(this.nodes.masterGain);
    this.nodes.ambienceGain.connect(this.nodes.masterGain);
    this.nodes.effectsGain.connect(this.nodes.masterGain);

    this.bufferLoader = new BufferLoader(
      sound.context,
      sound.effects,
      sound.loadComplete
    );

    this.bufferLoader.load();
  },
  loadComplete: function (bufferList) {
    this.effects = bufferList;
    if (sound.onload)
      sound.onload();
  },
  getSound: function (name) {
    for (var i = 0; i < this.effects.length; i++) {
      if (this.effects[i].fxname == name) return this.effects[i];
    }
  },
  play: function (name, loop, volume) {
    if (!this.enabled) return;

    var effect = this.getSound(name);
    var type = effect.type;
    var source = effect.source;
    source = sound.context.createBufferSource();
    effect.source = source;
    source.buffer = effect.buffer;
    source.connect(this.getGain(type));

    source.loop = loop;
    if (volume) sound.setVolume(name, volume, 0);

    source.noteOn(0);
  },
  mute: function () {
    if (!sound.enabled) return;
    var gain = this.nodes.masterGain.gain;
    this.currentGain = gain.value;
    this.setVolume("", 0);
  },
  unmute: function () {
    if (!sound.enabled) return;
    this.setVolume("", this.currentGain);
  },
  getGain: function (type) {
    if (!sound.enabled) return;
    var gain = this.nodes.masterGain;
    if (type == "effect") gain = this.nodes.effectsGain;
    else if (type == "ambience") gain = this.nodes.ambienceGain;
    else if (type == "bgm") gain = this.nodes.backgroundMusicGain;
    return gain;
  },
  // todo: figure out a way to stop playing one bgm while continuing to play another, or
  // add ability to stop playing a source
  setVolume: function (name, volume, dur) {
    if (!sound.enabled) return;
    var effect = this.getSound(name);
    var type = effect ? effect.type : "";
    var gain = this.getGain(type).gain;

    //if (dur && dur > 0)gain.linearRampToValueAtTime(volume,dur);
    gain.value = volume;
  }
};