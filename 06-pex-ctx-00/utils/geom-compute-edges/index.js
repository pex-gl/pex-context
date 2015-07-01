function computeEdges(faces) {
    var cache = {};
    var edges = [];
    for(var i=0, len=faces.length; i<len; i++) {
        var f = faces[i];
        for(var j=0, flen=f.length; j<flen; j++) {
            var a = f[j];
            var b = f[(j+1)%flen];
            var hash1 = a + '-' + b;
            var hash2 = b + '-' + a;
            if (!cache[hash1] && !cache[hash2]) {
                edges.push([a, b]);
                cache[hash1] = true;
                cache[hash2] = true;
            }
        }
    }
    return edges;
}

module.exports = computeEdges;
