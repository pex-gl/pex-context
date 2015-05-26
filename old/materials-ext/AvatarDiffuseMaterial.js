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
    + "attribute vec3 normal;"
    + "varying vec4 vColor;"
    + "varying vec3 vBC;"
    + "varying vec3 vNormal;"
    + "void main() {"
    +  "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
    +  "gl_PointSize = pointSize;"
    +  "vNormal = (normalMatrix * vec4(normal, 1.0)).xyz;"
    +  "vBC = texCoord;"
    +  "vColor = color;"
    + "}";

  var frag = ""
    + "#extension GL_OES_standard_derivatives : enable\n"
    + "varying vec4 vColor;"
    + "varying vec3 vBC;"
    + "varying vec3 vNormal;"
    + "uniform vec4 diffuseColor;"
    + "uniform vec4 wireframeColor;"
    + "uniform vec4 skyColor;"
    + "uniform vec4 groundColor;"
    + "uniform float wrap;"
    + "uniform float wireframeWidth;"
    + "uniform vec3 lightPos;"
    + "float edgeFactor(){"
    + "  vec3 d = fwidth(vBC) * wireframeWidth;"
    + "  vec3 a3 = smoothstep(vec3(0.0), d*1.5, vBC);"
    + "  return min(min(a3.x, a3.y), a3.z);"
    + "}"
    + "void main() {"
    +  "vec3 N = normalize(vNormal);"
    +  "vec3 L = normalize(vec3(10.0, 10.0, 10.0));"
    +  "float skyNdotL = dot(N, vec3(0.0, 1.0, 0.0));"
    +  "vec4 skyColor = mix(groundColor, skyColor, 0.5 + 0.5 * skyNdotL);"
    +  "float NdotL = max(0.0, (dot(N, L) + wrap)/(1.0 + wrap));"
    +  "gl_FragColor = diffuseColor * vColor * NdotL;"
    +  "if (wireframeWidth > 0.0) gl_FragColor = mix(wireframeColor, gl_FragColor, edgeFactor());"
    +  "gl_FragColor += 0.25 * skyColor;"
    +  "if (!gl_FrontFacing) gl_FragColor.rgb *= 0.5;"
    + "}";

  function AvatarDiffuseMaterial(uniforms) {
      this.gl = Core.Context.currentContext.gl;
      this.program = new Core.Program(vert, frag);

      var defaults = {
        pointSize : 1,
        wireframeColor : new Core.Vec4(1.0, 0.0, 0.0, 1.0),
        wireframeWidth : 0,
        lightPos : new Core.Vec3(10, 10, 10),
        diffuseColor : new Core.Vec4(1, 1, 1, 1),
        skyColor : new Core.Vec4(1.0, 1.0, 1.0, 1.0),
        groundColor : new Core.Vec4(0.0, 0.0, 0.0, 1.0),
        wrap : 1
      }

      this.uniforms = ObjUtils.mergeObjects(defaults, uniforms);
  }

  AvatarDiffuseMaterial.prototype = new Core.Material();

  return AvatarDiffuseMaterial;
});