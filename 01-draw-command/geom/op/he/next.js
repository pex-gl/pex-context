function next(edge) {
  return edge.face.halfEdges[(edge.slot + 1) % edge.face.length]
}

module.exports = next;
