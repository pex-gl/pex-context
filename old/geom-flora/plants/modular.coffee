define (require) ->
  exports=
    Modulae: require 'flora/plants/modular/Modulae'
    SingleFaceSelector: require 'flora/plants/modular/SingleFaceSelector'
    ExtrudeSegment: require 'flora/plants/modular/ExtrudeSegment'
    Split2: require 'flora/plants/modular/Split2'
    FaceSelector: require 'flora/plants/modular/FaceSelector'
    AllFacesSelector: require 'flora/plants/modular/AllFacesSelector'
    RandomFaceSelector: require 'flora/plants/modular/RandomFaceSelector'
    NeighbourFaces: require 'flora/plants/modular/NeighbourFaces'