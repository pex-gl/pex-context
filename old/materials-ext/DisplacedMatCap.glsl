#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
uniform float pointSize;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord;

varying vec3 e;
varying vec3 n;

uniform sampler2D displacementMap;
uniform float displacementHeight;
uniform vec2 textureSize;
uniform vec2 planeSize;
uniform float numSteps;
varying float vHeight;

uniform float time;

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

//twist from http://iquilezles.org/www/articles/distfunctions/distfunctions.htm
float twistedNoise(vec3 p) {
  float len = length(p);
  float c = cos(2.0*len);
  float s = sin(2.0*len);
  mat2  m = mat2(c,-s,s,c);
  vec3  q = vec3(m*p.xz,p.y);

  return (snoise(q + time/5.0) + snoise(q/2.0) + 0.25 * snoise(2.0 * q));
}

void main() {
  vec3 pos = position;
  float h = displacementHeight * texture2D(displacementMap, texCoord).r;
  //float heightRight = displacementHeight * texture2D(displacementMap, texCoord + vec2(2.0/textureSize.x, 0.0)).r;
  //float heightFront = displacementHeight * texture2D(displacementMap, texCoord + vec2(0.0, 2.0/textureSize.y)).r;
  float height = displacementHeight * (0.5 + 0.5 * twistedNoise(vec3(position.x, position.y, position.z) * 2.0));
  float heightRight = displacementHeight * (0.5 + 0.5 * twistedNoise(vec3(position.x + 2.0/textureSize.x, position.y, position.z) * 2.0));
  float heightFront = displacementHeight * (0.5 + 0.5 * twistedNoise(vec3(position.x, position.y, position.z + 2.0/textureSize.x) * 2.0));

  vec3 right = normalize(vec3(2.0*planeSize.x/numSteps, heightRight, 0.0) - vec3(0.0, height, 0.0));
  vec3 front = normalize(vec3(0.0, heightFront, 2.0*planeSize.y/numSteps) - vec3(0.0, height, 0.0));
  vec3 up = normalize(cross(right, -front));

  vec3 N = up;

  pos.y += height;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

  e = normalize(vec3(modelViewMatrix * vec4(position, 1.0)));
  n = normalize(vec3(normalMatrix * vec4(N, 1.0)));

  vHeight = heightFront;
}

#endif

#ifdef FRAG

uniform vec4 tint;
uniform sampler2D texture;
uniform sampler2D texture2;
uniform bool showNormals;

varying vec3 e;
varying vec3 n;
varying float vHeight;

void main() {
  vec3 r = (reflect(e, n));
  float m = 2.0 * sqrt(r.x * r.x + r.y * r.y + (r.z + 1.0) * (r.z + 1.0));
  vec2 N = r.xy / m + 0.5;
  vec3 base = texture2D( texture, N ).rgb;

  if (length(tint.xyz) > 0.0) {
    gl_FragColor = tint;
  }
  else {
    gl_FragColor = vec4( base, 1.0 );
  }

  if (showNormals) {
    gl_FragColor = vec4(n * 0.5 + 0.5, 1.0);
  }
}

#endif
