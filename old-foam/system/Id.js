var num = 0;

module.exports = {
    /**
     * Get a unique Id within the programs lifetime.
     * @returns {Number}
     */
    get : function(){
        return num++;
    }
};