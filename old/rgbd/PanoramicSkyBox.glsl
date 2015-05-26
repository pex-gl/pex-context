#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;
uniform mat4 normalMatrix;
uniform vec3 eyePos;
uniform float refraction;
uniform float skyBox;

attribute vec3 position;
attribute vec2 texCoord;
attribute vec3 normal;

varying vec3 R;
varying vec3 RR;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vTexCoord;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  //vec3 I = normalize(position.xyz - eyePos.xyz);
  vec3 I = normalize(position.xyz - eyePos.xyz);
  if (skyBox >= 0.95) {
    vNormal = normal;
    vTexCoord = texCoord;
  }
  else {
    //vNormal = (normalMatrix * vec4(normal, 1.0)).xyz;
    //vNormal = (normalMatrix * vec4(normal, 1.0)).xyz;
    vNormal = (modelWorldMatrix * vec4(normal, 1.0)).xyz;
    vTexCoord = vec2(0.0);
  }
  R = reflect(I, vNormal);
  RR = refract(I, vNormal, refraction);
  vPosition = position;
}

#endif

#ifdef FRAG
uniform sampler2D texture;
//uniform sampler2D texture2;
uniform float skyBox;
uniform float refraction;
uniform float reflection;
uniform float glass;
varying vec3 R;
varying vec3 RR;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vTexCoord;

vec4 extractHDR(vec4 color) {
  return vec4((color.rgb * pow(2.0, color.a * 256.0 - 128.0)) , 1.0);
}

const vec3 Xunitvec = vec3 (1.0, 0.0, 0.0);
const vec3 Yunitvec = vec3 (0.0, 1.0, 0.0);

void main() {
  //gl_FragColor = (1.0 - skyBox)*(1.0-glass)*extractHDR(texture2D(texture, vec2((1.0 + atan(-vNormal.z, vNormal.x)/3.14159265359)/2.0, acos(vNormal.y)/3.14159265359)));
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  //gl_FragColor.rgb = R;
  //gl_FragColor = texture2D(texture, vec2((1.0 + atan(-vNormal.z, vNormal.x)/3.14159265359)/2.0, acos(-vNormal.y)/3.14159265359));

  vec3 reflectDir = R;

  vec2 index;

  index.y = dot(normalize(reflectDir), Yunitvec);
  reflectDir.y = 0.0;
  index.x = dot(normalize(reflectDir), Xunitvec) * 0.5;

  if (reflectDir.z >= 0.0) {
    index = (index + 1.0) * 0.5;
  }
  else {
    index.t = (index.t + 1.0) * 0.5;
    index.s = (-index.s) * 0.5 + 1.0;
  }

  index.s = mod(index.s, 1.0);
  index.t = 1.0 - index.t;

  if (skyBox > 0.5)
    gl_FragColor = texture2D(texture, vec2(1.0 - vTexCoord.x, 1.0 - vTexCoord.y));
  else
  //if (y*y >= z*z) && (y*y >= x*x) : 
  //  return ( (y>0) ? Y_AXIS_POS : Y_AXIS_NEG, x/abs(y), z/abs(y))
  //return ( (z>0) ? Z_AXIS_POS : Z_AXIS_NEG, x/abs(z), y/abs(z))

  gl_FragColor = texture2D(texture, vec2((1.0 + atan(RR.z, -RR.x)/3.14159265359)/2.0, acos(RR.y)/3.14159265359));
  //gl_FragColor += (1.0 - skyBox)*(glass)*refraction*extractHDR(texture2D(texture, vec2((1.0 + atan(RR.z, -RR.x)/3.14159265359)/2.0, acos(RR.y)/3.14159265359)));
  //gl_FragColor += (1.0 - skyBox)*(glass)*reflection*extractHDR(texture2D(texture2, vec2((1.0 + atan(R.z, -R.x)/3.14159265359)/2.0, acos(R.y)/3.14159265359)));
  //gl_FragColor += skyBox*extractHDR(texture2D(texture2, vec2((1.0 + atan(vNormal.z, -vNormal.x)/3.14159265359)/2.0, acos(vNormal.y)/3.14159265359)));
  gl_FragColor.a = 1.0;
}

#endif