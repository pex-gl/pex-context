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

/*

float A = 0.15;
float B = 0.50;
float C = 0.10;
float D = 0.20;
float E = 0.02;
float F = 0.30;
float W = 11.2;

float3 Uncharted2Tonemap(float3 x)
{
   return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}

float4 ps_main( float2 texCoord  : TEXCOORD0 ) : COLOR
{
   float3 texColor = tex2D(Texture0, texCoord );
   texColor *= 16;  // Hardcoded Exposure Adjustment

   float ExposureBias = 2.0f;
   float3 curr = Uncharted2Tonemap(ExposureBias*texColor);

   float3 whiteScale = 1.0f/Uncharted2Tonemap(W);
   float3 color = curr*whiteScale;

   float3 retColor = pow(color,1/2.2);
   return float4(retColor,1);
}

*/

varying vec2 vTexCoord;
uniform sampler2D tex0;

void main() {
  vec4 color = texture2D(tex0, vTexCoord).rgba;
  //color.rgb *= 16.0; //hardcoded exposure
  color = color/(1.0 + color);
  //vec3 retColor = pow(color.rgb, vec3(1.0/2.2)); //map gamma
  vec3 retColor = color.rgb;
  gl_FragColor.rgb = retColor;
  gl_FragColor.a = color.a;
}

#endif