var gl = {
    _obj: null,
    set : function(gl){
        this._obj = gl;
    },
    /**
     * Returns the shared gl context.
     * @returns {WebGLRenderingContext}
     */
    get: function () {
        return this._obj;
    },
    dispose : function(){
        this._obj = null;
    }
};
module.exports = gl;