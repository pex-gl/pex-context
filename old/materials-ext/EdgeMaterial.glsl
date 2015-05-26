#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
attribute vec3 position;
attribute vec3 normal;
attribute vec3 texCoord;
attribute vec4 color;

varying vec3 vNormal;
varying vec3 vBC;
varying vec4 vColor;

void main() {
  float life = normal.y;
  vec3 pos = position;
  if (normal.x > 0.0 && texCoord.z > 0.9)  {
  //  pos *= life;
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  vNormal = normal;
  vBC = texCoord;
  vColor = color;
}

#endif

#ifdef FRAG

uniform vec4 color;
uniform float alphaBoost;
uniform float showDyingInputs;
uniform float time;

varying vec3 vNormal;
varying vec3 vBC;
varying vec4 vColor;

#extension GL_OES_standard_derivatives : enable
float edgeFactor(){
    vec3 d = fwidth(vBC);
    vec3 a3 = smoothstep(vec3(0.0), d*1.0, vBC);
    return min(min(a3.x, a3.y), a3.z);
}

float fillFactor(){
    vec3 d = fwidth(vBC);
    vec3 a3 = smoothstep(vec3(0.0), d*9.5, vBC);
    float f = min(min(a3.x, a3.y), a3.z);

    vec3 b3 = smoothstep(vec3(0.0), d*50.5, vBC);
    float k = 1.0 - max(max(b3.x, b3.y), b3.z);

    f = 1.0 - vBC.b;
    k = vBC.b;

    float r = max(pow(1.0 - k, 10.025), 1.0 - pow(f, 0.25));
    r += max(0.0, 0.5 * cos(f * 3.14));
    return r;
}

float borderFactor(){
    vec3 d = fwidth(vBC);
    vec3 a3 = smoothstep(vec3(0.0), d*9.5, vBC);
    float f = min(min(a3.x, a3.y), a3.z);

    vec3 b3 = smoothstep(vec3(0.0), d*50.5, vBC);
    float k = 1.0 - max(max(b3.x, b3.y), b3.z);

    f = 1.0 - vBC.b;
    k = vBC.b;

    float r = max(pow(1.0 - k, 10.025), 1.0 - pow(f, 0.25));
    return r;
}

void main() {
  gl_FragColor = vColor;
  float dimm = 1.0;

  if (!gl_FrontFacing) {
    dimm = 0.5;
  }

  gl_FragColor *= dimm;

  float life = vNormal.y;
  float fadeIn = vNormal.z;

  if (vNormal.x > 0.0) {
    gl_FragColor = vec4(0.15 * life, 0.15 * life, 0.15 * life, 0.35) * dimm;
    if (showDyingInputs > 0.0 && life <= 0.5) gl_FragColor = vec4(sin(time * 10.0)*0.5 + 0.5, 0.0, 0.0, 1.0) * borderFactor();
    //gl_FragColor = vec4(life, life, life, 0.55) * dimm;
  }
  else {
    gl_FragColor = gl_FragColor * fillFactor() * fadeIn;
    gl_FragColor.a = 0.5 + 0.5 * alphaBoost;
    //gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }

  gl_FragColor.rgba += (1.0 - edgeFactor()) * dimm * dimm * 0.95;

  //gl_FragColor.rgb = vBC;
  //gl_FragColor.a = 0.80;
  //gl_FragColor.a = 1.0;

  //gl_FragColor = vec4(0.0, 0.0, 0.0, (1.0-edgeFactor())*0.95);
}

#endif