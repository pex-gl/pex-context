uniform vec3 lightPos; //world coord
uniform mat4 viewMatrix;
uniform mat4 modelViewMatrix;
varying vec3 vLightPos;

void main() {
  vLightPos = (viewMatrix * vec4(lightPos, 1.0)).xyz;
}