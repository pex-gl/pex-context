import { c as global_1 } from './iterators-80846cd5.js';
import { e as classof } from './esnext.iterator.map-e6a047df.js';

var String = global_1.String;

var toString_1 = function (argument) {
  if (classof(argument) === 'Symbol') throw TypeError('Cannot convert a Symbol value to a string');
  return String(argument);
};

export { toString_1 as t };
