var Window = require('../../sys/Window');
var assert = require('assert');

function assertArgs(bitname,args){
    for(var i = 1, l = arguments.length; i < l; i+=2){
        assert.deepEqual(arguments[i],arguments[i+1],bitname);
    }
}

Window.create({
    settings : {
        width : 800,
        height: 600,
        type  : '3d'
    },
    init : function(){
        var ctx = this.getContext();

        this._framebufferA = ctx.createFramebuffer([{
            texture : ctx.createTexture2D(null,800,600)
        }]);
        this._framebufferB = ctx.createFramebuffer([{
            texture : ctx.createTexture2D(null,400,300)
        }]);
    },
    testDepthStateSeparate : function(){
        var ctx    = this.getContext();

        ctx.setDepthTest(false);
        ctx.pushState(ctx.DEPTH_BIT);
            ctx.setDepthTest(true);
            assert.equal(ctx.getDepthTest(),true,'DEPTH_BIT');
        ctx.popState(ctx.DEPTH_BIT);
        assert.equal(ctx.getDepthTest(),false,'DEPTH_BIT');

        ctx.setDepthMask(false);
        ctx.pushState(ctx.DEPTH_BIT);
            ctx.setDepthMask(true);
            assert.equal(ctx.getDepthMask(),true,'DEPTH_BIT');
        ctx.popState();
        assert.equal(ctx.getDepthMask(),false,'DEPTH_BIT');

        ctx.setDepthFunc(ctx.LESS);
        ctx.pushState(ctx.DEPTH_BIT);
            ctx.setDepthFunc(ctx.NEVER);
            assert.equal(ctx.getDepthFunc(),ctx.NEVER,'DEPTH_BIT');
        ctx.popState(ctx.DEPTH_BIT);
        assert.equal(ctx.getDepthFunc(),ctx.LESS);

        ctx.setClearDepth(0.0);
        ctx.pushState(ctx.DEPTH_BIT);
            ctx.setClearDepth(1.0);
            assert.equal(ctx.getClearDepth(),1.0,'DEPTH_BIT');
        ctx.popState(ctx.DEPTH_BIT);
        assert.equal(ctx.getClearDepth(),0.0,'DEPTH_BIT');

        ctx.setDepthRange(0,1);
        ctx.pushState(ctx.DEPTH_BIT);
            ctx.setDepthRange(0.5,1.0);
            assert.deepEqual(ctx.getDepthRange(),[0.5,1.0],'DEPTH_BIT');
        ctx.popState(ctx.DEPTH_BIT);
        assert.deepEqual(ctx.getDepthRange(),[0,1],'DEPTH_BIT');

        ctx.setPolygonOffset(1,1);
        ctx.pushState(ctx.DEPTH_BIT);
            ctx.setPolygonOffset(1,2);
            assert.deepEqual(ctx.getPolygonOffset(),[1,2],'DEPTH_BIT');
        ctx.popState(ctx.DEPTH_BIT);
        assert.deepEqual(ctx.getPolygonOffset(),[1,1],'DEPTH_BIT');
    },
    testColorStateSeparate : function(){
        var ctx = this.getContext();

        ctx.setClearColor(0,0,0,1);
        ctx.pushState(ctx.COLOR_BIT);
            ctx.setClearColor(1,1,1,1);
            assert.deepEqual(ctx.getClearColor(),[1,1,1,1],'COLOR_BIT');
        ctx.popState(ctx.COLOR_BIT);
        assert.deepEqual(ctx.getClearColor(),[0,0,0,1],'COLOR_BIT');

        ctx.setColorMask(true,true,true,true);
        ctx.pushState(ctx.COLOR_BIT);
            ctx.setColorMask(true,false,false,true);
            assert.deepEqual(ctx.getColorMask(),[true,false,false,true],'COLOR_BIT');
        ctx.popState(ctx.COLOR_BIT);
        assert.deepEqual(ctx.getColorMask(),[true,true,true,true],'COLOR_BIT');
    },
    testScissorStateSeparate : function(){
        var ctx = this.getContext();

        ctx.setScissorTest(true);
        ctx.pushState(ctx.SCISSOR_BIT);
            ctx.setScissorTest(false);
            assert.equal(ctx.getScissorTest(),false,'SCISSOR_BIT');
        ctx.popState(ctx.SCISSOR_BIT);
        assert.equal(ctx.getScissorTest(),true,'SCISSOR_BIT');

        ctx.setScissor(0,0,800,600);
        ctx.pushState(ctx.SCISSOR_TEST);
            ctx.setScissor(0,0,400,300);
            assert.deepEqual(ctx.getScissor(),[0,0,400,300],'SCISSOR_BIT');
        ctx.popState(ctx.SCISSOR_TEST);
        assert.deepEqual(ctx.getScissor(),[0,0,800,600],'SCISSOR_BIT');
    },
    testCullStateSeparate : function(){
        var ctx = this.getContext();

        ctx.setCulling(false);
        ctx.pushState(ctx.CULL_BIT);
            ctx.setCulling(true);
            assert.equal(ctx.getCulling(), true, 'CULL_BIT');
        ctx.popState(ctx.CULL_BIT);
        assert.equal(ctx.getCulling(), false, 'CULL_BIT');

        ctx.setCullFace(ctx.FRONT);
        ctx.pushState(ctx.CULL_BIT);
            ctx.setCullFace(ctx.BACK);
            assert.equal(ctx.getCullFaceMode(), ctx.BACK, 'CULL_BIT');
        ctx.popState(ctx.CULL_BIT);
        assert.equal(ctx.getCullFaceMode(), ctx.FRONT, 'CULL_BIT');
    },
    testViewportStateSeparate : function(){
        var ctx = this.getContext();

        ctx.setViewport(0,0,800,600);
        ctx.pushState(ctx.VIEWPORT_BIT);
            ctx.setViewport(0,0,400,300);
            assert.deepEqual(ctx.getViewport(),[0,0,400,300],'VIEWPORT_BIT');
        ctx.popState(ctx.VIEWPORT_BIT);
        assert.deepEqual(ctx.getViewport(),[0,0,800,600],'VIEWPORT_BIT');
    },
    testBlendStateSeparate : function(){
        var ctx = this.getContext();

        ctx.setBlend(true);
        ctx.pushState(ctx.BLEND_BIT);
            ctx.setBlend(false);
            assert.equal(ctx.getBlend(),false,'BLEND_BIT');
        ctx.popState(ctx.BLEND_BIT);
        assert.equal(ctx.getBlend(),true,'BLEND_BIT');

        ctx.setBlendColor(0,1,0,1);
        ctx.pushState(ctx.BLEND_BIT);
            ctx.setBlendColor(1,0,1,1);
            assert.deepEqual(ctx.getBlendColor(),[1,0,1,1],'BLEND_BIT');
        ctx.popState(ctx.BLEND_BIT);
        assert.deepEqual(ctx.getBlendColor(),[0,1,0,1],'BLEND_BIT');

        ctx.setBlendEquation(ctx.FUNC_ADD);
        ctx.pushState(ctx.BLEND_BIT);
            ctx.setBlendEquation(ctx.FUNC_SUBSTRACT);
            assert.equal(ctx.getBlendEquation(),ctx.FUNC_SUBSTRACT,'BLEND_BIT');
        ctx.popState(ctx.BLEND_BIT);
        assert.equal(ctx.getBlendEquation(),ctx.FUNC_ADD,'BLEND_BIT');

        ctx.setBlendEquationSeparate(ctx.FUNC_ADD,ctx.FUNC_SUBSTRACT);
        ctx.pushState(ctx.BLEND_BIT);
            ctx.setBlendEquationSeparate(ctx.FUNC_SUBSTRACT,ctx.FUNC_ADD);
            assert.deepEqual(ctx.getBlendEquationSeparate(),[ctx.FUNC_SUBSTRACT,ctx.FUNC_ADD],'BLEND_BIT');
        ctx.popState(ctx.BLEND_BIT);
        assert.deepEqual(ctx.getBlendEquationSeparate(),[ctx.FUNC_ADD,ctx.FUNC_SUBSTRACT],'BLEND_BIT');

        ctx.setBlendFunc(ctx.ONE,ctx.ZERO);
        ctx.pushState(ctx.BLEND_BIT);
            ctx.setBlendFunc(ctx.SRC_COLOR,ctx.ONE_MINUS_SRC_COLOR);
            assert.deepEqual(ctx.getBlendFunc(),[ctx.SRC_COLOR,ctx.ONE_MINUS_SRC_COLOR],'BLEND_BIT');
        ctx.popState(ctx.BLEND_BIT);
        assert.deepEqual(ctx.getBlendFunc(),[ctx.ONE,ctx.ZERO],'BLEND_BIT');

        ctx.setBlendFuncSeparate(ctx.ZERO,ctx.ZERO,ctx.ZERO,ctx.ZERO);
        ctx.pushState(ctx.BLEND_BIT);
            ctx.setBlendFuncSeparate(ctx.ZERO,ctx.ONE,ctx.ZERO,ctx.ONE);
            assert.deepEqual(ctx.getBlendFuncSeparate(),[ctx.ZERO,ctx.ONE,ctx.ZERO,ctx.ONE],'BLEND_BIT');
        ctx.popState(ctx.BLEND_BIT);
        assert.deepEqual(ctx.getBlendFuncSeparate(),[ctx.ZERO,ctx.ZERO,ctx.ZERO,ctx.ZERO],'BLEND_BIT')
    },
    testLineWidthStateSeparate : function(){
        var ctx = this.getContext();

        ctx.setLineWidth(1);
        ctx.pushState(ctx.LINE_WIDTH_BIT);
            ctx.setLineWidth(3);
            assert.equal(ctx.getLineWidth(),3,'LINE_WIDTH_BIT');
        ctx.popState(ctx.LINE_WIDTH_BIT);
        assert.equal(ctx.getLineWidth(),1,'LINE_WIDTH_BIT');
    },
    testFramebufferStateSeparate : function(){
        var ctx = this.getContext();

        ctx.bindFramebuffer(this._framebufferA);
        ctx.pushState(ctx.FRAMEBUFFER_BIT);
            ctx.bindFramebuffer(this._framebufferB);
            assert.equal(ctx.getFramebuffer(),this._framebufferB,'FRAMEBUFFER_BIT');
        ctx.popState(ctx.FRAMEBUFFER_BIT);
        assert.equal(ctx.getFramebuffer(), this._framebufferA, 'FRAMEBUFFER_BIT');
    },
    testAllState : function(){
        var ctx = this.getContext();

        //depth state
        ctx.setDepthTest(false);
        ctx.setDepthMask(false);
        ctx.setDepthFunc(ctx.LESS);
        ctx.setClearDepth(0.0);
        ctx.setDepthRange(0,1);
        ctx.setPolygonOffset(1,1);

        //color state
        ctx.setClearColor(0,0,0,1);
        ctx.setColorMask(true,true,true,true);

        //scissor state
        ctx.setScissorTest(true);
        ctx.setScissor(0,0,800,600);

        //cull state
        ctx.setCulling(false);
        ctx.setCullFace(ctx.FRONT);

        //viewport state
        ctx.setViewport(0,0,800,600);

        //blend state
        ctx.setBlend(true);
        ctx.setBlendColor(0,1,0,1);
        ctx.setBlendEquation(ctx.FUNC_ADD);
        ctx.setBlendEquationSeparate(ctx.FUNC_ADD,ctx.FUNC_SUBSTRACT);
        ctx.setBlendFunc(ctx.ONE,ctx.ZERO);
        ctx.setBlendFuncSeparate(ctx.ZERO,ctx.ZERO,ctx.ZERO,ctx.ZERO);

        //linewidth state
        ctx.setLineWidth(1);

        //framebuffer state
        ctx.bindFramebuffer(this._framebufferA);

        ctx.pushState();
            //depth state
            ctx.setDepthTest(true);
            ctx.setDepthMask(true);
            ctx.setDepthFunc(ctx.NEVER);
            ctx.setClearDepth(1.0);
            ctx.setDepthRange(0.5,1.0);
            ctx.setPolygonOffset(1,2);

            //color state
            ctx.setClearColor(1,1,1,1);
            ctx.setColorMask(true,false,false,true);

            //scissor state
            ctx.setScissorTest(false);
            ctx.setScissor(0,0,400,300);

            //cull state
            ctx.setCulling(true);
            ctx.setCullFace(ctx.BACK);

            //viewport state
            ctx.setViewport(0,0,400,300);

            //blend state
            ctx.setBlend(false);
            ctx.setBlendColor(1,0,1,1);
            ctx.setBlendEquation(ctx.FUNC_SUBSTRACT);
            ctx.setBlendEquationSeparate(ctx.FUNC_SUBSTRACT,ctx.FUNC_ADD);
            ctx.setBlendFunc(ctx.SRC_COLOR,ctx.ONE_MINUS_SRC_COLOR);
            ctx.setBlendFuncSeparate(ctx.ZERO,ctx.ONE,ctx.ZERO,ctx.ONE);

            //linewidth state
            ctx.setLineWidth(3);

            //framebuffer state
            ctx.bindFramebuffer(this._framebufferB);

            assertArgs('DEPTH_BIT',
                ctx.getDepthTest(),true,
                ctx.getDepthMask(),true,
                ctx.getDepthFunc(),ctx.NEVER,
                ctx.getClearDepth(),1.0,
                ctx.getDepthRange(),[0.5,1.0],
                ctx.getPolygonOffset(),[1,2]
            );

            assertArgs('COLOR_BIT',
                ctx.getClearColor(),[1,1,1,1],
                ctx.getColorMask(),[true,false,false,true]
            );

            assertArgs('SCISSOR_BIT',
                ctx.getScissorTest(),false,
                ctx.getScissor(),[0,0,400,300]
            );

            assertArgs('CULL_BIT',
                ctx.getCulling(),true,
                ctx.getCullFaceMode(),ctx.BACK
            );

            assertArgs('VIEWPORT_BIT',
                ctx.getViewport(),[0,0,400,300]
            );

            assertArgs('BLEND_BIT',
                ctx.getBlend(),false,
                ctx.getBlendColor(),[1,0,1,1],
                ctx.getBlendEquation(),ctx.FUNC_SUBSTRACT,
                ctx.getBlendEquationSeparate(),[ctx.FUNC_SUBSTRACT,ctx.FUNC_ADD],
                ctx.getBlendFunc(),[ctx.SRC_COLOR,ctx.ONE_MINUS_SRC_COLOR],
                ctx.getBlendFuncSeparate(),[ctx.ZERO,ctx.ONE,ctx.ZERO,ctx.ONE]
            );

            assertArgs('LINE_WIDTH_BIT',
                ctx.getLineWidth(), 3
            );

            assertArgs('FRAMEBUFFER_BIT',
                ctx.getFramebuffer(), this._framebufferB
            );

        ctx.popState();

        assertArgs('DEPTH_BIT',
            ctx.getDepthTest(),false,
            ctx.getDepthMask(),false,
            ctx.getDepthFunc(),ctx.LESS,
            ctx.getClearDepth(),0.0,
            ctx.getDepthRange(),[0.0,1.0],
            ctx.getPolygonOffset(),[1,1]
        );

        assertArgs('COLOR_BIT',
            ctx.getClearColor(),[0,0,0,1],
            ctx.getColorMask(),[true,true,true,true]
        );

        assertArgs('SCISSOR_BIT',
            ctx.getScissorTest(),true,
            ctx.getScissor(),[0,0,800,600]
        );

        assertArgs('CULL_BIT',
            ctx.getCulling(),false,
            ctx.getCullFaceMode(),ctx.FRONT
        );

        assertArgs('VIEWPORT_BIT',
            ctx.getViewport(),[0,0,800,600]
        );

        assertArgs('BLEND_BIT',
            ctx.getBlend(),true,
            ctx.getBlendColor(),[0,1,0,1],
            ctx.getBlendEquation(),ctx.FUNC_ADD,
            ctx.getBlendEquationSeparate(),[ctx.FUNC_ADD,ctx.FUNC_SUBSTRACT],
            ctx.getBlendFunc(),[ctx.ONE,ctx.ZERO],
            ctx.getBlendFuncSeparate(),[ctx.ZERO,ctx.ZERO,ctx.ZERO,ctx.ZERO]
        );

        assertArgs('LINE_WIDTH_BIT',
            ctx.getLineWidth(), 1
        );

        assertArgs('FRAMEBUFFER_BIT',
            ctx.getFramebuffer(), this._framebufferA
        );
    },
    draw : function(){
        this.testDepthStateSeparate();
        this.testColorStateSeparate();
        this.testScissorStateSeparate();
        this.testCullStateSeparate();
        this.testViewportStateSeparate();
        this.testBlendStateSeparate();
        this.testLineWidthStateSeparate();
        this.testFramebufferStateSeparate();
        this.testAllState();
    }
});