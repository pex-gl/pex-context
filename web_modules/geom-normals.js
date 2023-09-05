import { n as normalize$1, s as sub$1, a as set$1, c as cross$1, b as add$1, d as create } from './_chunks/vec3-81d013fb.js';
import { s as set, a as sub, n as normalize, c as cross, b as add, d as set3 } from './_chunks/avec3-d7dfe38e.js';

const TEMP_0 = create();
const TEMP_1 = create();
const TEMP_2 = create();
function normals(positions, cells, normals) {
    const isTypedArray = !Array.isArray(positions);
    if (isTypedArray) {
        normals ||= new Float32Array(positions.length);
        for(let fi = 0; fi < cells.length / 3; fi++){
            set(TEMP_0, 0, cells, fi);
            set(TEMP_1, 0, positions, TEMP_0[1]); // b
            sub(TEMP_1, 0, positions, TEMP_0[0]); // ab = b - a
            normalize(TEMP_1, 0);
            set(TEMP_2, 0, positions, TEMP_0[2]); // c
            sub(TEMP_2, 0, positions, TEMP_0[0]); // ac = c - a
            normalize(TEMP_2, 0);
            cross(TEMP_1, 0, TEMP_2, 0); // ab x ac
            normalize(TEMP_1, 0);
            for(let i = 0; i < 3; i++){
                add(normals, TEMP_0[i], TEMP_1, 0);
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
    for(let fi = 0; fi < cells.length; fi++){
        const f = cells[fi];
        const a = positions[f[0]];
        normalize$1(sub$1(set$1(TEMP_1, positions[f[1]]), a));
        normalize$1(sub$1(set$1(TEMP_2, positions[f[2]]), a));
        normalize$1(cross$1(TEMP_1, TEMP_2));
        for(let i = 0; i < f.length; i++){
            normals[f[i]] ||= [
                0,
                0,
                0
            ];
            add$1(normals[f[i]], TEMP_1);
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
