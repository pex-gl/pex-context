//Simple audio playback
//
//## Example use
//      var audio = new Audio("assets/test.mp3");
//      audio.play();
//      audio.volume = 0.5;

//## Reference

var Platform = require('pex-sys').Platform;

module.exports = Platform.isPlask ? require('./PlaskAudio') : require('./HTMLAudio');

//Please refer to one of the platform specific impelementations (they have the same API):  
//[HTMLAudio](HTMLAudio.html) for the browser  
//[PlaskAudio](PlaskAudio.html) for the plask