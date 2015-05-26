float remap(float value, float oldMin, float oldMax, float newMin, float newMax) {
  return newMin + (value - oldMin) / (oldMax - oldMin) * (newMax - newMin);
}

vec3 rgb2hsl(vec3 rgb) {
  float h = 0.0;
  float s = 0.0;
  float l = 0.0;
  float r = rgb.r;
  float g = rgb.g;
  float b = rgb.b;
  float cMin = min( r, min( g, b ) );
  float cMax = max( r, max( g, b ) );

  l = ( cMax + cMin ) / 2.0;
  if ( cMax > cMin ) {
    float cDelta = cMax - cMin;

    s = l < .05 ? cDelta / ( cMax + cMin ) : cDelta / ( 2.0 - ( cMax + cMin ) );

    // hue
    if ( r == cMax ) {
      h = ( g - b ) / cDelta;
    } else if ( g == cMax ) {
      h = 2.0 + ( b - r ) / cDelta;
    } else {
      h = 4.0 + ( r - g ) / cDelta;
    }

    if ( h < 0.0) {
      h += 6.0;
    }
    h = h / 6.0;
  }
  return vec3( h, s, l );
}

float hsl2depth(vec3 hsl, float minDepth, float maxDepth) {
  float depth = hsl.r;
  if (hsl.b > 0.2) {
    return depth * ( maxDepth - minDepth ) + minDepth;
  }
  else {
    return 0.0;
  }
}

vec4 uvd2xyzw(vec2 samplePos, vec2 depthPP, float depth, vec2 depthFOV, float offsetDepth) {
  //return vec4((samplePos.x - depthPP.x) * depth / depthFOV.x, (samplePos.y - depthPP.y) * depth / depthFOV.y, -depth + offsetDepth, 1.0);
  //return vec4((samplePos.x - depthPP.x) * depth / depthFOV.x, (samplePos.y - depthPP.y) * depth / depthFOV.y, depth, 1.0);
  float scale = 0.5;
  return vec4((samplePos.x - 160.0) * depth / (depthFOV.x * scale), (samplePos.y - 120.0) * depth / (depthFOV.y * scale), depth, 1.0);
}