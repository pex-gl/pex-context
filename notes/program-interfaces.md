```
program.uniform('name',auto);

program.uniform{1234i,1234f...}('name',args);

program.uniforms({
	nameA : 0,
	nameB : 1,
	nameC : 2
});

program.uniforms1i(
	'nameA',0,
	'nameV',1,
	'nameC',2
);

program.getUniforms()[name](value);

program.bind();
program.unbind(); //reset to previous program



```