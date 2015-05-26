//Simple audio playback for Plask
//
//## Example use
//      var audio = new Audio("assets/test.mp3");
//      audio.play();
//      audio.volume = 0.5;

//## Reference
var AVPlayer = require('plask').AVPlayer;

//### Audio(file)
//`file` - audio file to play
function Audio(file) {
  this.audio = new AVPlayer();
  this.audio.appendFile(file);

  this._playing = false;
  this._loops = false;

  //### volume
  //gets or sets playback volume *{ Number }*
  Object.defineProperty(this, 'volume', {
    set: function(value) {
      this.audio.setVolume(value);
    },
    get: function() {
      return this.audio.volume();
    }
  });

  //### isPlaying
  //returns true if audio is currently playing, false otherwise *{ Boolean }*
  //FIXME: this is currently not reliable as we don't have a method to detect if file stopped playing
  Object.defineProperty(this, 'isPlaying', {
    get: function() {
      return this._playing;
    }
  });

  //### currentTime
  //gets or sets current playback time *{ Number }*
  Object.defineProperty(this, 'currentTime', {
    get: function() {
      return this.audio.currentTime();
    },
    set: function(time) {
      this.audio.seekToTime(time);
    }
  });

  //### duration
  //returns total playback time in seconds  *{ Number }*
  Object.defineProperty(this, 'duration', {
    get: function() {
      return this.audio.duration() || 0;
    }
  });

  //### loop
  //gets or sets loop mode *{ Boolean }* = false
  Object.defineProperty(this, 'loop', {
    get: function() {
      return this._loops;
    },
    set: function(value) {
      this._loops = value;
      this.audio.setLoops(value);
    }
  });
}

//### play()
//start playing the file
Audio.prototype.play = function() {
  this._playing = true;
  this.audio.setRate(1);
}

//### pause()
//pause playback
Audio.prototype.pause = function() {
  this._playing = false;
  this.audio.setRate(0);
}

module.exports = Audio;