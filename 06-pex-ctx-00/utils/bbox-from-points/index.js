function createFromPoints(points) {
    var min = [ Infinity, Infinity, Infinity ];
    var max = [ -Infinity, -Infinity, -Infinity ];
    for(var i=0, len = points.length; i<len; i++) {
        var p = points[i];
        min[0] = Math.min(min[0], p[0]);
        min[1] = Math.min(min[1], p[1]);
        min[2] = Math.min(min[2], p[2]);
        max[0] = Math.max(max[0], p[0]);
        max[1] = Math.max(max[1], p[1]);
        max[2] = Math.max(max[2], p[2]);
    }
    return [ min, max ];
}

module.exports = createFromPoints;
