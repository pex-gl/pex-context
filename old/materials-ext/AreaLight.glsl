#ifdef VERT

attribute vec3 position;
attribute vec3 normal;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;
varying vec3 vNormal;
varying vec3 vWorldPos;
void main() {
  vNormal = normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vWorldPos = (modelWorldMatrix * vec4(position, 1.0)).xyz;
}

#endif

#ifdef FRAG

uniform mat4 modelViewMatrix;
uniform vec4 ambientColor;
uniform vec4 diffuseColor;
uniform vec3 lightPos;
uniform vec2 lightSize;
uniform vec3 lightNormal;
uniform vec3 lightRight;
varying vec3 vNormal;
uniform float wrap;
uniform float constantAttenuation;
uniform float linearAttenuation;
uniform float quadraticAttenuation;
varying vec3 vWorldPos;
uniform sampler2D tex;

//Based on http://www.gamedev.net/topic/552315-glsl-area-light-implementation/ by ArKano22

vec3 projectOnPlane(in vec3 p, in vec3 pc, in vec3 pn)
{
    float dist = dot(pn, p-pc);
    return p - dist*pn;
}

int sideOfPlane(in vec3 p, in vec3 pc, in vec3 pn){
   if (dot(p-pc,pn)>=0.0) return 1; else return 0;
}

vec3 linePlaneIntersect(in vec3 lp, in vec3 lv, in vec3 pc, in vec3 pn){
   return lp+lv*(dot(pn,pc-lp)/dot(pn,lv));
}

void areaLight(in vec3 lightPos, in vec3 lightDir, in vec3 lightRight, in vec2 lightSize, in vec3 N, in vec3 V, in float shininess,
                inout vec4 ambient, inout vec4 diffuse, inout vec4 specular)
{
    vec3 right = normalize(vec3(lightRight));
    vec3 pnormal = normalize(lightDir);
    vec3 up = normalize(cross(right,pnormal));

    //width and height of the area light:
    float width = lightSize.x;
    float height = lightSize.y;

    //project onto plane and calculate direction from center to the projection.
    vec3 projection = projectOnPlane(V,lightPos,pnormal);// projection in plane
    vec3 dir = projection-vec3(lightPos);

    //calculate distance from area:
    vec2 diagonal = vec2(dot(dir,right),dot(dir,up));
    vec2 nearest2D = vec2(clamp( diagonal.x,-width,width  ),clamp(  diagonal.y,-height,height));
    vec2 texCoord = vec2(nearest2D.x / width, nearest2D.y / height) * 0.5 + vec2(0.5);
    vec3 nearestPointInside = lightPos + (right * nearest2D.x + up * nearest2D.y);

    float dist = distance(V,nearestPointInside);//real distance to area rectangle

    vec3 L = normalize(nearestPointInside - V);
    float attenuation = 1.0 / (constantAttenuation + dist * linearAttenuation + dist * dist * quadraticAttenuation);

    float nDotL = dot(pnormal,-L);

    if (nDotL > 0.0 && sideOfPlane(V,lightPos,pnormal) == 1) //looking at the plane
    {
        //shoot a ray to calculate specular:
        vec3 R = reflect(normalize(-V), N);
        vec3 E = linePlaneIntersect(V,R,lightPos,pnormal);

        //float specAngle = dot(R,pnormal);
        //if (specAngle > 0.0){
        //  vec3 dirSpec = E-lightPos;
        //  vec2 dirSpec2D = vec2(dot(dirSpec,right),dot(dirSpec,up));
        //  vec2 nearestSpec2D = vec2(clamp( dirSpec2D.x,-width,width  ),clamp(  dirSpec2D.y,-height,height));
        //  float specFactor = 1.0-clamp(length(nearestSpec2D-dirSpec2D)*shininess,0.0,1.0);
        //  specular += gl_LightSource[i].specular * attenuation * specFactor * specAngle;   
        //}
        diffuse  += diffuseColor  * attenuation * nDotL;  
        //diffuse = vec4(texture2D(tex, texCoord, 5.0).rgb, 1.0);// * attenuation * nDotL;
    }
    ambient  += ambientColor;
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 lightDir = lightPos - vWorldPos;
  vec3 L = normalize(lightDir);
  float dist = length(lightDir);
  float att = 1.0 / (constantAttenuation + dist * linearAttenuation + dist * dist * quadraticAttenuation);

  //float NdotL = max(0.0, (dot(N, L) + wrap)/(1 + wrap));

  vec4 ambient = vec4(0.0);
  vec4 diffuse = vec4(0.0);
  vec4 specular = vec4(0.0);
  areaLight(lightPos, lightNormal, lightRight, lightSize, N, vWorldPos, 0.0, ambient, diffuse, specular);

  gl_FragColor = pow(ambient + diffuse, vec4(2.2));
}

#endif
