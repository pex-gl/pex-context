define(["pex/core/Core", "pex/util/ObjUtils"], function(Core, ObjUtils) {

  var solidColorVert = ""
    + "uniform mat4 projectionMatrix;"
    + "uniform mat4 modelViewMatrix;"
    + "uniform float pointSize;"
    + "attribute vec3 position;"
    + "attribute vec4 color;"
    + "varying vec4 vertexColor;"
    + "void main() {"
    +  "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
    +  "gl_PointSize = pointSize;"
    +  "vertexColor = color;"
    + "}";

  var solidColorFrag = ""
    + "uniform sampler2D texture;"
    + "varying vec4 vertexColor;"
    + "void main() {"
    +  "gl_FragColor.rgb = vertexColor.rgb;"
    +  "gl_FragColor.a = vertexColor.a * texture2D(texture, gl_PointCoord).r;"
    + "}";


  function TexturedPointSprite(uniforms) {
      this.gl = Core.Context.currentContext.gl;
      this.program = new Core.Program(solidColorVert, solidColorFrag);
      this.uniforms = ObjUtils.mergeObjects({}, uniforms);
  }

  TexturedPointSprite.prototype = new Core.Material();

  return TexturedPointSprite;
});