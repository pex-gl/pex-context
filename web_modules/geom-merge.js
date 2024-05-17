import typedArrayConcat from './typed-array-concat.js';
import { t as typedArrayConstructor } from './_chunks/index-BO63msRe.js';

const isAttributeFlat = (attribute)=>!attribute[0]?.length;
const isAttributeTypedArray = (attribute)=>!(attribute instanceof Array);
const isAttributeArrayLike = (attribute)=>Array.isArray(attribute) || ArrayBuffer.isView(attribute);
const getGeometryAttributes = (geometry)=>Object.keys(geometry).filter((attribute)=>isAttributeArrayLike(geometry[attribute]));
function chunkAndOffset(array, stride, offset) {
    const result = [];
    let chunk = [];
    for(let i = 0; i < array.length; i++){
        chunk.push(array[i] + offset);
        if (i % stride === stride - 1) {
            result.push(chunk);
            chunk = [];
        }
    }
    if (chunk.length) {
        console.warn(`Array length (${array.length}) is not a multiple of stride "${stride}".`);
        result.push(chunk);
    }
    return result;
}
const meta = Symbol("geom-merge-meta");
function merge(geometries) {
    let mergedPositionCount = 0;
    let areAllCellsFlatArray = true;
    let areAllCellsTypedArray = true;
    // Set mergeable attributes from first geometry
    const initialAttributes = getGeometryAttributes(geometries[0]);
    let mergeableAttributes = [
        ...initialAttributes
    ];
    // Collect cells type, position count and filter mergeable attributes
    for(let i = 0; i < geometries.length; i++){
        const geometry = geometries[i];
        if (i > 0) {
            const attributes = getGeometryAttributes(geometry);
            // Check if geometry has all the first geometry attributes
            for(let j = 0; j < initialAttributes.length; j++){
                const initialAttribute = initialAttributes[j];
                if (!attributes.includes(initialAttribute)) {
                    console.warn(`geom-merge: geometry "${geometry.name || i}" is missing attribute ${initialAttribute}.`);
                    // Remove the attribute from the list of mergeable attributes
                    mergeableAttributes = mergeableAttributes.filter((attribute)=>attribute !== initialAttribute);
                }
            }
            // Check if geometry has all the previous geometry attributes
            const extraAttributes = attributes.filter((attribute)=>!mergeableAttributes.includes(attribute));
            if (extraAttributes.length) {
                console.warn(`geom-merge: geometry "${geometry.name || i}" has extra attributes: ${extraAttributes.join(", ")}.`);
            }
        }
        const positionCount = geometry.positions.length / (isAttributeFlat(geometry.positions) ? 3 : 1);
        const isCellsFlatArray = isAttributeFlat(geometry.cells);
        // Store attribute properties reused in the next loop
        geometry[meta] = {
            positionCount,
            isCellsFlatArray
        };
        // Increment/update properties used to determine cells type
        mergedPositionCount += positionCount;
        areAllCellsFlatArray &&= isCellsFlatArray;
        areAllCellsTypedArray &&= isAttributeTypedArray(geometry.cells);
    }
    // Check if first geometry has extra attributes
    const extraAttributes = initialAttributes.filter((initialAttribute)=>!mergeableAttributes.includes(initialAttribute));
    if (extraAttributes.length) {
        console.warn(`geom-merge: geometry "${geometries[0].name || "0"}" has extra attributes: ${extraAttributes.join(", ")}.`);
    }
    const CellsConstructor = areAllCellsTypedArray ? typedArrayConstructor(mergedPositionCount) : Array;
    const mergedGeometry = {
        cells: new CellsConstructor()
    };
    let vertexOffset = 0;
    for(let i = 0; i < geometries.length; i++){
        const geometry = geometries[i];
        const { positionCount , isCellsFlatArray  } = geometry[meta];
        for(let j = 0; j < mergeableAttributes.length; j++){
            const attribute = mergeableAttributes[j];
            if (attribute === "cells") {
                if (areAllCellsFlatArray) {
                    if (areAllCellsTypedArray) {
                        mergedGeometry.cells = typedArrayConcat(CellsConstructor, mergedGeometry.cells, // Add previous geometry vertex offset mapped via a new typed array
                        // because new value could be larger than what current type supports
                        new CellsConstructor(geometry.cells).map((n)=>vertexOffset + n));
                    } else {
                        mergedGeometry.cells = mergedGeometry.cells.concat(geometry.cells.map((n)=>vertexOffset + n));
                    }
                } else {
                    mergedGeometry.cells = mergedGeometry.cells.concat(// Chunk flat cells if needed
                    isCellsFlatArray ? chunkAndOffset(geometry.cells, 3, vertexOffset) : geometry.cells.map((cell)=>cell.map((n)=>vertexOffset + n)));
                }
            } else {
                // Create the merged attribute from first geometry type
                mergedGeometry[attribute] ||= new geometry[attribute].constructor();
                // Enforce returning flat arrays
                const values = isAttributeFlat(geometry[attribute]) ? geometry[attribute] : geometry[attribute].flat();
                if (isAttributeTypedArray(mergedGeometry[attribute])) {
                    mergedGeometry[attribute] = typedArrayConcat(mergedGeometry[attribute].constructor, mergedGeometry[attribute], values);
                } else {
                    mergedGeometry[attribute] = mergedGeometry[attribute].concat(values);
                }
            }
        }
        vertexOffset += positionCount;
        delete geometry[meta];
    }
    return mergedGeometry;
}

export { merge as default };
