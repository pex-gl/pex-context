#ifdef VERT
  attribute vec3 position;
  attribute vec2 texCoord;

  uniform mat4 projectionMatrix;
  uniform mat4 modelViewMatrix;

  varying vec2 vTexCoord;
  void main() {
    vec3 pos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vTexCoord = texCoord;
  }
#endif

#ifdef FRAG
  vec3 hsv2rgb(vec3 hsv) {
    // We basically just make the ramp curves using builtins, see:
    //   http://en.wikipedia.org/wiki/File:HSV-RGB-comparison.svg
    float h6 = hsv.x * 6.0;
    float r = clamp(h6 - 4.0, 0.0, 1.0) - clamp(h6 - 1.0, 0.0, 1.0) + 1.0;
    float g = clamp(h6, 0.0, 1.0) - clamp(h6 - 3.0, 0.0, 1.0);
    float b = clamp(h6 - 2.0, 0.0, 1.0) - clamp(h6 - 5.0, 0.0, 1.0);
    // Map from 0 .. 1 to v(1-s) .. v.
    // rgb * (v - (v*(1-s)) + (v*(1-s)) becomes rgb / (v*s) + (v*(1-s)).
    return vec3(r, g, b) * hsv.z * hsv.y + (hsv.z * (1.0 - hsv.y));
  }

  varying vec2 vTexCoord;
  uniform vec4 color;
  uniform float shift;
  uniform float energy;

  float PI = 3.14159265359;
  float TWOPI = 2.0 * 3.14159265359;

  void main() {
    float u = vTexCoord.x;
    float v = vTexCoord.y;
    float stripes = 0.8 + 0.2 * sin(v * TWOPI * 5.0);
    float spine = step(0.97, sin(u * PI));

    if (v < 0.1) spine += 0.5 * (1.0 - v/0.1);

    vec3 c;
    c = color.rgb;
    c *= (0.4 + 0.6 * energy);
    c += vec3(1.0 - energy);
    c += vec3(spine);
    c += 0.15 * hsv2rgb(vec3(mod(v * 1.0 - shift, 0.75), 1.0, min(energy, 1.0)));

    gl_FragColor.rgb = c;
    gl_FragColor.rgb *= 0.4 + 0.6 * energy;

    gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.06, 0.2, 0.25), 0.5 * v);
    gl_FragColor.a = 0.7 + 0.3 * energy;
    gl_FragColor.a *= 0.5 + 0.5 * energy - 0.5 * v;
  }
#endif