define(["plask", "pex/core/Core", "pex/geom/Geom", "materials/LabelMaterial"], function(plask, Core, Geom, LabelMaterial) {
  function Label(position, text, scale, size, align, font) {
    this.scale = scale = scale || 2;
    this.size = size = size || 2;
    this.text = text;
    this.mesh = new Core.Mesh(new Geom.Plane(scale, scale/8), new LabelMaterial());
    this.mesh.position.set(position.x, position.y, position.z);
    this.font = font || null;

    if (align == "left") {
      this.mesh.position.x += scale/2;
    }

    this.alpha = 1;

    this.updateTexture();

    this.mesh.material.uniforms.tex = this.tex;
  }

  Label.prototype.draw = function(camera) {
    var gl = Core.Context.currentContext.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_COLOR, gl.ONE);
    this.tex.bind();
    this.mesh.material.uniforms.alpha = this.alpha;
    this.mesh.draw(camera);
    gl.disable(gl.BLEND);
  }

  Label.prototype.updateTexture = function() {
    var gl = Core.Context.currentContext.gl;
    var canvas = new plask.SkCanvas.create(256*this.size, 32*this.size);
    var paint = new plask.SkPaint();

    paint.setStyle(paint.kFillStyle);
    paint.setFlags(paint.kAntiAliasFlag);
    paint.setTextSize(24*this.size);
    if (this.font) {
      paint.setFontFamilyPostScript(this.font);
    }
    else {
      paint.setFontFamily('OpenSans');
    }
    paint.setTextSize(24*this.size);
    paint.setStrokeWidth(0);  // Scale invariant.
    paint.setColor(255, 255, 255, 255);

    canvas.drawColor(0, 0, 0, 255, paint.kClearMode); //transparent
    //canvas.drawColor(0, 255, 0, 255);
    canvas.drawText(paint, this.text, 10*this.size, 22*this.size);

    this.tex = Core.Texture2D.create(0, 0);

    this.tex.bind();
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2DSkCanvas(gl.TEXTURE_2D, 0, canvas);
    gl.generateMipmap(gl.TEXTURE_2D);
  };

  return Label;
});
/*
function Label(str, landscape, pointIndex, point) {
  this.str = str;
  this.landscape = landscape;
  this.pointIndex = pointIndex;
  this.point = point;
  if (!Label.pointerMesh) {
    var mesh = new Pex.Mesh();
    mesh.addAttrib("position", [0, 0, 0, 0, 1, 0], 3);
    mesh.setIndices([0, 1]);
    Label.pointerMesh = mesh;
  }
  if (!Label.pointerShader) {
    Label.pointerShader = new Pex.Shader(
      fs.readFileSync('shaders/basic.vert', 'utf8'),
      fs.readFileSync('shaders/solidColor.frag', 'utf8')
    )
  }
  if (!Label.textMesh) {
    Label.textMesh = Pex.Mesh.buildPlaneXY(0.2, 0.025, 2, 2);
  }
  if (!Label.textShader) {
    Label.textShader = new Pex.Shader(
      fs.readFileSync('shaders/textured.vert', 'utf8'),
      fs.readFileSync('shaders/textured.frag', 'utf8')
    )
  }

  
}
*/