var Light = require('./Light');

function PointLight(id) {
    Light.apply(this, arguments);
}

PointLight.prototype = Object.create(Light.prototype);
PointLight.prototype.constructor = PointLight;

module.exports = PointLight;