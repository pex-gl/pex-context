var gl      = require('./gl'),
    glTrans = require('./glTrans'),
    glDraw  = require('./glDraw');

/**
 * Base class for all drawable objects.
 * @constructor
 */

function glObject(){
    /**
     * Reference to WebGLRenderingContext
     * @type {WebGLRenderingContext}
     * @protected
     */
    this._gl = gl.get();

    /**
     * Reference to glTrans
     * @type {glTrans}
     * @protected
     */

    this._glTrans = glTrans;


    /**
     * Reference to glDraw
     * @type {glDraw}
     * @protected
     */
    this._glDraw = glDraw.get();
}

module.exports = glObject;

