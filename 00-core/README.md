Trying out a new minimal pex core implementation.

## Pex v3 style init

```javascript
var Window = require('pex-sys').Window;

Window.create({
  settings: {
    type: '3d',
    width: 1280,
    height: 720
  },
  init: function() {

  },
  draw: function() {
    var gl = this.gl;
  }
})
```

## FOAM style init

```javascript
var Foam = require('foam-gl');

function setup(){
    this.setWindowSize(800,600);
}

function draw(){
    var gl = this._gl;
}

Foam.App.newOnLoad(setup,draw);
```

## Glo style init

```javascript
const gl = require('webgl-context')()
const canvas = gl.canvas

const app = require('canvas-loop')(canvas, {
  scale: window.devicePixelRatio
})

app.on('tick', render).start()

function render(dt) {

}
```

## Three.js style init

```javascript
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var render = function () {
	requestAnimationFrame( render );

	renderer.render(/*scene, camera*/);
};

render();
```
