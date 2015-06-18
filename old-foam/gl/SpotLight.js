var DirectionalLight = require('./DirectionalLight');

function SpotLight(id) {
    DirectionalLight.apply(this, arguments);
}

SpotLight.prototype = Object.create(DirectionalLight.prototype);
SpotLight.prototype.constructor = SpotLight;

SpotLight.prototype.setExponent = function () {
};
SpotLight.prototype.setCutOff = function () {
};

module.exports = SpotLight;