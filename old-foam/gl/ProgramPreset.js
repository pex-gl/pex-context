var ProgramPreset = {};

ProgramPreset.Basic2d = 
"#ifdef VERTEX_SHADER\n" + 
"precision highp float;\n" + 
"\n" + 
"attribute vec3 aVertexPosition;\n" + 
"attribute vec4 aVertexColor;\n" + 
"attribute vec2 aTexcoord;\n" + 
"\n" + 
"varying   vec4 vVertexColor;\n" + 
"varying   vec2 vTexcoord;\n" + 
"\n" + 
"uniform mat4 uProjectionMatrix;\n" + 
"uniform mat4 uModelViewMatrix;\n" + 
"\n" + 
"uniform float uPointSize;\n" + 
"\n" + 
"void main(){\n" + 
"    vVertexColor = aVertexColor;\n" + 
"    vTexcoord    = aTexcoord;\n" + 
"\n" + 
"    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition,1.0);\n" + 
"    gl_PointSize = uPointSize;\n" + 
"}\n" + 
"#endif\n" + 
"\n" + 
"\n" + 
"#ifdef FRAGMENT_SHADER\n" + 
"precision highp float;\n" + 
"\n" + 
"uniform sampler2D uTexture;\n" + 
"\n" + 
"varying vec4  vVertexColor;\n" + 
"varying vec2  vTexcoord;\n" + 
"\n" + 
"uniform float uUseTexture;\n" + 
"\n" + 
"uniform vec4  uColor;\n" + 
"uniform float uUseUniformColor;\n" + 
"\n" + 
"void main(){\n" + 
"    gl_FragColor = (vVertexColor * (1.0 - uUseUniformColor) + uColor * uUseUniformColor) * (1.0 - uUseTexture) + texture2D(uTexture,vTexcoord) * uUseTexture;\n" + 
"}\n" + 
"#endif";

ProgramPreset.Basic3d = 
"#ifdef VERTEX_SHADER\n" + 
"precision highp float;\n" + 
"\n" + 
"attribute vec3 aVertexPosition;\n" + 
"attribute vec4 aVertexColor;\n" + 
"varying   vec4 vVertexColor;\n" + 
"\n" + 
"uniform mat4 uModelViewMatrix;\n" + 
"uniform mat4 uProjectionMatrix;\n" + 
"\n" + 
"uniform float uPointSize;\n" + 
"\n" + 
"void main(){\n" + 
"	vVertexColor = aVertexColor;\n" + 
"	gl_Position  = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);\n" + 
"	gl_PointSize = uPointSize;\n" + 
"}\n" + 
"#endif\n" + 
"\n" + 
"#ifdef FRAGMENT_SHADER\n" + 
"precision highp float;\n" + 
"varying vec4 vVertexColor;\n" + 
"\n" + 
"void main(){\n" + 
"	gl_FragColor = vVertexColor;\n" + 
"}\n" + 
"#endif";

module.exports = ProgramPreset;