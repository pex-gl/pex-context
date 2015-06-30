var HalfEdge = {
    computeHalfEdges: require('./computeHalfEdges'),
    next: require('./next'),
    prev: require('./prev'),
    edgeLoop: require('./edgeLoop'),
    vertexEdgeLoop: require('./vertexEdgeLoop'),
}

module.exports = HalfEdge;
