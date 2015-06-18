var ElementArrayUtil = {
    /**
     * Generate a set of triangle fan indices.
     * @param start - The start index
     * @param end - The end index
     * @param {Array} [out] - The target array
     * @returns {Array}
     */
    genTriangleFan : function(start,end,out){
        var arr = out || [],
            len = end - start;
        if(len < 3){
            return arr;
        }
        arr.length = (len - 1) * 3 - 3;

        var begin = start,
            end_2 = end - 2,
            index = 0;
        while(start < end_2){
            arr[index    ] = begin;
            arr[index + 1] = start + 1;
            arr[index + 2] = start + 2;
            start++;
            index += 3;
        }

        return arr;
    },
    /*
    genTriangle : function(start, end){

    },

    genTriangleStrip : function(start,end){

    },
    */

    /**
     * Generate a set of indices.
     * @param start - The start index
     * @param end - The start index
     * @returns {Array}
     */

    genPoints : function(start,end){
        var arr = [],
            len = end - start;
        if(len < 0){
            return arr;
        }
        arr.length = len;

        while(start < end){
            arr[start++] = start;
        }

        return arr;
    }

};

module.exports = ElementArrayUtil;