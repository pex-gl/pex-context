var Window = require('./sys/Window');
var mat44  = require('./math/mat44');

Window.create({
    settings : {
        width  : 800,
        height : 600
    },
    init : function(){
        var ctx = this.getContext();

        this._matrixProjection = mat44.create();
        this._matrixView       = mat44.create();
    },
    draw : function(){
        var ctx = this.getContext();

        var windowWidth_2 = this.getWidth() * 0.5;
        var windowHeight  = this.getHeight();


        ctx.push();
            ctx.setViewport(0,0,windowWidth_2,windowHeight);
            ctx.setProjectionMatrix(
                mat44.perspective(this._matrixProjection,45,windowWidth_2 / windowHeight, 0.001,10.0)
            );
            ctx.setClearColor(1,0,0,1);
            //ctx.setScissor(0,0,windowWidth_2,windowHeight);
        ctx.pop();
        ctx.push();
            ctx.setViewport(windowWidth_2,0,windowWidth_2,windowHeight);
            ctx.setProjectionMatrix(
                mat44.ortho(this._matrixProjection,0,windowWidth_2,windowHeight,0,0.001,10.0)
            );
            ctx.setClearColor(0,0,0,1);
        ctx.pop();
    }
});
