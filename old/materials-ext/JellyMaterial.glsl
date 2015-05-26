#ifdef VERT
  attribute vec3 position;
  attribute vec2 texCoord;

  uniform mat4 projectionMatrix;
  uniform mat4 modelViewMatrix;

  varying vec2 vTexCoord;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
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
  uniform float intensity;

  float PI = 3.1415;
  float TWOPI = 2.0 * 3.1415;

  void main() {
    float u = vTexCoord.x;
    float v = vTexCoord.y;
    float stripes = max(0.0, (sin(v * TWOPI * 10.0)));
    gl_FragColor = color;
    gl_FragColor.rgb = hsv2rgb(vec3(mod(v * 1.0 - shift, 0.75), 1.0, min(intensity, 1.0)));
    float c = step(0.95 + (1.0 - intensity) * 0.05, sin(u * PI));
    stripes = 1.0;
    gl_FragColor.rgb *= vec3(c * stripes);
    gl_FragColor.rgb = vec3(1.0) - gl_FragColor.rgb;
    //gl_FragColor.rgb = vec3(stripes);
    gl_FragColor.a = max(c * stripes * 0.5, 0.12 * sin(u * PI));

    gl_FragColor.rgb = gl_FragColor.rgb * 0.8 + color.rgb  * 0.2;

    //gl_FragColor.rgb = vec3(c);
    //gl_FragColor.rgb = vec3(u, v, 0.0);
    //gl_FragColor.rgb = vec3(1.0, 1.0, 1.0);
    //gl_FragColor.a = 1.0;
  }
#endif