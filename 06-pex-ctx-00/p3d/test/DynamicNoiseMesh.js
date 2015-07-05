var Platform = require('../../sys/Platform');
var Window = require('../../sys/Window');
var Program = require('../../p3d/Program');
var Mat4 = require('../../math/Mat4');
var Vec3 = require('../../math/Vec3');
var material = require('./BasicMateria.js');
var createIcosahedron = require('../../utils/primitive-icosahedron');
var toFlatGeometry = require('../../utils/geom-to-flat-geometry');
var computeNormals = require('../../utils/geom-compute-normals');
var subdivide = require('../../utils/geom-subdivide-camtull-clark');
var triangulate = require('../../utils/geom-triangulate');
var SimplexNoise = require('simplex-noise');
var simplex = new SimplexNoise(Math.random);
var R = require('ramda');
var clone = require('clone');
var Mesh = require('../Mesh');

var VERT_SRC = '\
attribute vec4 aPosition; \
attribute vec3 aNormal; \
varying vec4 vColor; \
uniform mat4 uProjectionMatrix;\
uniform mat4 uViewMatrix;\
uniform mat4 uModelMatrix;\
void main() { \
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aPosition; \
    vColor = vec4(aNormal * 0.5 + 0.5, 1.0); \
} \
';

var FRAG_SRC = '\
varying vec4 vColor; \
void main() { \
    gl_FragColor = vColor; \
} \
';

if (Platform.isBrowser) {
    FRAG_SRC = 'precision highp float; \n' + FRAG_SRC;
}

Window.create({
    settings: {
        type: '3d',
        width: 800,
        height: 600
    },
    init: function() {
        var ctx = this.getContext();

        this.model = Mat4.create();
        this.projection = Mat4.perspective(Mat4.create(), 45, this.getAspectRatio(), 0.001, 10.0);
        this.view = Mat4.lookAt([], [3, 2, 2], [0, 0, 0], [0, 1, 0]);

        this.program = ctx.createProgram(VERT_SRC, FRAG_SRC);
        ctx.bindProgram(this.program);
        var g = createIcosahedron(2);
        g = subdivide(g);
        g = subdivide(g);
        g = subdivide(g);
        g = subdivide(g);
        g = triangulate(g);
        g = toFlatGeometry(g);
        g.normals = computeNormals(g);

        this.basePositions = clone(g.positions);
        this.mesh = ctx.createMesh([
            { data: g.positions, location: ctx.ATTRIB_POSITION, usage: ctx.DYNAMIC_DRAW },
            { data: g.normals, location: ctx.ATTRIB_NORMAL, usage: ctx.DYNAMIC_DRAW }
        ], { data: g.cells, usage: ctx.STATIC_DRAW });
    },
    time: 0,
    prevTime: Date.now(),
    update: function() {
        var ctx = this.getContext();
        var gl = ctx.getGL();
        gl.finish();

        console.log('--');
        console.time('update');
        var now = Date.now();
        this.time += (now - this.prevTime)/1000;
        this.prevTime = now;

        var time = this.time;
        var basePositions = this.basePositions;
        var positions = this.mesh.getAttribute(ctx.ATTRIB_POSITION).data;
        var noiseFrequency = 2;
        var noiseScale = 0.75;
        console.time('noise');
        for(var i = 0, len = basePositions.length; i<len; i++) {
            var p = basePositions[i];
            var f = simplex.noise3D(p[0] * noiseFrequency + time, p[1] * noiseFrequency, p[2] * noiseFrequency)
            Vec3.set(positions[i], p);
            Vec3.scale(positions[i], 1 + noiseScale * f);
        }
        console.timeEnd('noise');

        console.time('normals');
        var faces = this.mesh.getIndices().data;
        var normals = this.mesh.getAttribute(ctx.ATTRIB_NORMAL).data;
        computeNormals({ cells: faces, positions: positions }, normals);
        console.timeEnd('normals');

        console.time('flatten + buffer');
        gl.finish();
        this.mesh.updateAttribute(ctx.ATTRIB_POSITION, positions);
        this.mesh.updateAttribute(ctx.ATTRIB_NORMAL, normals);
        gl.finish();
        console.timeEnd('flatten + buffer');

        console.timeEnd('update');
    },
    draw: function() {
        this.update();

        var ctx = this.getContext();
        ctx.setClearColor(0.2, 0.2, 0.2, 1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
        ctx.setDepthTest(true);

        var speed = 0.2;

        ctx.setViewMatrix(Mat4.lookAt9(this.view,
                Math.cos(speed * this.time * Math.PI) * 5,
                Math.sin(speed * this.time * 0.5) * 0,
                Math.sin(speed * this.time * Math.PI) * 5,
                0,0,0,0,1,0
            )
        );

        ctx.bindTexture(this.tex, 0);

        ctx.setProjectionMatrix(this.projection);
        ctx.setViewMatrix(this.view);
        ctx.setModelMatrix(this.model);

        ctx.bindProgram(this.program);

        this.program.setUniform('uProjectionMatrix', ctx.getProjectionMatrix());
        this.program.setUniform('uViewMatrix', ctx.getViewMatrix());
        this.program.setUniform('uModelMatrix', ctx.getModelMatrix());

        ctx.bindMesh(this.mesh);
        ctx.drawMesh();
    }
})
