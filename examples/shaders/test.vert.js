export default /* glsl */ `#version 300 es
in vec2 aPosition;
in vec2 aTexCoord;

uniform int uInt;
uniform uint uUint;
uniform bool uBoolean;
uniform float uFloat;

uniform vec2 uFloatVec2;
uniform vec3 uFloatVec3;
uniform vec4 uFloatVec4;

uniform ivec2 uIntVec2;
uniform ivec3 uIntVec3;
uniform ivec4 uIntVec4;

uniform uvec2 uUnsignedIntVec2;
uniform uvec3 uUnsignedIntVec3;
uniform uvec4 uUnsignedIntVec4;

uniform bvec2 uBoolVec2;
uniform bvec3 uBoolVec3;
uniform bvec4 uBoolVec4;

uniform mat2 uFloatMat2;
uniform mat3 uFloatMat3;
uniform mat4 uFloatMat4;
uniform mat2x3 uFloatMat2x3;
uniform mat2x4 uFloatMat2x4;
uniform mat3x2 uFloatMat3x2;
uniform mat3x4 uFloatMat3x4;
uniform mat4x2 uFloatMat4x2;
uniform mat4x3 uFloatMat4x3;

out vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;

  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;
