#pex-geom-primitives

Helper functions for creating basic geometry. Result type is:

```javascript
{
    positions : [[ x0,  y0,  z0], [ x1,  y1,  z1], ..],
    normals   : [[nx0, ny0, nz0], [nx1, ny1, nz1], ..],
    faces     : [[i00, i01, i02], [i10, i11, i12], ..]
}
```

## Todo

What about

- [ ] optional normals (or just ask to use pex-geom-ops/computeNormals)
- [ ] optional edges (or just ask to use pex-geom-ops/computEdges)
- [ ] optional texCoords (when it makes sense e.g. cube, sphere)

Question

- [ ] so that's the thing with npm this things are alredy there (with cells instead of faces) e.g. [primitive-sphere](https://github.com/glo-js/primitive-sphere)
- [ ] another e.g. [icosphere](https://github.com/hughsk/icosphere/blob/master/index.js) is a [better implementation](http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html) than mine, we could also just wrap it inside pex namespace so we have e.g. faces instead of cells like [primitive-icosphere](https://www.npmjs.com/package/primitive-icosphere)

Implement

- [ ] plane
- [ ] sphere
- [ ] box (cube without separated faces)
- [ ] cylinder
- [ ] dodecahedron
- [ ] octahedron
- [ ] tetrahedron
- [ ] hex sphere

Where to put these things? Candidates: pex-gen (like before), pex-ops (with everything else),pex-geom-algname (e.g. peg-geom-iso-surface, as they are very project specific)

- [ ] loft
- [ ] iso surface (marching cubes)
- [ ] marching squares
