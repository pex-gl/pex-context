var Platform = require('../../sys/Platform');
var Window = require('../../sys/Window');
var Program = require('../../p3d/Program');
var Mat4 = require('../../math/Mat4');
var Vec3 = require('../../math/Vec3');
var material = require('./BasicMateria.js');
var torus = require('torus-mesh')({ majorRadius: 1, minorRadius: 0.5 });
var R = require('ramda');

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

        this.program = ctx.createProgram(material.vert, material.frag);
        ctx.bindProgram(this.program);
        this.program.setUniform('repeat', [ 8, 8 ]);
        this.program.setUniform('iChannel0', 0);
        this.program.setUniform('model', this.model);
        this.program.setUniform('projection', this.projection);
        this.program.setUniform('view', this.view);

        var positionBuffer  = ctx.createBuffer(ctx.ARRAY_BUFFER, new Float32Array(R.flatten(torus.positions)));
        var texCoord0Buffer = ctx.createBuffer(ctx.ARRAY_BUFFER, new Float32Array(R.flatten(torus.uvs)));
        var normalBuffer    = ctx.createBuffer(ctx.ARRAY_BUFFER, new Float32Array(R.flatten(torus.normals)));
        var indexBuffer     = ctx.createBuffer(ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(R.flatten(torus.cells)));
        var attributes = [
            { buffer: positionBuffer, location: ctx.ATTRIB_POSITION, size: 3 },
            { buffer: texCoord0Buffer, location: ctx.ATTRIB_TEX_COORD_0, size: 2 },
            { buffer: normalBuffer, location: ctx.ATTRIB_NORMAL, size: 3 }
        ];
        this.mesh = ctx.createVertexArray(attributes, indexBuffer);

        var img = new Uint8Array(R.flatten([
            [0xff, 0xff, 0xff, 0xff], [0xcc, 0xcc, 0xcc, 0xff],
            [0xcc, 0xcc, 0xcc, 0xff], [0xff, 0xff, 0xff, 0xff]
        ]));

        this.tex = ctx.createTexture2D(img, 2, 2, {
          repeat: true,
          minFilter: ctx.NEAREST,
          magFilter: ctx.NEAREST
        })
    },
    seconds: 0,
    prevTime: Date.now(),
    draw: function() {
        var now = Date.now();
        this.seconds += (now - this.prevTime)/1000;
        this.prevTime = now;

        var ctx = this.getContext();
        ctx.setClearColor(0.2, 0.2, 0.2, 1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
        ctx.setDepthTest(true);

        var time = Date.now()/1000;

        ctx.setViewMatrix(Mat4.lookAt9(this.view,
                Math.cos(time * Math.PI) * 5,
                Math.sin(time * 0.5) * 0,
                Math.sin(time * Math.PI) * 5,
                0,0,0,0,1,0
            )
        );

        ctx.bindTexture(this.tex, 0);
        ctx.bindProgram(this.program);
        this.program.setUniform('view', this.view);
        this.program.setUniform('uvOffset', [ 0, this.seconds*2 ]);
        ctx.bindVertexArray(this.mesh);
        ctx.draw(ctx.TRIANGLES, 0, this.mesh.getIndexBuffer().getLength())
    }
})
