import typedArrayConcat from './typed-array-concat.js';

/**
 * @module typedArrayConstructor
 */ const upperBounds = new Map();
upperBounds.set([
    Int8Array,
    Uint8Array
], 255);
upperBounds.set([
    Int16Array,
    Uint16Array
], 65535);
upperBounds.set([
    Int32Array,
    Uint32Array
], 4294967295);
upperBounds.set([
    BigInt64Array,
    BigUint64Array
], 2 ** 64 - 1);
const upperBoundsArray = Array.from(upperBounds.entries());
/**
 * Get a typed array constructor based on the hypothetical max value it could contain. Signed or unsigned.
 *
 * @alias module:typedArrayConstructor
 * @param {number} maxValue The max value expected.
 * @param {boolean} signed Get a signed or unsigned array.
 * @returns {(Uint8Array|Uint16Array|Uint32Array|BigInt64Array|Int8Array|Int16Array|Int32Array|BigInt64Array)}
 * @see [MDN TypedArray objects]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects}
 */ const typedArrayConstructor = (maxValue, signed)=>{
    const value = signed ? Math.abs(maxValue) : Math.max(0, maxValue);
    return upperBoundsArray[upperBoundsArray.findLastIndex((param)=>{
        let [_, bound] = param;
        return value > Math[Math.sign(maxValue) === -1 ? "ceil" : "floor"](bound / (signed ? 2 : 1));
    }) + 1][0][signed ? 0 : 1];
};
var typedArrayConstructor$1 = typedArrayConstructor;

function merge(geometries) {
    const isTypedArray = !Array.isArray(geometries[0].positions);
    const CellsConstructor = isTypedArray ? typedArrayConstructor$1(geometries.reduce((sum, geometry)=>sum + geometry.positions.length / (isTypedArray ? 3 : 1), 0)) : Array;
    const mergedGeometry = {
        cells: new CellsConstructor()
    };
    let vertexOffset = 0;
    for(let i = 0; i < geometries.length; i++){
        const geometry = geometries[i];
        const vertexCount = geometry.positions.length / (isTypedArray ? 3 : 1);
        for (let attribute of Object.keys(geometry)){
            if (attribute === "cells") {
                mergedGeometry.cells = isTypedArray ? typedArrayConcat(CellsConstructor, mergedGeometry.cells, // Add previous geometry vertex offset mapped via a new typed array
                // because new value could be larger than what current type supports
                new (typedArrayConstructor$1(vertexOffset + vertexCount))(geometry.cells).map((n)=>vertexOffset + n)) : mergedGeometry.cells.concat(geometry.cells.map((cell)=>cell.map((n)=>vertexOffset + n)));
            } else {
                const isAttributeTypedArray = !Array.isArray(geometry[attribute]);
                mergedGeometry[attribute] ||= isAttributeTypedArray ? new geometry[attribute].constructor() : [];
                mergedGeometry[attribute] = isAttributeTypedArray ? typedArrayConcat(mergedGeometry[attribute].constructor, mergedGeometry[attribute], geometry[attribute]) : mergedGeometry[attribute].concat(geometry[attribute]);
            }
        }
        vertexOffset += vertexCount;
    }
    return mergedGeometry;
}

export { merge as default };
