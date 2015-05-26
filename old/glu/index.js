module.exports.Context = require('./lib/Context');
module.exports.Texture = require('./lib/Texture');
module.exports.Texture2D = require('./lib/Texture2D');
module.exports.TextureCube = require('./lib/TextureCube');
module.exports.Program = require('./lib/Program');
module.exports.Material = require('./lib/Material');
module.exports.Mesh = require('./lib/Mesh');
module.exports.OrthographicCamera = require('./lib/OrthographicCamera');
module.exports.PerspectiveCamera = require('./lib/PerspectiveCamera');
module.exports.Arcball = require('./lib/Arcball');
module.exports.ScreenImage = require('./lib/ScreenImage');
module.exports.RenderTarget = require('./lib/RenderTarget');

//export all functions from Utils to module exports
var Utils = require('./lib/Utils');
for(var funcName in Utils) {
  module.exports[funcName] = Utils[funcName];
}

