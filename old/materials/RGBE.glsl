#ifdef VERT

attribute vec2 position;
attribute vec2 texCoord;
uniform vec2 screenSize;
uniform vec2 pixelPosition;
uniform vec2 pixelSize;
varying vec2 vTexCoord;

void main() {
  float tx = position.x * 0.5 + 0.5; //-1 -> 0, 1 -> 1
  float ty = -position.y * 0.5 + 0.5; //-1 -> 1, 1 -> 0
  //(x + 0)/sw * 2 - 1, (x + w)/sw * 2 - 1
  float x = (pixelPosition.x + pixelSize.x * tx)/screenSize.x * 2.0 - 1.0;  //0 -> -1, 1 -> 1
  //1.0 - (y + h)/sh * 2, 1.0 - (y + h)/sh * 2
  float y = 1.0 - (pixelPosition.y + pixelSize.y * ty)/screenSize.y * 2.0;  //0 -> 1, 1 -> -1
  gl_Position = vec4(x, y, 0.0, 1.0);
  vTexCoord = texCoord;
}

#endif

#ifdef FRAG

varying vec2 vTexCoord;
uniform sampler2D image;
uniform sampler2D diffuseMap;
uniform float roughness;
uniform float exposure;

vec4 extractHDR(vec4 color) {
  return vec4((color.rgb * pow(2.0, color.a * 255.0 - 128.0)), 1.0);
}

vec4 tonemapReinhard(vec4 color) {
  vec4 result = color;
  result.rgb *= exposure;
  result.rgb = result.rgb/(vec3(1.0) + result.rgb);
  return result;
}

void main() {
  vec4 diffuseColor = extractHDR(texture2D(diffuseMap, vTexCoord));
  diffuseColor += extractHDR(texture2D(diffuseMap, vTexCoord + vec2(1.0/256.0, 0.0)));
  diffuseColor += extractHDR(texture2D(diffuseMap, vTexCoord + vec2(0.0, 1.0/128.0)));
  diffuseColor += extractHDR(texture2D(diffuseMap, vTexCoord + vec2(1.0/256.0, 1.0/128.0)));
  diffuseColor /= 4.0;
  vec4 reflectionColor = extractHDR(texture2D(image, vTexCoord));
  gl_FragColor = tonemapReinhard(mix(reflectionColor, diffuseColor, roughness));
  gl_FragColor.a = 1.0;
}

#endif