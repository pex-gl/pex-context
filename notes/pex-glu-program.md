###Program

- explicit uniform setters

    ```
    uniform1f(name,x);
    uniform2f(name,x,y);
    uniform3f(name,x,y,z);
    uniform4f(name,x,y,z,w);
    
    //change immediatly applied, user explicitly updates uniform
    prototype.uniform = function(name,param){
        this.gl.uniform(name,param);
    }
    ```
    vs
    
    ```
    //not clear that those are setters
    uniforms.aUniform1f = x;
    uniforms.aUniform2f = [x,y];
    uniforms.aUniform3f = [x,y,z];
    uniforms.aUniform3f = [x,y,z,w];
    
    //where does the update happen?
    
    //no pex setter pattern
    uniforms.aUniform1f(x);
    uniforms.aUniform2f(x,y);
    ```
- cant throw errors    

    ```
    uniforms.aUnifrom = 1; //typo, expected doesnt get applied, creating new uniforms entry, searching for erros
    
    //throws
    prototype.uniform = function(name,param){
        if(!this.uniforms[name]){
            throw new Error(msg);
        }
        this.gl.uniform(name,param);
    }

    ```
- if setter functions
    ```
    //passing uniforms would be chainable
    program.use().uniform1f('uPointSize',1).uniform4fv('uProperty',arr);
    ```
    vs
    
    ```
    program.use();
    program.uniform.uPointSize = 1;
    program.uniform.uProperty = arr;
    ```
- user is responsible for deciding if a uniform needs to be updated
- programs can be reloaded on watch
    ```
    function fileDidChange(shaderSource){
        program.load(shaderSource);
    }
    ```