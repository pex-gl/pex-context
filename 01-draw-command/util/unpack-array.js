function unpackarray(typedArray, nestedArray) {
  var len = nestedArray.length;
  var dim = nestedArray[0].length;
  var i =0;
  for(var j=0; j<len; j++) {
    for(var k=0; k<dim; k++) {
      typedArray[i++] = nestedArray[j][k];
    }
  }
}

module.exports = unpackarray;
