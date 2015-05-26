var Mesh = require('pex-glu').Mesh;
var SolidColor = require('pex-materials').SolidColor;
var Geometry = require('pex-geom').Geometry;
var Vec2 = require('pex-geom').Vec2;
var Color = require('pex-color').Color;
var find = require('ramda/src/find');
var where = require('ramda/src/where');
var wordwrap = require('word-wrapper');

var SDF = require('./materials/SDF');

function SpriteTextBox(text, opts) {
  this.text = text;
  this.opts = opts;
  this.opts.scale = this.opts.scale || 1;
  this.opts.lineHeight = this.opts.lineHeight || 1;
  this.opts.color = this.opts.color || Color.White;
  if (this.opts.fontSize) {
    this.opts.scale = this.opts.fontSize / this.opts.font.info.size;
  }
  if (!opts.font) {
    throw 'BMFont required in opts = { font: {} }';
  }

  if (typeof(this.opts.smoothing) != 'undefined') {
    this.smoothing = this.opts.smoothing
  }
  else {
    this.smoothing = 1/16;
  }

  if (!SpriteTextBox.fontMaterial) {
    SpriteTextBox.fontMaterial = new SDF({});
  }

  this.geometry = new Geometry({ vertices: true, texCoords: true, faces: true });
  this.geometry.computeEdges();
  this.mesh = new Mesh(this.geometry, SpriteTextBox.fontMaterial, { triangles: true });
  this.mesh.scale.set(this.opts.scale, this.opts.scale, this.opts.scale);

  this.rebuild(this.text);
}

SpriteTextBox.prototype.setText = function(text) {
  this.text = text;
  this.rebuild(text);
}

SpriteTextBox.prototype.getText = function() {
  return this.text;
}

SpriteTextBox.prototype.getCharInfo = function(c) {
  var charCode = c.charCodeAt(0);
  return find(where({ id: charCode}), this.opts.font.chars);
}

SpriteTextBox.prototype.getKerning = function(firstChar, secondChar) {
  var firstCharCode = firstChar.charCodeAt(0);
  var secondCharCode = secondChar.charCodeAt(0);
  var kerning = find(where({ first: firstCharCode, second: secondCharCode}), this.opts.font.kernings);
  if (kerning) {
    return kerning.amount;
  }
  else {
    return 0;
  }
}

SpriteTextBox.prototype.rebuild = function(text) {
  var vertices = this.geometry.vertices;
  var texCoords = this.geometry.texCoords;
  var faces = this.geometry.faces;

  //TODO: we could reuse the existing data
  vertices.length = 0;
  texCoords.length = 0;
  faces.length = 0;

  var dx = 0;
  var dy = 0;
  var textureWidth = this.opts.font.common.scaleW;
  var textureHeight = this.opts.font.common.scaleH;
  var fontBaseHeight = this.opts.font.common.base;
  var lineHeight = this.opts.font.common.lineHeight;
  var fontSize = this.opts.font.info.size;
  var kernings = this.opts.font.info.kernings;
  var index = 0;

  function measure(text, start, end, width) {
    var dx = 0;
    var i = start;
    for(; i<end; i++) {
      var charInfo = this.getCharInfo(text[i]);
      var kerning = 0;
      if (i > start) {
        kerning = this.getKerning(text[i], text[i-1]);
      }

      dx += charInfo.xadvance + kerning;
      if (dx > width) break;
    }

    return {
      start: start,
      end: i
    }
  }

  var lines = [];

  if (this.opts.wrap) {
    lines = wordwrap(this.text, { width: this.opts.wrap / this.opts.scale, measure: measure.bind(this) }).split('\n');
  }
  else {
    lines = [ this.text ]
  }

  lines.forEach(function(line) {
    dx = 0;

    var lineStartVertexIndex = vertices.length;

    for(var i=0; i<line.length; i++) {
      var charInfo = this.getCharInfo(line[i]);
      if (!charInfo) {
        charInfo = this.getCharInfo('?');
      }
      if (!charInfo) {
        continue;
      }


      //texture coords
      var tx = charInfo.x / textureWidth;
      var ty = charInfo.y / textureHeight;
      var tw = charInfo.width / textureWidth;
      var th = charInfo.height / textureHeight;

      var w = charInfo.width;
      var h = charInfo.height;

      var kerning = 0;

      if (i > 0) {
        kerning = this.getKerning(line[i], line[i-1]);
      }

      //
      //   3--------2
      //   |     _/ |
      //   |  __/   |
      //   | /      |
      //   0--------1
      //

      //https://www.mapbox.com/blog/text-signed-distance-fields/
      //https://github.com/libgdx/libgdx/wiki/Distance-field-fonts
      //http://www.angelcode.com/products/bmfont/doc/render_text.html

      vertices.push(new Vec2(dx     + charInfo.xoffset + kerning, dy + h + charInfo.yoffset));
      vertices.push(new Vec2(dx + w + charInfo.xoffset + kerning, dy + h + charInfo.yoffset));
      vertices.push(new Vec2(dx + w + charInfo.xoffset + kerning, dy     + charInfo.yoffset));
      vertices.push(new Vec2(dx     + charInfo.xoffset + kerning, dy     + charInfo.yoffset));
      texCoords.push(new Vec2(tx     , 1.0 - ty - th));
      texCoords.push(new Vec2(tx + tw, 1.0 - ty - th));
      texCoords.push(new Vec2(tx + tw, 1.0 - ty     ));
      texCoords.push(new Vec2(tx     , 1.0 - ty     ));
      faces.push([index, index + 1, index + 2]);
      faces.push([index, index + 2, index + 3]);
      index += 4;
      dx += charInfo.xadvance + kerning;
    }

    if (this.opts.align == 'right') {
      for(var i=lineStartVertexIndex; i<vertices.length; i++) {
        vertices[i].x -= dx;
      }
    }
    dy += lineHeight * this.opts.lineHeight;
  }.bind(this));

  vertices.dirty = true;
  texCoords.dirty = true;
  faces.dirty = true;

  this.geometry.computeEdges();
}

SpriteTextBox.prototype.dispose = function() {
  this.mesh.dispose();
}

SpriteTextBox.prototype.draw = function(camera) {
  SpriteTextBox.fontMaterial.uniforms.texture = this.opts.textures[0];
  SpriteTextBox.fontMaterial.uniforms.smoothing = this.smoothing;
  SpriteTextBox.fontMaterial.uniforms.color = this.opts.color;
  this.mesh.draw(camera);
}

SpriteTextBox.prototype.drawDebug = function(camera) {
  if (!this.debugMaterial) {
    this.debugMaterial = new SolidColor({ color: Color.Red });
  }
  var oldMat = this.mesh.material;
  this.mesh.setMaterial(this.debugMaterial);
  this.mesh.primitiveType = this.mesh.gl.LINES;
  this.mesh.draw(camera);
  this.mesh.setMaterial(oldMat);
  this.mesh.primitiveType = this.mesh.gl.TRIANGLES;
}

module.exports = SpriteTextBox;