

#General

###Private/Public/Explicitness

- private vs public members vs user trust vs clarity

###Documentation

- proper documentation for every single core module, should develop into habit, i like jsdoc ;), can do:
    
    ```
    @private, @protected, 
    
    /**
     * Draw a pivot.
     * @param {Number} [axisLength=1.0] - The length of the xyz-axes
     * @param {Number} [headLength=0.125] - The length of the xyz-axes head
     * @param {Number} [headRadius=0.075] - The radius of the xyz-axes head
     */
    ```
    integrates well with ides, easy to parse
- write documentation while integrating new features, make it part of the workflow!


###Resource Handling

- Asynchronous loading :(, having to wait to for loading resources and then updating states to indicate that we are able to draw now is and will always be messy espeacilly when requesting from within multiple classes, no callback hell
- Foam has 'bundled' resource loading (also not best option, but escapes async
hell): https://github.com/automat/foam-gl/blob/master/lib/system/Resource.js

    ```
    var resources = {
		shader : {path: pathToShader},
		image  : {path: pathToImage, type : 'image'},
		buffer : {path: pathToData, type : 'arraybuffer'}
	}

	Foam.App.newWithResources(
		resources,
		function(resources){
			//init called when all resources loaded
			this.texture = new Texture(resources.image)
			//can still do async
			resources.dispose();
		},
		function(){
			//draw
		}
	);

	//withing other module
	var Resources = Foam.Resources;

	function Class(){
		//hopefully initialised before resources.dispose() is called somewhere, otherwise null
		this.program = new Program(Resources.shader);
	}
	```


###Breaking the scene graph ⚡

- Material / Program - Camera - Mesh - Relationship

    ```
    //init
    var material = new Program(v,f); //material as raw program
    //or specialised program subclass
    var otherMaterial = new MaterialPBR();
    
    //draw
    glu.setCameraMatrices(this.camera);
    material.use();
    meshA.draw();
    meshB.draw();
    meshC.draw();
    otherMaterial.use();
    meshD.draw();
    meshC.draw();
    ```

- Mesh holds no ref to camera matrices, only modelmatrix if actively set, one projection & modelview matrix for everything

###OpenGL matrices stack model ⚡

    ````
    glu.setCameraMatrices(camera); //set current projection matrix 
    mesh.draw();
    //either
    glu.setMatrixMode(glu.PROJECTION_MATRIX);
    glu.pushMatrix();
    //or
    glu.pushMatrices(); //convinience
    glu.setWindowMatrices(windowWidth,windowHeight); //set screen projection 2d
    //draw something 2d – no need for orthocam or screen image
    //either
    glu.popMatrix();
    glu.setMatrixMode(glu.PROJECTION_MATRIX);
    //or based on the above
    glu.popMatrix();
    //continue using camera
    


---

##pex-sys


###Window
- optional fixed update?
- cancel & resume update tick via requestanimationframeid, good for pausing or restarting without timer mess, see: https://github.com/automat/foam-gl/blob/master/lib/app/App.js#L384, https://github.com/automat/foam-gl/blob/master/lib/app/App.js#L434

###Time
- not sure about: https://github.com/vorg/pex-sys/blob/master/lib/Time.js#L30

###IO.js
- would be cool to have browser version: https://github.com/vorg/pex-sys/blob/master/lib/IO.js#L50, have https://github.com/automat/foam-gl/blob/master/lib/system/FileWatcher.js, works very good

---

##pex-glu


###Context
- i can just do Context.currentContext = whatever, Peng!, currentContext as explicit getter
- context === gl

###RenderTarget
- Why not call it Fbo? I didnt kwow what it was when looking at the class.

###ScreenImage
- This is something that could be expressed with:

    ```
	glu.setWindowMatrics(windowWidth,windowHeight);
	glu.translate(screenImageOffsetX,screenImageOffsetY);
	texture.bind();
	glu.drawRect(screenImageWidth,screenImageHeight);
	texture.unbind();
	```

- I was wondering why this functionality is wrapped in a class, because if you have a projection and transformation matrix stack this is an obvious thing to do. 

###Program
- clear reload(vertSrc,fragSrc) missing
- state management unbind(), reanabling previous program
- no vertexAttribArray enable/disable, vertexAttribPointer with owned attributes
- uniform2fv, uniform3fv, uniform4fv, mat33?
- should be general representaion of program not only for pex context, make it still usefull when using pex.glu.Program with raw gl
- not sure about setters

###Util ⚡
- gl in general: How much convinience?
- Are glu injected methods really worth?
- Most of the wrapped functionality is just a few lines, why wrap? 
- Get it that you want to use your types but, but its just some chars more to type. 
- Is it worth to import glu for those cases?
- Using unwraped makes at least clear what you do, eg. glu.clearColor vs gl.clearColor
  Also altering other gl states in those is error prone. glu.clearColor setting depthMask
- glu.scissor vs gl.scissor & constantly enabling/disabling state
- glu.cullface && gl.linewidth, why? espeacilly last, shouldnt be accesing the gl context
  itself be prefered for those simple setters?
  
###Arcball
- lerp,lerp,lerp rotation targets, just feels so much better
- you assume that everybody has inverted scrolling, somewhat against default behaviour on other systems

###Immediate draw mode ⚡

- WANT THAT.

###Matrices stack ⚡

###Centralised draw state management

- from instance update of matrices, buffer binding... --> drawManagerOrWhatever(mesh) (only one knowing how to draw things, switching buffers and programs, disabling and enabling program properties in one single place

---

###pex-helpers

- would be cool to move those to either (A) immediate or (B) class related
    
    ```
    // AxisHelper - from Mesh to
    glu.drawAxis(size);
    // PerspectiveCameraHelper - from Mesh to
    camera.debugDrawFrustum();
    //OctreeHelper - from Mesh to
    octree.debugDrawCells()
    
    ```
    
    EdgeHelper / FaceHelper ... different thing
    

---
  
##pex-geom

###Vec2 & Vec3

- create()?, guess thats there so things don't break
- not clear what the convention is here: set(x,y), setVec{2,3}, add(v), shouldn't it be assumed that the arg is the type if not explicity obvious in method name?
- dup() vs copy() vs clone vs set() - I expected:

    ```
    var a = new Vec3();
    var b = a.set(b); //copy by setting
    var c = a.copy(); //get new copy
    ```

- asSub vs addScaled, as{...} - whats the convention here? asAdded?
- asSub, asAdd - order of operation meaningful ?

    ```
    var a = new Vec3();
    var b = new Vec3();
    var c = new Vec3();
    
    c.asSub(a,b);
    
    var a = new Vec3();
    var b = new Vec3();
    var c = new Vec3();
    
    a.subbed(d,c); //optional out
    ```
  
- Constants, Zero, One - what prevents me from accidentally altering those somewhere e.g. when i forget to copy it into another vector and breaking everything also referring to it, explicit creation Vec3.Zero() ?

###Mat4

- wheres your brother Mat3?
- why not flat? easier to copy, also to float32array
- frustum,perspective,ortho, do they really belong here, maybe im just used to do something like gluFrustum(containerIn,a,b,c,d);

---

###pex-color

- constuctor, need that:

    ```
    var a = new Color(1,1,1,1); //rgba
    var b = new Color(1);       //rgb
    var c = new Color(1,0.5);   //ka