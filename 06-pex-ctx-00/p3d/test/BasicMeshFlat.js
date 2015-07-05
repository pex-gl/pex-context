var Platform    = require('../../sys/Platform');
var Window      = require('../../sys/Window');
var Program     = require('../../p3d/Program');
var Mesh        = require('../../p3d/Mesh');
var Mat4        = require('../../math/Mat4');
var Vec3        = require('../../math/Vec3');
var torus       = require('torus-mesh')({ majorRadius: 1, minorRadius: 0.5 });
var R           = require('ramda');

var VERT = ' \
attribute vec2 aTexCoord0; \
attribute vec3 aNormal; \
attribute vec4 aPosition; \
uniform mat4 projection; \
uniform mat4 view; \
uniform mat4 model; \
varying vec3 vNormal; \
varying vec2 vUv; \
void main() { \
  vUv = aTexCoord0; \
  vNormal = aNormal; \
  gl_Position = projection * view * model * aPosition; \
  gl_PointSize = 1.0; \
}';

//precision highp float; \
var FRAG = ' \
varying vec2 vUv; \
varying vec3 vNormal; \
uniform sampler2D iChannel0; \
uniform vec2 repeat; \
uniform vec2 uvOffset; \
void main() { \
  gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0); \
  gl_FragColor = vec4(vUv, 0.0, 1.0); \
  gl_FragColor = texture2D(iChannel0, vUv * repeat + uvOffset); \
}';

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

        this.program = ctx.createProgram(VERT, FRAG);
        ctx.bindProgram(this.program);
        this.program.setUniform('repeat', [ 8, 8 ]);
        this.program.setUniform('iChannel0', 0);
        this.program.setUniform('model', this.model);
        this.program.setUniform('projection', this.projection);
        this.program.setUniform('view', this.view);

        var attributes = [
            { data: R.flatten(torus.positions), location: ctx.ATTRIB_POSITION, size: 3 },
            { data: R.flatten(torus.uvs), location: ctx.ATTRIB_TEX_COORD_0, size: 2 },
            { data: R.flatten(torus.normals), location: ctx.ATTRIB_NORMAL, size: 3 }
        ];
        var indices = { data: torus.cells, usage: ctx.STATIC_DRAW };
        this.mesh = ctx.createMesh(attributes, indices);

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
        if (!this.mesh) return;
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

        ctx.bindMesh(this.mesh);
        ctx.drawMesh();
    }
})
