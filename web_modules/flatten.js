import './common/esnext.iterator.map-e6a047df.js';
import './common/esnext.iterator.reduce-3587a2b0.js';
import './common/iterate-3e898cf4.js';
import './common/iterators-80846cd5.js';

var flatten = function flatten(list, depth) {
  depth = typeof depth == 'number' ? depth : Infinity;

  if (!depth) {
    if (Array.isArray(list)) {
      return list.map(function (i) {
        return i;
      });
    }

    return list;
  }

  return _flatten(list, 1);

  function _flatten(list, d) {
    return list.reduce(function (acc, item) {
      if (Array.isArray(item) && d < depth) {
        return acc.concat(_flatten(item, d + 1));
      } else {
        return acc.concat(item);
      }
    }, []);
  }
};

export default flatten;
