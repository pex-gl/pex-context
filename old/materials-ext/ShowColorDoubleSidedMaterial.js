//wireframe rendering based on http://codeflow.org/entries/2012/aug/02/easy-wireframe-display-with-barycentric-coordinates/
define(["pex/core/Core", "pex/util/ObjUtils", "plask"], function(Core, ObjUtils, plask) {

  var vert = ""
    + "uniform mat4 projectionMatrix;"
    + "uniform mat4 modelViewMatrix;"
    + "uniform mat4 normalMatrix;"
    + "uniform float pointSize;"
    + "attribute vec3 position;"
    + "attribute vec4 color;"
    + "attribute vec3 texCoord;"
    + "varying vec4 vColor;"
    + "varying vec3 vBC;"
    + "void main() {"
    +  "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
    +  "gl_PointSize = pointSize;"
    +  "vBC = texCoord;"
    +  "vColor = color;"
    + "}";

  var frag = ""
    + "#extension GL_OES_standard_derivatives : enable\n"
    + "varying vec4 vColor;"
    + "varying vec3 vBC;"
    + "uniform vec4 wireframeColor;"
    + "uniform float wireframeWidth;"
    + "float edgeFactor(){"
    + "  vec3 d = fwidth(vBC) * wireframeWidth;"
    + "  vec3 a3 = smoothstep(vec3(0.0), d*1.5, vBC);"
    + "  return min(min(a3.x, a3.y), a3.z);"
    + "}"
    + "void main() {"
    +  "gl_FragColor = vColor;"
    +  "if (wireframeWidth > 0.0) gl_FragColor = mix(wireframeColor, gl_FragColor, edgeFactor());"
    +  "if (!gl_FrontFacing) gl_FragColor.rgb *= 0.25;"
    + "}";

  function ShowColorDoubleSidedMaterial(uniforms) {
      this.gl = Core.Context.currentContext.gl;
      this.program = new Core.Program(vert, frag);

      var defaults = {
       pointSize : 1,
       wireframeColor : new Core.Vec4(1.0, 0.0, 0.0, 1.0),
       wireframeWidth : 0
      }

      this.uniforms = ObjUtils.mergeObjects(defaults, uniforms);
  }

  ShowColorDoubleSidedMaterial.prototype = new Core.Material();

  return ShowColorDoubleSidedMaterial;
});