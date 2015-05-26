#ifdef VERT

attribute vec3 position;
attribute vec2 texCoord;
attribute vec4 normal;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;
uniform float pointSize;
uniform sampler2D rgbd;
uniform float maxTriangleSize;

varying vec4 vColor;
varying vec3 vNormal;
varying vec3 wcPosition;

void main() {
  vec3 pos = texture2D(rgbd, vec2(texCoord.x, texCoord.y * 0.5)).rgb;
  vec3 pos2 = texture2D(rgbd, vec2(normal.x, normal.y * 0.5)).rgb;
  vec3 pos3 = texture2D(rgbd, vec2(normal.z, normal.w * 0.5)).rgb;

  vNormal = cross(pos2 - pos, pos3 - pos);

  float alpha = 1.0;//length(pos) * length(pos2) * length(pos3);

  if (length(pos - pos2) > maxTriangleSize || length(pos - pos3) > maxTriangleSize || length(pos2 - pos3) > maxTriangleSize) {
    alpha = 0.0;
    pos = pos3;
  }

  wcPosition = pos;
  vColor = texture2D(rgbd, vec2(texCoord.x, 0.5 + texCoord.y*0.5));
  vColor.a = alpha;


  vColor.rgb = vec3(1.0, normal.xy);
  //vColor = vec4(normal.xy, 0.0, 1.0);
  //vColor.r = 1.0;

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
uniform float cutout;

void main() {

  if (wcPosition.x <= bboxMin.x || wcPosition.x >= bboxMax.x || wcPosition.z <= bboxMin.z || wcPosition.z >= bboxMax.z || wcPosition.y < bboxMin.y) {
    discard;
  }

  if (vColor.a < 0.01) {
    discard;
  }

  vec3 N = normalize(vNormal);
  vec3 L = normalize(vec3(10.0, 2.0, 5.0));
  float diffuse = 0.5 + 0.5 * dot(N, L);

  if ((wcPosition.y - bboxMin.y)/(bboxMax.y - bboxMin.y) > cutout) {
    discard;
  }

  //gl_FragColor.rgb = normalize(vNormal) * 0.5 + vec3(0.5);
  //gl_FragColor = vec4(diffuse);
  gl_FragColor = vColor;
  //gl_FragColor.r = 1.0;
  //gl_FragColor += vec4(diffuse);
  //gl_FragColor = vColor;
  //gl_FragColor = vec4(vColor.a);

}

#endif
