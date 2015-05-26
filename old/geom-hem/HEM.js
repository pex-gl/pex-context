//Module wrapper for half-edge mesh related classes.
define([
  "hem/HEMesh",
  "hem/HEVertex",
  "hem/HEEdge",
  "hem/HEFace",
  "hem/CatmullClark",
  "hem/HEExtrude",
  "hem/HEGeometryConverter",
  "hem/HEDooSabin",
  "hem/HESelection",
  "hem/HEPull",
  "hem/HESmooth",
  "hem/HEParametrize",
  "hem/HESubdivideTriangles",
  "hem/HESpherize",
  "hem/HETriangulate",
  "hem/HESubdivideFaceCenter",
  ],
  function(HEMesh, HEVertex, HEEdge, HEFace, CatmullClark, HEExtrude, HEGeometryConverter, HEDooSabin, HESelection, HEPull, HESmooth, HEParametrize, HESubdivideTriangles, HESpherize, HETriangulate, HESubdivideFaceCenter) {
    return function() {
      return new HEMesh();
    }
    // return {
    //   HEMesh : HEMesh,
    //   HEVertex : HEVertex,
    //   HEEdge : HEEdge,
    //   HEFace : HEFace,
    //   CatmullClark : CatmullClark,
    //   Extrude : Extrude,
    //   HEGeometryConverter : HEGeometryConverter,
    //   DooSabin : DooSabin
    // };
});