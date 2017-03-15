# pex-context

Thin WebGL state stack and resource management wrapper for the pex library

# API

```javascript
var createContext = require('pex-context')

// full window canvas
var ctx = createContext() 

// creates gl context from existing canvas and keeps it's size
var ctx = createContext({ gl: gl })

// creates gl context from existing canvas and keeps it's size
var ctx = createContext({ canvas: canvas })

// creates new canvas with given width and height
var ctx = createContext({ width: Number, height: Number })
```

# Examples

To run e.g. shadow mapping example

```
cd examples
budo shadows.js --open --live -- -t glslify
```
