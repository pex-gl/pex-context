#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;
attribute vec3 position;
attribute vec3 normal;
varying vec3 wcNormal;
varying vec3 wcCoords;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  wcNormal = normal; //this is not correct, shoud go from model -> world
  wcCoords = (modelWorldMatrix * vec4(position, 1.0)).xyz;
}

#endif

#ifdef FRAG

uniform sampler2D texture;
uniform float scale;
varying vec3 wcNormal;
varying vec3 wcCoords;

void main() {
  vec3 blending = abs( normalize(wcNormal) );
  blending = normalize(max(blending, 0.00001)); // Force weights to sum to 1.0
  float b = (blending.x + blending.y + blending.z);
  blending /= vec3(b, b, b);

  vec4 xaxis = texture2D( texture, wcCoords.zy * scale);
  vec4 yaxis = texture2D( texture, wcCoords.xz * scale);
  vec4 zaxis = texture2D( texture, wcCoords.xy * scale);
  // blend the results of the 3 planar projections.
  vec4 tex = xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;

  gl_FragColor = tex;
}

#endif
