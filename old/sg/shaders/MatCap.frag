uniform sampler2D matCapTexture;

void main_matcap(in vec3 normalIn, in vec3 positionIn, out vec4 color) {
  vec3 V = normalize(-positionIn); //view vector from point to camera
  vec3 r = reflect(-V, normalIn);
  float m = 2.0 * sqrt(
    pow(r.x, 2.0) +
    pow(r.y, 2.0) +
    pow(r.z + 1.0, 2.0)
  );
  vec2 N = r.xy / m + 0.5;
  vec3 base = texture2D( matCapTexture, N ).rgb;
  color = vec4( base, 1.0 );
}