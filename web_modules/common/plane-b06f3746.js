import './web.dom-collections.iterator-0e2ab85b.js';
import { j as create, h as set, k as dot, s as sub, f as add, e as scale } from './vec3-68b228db.js';

/**
 * @typedef {number[][]} ray A ray defined by a starting 3D point origin and a 3D direction vector.
 */

/**
 * Enum for different intersections values
 * @readonly
 * @enum {number}
 */

const INTERSECTIONS = Object.freeze({
  INTERSECT: 1,
  NO_INTERSECT: 0,
  SAME_PLANE: -1,
  PARALLEL: -2,
  TRIANGLE_DEGENERATE: -2
});
const TEMP_0 = create();
const TEMP_1 = create();
const TEMP_2 = create();
/**
 * Determines if a ray intersect a plane
 * https://www.cs.princeton.edu/courses/archive/fall00/cs426/lectures/raycast/sld017.htm
 * @param {ray} ray
 * @param {import("pex-math").vec3} point
 * @param {import("pex-math").vec3} normal
 * @param {import("pex-math").vec3} out
 * @returns {number}
 */

function hitTestPlane(ray, point, normal, out = create()) {
  const origin = set(TEMP_0, ray[0]);
  const direction = set(TEMP_1, ray[1]);
  const dotDirectionNormal = dot(direction, normal);
  if (dotDirectionNormal === 0) return INTERSECTIONS.SAME_PLANE;
  point = set(TEMP_2, point);
  const t = dot(sub(point, origin), normal) / dotDirectionNormal;
  if (t < 0) return INTERSECTIONS.PARALLEL;
  set(out, add(origin, scale(direction, t)));
  return INTERSECTIONS.INTERSECT;
}

/**
 * @typedef {number[][]} plane A plane defined by a 3D point and a normal vector perpendicular to the plane’s surface.
 */

/**
 * Enum for different side values
 * @readonly
 * @enum {number}
 */

const SIDE = Object.freeze({
  ON_PLANE: 0,
  SAME: -1,
  OPPOSITE: 1
});

export { hitTestPlane as h };
