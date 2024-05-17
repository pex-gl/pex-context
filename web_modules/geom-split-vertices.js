import { e as copy, d as create } from './_chunks/vec3-CYW9rG16.js';
import { d as set3, s as set } from './_chunks/avec3-BSBrm7T8.js';
import { t as typedArrayConstructor } from './_chunks/index-BO63msRe.js';

const TEMP_CELL = create();
const TEMP_POSITION = create();
function splitVertices(positions, cells) {
    const isFlatArray = !positions[0]?.length;
    const isCellsFlatArray = !cells[0]?.length;
    const cellCount = cells.length / (isCellsFlatArray ? 3 : 1);
    const positionCount = cellCount * 3;
    const splitPositions = isFlatArray ? new positions.constructor(positionCount * 3) : [];
    const splitCells = isCellsFlatArray ? new (typedArrayConstructor(positionCount))(cells.length) : [];
    let faceSize = 3;
    let cellIndex = 0;
    for(let i = 0; i < cellCount; i++){
        if (isCellsFlatArray) {
            set3(splitCells, i, i * 3, i * 3 + 1, i * 3 + 2);
            set(TEMP_CELL, 0, cells, i);
        } else {
            faceSize = cells[i].length;
            splitCells.push(cells[i].map((_, index)=>cellIndex + index));
            cellIndex += faceSize;
        }
        for(let j = 0; j < faceSize; j++){
            if (isFlatArray) {
                set(TEMP_POSITION, 0, positions, TEMP_CELL[j]);
                set(splitPositions, i * 3 + j, TEMP_POSITION, 0);
            } else {
                splitPositions.push(copy(positions[cells[i][j]]));
            }
        }
    }
    return {
        positions: splitPositions,
        cells: splitCells
    };
}

export { splitVertices as default };
