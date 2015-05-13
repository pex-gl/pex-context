
###pex-gl

- all gl related obj wrappers
- class namespace vs method namepspace    

    ```
    var gl = require('pex-gl');
    
    var Mesh = gl.Mesh;
    var Program = gl.Program;
    var Texture = gl.Texture;
    ```

    BUT what about this then:
    
    ```
    var gl = require('pex-gl');
    var Mesh = gl.Mesh;
    var Program = gl.Program;
    var Texture = gl.Texture;
    
    //class context
    function draw(){
        var gl = this.gl; //context alias vs module
    }
    ```
    
- Material as direct Program subclass

    ```
    function Material(){
        Program.call(this);
        //uniforms object inherited from program, 
        //or am i missing something: 
        //https://github.com/vorg/pex-glu/blob/master/lib/Material.js#L6
    }
    //Material special setters
    Material.prototype.setterMethods ....
    
    Material.prototype.use = Program.prototype.use
    ```
    No difference between empty Material & Program, same usage, could inherit active state 
    check from program, something like:
    
    ```
    var materialA = new MaterialSolid();
    var materialB = new MaterialNormals();
    
    materialA.bind(); //enable
    meshA.draw();
    meshB.draw();
    materialB.bind(); //enable other
    meshC.draw();
    materialB.unbind(); //back to materialA
    meshD.draw();
    materialA.unbind();
    ```

- Material as specialised programs with explict setters?

    ```
    var Program = require('./Program');
    
    function MaterialBlinnPhong(){
        Program.call(this,BlinnPhingGLSL);
    }
    
    MaterialBlinnPhong.prototype = Object.create(Program.prototype);
    MaterialBlingPhong.prototype.constructor = MaterialBlinnPhong;
    
    MaterialBlingPhong.prototype.setLightPos = function(pos){
        this.uniforms.lightPos = pos;
    };
    
    MaterialBlingPhong.prototype.setColorAmbient = function(color){
        this.uniforms.colorAmbient = color;
    };
    
    ...
    ```
    So conceptually there is no difference between materials and programs, *materials as program presets*
    
- Material on same level os Mesh, exist next to each other
    
    ```
    var material = new MaterialCool();
    var mesh     = new Mesh(); //no material pass, mesh is unaware of material/program it will be used with
    ```
    
    #####pros / cons
    
    - **(+)** easy to change materials: 
    
    ```
    material = a ? materialA.bind() : materialB.bind();
    mesh.draw();
    material.unbind();
    ```
    - **(+)** batch apply:
    
    ```
    material.bind();
    for(var i = 0, l = 1000; i < l; ++i){
        meshes[i].draw();
    }
    material.unbind();

    ```
    
    - **(-)** no mesh.getMaterial()
    - **(+/-)** its more manual
    
```
graph TB
A[Mesh] --> B(mesh.draw)
B -->|internal| D(glu.drawMesh)
C(program.bind) --> E
D --> E(program update)
```
    
###pex-glu

- dedicated namespace for gl utilities, no mixup classes methods
- projection,model,view matrix stack

    ```
    //managing the matrix stack
    glu.setCameraMatrix(camera);
    glu.pushMatrix(); //transfomation stack
        glu.translate(100,0,0);
        mesh.draw();
    glu.popMatrix();
    glu.setMatrixMode(glu.PROJECTION_MATRIX);
    glu.pushMatrix();
        glu.setWindowMatrices(windowWidth,windowHeight); //window screen 2d projection, no ortho, no screenimage
        mesh2d.draw();
    glu.popMatrix(); //back to camera
    
    //also
    glu.pushMatrices(); //push new transformatin & projection
    //something
    glu.popMatrices():
    
    ```
- *glu* could than also be home for attrib stacks (which would be extremly useful!!)

    ```
    glu.pushAttrib(glu.VIEWPORT_BIT);
        glu.viewport(x,y,width,height); //ok we need to wrap gl.viewport
        //something
    glu.popAttrib(); //no manual resets, thanks!    
    
    glu.pushAttrib(glu.SCISSOR_BIT);
        glu.scissor(x,y,width,height); //ok again, need to wrap thos then
        glu.pushAttrib(glu.VIEWPORT_BIT);
            glu.viewport(x+width/2,y,width/2,height);
            //something
        glu.popAttrib();
    glu.popAttrib();
    ```  
    
- *draw*, hm where to put this...

    ```
    glu.pushMatrices();
        glu.setWindowMatrices(0,0,windowWidth,windowHeight);
        glu.pushMatrix();
            glu.translate(100,0,0);
                glu.pushAttrib(glu.DRAW_COLOR_BIT); //custom draw attrib bits, omg
                glu.setColor(1,1,1,1);
                glu.drawRect(100,100);
                glu.popAttrib();
            glu.translate(100,0,0);
                glu.drawRect(100,100); 
        glu.popMatrix();    
    glu.popMatrices();
    ```    
- *decoupling material and camera from meshes* forces centralised draw state manager, where does it live

    ```
    //glu
    
    glu.drawMesh = function(mesh){ //also public
        //manages currently bound program, update program locations, ....
        //updates uniforms outside mesh, because material progarm & 
        //mesh no direct link
        //drawArrays, drawElements
    }
    
    // Mesh
    
    Mesh.prototype.draw = function(){
        //so this is a bit strange, but keeps program management & 
        //draw calls encapsulated to one single place
        glu.drawMesh(this);
    }
    
    ```
    
    *glu* handles everthing program related, enable/disable attributes according to geometry properties...
    
- *glu* needs valid context ref, so theres no way to prevent something like this

    ```
    var glu_ = require('pex-glu');
    var glu;
    function yo(){
        glu = glu_.get(); //:(
    }
    //also needs to be initialised in window if type 3d
    ...
    glu.init(gl);
    ...
    ```
    
    