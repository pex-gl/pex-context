define (require) ->
  plants=
    Fruit: require('flora/plants/Fruit')
    Cactus: require('flora/plants/Cactus')
    Herb: require('flora/plants/Herb')
    Algae: require('flora/plants/Algae')
    Grass: require('flora/plants/GrassInstanced')
    Flower: require('flora/plants/Flower')