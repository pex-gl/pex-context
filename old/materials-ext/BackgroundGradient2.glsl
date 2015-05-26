#ifdef VERT
  attribute vec2 position;
  attribute vec2 texCoord;
  varying vec2 vTexCoord;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    vTexCoord = texCoord;
  }

#endif

#ifdef FRAG
  varying vec2 vTexCoord;
  uniform vec4 bottomColor;
  uniform vec4 topColor;
  uniform float alpha;
  uniform float labMixing;

  float rand(in vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  float correct(float c) {
    float a = 0.055;
    if (c <= 0.04045) return c/12.92;
    else return pow((c+a)/(1.0+a), 2.4);
  }

  vec3 rgb2xyz(vec3 rgb) {
    float rl = correct(rgb.x/255.0);
    float gl = correct(rgb.y/255.0);
    float bl = correct(rgb.z/255.0);

    float x = 0.4124 * rl + 0.3576 * gl + 0.1805 * bl;
    float y = 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
    float z = 0.0193 * rl + 0.1192 * gl + 0.9505 * bl;
    return vec3(x, y, z);
  }

  float f(float t) {
    if (t > pow(6.0/29.0, 3.0)) return pow(t, 1.0/3.0);
    else return (1.0/3.0)*(29.0/6.0)*(29.0/6.0)*t+4.0/29.0;
  }

  vec3 xyz2lab(vec3 xyz) {
    //# 6500K color templerature

    float ill[3];
    ill[0] = 0.96421;
    ill[1] = 1.00000;
    ill[2] = 0.82519;
    float l = 1.16 * f(xyz.y/ill[1]) - 0.16;
    float a = 5.0 * (f(xyz.x/ill[0]) - f(xyz.y/ill[1]));
    float b = 2.0 * (f(xyz.y/ill[1]) - f(xyz.z/ill[2]));
    return vec3(l, a, b);
  }

  vec3 rgb2lab(vec3 rgb) {
    return xyz2lab(rgb2xyz(rgb));
  }

  float finv(float t) {
    if (t > (6.0/29.0)) return t*t*t;
    else return 3.0*(6.0/29.0)*(6.0/29.0)*(t-4.0/29.0);
  }

  vec3 lab2xyz(vec3 lab) {
    float sl = (lab.x+0.16) / 1.16;
    float ill[3];
    ill[0] = 0.96421;
    ill[1] = 1.00000;
    ill[2] = 0.82519;
    float y = ill[1] * finv(sl);
    float x = ill[0] * finv(sl + (lab.y/5.0));
    float z = ill[2] * finv(sl - (lab.z/2.0));
    return vec3(x, y, z);
  }

  float correctinv(float cl) {
    float a = 0.055;
    if (cl<=0.0031308) return 12.92*cl;
    else return (1.0+a)*pow(cl,1.0/2.4)-a;
  }

  vec3 xyz2rgb(vec3 xyz) {
    float rl =  3.2406*xyz.x - 1.5372*xyz.y - 0.4986*xyz.z;
    float gl = -0.9689*xyz.x + 1.8758*xyz.y + 0.0415*xyz.z;
    float bl =  0.0557*xyz.x - 0.2040*xyz.y + 1.0570*xyz.z;

    rl = clamp(rl, 0.0, 1.0);
    gl = clamp(gl, 0.0, 1.0);
    bl = clamp(bl, 0.0, 1.0);

    float r = (255.0*correctinv(rl));
    float g = (255.0*correctinv(gl));
    float b = (255.0*correctinv(bl));
    return vec3(r,g,b);
  }

  vec3 lab2rgb(vec3 lab) {
    return xyz2rgb(lab2xyz(lab));
  }

  vec3 mixrgb(vec3 c0, vec3 c1, float t) {
    return mix(c0, c1, t);
  }

  vec3 mixlab(vec3 c0, vec3 c1, float t) {
    vec3 cl0 = rgb2lab(c0 * 255.0);
    vec3 cl1 = rgb2lab(c1 * 255.0);
    return lab2rgb(mix(cl0, cl1, t)) / 255.0;
  }

  void main() {
    gl_FragColor = vec4(vTexCoord, 0.0, 1.0);

    float r = rand(vTexCoord);
    if (labMixing == 0.0) gl_FragColor.rgb = mixrgb(bottomColor.rgb, topColor.rgb, vTexCoord.y);
    else gl_FragColor.rgb = mixlab(bottomColor.rgb, topColor.rgb, vTexCoord.y);
    gl_FragColor.rgb += 0.02 * vec3(r);

    gl_FragColor.a = alpha;
  }
#endif