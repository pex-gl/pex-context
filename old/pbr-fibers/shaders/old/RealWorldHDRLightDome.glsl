precision highp float;
precision highp int;
 
#define ROUGHNESS_SAMPLES 32
#define MAX_DIR_LIGHTS 1
#define MAX_POINT_LIGHTS 0
#define MAX_SPOT_LIGHTS 0
#define MAX_HEMI_LIGHTS 1
#define MAX_SHADOWS 1
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
#define DOUBLE_SIDED
 
#define USE_SHADOWMAP
#define SHADOWMAP_TYPE_PCF
 
 
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
uniform vec3 ambient;
uniform vec3 diffuse;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
uniform bool enableDiffuse;
uniform bool enableSpecular;
uniform bool enableAO;
uniform bool enableReflection;
uniform bool enableNormal;
uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform sampler2D tSpecular;
uniform sampler2D tAO;
uniform samplerCube tCube;
uniform samplerCube irradCube;
uniform vec2 uNormalScale;
uniform bool useRefract;
uniform float refractionRatio;
uniform float reflectivity;
uniform float roughness;
varying vec3 vTangent;
varying vec3 vBinormal;
varying vec3 vNormal;
varying vec3 wNormal;
varying vec2 vUv;
uniform vec3 ambientLightColor;
#if MAX_DIR_LIGHTS > 0
uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];
uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];
#endif
#if MAX_HEMI_LIGHTS > 0
uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];
uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];
uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];
#endif
#if MAX_POINT_LIGHTS > 0
uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];
uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];
uniform float pointLightDistance[ MAX_POINT_LIGHTS ];
#endif
#if MAX_SPOT_LIGHTS > 0
uniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];
uniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];
uniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];
uniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];
uniform float spotLightExponent[ MAX_SPOT_LIGHTS ];
uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];
#endif
#ifdef WRAP_AROUND
uniform vec3 wrapRGB;
#endif
varying vec3 vWorldPosition;
varying vec3 vViewPosition;
vec3 rand3(vec3 p, int seed)
{
    float a = 12.988;
    float b = 68.233;
    float c = 11.883;
    vec3 rv = normalize( vec3(a,b,c) + (float(seed)*0.987));
    float x = fract( sin( mod( dot( p, rv), 3.14)) * 43758.5453) * 2.0 - 1.0;
    float y = fract( sin( mod( dot( p, rv), 3.14)) * 19782.8974) * 2.0 - 1.0;
    float z = fract( sin( mod( dot( p, rv), 3.14)) * 61415.4067) * 2.0 - 1.0;
    return vec3(x, y, z);
}
float fresnel(float cosine, float refl )
{
    const float mFresnelBias = 0.01;
    const float mFresnelScale = 1.0;
    const float mFresnelPower = 5.0;
    return mix( mFresnelScale * pow( 1.0 + cosine, mFresnelPower ), 1.0, pow(refl, 2.0)  );
}
#ifdef USE_SHADOWMAP
uniform sampler2D shadowMap[ MAX_SHADOWS ];
uniform vec2 shadowMapSize[ MAX_SHADOWS ];
uniform float shadowDarkness[ MAX_SHADOWS ];
uniform float shadowBias[ MAX_SHADOWS ];
varying vec4 vShadowCoord[ MAX_SHADOWS ];
float unpackDepth( const in vec4 rgba_depth ) {
const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );
float depth = dot( rgba_depth, bit_shift );
return depth;
}
#endif
#ifdef USE_FOG
uniform vec3 fogColor;
#ifdef FOG_EXP2
uniform float fogDensity;
#else
uniform float fogNear;
uniform float fogFar;
#endif
#endif
void main() {
gl_FragColor = vec4( vec3( 1.0 ), opacity );
vec3 specularTex = vec3( 1.0 );
float specularRough = 1.0;
if( enableDiffuse ) {
#ifdef GAMMA_INPUT
vec4 texelColor = texture2D( tDiffuse, vUv );
texelColor.xyz *= texelColor.xyz;
gl_FragColor = gl_FragColor * texelColor;
#else
gl_FragColor = gl_FragColor * texture2D( tDiffuse, vUv );
#endif
}
if( enableSpecular ) {
specularRough = texture2D( tSpecular, vUv * 6.0 ).r;
specularRough = ( specularRough * specularRough + 0.4) * 2.0;
}
vec3 finalNormal = normalize( vNormal );
vec3 worldNormal = normalize( wNormal );
if( enableNormal ) {
vec3 normalTex = texture2D( tNormal, vUv * 6.0 ).xyz * 2.0 - 1.0;
normalTex.xy *= uNormalScale;
normalTex = normalize( normalTex );
mat3 tsb = mat3( normalize( vTangent ), normalize( vBinormal ), finalNormal );
finalNormal = tsb * normalTex;
mat3 tsbw = mat3( normalize( vTangent ), normalize( vBinormal ), worldNormal );
worldNormal = normalize( tsbw * normalTex );
}
#ifdef FLIP_SIDED
finalNormal = -finalNormal;
#endif
vec3 normal = normalize( finalNormal );
vec3 viewPosition = normalize( vViewPosition );
float F = fresnel( dot( -viewPosition, normal), reflectivity );
#ifdef DOUBLE_SIDED
if ( gl_FrontFacing ){
#endif
#if MAX_POINT_LIGHTS > 0
vec3 pointDiffuse = vec3( 0.0 );
vec3 pointSpecular = vec3( 0.0 );
for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {
vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );
vec3 pointVector = lPosition.xyz + vViewPosition.xyz;
float pointDistance = 1.0;
if ( pointLightDistance[ i ] > 0.0 )
pointDistance = 1.0 - min( ( length( pointVector ) / pointLightDistance[ i ] ), 1.0 );
pointVector = normalize( pointVector );
#ifdef WRAP_AROUND
float pointDiffuseWeightFull = max( dot( normal, pointVector ), 0.0 );
float pointDiffuseWeightHalf = max( 0.5 * dot( normal, pointVector ) + 0.5, 0.0 );
vec3 pointDiffuseWeight = mix( vec3 ( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );
#else
float pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );
#endif
pointDiffuse += pointDistance * pointLightColor[ i ] * diffuse * pointDiffuseWeight;
vec3 pointHalfVector = normalize( pointVector + viewPosition );
float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );
float pointSpecularWeight = specularTex.r * max( pow( pointDotNormalHalf, shininess ), 0.0 );
float specularNormalization = ( shininess + 2.0001 ) / 8.0;
vec3 schlick = specular + vec3( 1.0 - specular ) * pow( 1.0 - dot( pointVector, pointHalfVector ), 5.0 );
pointSpecular += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * pointDistance * specularNormalization;
}
#endif
#if MAX_SPOT_LIGHTS > 0
vec3 spotDiffuse = vec3( 0.0 );
vec3 spotSpecular = vec3( 0.0 );
for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {
vec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );
vec3 spotVector = lPosition.xyz + vViewPosition.xyz;
float spotDistance = 1.0;
if ( spotLightDistance[ i ] > 0.0 )
spotDistance = 1.0 - min( ( length( spotVector ) / spotLightDistance[ i ] ), 1.0 );
spotVector = normalize( spotVector );
float spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - vWorldPosition ) );
if ( spotEffect > spotLightAngleCos[ i ] ) {
spotEffect = max( pow( spotEffect, spotLightExponent[ i ] ), 0.0 );
#ifdef WRAP_AROUND
float spotDiffuseWeightFull = max( dot( normal, spotVector ), 0.0 );
float spotDiffuseWeightHalf = max( 0.5 * dot( normal, spotVector ) + 0.5, 0.0 );
vec3 spotDiffuseWeight = mix( vec3 ( spotDiffuseWeightFull ), vec3( spotDiffuseWeightHalf ), wrapRGB );
#else
float spotDiffuseWeight = max( dot( normal, spotVector ), 0.0 );
#endif
spotDiffuse += spotDistance * spotLightColor[ i ] * diffuse * spotDiffuseWeight * spotEffect;
vec3 spotHalfVector = normalize( spotVector + viewPosition );
float spotDotNormalHalf = max( dot( normal, spotHalfVector ), 0.0 );
float spotSpecularWeight = specularTex.r * max( pow( spotDotNormalHalf, shininess ), 0.0 );
float specularNormalization = ( shininess + 2.0001 ) / 8.0;
vec3 schlick = specular + vec3( 1.0 - specular ) * pow( 1.0 - dot( spotVector, spotHalfVector ), 5.0 );
spotSpecular += schlick * spotLightColor[ i ] * spotSpecularWeight * spotDiffuseWeight * spotDistance * specularNormalization * spotEffect;
}
}
#endif
#if MAX_DIR_LIGHTS > 0
vec3 dirDiffuse = vec3( 0.0 );
vec3 dirSpecular = vec3( 0.0 );
for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {
vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );
vec3 dirVector = normalize( lDirection.xyz );
#ifdef WRAP_AROUND
float directionalLightWeightingFull = max( dot( normal, dirVector ), 0.0 );
float directionalLightWeightingHalf = max( 0.5 * dot( normal, dirVector ) + 0.5, 0.0 );
vec3 dirDiffuseWeight = mix( vec3( directionalLightWeightingFull ), vec3( directionalLightWeightingHalf ), wrapRGB );
#else
float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );
#endif
vec4 dirDiffuseSample = textureCube( tCube, normalize( directionalLightDirection[ i ] ));
vec3 atmMask = dirDiffuseSample.xyz * vec3(1. - pow(dirDiffuseSample.a * 0.95, 3.));
dirDiffuse += atmMask * diffuse * dirDiffuseWeight;
vec3 dirHalfVector = normalize( dirVector + viewPosition );
float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );
float dirSpecularWeight = specularTex.r * max( pow( dirDotNormalHalf, shininess * specularRough ), 0.0 );
float specularNormalization = ( shininess + 2.0001 ) / 8.0;
vec3 schlick = specular + vec3( 1.0 - specular ) * pow( 1.0 - dot( dirVector, dirHalfVector ), 5.0 );
dirSpecular += atmMask * schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization  * F;
}
#endif
#if MAX_HEMI_LIGHTS > 0
vec3 hemiDiffuse  = vec3( 0.0 );
vec3 hemiSpecular = vec3( 0.0 );
for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {
vec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );
vec3 lVector = normalize( lDirection.xyz );
float dotProduct = dot( normal, lVector );
float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;
vec3 hemiColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );
hemiDiffuse += diffuse * hemiColor;
vec3 hemiHalfVectorSky = normalize( lVector + viewPosition );
float hemiDotNormalHalfSky = 0.5 * dot( normal, hemiHalfVectorSky ) + 0.5;
float hemiSpecularWeightSky = specularTex.r * max( pow( hemiDotNormalHalfSky, shininess ), 0.0 );
vec3 lVectorGround = -lVector;
vec3 hemiHalfVectorGround = normalize( lVectorGround + viewPosition );
float hemiDotNormalHalfGround = 0.5 * dot( normal, hemiHalfVectorGround ) + 0.5;
float hemiSpecularWeightGround = specularTex.r * max( pow( hemiDotNormalHalfGround, shininess ), 0.0 );
float dotProductGround = dot( normal, lVectorGround );
float specularNormalization = ( shininess + 2.0001 ) / 8.0;
vec3 schlickSky = specular + vec3( 1.0 - specular ) * pow( 1.0 - dot( lVector, hemiHalfVectorSky ), 5.0 );
vec3 schlickGround = specular + vec3( 1.0 - specular ) * pow( 1.0 - dot( lVectorGround, hemiHalfVectorGround ), 5.0 );
hemiSpecular += hemiColor * specularNormalization * ( schlickSky * hemiSpecularWeightSky * max( dotProduct, 0.0 ) + schlickGround * hemiSpecularWeightGround * max( dotProductGround, 0.0 ) );
}
#endif
vec3 totalDiffuse = vec3( 0.0 );
vec3 totalSpecular = vec3( 0.0 );
#if MAX_DIR_LIGHTS > 0
totalDiffuse += dirDiffuse;
totalSpecular += dirSpecular;
#endif
#if MAX_HEMI_LIGHTS > 0
#endif
#if MAX_POINT_LIGHTS > 0
totalDiffuse += pointDiffuse;
totalSpecular += pointSpecular;
#endif
#if MAX_SPOT_LIGHTS > 0
totalDiffuse += spotDiffuse;
totalSpecular += spotSpecular;
#endif
#ifdef METAL
gl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * ambient + totalSpecular );
#else
gl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * ambient ) + totalSpecular;
#endif
#ifdef USE_SHADOWMAP
#ifdef SHADOWMAP_DEBUG
vec3 frustumColors[3];
frustumColors[0] = vec3( 1.0, 0.5, 0.0 );
frustumColors[1] = vec3( 0.0, 1.0, 0.8 );
frustumColors[2] = vec3( 0.0, 0.5, 1.0 );
#endif
#ifdef SHADOWMAP_CASCADE
int inFrustumCount = 0;
#endif
float fDepth;
vec3 shadowColor = vec3( 1.0 );
for( int i = 0; i < MAX_SHADOWS; i ++ ) {
vec3 shadowCoord = vShadowCoord[ i ].xyz / vShadowCoord[ i ].w;
bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
bool inFrustum = all( inFrustumVec );
#ifdef SHADOWMAP_CASCADE
inFrustumCount += int( inFrustum );
bvec3 frustumTestVec = bvec3( inFrustum, inFrustumCount == 1, shadowCoord.z <= 1.0 );
#else
bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );
#endif
bool frustumTest = all( frustumTestVec );
if ( frustumTest ) {
shadowCoord.z += shadowBias[ i ];
#if defined( SHADOWMAP_TYPE_PCF )
float shadow = 0.0;
const float shadowDelta = 1.0 / 9.0;
float xPixelOffset = 1.0 / shadowMapSize[ i ].x;
float yPixelOffset = 1.0 / shadowMapSize[ i ].y;
float dx0 = -1.25 * xPixelOffset;
float dy0 = -1.25 * yPixelOffset;
float dx1 = 1.25 * xPixelOffset;
float dy1 = 1.25 * yPixelOffset;
fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );
if ( fDepth < shadowCoord.z ) shadow += shadowDelta;
fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );
if ( fDepth < shadowCoord.z ) shadow += shadowDelta;
fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );
if ( fDepth < shadowCoord.z ) shadow += shadowDelta;
fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );
if ( fDepth < shadowCoord.z ) shadow += shadowDelta;
fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );
if ( fDepth < shadowCoord.z ) shadow += shadowDelta;
fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );
if ( fDepth < shadowCoord.z ) shadow += shadowDelta;
fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );
if ( fDepth < shadowCoord.z ) shadow += shadowDelta;
fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );
if ( fDepth < shadowCoord.z ) shadow += shadowDelta;
fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );
if ( fDepth < shadowCoord.z ) shadow += shadowDelta;
shadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );
#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
float shadow = 0.0;
float xPixelOffset = 1.0 / shadowMapSize[ i ].x;
float yPixelOffset = 1.0 / shadowMapSize[ i ].y;
float dx0 = -1.0 * xPixelOffset;
float dy0 = -1.0 * yPixelOffset;
float dx1 = 1.0 * xPixelOffset;
float dy1 = 1.0 * yPixelOffset;
mat3 shadowKernel;
mat3 depthKernel;
depthKernel[0][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );
depthKernel[0][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );
depthKernel[0][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );
depthKernel[1][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );
depthKernel[1][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );
depthKernel[1][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );
depthKernel[2][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );
depthKernel[2][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );
depthKernel[2][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );
vec3 shadowZ = vec3( shadowCoord.z );
shadowKernel[0] = vec3(lessThan(depthKernel[0], shadowZ ));
shadowKernel[0] *= vec3(0.25);
shadowKernel[1] = vec3(lessThan(depthKernel[1], shadowZ ));
shadowKernel[1] *= vec3(0.25);
shadowKernel[2] = vec3(lessThan(depthKernel[2], shadowZ ));
shadowKernel[2] *= vec3(0.25);
vec2 fractionalCoord = 1.0 - fract( shadowCoord.xy * shadowMapSize[i].xy );
shadowKernel[0] = mix( shadowKernel[1], shadowKernel[0], fractionalCoord.x );
shadowKernel[1] = mix( shadowKernel[2], shadowKernel[1], fractionalCoord.x );
vec4 shadowValues;
shadowValues.x = mix( shadowKernel[0][1], shadowKernel[0][0], fractionalCoord.y );
shadowValues.y = mix( shadowKernel[0][2], shadowKernel[0][1], fractionalCoord.y );
shadowValues.z = mix( shadowKernel[1][1], shadowKernel[1][0], fractionalCoord.y );
shadowValues.w = mix( shadowKernel[1][2], shadowKernel[1][1], fractionalCoord.y );
shadow = dot( shadowValues, vec4( 1.0 ) );
shadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );
#else
vec4 rgbaDepth = texture2D( shadowMap[ i ], shadowCoord.xy );
float fDepth = unpackDepth( rgbaDepth );
if ( fDepth < shadowCoord.z )
shadowColor = shadowColor * vec3( 1.0 - shadowDarkness[ i ] );
#endif
}
#ifdef SHADOWMAP_DEBUG
#ifdef SHADOWMAP_CASCADE
if ( inFrustum && inFrustumCount == 1 ) gl_FragColor.xyz *= frustumColors[ i ];
#else
if ( inFrustum ) gl_FragColor.xyz *= frustumColors[ i ];
#endif
#endif
}
#ifdef GAMMA_OUTPUT
shadowColor *= shadowColor;
#endif
gl_FragColor.xyz = gl_FragColor.xyz * shadowColor;
#endif
vec3 aoColor = vec3(1.0);
if( enableAO ) {
aoColor = texture2D( tAO, vUv ).rgb;
aoColor = sqrt(aoColor);
}
#if MAX_HEMI_LIGHTS > 0
gl_FragColor.xyz +=  hemiDiffuse * aoColor;
#endif
vec3 irraColor = textureCube( irradCube, worldNormal ).rgb;
#ifdef GAMMA_INPUT
irraColor.xyz *= irraColor.xyz;
#endif
gl_FragColor.xyz +=  irraColor * aoColor * diffuse;
if ( enableReflection ) {
vec3 vReflect;
vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );
if ( useRefract ) {
vReflect = refract( cameraToVertex, normal, refractionRatio );
} else {
vReflect = reflect( cameraToVertex, worldNormal );
}
    vec3 cubeColor = vec3( 0.0 );
    if( roughness != 0.0 )
    {
        for( int i = 0; i <= ROUGHNESS_SAMPLES; i++ )
        {
            cubeColor += textureCube( tCube, normalize(( rand3( vWorldPosition, i ) * roughness * specularRough ) + vReflect ) ).rgb * (1.0 / float( ROUGHNESS_SAMPLES ));
        }
    }else{
        cubeColor = textureCube( tCube, vReflect ).rgb;
    }
   cubeColor = cubeColor * aoColor;
#ifdef GAMMA_INPUT
cubeColor.xyz *= cubeColor.xyz;
#endif
gl_FragColor.xyz = mix( gl_FragColor.xyz, cubeColor.xyz, specularTex.r * F);
}
#ifdef DOUBLE_SIDED
}else{ gl_FragColor.xyz = vec3(0.0);}
#endif
#ifdef GAMMA_OUTPUT
gl_FragColor.xyz = sqrt( gl_FragColor.xyz );
#endif
#ifdef USE_FOG
float depth = gl_FragCoord.z / gl_FragCoord.w;
#ifdef FOG_EXP2
const float LOG2 = 1.442695;
float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );
#else
float fogFactor = smoothstep( fogNear, fogFar, depth );
#endif
gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
#endif
}