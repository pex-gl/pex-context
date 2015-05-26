#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;
uniform mat4 normalMatrix;
uniform vec3 eyePos;
uniform float refraction;
uniform float skyBox;

attribute vec3 position;
attribute vec3 normal;

varying vec3 R;
varying vec3 RR;
varying vec3 vNormal;
varying vec3 vI;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec3 I = normalize(position.xyz - eyePos.xyz);
  if (skyBox >= 0.95) {
    vNormal = (modelWorldMatrix * vec4(normal, 1.0)).xyz;
  }
  else {
    //vNormal = normal;//(normalMatrix * vec4(normal, 1.0)).xyz;
    vNormal = (modelWorldMatrix * vec4(normal, 1.0)).xyz;
    //vNormal = (normalMatrix * vec4(normal, 1.0)).xyz;
  }
  R = reflect(I, vNormal);
  RR = refract(I, vNormal, refraction);
  vI = I;
}

#endif

#ifdef FRAG
uniform sampler2D texture;
//uniform sampler2D texture2;
uniform float skyBox;
uniform float refraction;
uniform float reflection;
uniform float glass;
uniform vec3 eyePos;
varying vec3 R;
varying vec3 RR;
varying vec3 vNormal;
varying vec3 vI;

vec4 extractHDR(vec4 color) {
  return vec4((color.rgb * pow(2.0, color.a * 256.0 - 128.0)) , 1.0);
}

void main() {
  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  //gl_FragColor = texture2D(texture, vec2((1.0 + atan(-vNormal.z, vNormal.x)/3.14159265359)/2.0, acos(-vNormal.y)/3.14159265359));
  //gl_FragColor += texture2D(texture, vec2((1.0 + atan(RR.z, -RR.x)/3.14159265359)/2.0, acos(RR.y)/3.14159265359));
  float lon = atan(-vNormal.z, vNormal.x);
  float lat = acos(vNormal.y);
  vec2 sphereCoords = vec2(lon, lat) * (1.0 / 3.14159265359);
  sphereCoords = vec2(sphereCoords.x * 0.5 + 0.5, 1.0 - sphereCoords.y);
  //gl_FragColor += texture2D(texture, vec2((1.0 + atan(RR.z, -RR.x)/3.14159265359)/2.0, acos(RR.y)/3.14159265359));
  gl_FragColor += texture2D(texture, sphereCoords);
  //gl_FragColor.rgb = RR;

  //gl_FragColor = vec4(skyBox);
  //gl_FragColor = texture2D(texture, vec2((1.0 + atan(RR.z, -RR.x)/3.14159265359)/2.0, acos(RR.y)/3.14159265359));
  //gl_FragColor += (1.0 - skyBox)*(glass)*refraction*extractHDR(texture2D(texture, vec2((1.0 + atan(RR.z, -RR.x)/3.14159265359)/2.0, acos(RR.y)/3.14159265359)));
  //gl_FragColor += (1.0 - skyBox)*(glass)*reflection*extractHDR(texture2D(texture2, vec2((1.0 + atan(R.z, -R.x)/3.14159265359)/2.0, acos(R.y)/3.14159265359)));
  //gl_FragColor += skyBox*extractHDR(texture2D(texture2, vec2((1.0 + atan(vNormal.z, -vNormal.x)/3.14159265359)/2.0, acos(vNormal.y)/3.14159265359)));
  gl_FragColor.a = 1.0;
}

#endif