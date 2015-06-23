## Building

cd 06-pex-ctx-00
npm install
cd p3d/test
../../node_modules/.bin/browserify -i plask VertexArray.js -o VertexArray.web.js
../../node_modules/.bin/browserify -i plask GLTF.js -o GLTF.web.js
