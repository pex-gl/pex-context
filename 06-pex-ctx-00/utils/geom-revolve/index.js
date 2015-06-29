function revolve(path, numSteps, rotation) {
    var loop = false;
    if (Math.abs(rotation - 2 * Math.PI) < 0.00001) {
        rotation = 2 * Math.PI;
        loop = true;
    }
    var positions = [];
    var cells = [];
    var n = loop ? numSteps : ((numSteps > 1) ? numSteps - 1 : 1);
    var numPoints = path.length;
    for(var i=0; i<numSteps; i++) {
        var angle = rotation * i / n;
        var sina = Math.sin(angle);
        var cosa = Math.cos(angle);
        for(var j=0; j<numPoints; j++) {
            var pathPoint = path[j];
            var x = cosa * pathPoint[0];
            var y = pathPoint[1];
            var z = sina * pathPoint[0];
            positions.push([x, y, z]);

            if (loop) {
                if (i < numSteps && j < numPoints - 1) {
                    cells.push([
                        i * numPoints + j,
                        ((i + 1) % numSteps) * numPoints + j,
                        ((i + 1) % numSteps) * numPoints + j + 1
                    ])
                    cells.push([
                        i * numPoints + j,
                        ((i + 1) % numSteps) * numPoints + j + 1,
                        i * numPoints + j + 1
                    ])
                }
            }
            else {
                if (i < numSteps - 1 && j < numPoints - 1) {
                    cells.push([
                        i * numPoints + j,
                        (i + 1) * numPoints + j,
                        (i + 1) * numPoints + j + 1
                    ])
                    cells.push([
                        i * numPoints + j,
                        (i + 1) * numPoints + j + 1,
                        i * numPoints + j + 1
                    ])
                }
            }
        }
    }

    return {
        positions: positions,
        cells: cells
    }
}

module.exports = revolve;
