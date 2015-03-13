function BufferLoader(context, list, callback) {
  this.context = context;
  this.list = list;
  this.onload = callback;
  this.bufferList = this.list;
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(obj, index) {
  // Load buffer asynchronously
  var url = obj.url;
  var name = obj.fxname;
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = obj;
        loader.bufferList[index].buffer = buffer;
        if (++loader.loadCount == loader.list.length)
          loader.onload(loader.bufferList);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.list.length; ++i)
  this.loadBuffer(this.list[i], i);
}
