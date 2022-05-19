import { l as global_1 } from './iterators-core-5c29a195.js';
import { j as classof } from './esnext.iterator.map-88bfc258.js';

var String = global_1.String;

var toString_1 = function (argument) {
  if (classof(argument) === 'Symbol') throw TypeError('Cannot convert a Symbol value to a string');
  return String(argument);
};

export { toString_1 as t };
