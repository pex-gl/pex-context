#ifdef VERT

uniform mat4 projectionMatrix; 
uniform mat4 modelViewMatrix; 
uniform mat4 normalMatrix; 
attribute vec3 position; 
attribute vec3 normal; 
attribute vec2 texCoord; 
varying vec3 objPos;
varying float V;
varying float NdotL;
varying vec3 oN;
  
void main() { 
  vec3 lightPos = vec3(10.0, 10.0, 10.0);
  vec3 L = normalize(lightPos);
    
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  objPos = position.xyz * 0.05;
  V = texCoord.y;
  vec3 N = normalize((normalMatrix * vec4(normal, 1.0)).xyz); 
  NdotL = max(0.1, dot(N, L));
  oN = N;
}

#endif

#ifdef FRAG

#extension GL_OES_standard_derivatives : enable n
varying vec3 eyePos;
varying vec3 oN;
varying float NdotL;
varying float V;
varying vec3 objPos;
  
uniform vec4 lineColor;
uniform vec4 bgColor;
uniform vec4 fillColor;
  
void main() {
  float dp = length(vec2(dFdx(V), dFdy(V)));
  float logdp    = -log2(dp * 4.0);
  float ilogdp   = floor(logdp);
  float stripes  = exp2(ilogdp);
    
  float noise    = 0.0;
  float noiseHi    = 0.0;
  float frequency = 0.95;
  float sawtooth = fract((V + noise * 0.1) * frequency * stripes);
    
  float triangle = abs(2.0 * sawtooth - 1.0);
    
  float transition = logdp - ilogdp;
    
  triangle = abs((1.0 + transition) * triangle - transition);
    
  const float edgew = 0.5;
    
  float edge0  = clamp(NdotL - edgew, 0.0, 1.0);
  float edge1  = clamp(NdotL, 0.0, 1.0);
  float square = 1.0 - smoothstep(edge0, edge1, triangle);
  square = 1.0-abs(dot(oN, normalize(objPos)));
    
  if (square > 0.25) square = 1.0;
  if (noiseHi > 0.55) square = 1.0;
    
  float NdotL2 = max(0.075, NdotL);
  float edge02  = clamp(NdotL2 - edgew, 0.0, 1.0);
  float edge12  = clamp(NdotL2, 0.0, 1.0);
  float square2 = 1.0 - smoothstep(edge02, edge12, triangle);
    
  vec4 thickColor = fillColor * (1.0 - square);
  vec4 thinColor = lineColor * (1.0 - square2);
  gl_FragColor = bgColor;
  gl_FragColor = thickColor * thickColor.a + gl_FragColor * (1.0 - thickColor.a);
  gl_FragColor = thinColor * thinColor.a + gl_FragColor * (1.0 - thinColor.a);
    
  gl_FragColor.a = 1.0;
}

#endif