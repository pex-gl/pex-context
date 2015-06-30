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

        this.baseGeometry = g;
        this.positions = clone(g.positions);
        var positionArray   = this.positionArray  = new Float32Array(R.flatten(g.positions));
        var positionBuffer  = this.positionBuffer = ctx.createBuffer(ctx.ARRAY_BUFFER, positionArray, ctx.DYNAMIC_DRAW);
        var normalArray     = this.normalArray    = new Float32Array(R.flatten(g.normals));
        var normalBuffer    = this.normalBuffer   = ctx.createBuffer(ctx.ARRAY_BUFFER, normalArray, ctx.DYNAMIC_DRAW);
        var indexBuffer     = this.indexBuffer    = ctx.createBuffer(ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(R.flatten(g.cells)), ctx.STATIC_DRAW);
        var attributes = [
            { buffer: positionBuffer, location: ctx.ATTRIB_POSITION, size: 3 },
            { buffer: normalBuffer, location: ctx.ATTRIB_NORMAL, size: 3 }
        ];
        this.vao = ctx.createVertexArray(attributes, indexBuffer);
    },
    time: 0,
    prevTime: Date.now(),
    update: function() {
        var gl = this.getContext().getGL();
        gl.finish();

        console.log('--');
        console.time('update');
        var now = Date.now();
        this.time += (now - this.prevTime)/1000;
        this.prevTime = now;

        var time = this.time;
        var basePositions = this.baseGeometry.positions;
        var baseNormals = this.baseGeometry.normals;
        var positions = this.positions;
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
        var normals = computeNormals({ cells: this.baseGeometry.cells, positions: this.positions });
        console.timeEnd('normals');

        console.time('flatten');
        //R.flatten = 20ms
        //this.positionArray.set(R.flatten(positions));
        //this.normalArray.set(R.flatten(normals));

        //for loop = 1-2ms
        for(var i=0, len=positions.length; i<len; i++) {
            this.positionArray[i*3  ] = positions[i][0];
            this.positionArray[i*3+1] = positions[i][1];
            this.positionArray[i*3+2] = positions[i][2];
        }
        for(var i=0, len=normals.length; i<len; i++) {
            this.normalArray[i*3  ] = normals[i][0];
            this.normalArray[i*3+1] = normals[i][1];
            this.normalArray[i*3+2] = normals[i][2];
        }
        console.timeEnd('flatten');

        gl.finish();
        console.time('buffer');
        this.positionBuffer.bufferData(this.positionArray);
        this.normalBuffer.bufferData(this.normalArray);
        gl.finish();
        console.timeEnd('buffer');
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
        ctx.bindVertexArray(this.vao);

        ctx.bindProgram(this.program);
        //would that be too much to do manually?
        this.program.setUniform('uProjectionMatrix', ctx.getProjectionMatrix());
        this.program.setUniform('uViewMatrix', ctx.getViewMatrix());
        this.program.setUniform('uModelMatrix', ctx.getModelMatrix());
        ctx.drawElements(ctx.TRIANGLES, this.vao.getIndexBuffer().getLength(), 0);
    }
})
