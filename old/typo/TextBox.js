var plask = require('plask');
var glu = require('pex-glu');
var color = require('pex-color');

var Texture2D = glu.Texture2D;
var Color = color.Color;

function TextBox(str, fontFamily, fontSize, w, h, fontColor, bgColor) {
	this.str = str;
    this.width = w;
    this.height = h;
    this.fontFamily = fontFamily;
    this.fontSize = fontSize;
    this.canvas = null;
    var paint = this.paint = new plask.SkPaint();
    paint.setFill();
    this.fontColor = fontColor || Color.White;
    this.bgColor = bgColor || Color.Black;
    paint.setColor(this.fontColor.r*255, this.fontColor.g*255, this.fontColor.b*255, this.fontColor.a*255);
    paint.setAntiAlias(true);
    paint.setFontFamilyPostScript(fontFamily);
    paint.setTextSize(fontSize);
    paint.setFilterBitmap(true);
    //paint.setDevKernText(true);
    // if (Config.UseLCDTextRendering) paint.setLCDRenderText(true);
    paint.setLCDRenderText(true);
    //paint.setSubpixelText(true);
    this.render(this.str);
}

TextBox.prototype.render = function(str, canvas) {
	var paint = this.paint;
	var metrics = paint.getFontMetrics();

	var textWidth = paint.measureText(str);
	while(textWidth > 8000) {
	  str = str.substr(0, str.length-1);
	  textWidth = paint.measureText(str);
	}

	var bounds = paint.measureTextBounds(str);

	var w = bounds[2] - bounds[0]; //right - left
	var h = bounds[3] - bounds[1]; //bottom - top

	if (!this.width) this.width = w;
	if (!this.height) this.height = h;

	if (w > this.width || h > this.height) {
	  console.log("TextBox render not enought space for '" + str + "' with font " + this.fontFamily);
	}

	if (!canvas) canvas = this.canvas;
	if (!canvas) canvas = this.canvas = new plask.SkCanvas(this.width, this.height);

	canvas.drawColor(this.bgColor.r*255, this.bgColor.g*255, this.bgColor.b*255, this.bgColor.a*255, plask.SkPaint.kClear_Mode);
	canvas.drawText(paint, str, 0 - bounds[0] + (this.width-w)/2, h - bounds[3] + (this.height-h)/2);
}

// TODO: pass some options for texture creating
TextBox.prototype.getTexture = function(anisotropy) {
	var gl = glu.Context.currentContext;

	var aniso = anisotropy || 0;

	this.texture = this.texture || new Texture2D.create(this.width, this.height, { repeat: true });
	this.texture.bind();
	gl.texImage2DSkCanvas(gl.TEXTURE_2D, 0, this.canvas);
	this.texture.anisotropy(aniso);
	this.texture.generateMipmap();
	gl.bindTexture(gl.TEXTURE_2D, null);

	return this.texture;
};

module.exports = TextBox;
