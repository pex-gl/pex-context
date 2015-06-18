/**
 * Global access to all loaded resources.
 * @example
 * var Resources = Foam.Resources;
 *
 * function Class(){
 *     this._image = Resources.img;
 * }
 *
 * @type {{}}
 */

var Resources = {};

/**
 * Dispose all loaded resources.
 * @example
 *
 * function setup(resources){
 *     //do something with the loaded data
 *     this._texture = Texture.fromImage(resources.img);
 *     resources.dispose();
 *     //prints null
 *     console.log(resources.img);
 * }
 */

Resources.dispose = function(){
    for(var k in this){
        if(k === 'dispose'){
            continue;
        }
        this[k] = null;
    }
};

module.exports = Resources;