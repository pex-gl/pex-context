import { s as set$1, n as normalize$1, a as sub$1, c as cross$1, b as add$1, d as create } from './_chunks/vec3-CYW9rG16.js';
import { s as set, a as sub, n as normalize, c as cross, b as add, d as set3 } from './_chunks/avec3-BSBrm7T8.js';

const TEMP_CELL = create();
const TEMP_VEC3_1 = create();
const TEMP_VEC3_2 = create();
function normals(positions, cells, normals) {
    const isFlatArray = !positions[0]?.length;
    const isCellsFlatArray = !cells[0]?.length;
    const cellCount = cells.length / (isCellsFlatArray ? 3 : 1);
    if (isFlatArray) {
        normals ||= new positions.constructor(positions.length).fill(0);
        for(let fi = 0; fi < cellCount; fi++){
            if (isCellsFlatArray) {
                set(TEMP_CELL, 0, cells, fi);
            } else {
                set$1(TEMP_CELL, cells[fi]);
            }
            set(TEMP_VEC3_1, 0, positions, TEMP_CELL[1]); // b
            sub(TEMP_VEC3_1, 0, positions, TEMP_CELL[0]); // ab = b - a
            normalize(TEMP_VEC3_1, 0);
            set(TEMP_VEC3_2, 0, positions, TEMP_CELL[2]); // c
            sub(TEMP_VEC3_2, 0, positions, TEMP_CELL[0]); // ac = c - a
            normalize(TEMP_VEC3_2, 0);
            cross(TEMP_VEC3_1, 0, TEMP_VEC3_2, 0); // ab x ac
            normalize(TEMP_VEC3_1, 0);
            for(let i = 0; i < 3; i++){
                add(normals, TEMP_CELL[i], TEMP_VEC3_1, 0);
            }
        }
        for(let i = 0; i < positions.length / 3; i++){
            if (!isNaN(normals[i * 3])) {
                normalize(normals, i);
            } else {
                set3(normals, i, 0, 1, 0);
            }
        }
        return normals;
    }
    normals ||= [];
    for(let fi = 0; fi < cellCount; fi++){
        if (isCellsFlatArray) {
            set(TEMP_CELL, 0, cells, fi);
        } else {
            set$1(TEMP_CELL, cells[fi]);
        }
        const a = positions[TEMP_CELL[0]];
        normalize$1(sub$1(set$1(TEMP_VEC3_1, positions[TEMP_CELL[1]]), a)); // ab = b - a
        normalize$1(sub$1(set$1(TEMP_VEC3_2, positions[TEMP_CELL[2]]), a)); // ac = c - a
        normalize$1(cross$1(TEMP_VEC3_1, TEMP_VEC3_2)); // ab x ac
        for(let i = 0; i < 3; i++){
            normals[TEMP_CELL[i]] ||= [
                0,
                0,
                0
            ];
            add$1(normals[TEMP_CELL[i]], TEMP_VEC3_1);
        }
    }
    for(let i = 0; i < normals.length; i++){
        if (normals[i]) {
            normalize$1(normals[i]);
        } else {
            normals[i] = [
                0,
                1,
                0
            ];
        }
    }
    return normals;
}

export { normals as default };
