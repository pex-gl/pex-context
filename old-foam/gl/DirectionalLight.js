var Vec3 = require('../math/Vec3'),
    Light = require('./Light');

function DirectionalLight(id) {
    Light.apply(this, arguments);
}

DirectionalLight.prototype = Object.create(Light.prototype);

DirectionalLight.prototype.setDirection = function (v) {
    this.direction.set(v);
};

DirectionalLight.prototype.setDirection3f = function (x, y, z) {
    this.direction.setf(x,y,z);
};

DirectionalLight.prototype.lookAt = function (position, target) {
    this.setEye(position);
    this.setDirection(position.subbed(target).normalize());
};

module.exports = DirectionalLight;