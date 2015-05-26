define(["pex/core/Core", "pex/util/ObjUtils"], function(Core, ObjUtils) {

  var vert = ""
    + "uniform mat4 projectionMatrix;"
    + "uniform mat4 modelViewMatrix;"
    + "uniform mat4 normalMatrix;"
    + "uniform vec3 eyePos;"
    + "uniform float refraction;"
    + "attribute vec3 position;"
    + "attribute vec3 normal;"
    + "varying vec3 vNormal;"
    + "varying vec3 R;"
    + "varying vec3 RR;"
    + "void main() {"
    +  "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
    +  "vec3 N = normal;" //(normalMatrix * vec4(normal, 1.0)).xyz;"
    +  "vec3 I = normalize(position.xyz - eyePos.xyz);"
    +  "R = reflect(I, normal);"
    +  "RR = refract(I, normal, refraction);"
    +  "vNormal = N;"
    + "}";

  var frag = ""
    //+ "uniform samplerCube texture;"
    + "uniform sampler2D texture;"
    + "uniform sampler2D texture2;"
    + "uniform float reflection;"
    + "uniform float selected;"
    + "uniform vec4 color;"
    + "varying vec3 R;"
    + "varying vec3 RR;"
    + "varying vec3 vNormal;"
    + "void main() {"
    +  "float NdotL = dot(normalize(vNormal), normalize(vec3(0.0, -10.0, -10.0)));"
    +  "vec3 diffuse = mix(vec3(0.5, 0.4, 0.4), vec3(0.3, 0.3, 0.4), NdotL*0.5 + 0.5);"
    +  "gl_FragColor.rgb = diffuse;"
    +  "gl_FragColor.rgb = color.rgb;"
    //+  "vec4 colorR = textureCube(texture, vNormal + vec3(0.06));"
    //+  "vec4 colorG = textureCube(texture, vNormal);"
    //+  "vec4 colorB = textureCube(texture, vNormal - vec3(0.06));"
    //+  "gl_FragColor = 0.35 + 0.65*texture2D(texture2, vec2((1.0 + atan(vNormal.z, vNormal.x)/3.14159265359)/2.0, acos(-vNormal.y)/3.14159265359));"
    +  "gl_FragColor = 0.5 + 0.5 * pow(texture2D(texture2, vec2((1.0 + atan(vNormal.z, vNormal.x)/3.14159265359)/2.0, acos(-vNormal.y)/3.14159265359)), vec4(1.0/2.2));"
    //+  "color.rgb = (color.rgb * 256.0 * pow(2.0, color.a * 256.0 - 128.0)) / 256.0;"
    //+  "gl_FragColor.rgba = NdotL * 0.2 * vec4(colorR.r, colorG.g, colorB.b, 1.0);"
    //+  "gl_FragColor.rgba = vec4(NdotL);"
    //+  "gl_FragColor.rgba = 0.2 + (1.0 + vec4(NdotL))/5.0;"
    //+  "if (selected > 0.0) { gl_FragColor.rgba += vec4(0.9, 0.1, 0.0, 1.0) * (0.25 + 0.75 * abs(NdotL)); } "
    //+  "gl_FragColor += 1.0 * reflection * textureCube(texture, R);"
    //+  "gl_FragColor += 0.1*textureCube(texture, R);"
    //+  "gl_FragColor += 0.1 * (1.0 - reflection) * textureCube(texture, RR);"
    //+  "gl_FragColor += 0.01 * texture2D(texture, vec2((1.0 + atan(RR.z, RR.x)/3.14159265359)/2.0, acos(RR.y)/3.14159265359));"
    +  "gl_FragColor += 0.01 * texture2D(texture, vec2((1.0 + atan(R.z, R.x)/3.14159265359)/2.0, acos(R.y)/3.14159265359));"
    //+  "gl_FragColor += textureCube(texture, vNormal);"
    //+  "gl_FragColor += textureCube(texture, R);"
    //+  "gl_FragColor += NdotL/2.0 + 0.5;"
    +  "gl_FragColor.a = 1.0;"
    + "}";

  function TextureCubeMaterial(uniforms) {
    Core.Material.call(this);
    this.gl = Core.Context.currentContext.gl;
    this.program = new Core.Program(vert, frag);
    this.uniforms = ObjUtils.mergeObjects({eyePos: new Core.Vec3(0, 0, 0), refraction: 0.65 }, uniforms);
  }

  TextureCubeMaterial.prototype = new Core.Material();

  return TextureCubeMaterial;
});
