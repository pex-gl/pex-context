#ifdef VERT

attribute vec3 position;
attribute vec2 texCoord;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;
uniform float pointSize;
uniform sampler2D rgbd;
uniform vec3 bboxCenter;
uniform float amount;

varying vec4 vColor;
varying vec3 vNormal;
varying vec3 wcPosition;

void main() {
  vec3 pos = texture2D(rgbd, vec2(texCoord.x, texCoord.y * 0.5)).rgb;
  vec3 pos2 = texture2D(rgbd, vec2(texCoord.x + 1.0/320.0, texCoord.y * 0.5)).rgb;
  vec3 pos3 = texture2D(rgbd, vec2(texCoord.x, texCoord.y * 0.5 + 1.0/240.0)).rgb;

  vNormal = cross(pos2 - pos, pos3 - pos);

  float alpha = length(pos) * length(pos2) * length(pos3);

  pos += vNormal * amount;

  wcPosition = pos;
  vColor = texture2D(rgbd, vec2(texCoord.x, 0.5 + texCoord.y*0.5));
  vColor.a = amount * 4.0;

  //if (length(pos.rgb) < 0.2) vNormal *= 0.0;
  //vColor = vec4(pos.rgb, alpha);

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

void main() {

  //if (wcPosition.x <= bboxMin.x || wcPosition.x >= bboxMax.x || wcPosition.z <= bboxMin.z || wcPosition.z >= bboxMax.z || wcPosition.y < bboxMin.y) {
  // discard;
  //}

  //if ((wcPosition.y - bboxMin.y)/(bboxMax.y - bboxMin.y) > amount) {
  //  discard;
  //}

  if (length(gl_PointCoord.xy - 0.5) > 0.3) {
    discard;
  }

  vec3 N = normalize(vNormal);
  vec3 L = normalize(vec3(10.0, 2.0, 5.0));
  float diffuse = 0.5 + 0.5 * dot(N, L);

  gl_FragColor.rgb = (normalize(vNormal) * 0.5 + vec3(0.5));
  gl_FragColor.a = vColor.a;
}

#endif
