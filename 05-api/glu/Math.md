vec3.create(x, y, z)
//vec3.createFromVec3(v) or vec3.copy(v)

mat3.createFromMat4(m4)

mat4.translate(v)
mat4.translate3(x, y, z)
mat4.create()
mat4.createFromTranslation(v)
mat4.createFromTranslation3(x, y, z)
mat4.createFromRotation(a, v)
mat4.createFromRotationXYZ(v)
mat4.createFromRotationXYZ3(v)
mat4.createFromQuat(q)

m = mat4.create()
mat4.setQuat(m, q)

//mat4.createFromMat4(m) or mat4.copy(m)




mat4.mult(createMat4(), a, b);

//gl matrix v1
add3(a, b, out)

//gl-matrix v2
add3(out, a, b)

//foam
add3(a, b)
normalize(add3(a, b));
add(clone(a), b) -> c
add(copy(c, a), b)
set(a, b)
set3(a, x, y, z)
copy(a) //clone(a)
scale3(a, b)

var temp = vec3.create();
for(var i=0; i<len; i++) {

    normalize(set3(temp, particle.direction))
    vs
    normalized(particle.direction);
    vs
    normalize(tmp, particle.direction)
}

var vec3 = require('pex-math/vec3');
vec3.add(a, b)

var add3 = require('pex-math/vec3').add;
add3(a, b)

var add = require('pex-math/vec3').add;
add(a,b);

//plask
add3(a, b) -> c
add3Self(a, b)
