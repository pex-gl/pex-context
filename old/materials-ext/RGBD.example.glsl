vec3 rgb2hsl( vec3 _input ){
  float h = 0.0;
	float s = 0.0;
	float l = 0.0;
	float r = _input.r;
	float g = _input.g;
	float b = _input.b;
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
float depthValueFromSample( vec2 depthPos){
    vec2  halfvec = vec2(.5,.5);
    float depth = rgb2hsl( texture2DRect(texture, floor(depthPos) + halfvec ).xyz ).r;
    return depth * ( maxDepth - minDepth ) + minDepth;
}
  
vec2 samplePos = gl_Vertex.xy;
  vec2 depthPos = samplePos + depthRect.xy;
  float depth = depthValueFromSample( depthPos );
 
	// Reconstruct the 3D point position
  vec4 pos = vec4((samplePos.x - depthPP.x) * depth / depthFOV.x,
                  (samplePos.y - depthPP.y) * depth / depthFOV.y,
                  depth,                1.0);
 
 //------------------------------------------------------------------------------

vec3 rgb2hsl( vec3 color ) {

				float h = 0.0;
				float s = 0.0;
				float l = 0.0;
				float r = color.r;
				float g = color.g;
				float b = color.b;
				float cMin = min( r, min( g, b ) );
				float cMax = max( r, max( g, b ) );

				l =  ( cMax + cMin ) / 2.0;

				if ( cMax > cMin ) {

					float cDelta = cMax - cMin;

					// saturation

					if ( l < 0.5 ) {

						s = cDelta / ( cMax + cMin );

					} else {

						s = cDelta / ( 2.0 - ( cMax + cMin ) );

					}

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

			const float minD = 555.0;
			const float maxD = 1005.0;
			const float fx = 1.11087;
			const float fy = 0.832305;

			vec3 xyz( float x, float y, float depth ) {

				float z = depth * ( maxD - minD ) + minD;

				return vec3( ( x / 640.0 ) * z * fx, ( y / 480.0 ) * z * fy, - z );

			}

			uniform sampler2D map;

			varying float visibility;
			varying vec2 vUv;

			void main() {

				vUv = vec2( ( position.x + 320.0 ) / 640.0, ( position.y + 240.0 ) / 480.0 );
				vUv.x = vUv.x * 0.5;

				vec3 hsl = rgb2hsl( texture2D( map, vUv ).xyz );
				vec4 pos = vec4( xyz( position.x, position.y, hsl.x ), 1.0 );
				pos.z += 800.0;

				vUv.x += 0.5;
				visibility = hsl.z * 2.0;

				gl_PointSize = 2.0;

				gl_Position = projectionMatrix * modelViewMatrix * pos;

			}

		</script>

		<script id="fs" type="x-shader/x-fragment">

			uniform sampler2D map;
			uniform float opacity;

			varying float visibility;
			varying vec2 vUv;

			void main() {

				if ( visibility < 0.75 ) discard;

				vec4 color = texture2D( map, vUv );
				color.w = opacity;

				gl_FragColor = color;

			}
