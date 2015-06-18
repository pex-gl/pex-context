function none(a){
    return a;
}

function stepSmooth(a) {
    return a * a * (3 - 2 * a);
}

function stepSmoothSquared(a) {
    a = stepSmooth(a);
    return a * a;
}

function stepSmoothInvSquared(a) {
    a = 1.0 - stepSmooth(a);
    return 1 - a * a;
}

function stepSmoothCubed(a) {
    a = stepSmooth(a);
    return a * a * a * a;
}

function stepSmoothInvCubed(a) {
    a = 1.0 - stepSmooth(a);
    return 1 - a * a * a * a;
}

function stepSquared(a) {
    return a * a;
}

function stepInvSquared(a) {
    a = 1.0 - a;
    return 1 - a * a;
}

function stepCubed(a) {
    return a * a * a * a;
}

function stepInvCubed(a) {
    a = 1.0 - a;
    return 1 - a * a * a * a;
}


var Ease = {
    none : none,
    stepSmooth : stepSmooth,
    stepSmoothSquared : stepSmoothSquared,
    stepSmoothInvSquared : stepSmoothInvSquared,
    stepSmoothCubed : stepSmoothCubed,
    stepSmoothInvCubed : stepSmoothInvCubed,
    stepSquared : stepSquared,
    stepInvSquared : stepInvSquared,
    stepCubed: stepCubed,
    stepInvCubed : stepInvCubed
};

module.exports = Ease;