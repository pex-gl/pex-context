#ifdef VERT

attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;

varying   vec4 vPosition;
varying   vec4 vColor;
varying   vec3 vNormal;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform float pointSize;

void main(){
    vColor    = color;
    vNormal   = normalize(vec3(normalMatrix * vec4(normal, 1.0)));
    vPosition = modelViewMatrix * vec4(position, 1.0);

    gl_Position   = projectionMatrix * vPosition;
    gl_PointSize  = pointSize;
}
#endif

#ifdef FRAG

#define NUM_LIGHTS 1

varying vec4 vPosition;
varying vec3 vNormal;
varying vec4 vColor;


struct Light {
  vec4 position;
  vec4 ambient;
};

struct Material {
  vec4 ambient;
};

uniform Light uLights[NUM_LIGHTS];
uniform float uUseLighting;

uniform Material uMaterial;

uniform float uFogStart;
uniform float uFogEnd;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}


void main(){

    Light light;
    float intensity;
    vec4 colorSum = vec4(0,0,0,1.0);

    vec4 colorBase = uMaterial.ambient;

    for (int i = 0; i < NUM_LIGHTS; ++i) {
        light = uLights[i];
        intensity = max(dot(vNormal, normalize(light.position.xyz - vPosition.xyz)),0.0);
        colorSum += colorBase + colorBase * vec4(light.ambient.rgb * intensity,1.0);
    }

    gl_FragColor = colorSum * (0.95 + rand(vPosition.xy) * 0.05);

    float fog = (-vPosition.z - uFogStart)/(uFogEnd - uFogStart);
    //So now
    //0 = no fog, original color
    //1 = full fog, fog color
    fog = clamp(fog, 0.0, 1.0);

    gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.0, 0.0, 0.0), fog);
}
#endif