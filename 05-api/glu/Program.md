if (mv[0]  == other[0] &&
mv[1]  == other[1] &&
mv[2]  == other[2] &&
mv[3]  == other[3] &&
mv[4]  == other[4] &&
mv[5]  == other[5] &&
mv[6]  == other[6] &&
mv[7]  == other[7] &&
mv[8]  == other[8] &&
mv[9]  == other[9] &&
mv[10] == other[10] &&
mv[11] == other[11] &&
mv[12] == other[12] &&
mv[13] == other[13] &&
mv[14] == other[14] &&
mv[15] == other[15])



program.setUniform('tex', 0)
program.setUniform('tex', 1)

ctx.bindTexture(tex, 0);
ctx.bindTexture(tex, 1);

ctx.setCameraMatrices(camera.getProject(), camera.getView());
vs
ctx.setViewMatrix(camera.getView())
ctx.setProjectionMatrix(camera.getProjection())

ctx.bindProgram(program);
program.setUniform('projectionMatrix', projectionMatrix)


//ok
program.setUniform('color', value);
camera.setPosition(pos) {
  this.pos = pos;
  vs
  copy3(this.pos, pos);
}
camera.getPosition(out)

//confusion with props
program.uniform('color', value)
camera.position(pos)

//slow
program.uniforms.color = value;
camera.position = pos;

//hacky
program.uniforms['color'](value)
