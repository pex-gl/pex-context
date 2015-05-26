#ifdef VERT

attribute vec3 position;
attribute vec2 texCoord;
attribute vec3 normal;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;
uniform float pointSize;
uniform sampler2D rgbd;
uniform vec3 bboxCenter;
uniform vec3 bboxMin;
uniform vec3 bboxMax;
uniform float amountMouse;
uniform float amount;
uniform float time;

varying vec4 vColor;
varying vec3 vNormal;
varying vec3 wcPosition;

mat3 rotateY(float a) {
  return mat3(
    cos(a), 0.0, sin(a),
    0.0,     1.0, 0.0,
    -sin(a), 0.0, cos(a)
  );
}

void main() {
  vec3 pos = texture2D(rgbd, vec2(texCoord.x, texCoord.y * 0.5)).rgb;
  vec3 pos2 = texture2D(rgbd, vec2(texCoord.x + 1.0/320.0, texCoord.y * 0.5)).rgb;
  vec3 pos3 = texture2D(rgbd, vec2(texCoord.x, texCoord.y * 0.5 + 1.0/240.0)).rgb;

  vNormal = cross(pos2 - pos, pos3 - pos);

  vec3 noise = normal;

  float alpha = length(pos) * length(pos2) * length(pos3);

  float am = max(0.0, amount*0.5);
  if (amountMouse > 0.0) {
    am = max(0.0, amountMouse - 0.2);
  }
  float k = am;

  k *= (pos.y - bboxMin.y) / (bboxMax.y - bboxMin.y) * noise.g;

  pos += normalize(vNormal) * 5500.0 * k;
  pos -= bboxCenter;
  pos = rotateY(5.0 * 3.14 * amount * noise.g) * pos;
  pos += bboxCenter;

  wcPosition = pos;
  vColor = texture2D(rgbd, vec2(texCoord.x, 0.5 + texCoord.y*0.5));

  vColor.a = step(noise.r, amount) * alpha;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = pointSize;
}

#endif

#ifdef FRAG

varying vec4 vColor;
varying vec3 wcPosition;
varying vec3 vNormal;
uniform vec3 bboxMin;
uniform vec3 bboxMax;
uniform float amount;
uniform sampler2D particleTexture;

void main() {
  if (vColor.a < 0.01) {
    discard;
  }

  if (length(gl_PointCoord.xy - 0.5) > 0.3) {
    discard;
  }

  vec4 color = texture2D(particleTexture, gl_PointCoord.xy);
  gl_FragColor = vColor;
  gl_FragColor.a = amount;
}

#endif
