```javascript
	Window.create({
		resources : {
			path : '../resources/'
			basicVertShader : {src : 'basicVertShader.glsl', type: ResourceType.TEXT},
			basicFragShader : {src : 'basicFragShader.glsl', type: ResourceType.TEXT},
			imgTexture0 :     {src : 'imgae0.png', type: ResourceType.IMAGE},
			imgTexture1 :     {src : 'image1.png', type: ResourceType.IMAGE}
		},
		settings : {
			width  : 800,
			height : 600
		},
		init : function(){
			var resources = this.getResources();
			var ctx = this.ctx;
			
			this._program  = ctx.createProgram(resources.basicVertShader, resources.basicFragShader);
			
			this._camera = new CameraPerp(45.0,this.getAspectRatio(),0.01,10.0);
			
			this._vertices = ctx.createVbo(ctx.ARRAY_BUFFER, new Float32Array([
				0,0,0,
				1,0,0,
				1,1,0,
				0,1,0
			],ctx.STATIC_DRAW);
			
			this._colors = ctx.createVbo(ctx.ARRAY_BUFFER, new Float32Array([
				1,1,1,1,
				1,1,1,1,
				1,1,1,1,
				1,1,1,1
			],ctx.STATIC_DRAW);
			
			this._ibo = ctx.createVbo(ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array([
				0,1,2, 2,1,3
			],ctx.STATIC_DRAW);
			
			this._vao = new Vao();
			this._vao.bind(this._vertices);
			this._vao.enableVertexAttribArray(0);
			this._vao.setVertexAttribPointer(0,3,this._vertices.getDataType(), false, 0, 0);
			this._vao.enableVertexAttribArray(1);
			this._vao.setVertexAttribPointer(0,3,ctx.FLOAT,false,0,0);
			this._vao.setVertexAttribDivisor(0,3,
			
			this._vao.setVertexAttrib(
				this._vertices,
				this._program.getAttribLocation('aVertexPosition'),
				true, 3, this._vertices.getDataType(), false, 0, 0
			);
			
			this._vao.setVertexAttrib(
				this._vertices,
				this._program.getAttribLocation('aVertexColor'),
				true, 4, this._vertices.getDataType(), false, 0, 12 * this._vertice.getByteLength()
			);
			
			this._vao.setVertexAttribMap([{
					buffer : this._vertices, 
					enabled : true, 
					location : this._program.getAttribLocation('aVertexPosition'),
					normalized : false,
					stride : 0,
					offset : 0 
				}, {
					buffer : this._vertices,
					enabled : true,
					location : this._program.getAttribLocation('aVertexColor'),
					normalized : false,
					stride : 0,
					offset : 12 * this._vertices.getByteLength()		
				}]
			);
			
			this._vao.setVertexAttribMap([{
					buffer : this._vertices,
					location : this._program.getAttribLocation('aVertexPosition'),
					size : 3
				},{
					buffer : this._vertices,
					location : this._program.getAttribLocation('aVertexColor),
					size : 4,
					offset : 12 * this._vertices.getByteLength()
				}]
			);
			
			var attribVertexPosition = new VertexAttrib();
			attribVertexPosition.buffer   = this._vertices;
			attribVertexPosition.location = this._program.getAttribLocation('aVertexPosition');
			attribVertexPosition.size     = 3;
			
			var attribVertexColor = new VertexAttrib();
			attribVertexColor.buffer   = this._vertices;
			attribVertexColor.location = this._program.getAttribLocation('aVertexColor');
			attribVertexColor.size     = 4;
			
			this._vao.setVertexAttribMap([attribVertexPosition,attribVertexColor]);
				
			
			this._vao.bind(this._ibo);
			
			this._texture0 = ctx.createTexture(resources.imgTexture0);
		
		},
		draw : {
			var ctx = this.ctx;
			ctx.pushState();
				ctx.clearColor(0,0,1,1);
				ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
				ctx.enable(ctx.DEPTH_TEST);
				
				this._camera.lookAt([1,1,1],[0,0,0]);
				ctx.setProjectionMatrix(this._camera.getProjectionMatrix());
				ctx.setViewMatrix(this._camera.getViewMatrix());
				
				ctx.pushMatrix();
					ctx.translate3(-1,-1,0);
					ctx.scale3(2,2,1);
					ctx.bindVbo(this._vbo);
					
					ctx.drawVbo(ctx.TRIANGLES);
					
					ctx.bindVao(this._vao);
					ctx.drawVao(ctx.TRIANGLES);
					
					ctx.drawVao(this._vao,ctx.TRIANGLES);
					
					
					
					this._vao.bind();
					ctx.drawVao(ctx.TRIANGLES);
				
				ctx.popMatrix();
				
			ctx.popState();
			
			ctx.pushState();
				
			ctx.popState();
		}
	}



```
    ctx.push(ctx.MODELVIEW_MATRIX);
        trans.translate3(x,y,z);
            ctx.push(ctx.MODELVIEW_MATRIX);
    ctx.pop();
    
    trans.push();
```

```
	ctx.pushState();
		ctx.setProjectionMatrix(camera.getProjectionMatrix());
		ctx.setViewMatrix(camera.getViewMatrix());
		ctx.setMatrixMode(ctx.MODELVIEW_MATRIX);
		ctx.pushMatrix();
			ctx.setMatrix(newMatrix);
		ctx.popMatrix();
	ctx.popState();	
```	

```
	glTrans.pushMatrix = function(){
		ctx.push(ctx.getMatrixMode());
	}
	glTrans.translate(x,y,z){
		var matrix = ctx.getMatrix();
		
	}
```

```
	ctx.pushState();
		ctx.setProjectionMatrix(camera.getProjectionMatrix());
		ctx.setViewMatrix(camera.getViewMatrix());
		ctx.setMatrixMode(ctx.MODELVIEW_MATRIX);
		ctx.push(ctx.TEXTURE_BINDING);
		ctx.pop(ctx.TEXTURE_BINDING);
		
		ctx.pushMatrix();
			ctx.setMatrix(fdsfsdf);
		ctx.popMatrix();
	
	ctx.popState();	
```	

```
	ctx.push(ctx.COMPLETE);
		ctx.setMatrix(ctx.VIEW_MATRIX,camera.getViewMatrix());
		ctx.setMatrix(ctx.PROJECTION_MATRIX, camera.getProjectionMatrix();
		ctx.p
	ctx.pop();
```
```
var temp = new Array(3);
    for(var i = 0, l = this.getNumVertices(); i < l; ++i){
        this.getAttributeAtPosition(Attribute.VERTEX,i,temp);
        
        temp
        
        this.setAttributeAtPosition(Attribute.VERTEX,t,temp);
    }
```    

```
var vaoMesh = VaoMesh.fromGeometry(
    geometry,[new BufferGroup([
            new GeometryAttribute('vertices',3,gl.FLOAT,...),
            new GeometryAttribute('normals',3,gl.FLOAT,...),
        ], gl.DYNAMIC_DRAW),
            new BufferGroup([
            new GeometryAttribute('colors')
        ], gl.STATIC_DRAW)
)
```    