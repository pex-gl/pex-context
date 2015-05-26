var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var geom = require('pex-geom');

var Platform = sys.Platform;
var Cube = gen.Cube;
var Box = gen.Box;
var Sphere = gen.Sphere;
var Mesh = glu.Mesh;
var Diffuse = materials.Diffuse;
var ShowTexCoords = materials.ShowTexCoords;
var ShowNormals = materials.ShowNormals;
var ShowPosition = materials.ShowPosition;
var ShowColors = materials.ShowColors;
var ShowDepth = materials.ShowDepth;
var Diffuse = materials.Diffuse;
var BlinnPhong = materials.BlinnPhong;
var SolidColor = materials.SolidColor;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var RenderTarget = glu.RenderTarget;
var Texture2D = glu.Texture2D;
var ScreenImage = glu.ScreenImage;
var Program = glu.Program;
var Vec3 = geom.Vec3;
var Quat = geom.Quat;
var LineBuilder = gen.LineBuilder;
var Time = sys.Time;

var DPI = Platform.isBrowser ? 1 : 2;

sys.Window.create({
  settings: {
    width: 1024 * DPI,
    height: 512 * DPI,
    type: '3d',
    highdpi: DPI
    //fullscreen: Platform.isBrowser ? true : false
  },
  init: function() {
    if (Platform.isBrowser) {
        console.log('WEBGL_depth_texture', this.gl.getExtension('WEBGL_depth_texture'));
        console.log('OES_texture_float', this.gl.getExtension('OES_texture_float'));
        console.log('OES_texture_float_linear', this.gl.getExtension('OES_texture_float_linear'));
    }
    this.showNormals = new ShowNormals();
    this.diffuse = new BlinnPhong({ wrap: 1 });
    this.solidColor = new SolidColor();
    this.showTexCoord = new ShowTexCoords();
    this.showPosition = new ShowPosition();
    this.showDepth = new ShowDepth();

    geom.randomSeed(50);

    var cube = new Cube();
    cube = new Box().dooSabin().catmullClark();
    cube.computeNormals();

    var m1 = new Mesh(cube, this.showNormals);
    //m1.position.x = 1;
    //m1.position.y -= 0.5;
    var m2 = new Mesh(new Sphere(), this.showNormals);
    //m2.position.y -= 0.205;
    var m3 = new Mesh(new Cube(), this.showNormals);
    //m3.position.x -= 1;
    this.scene = [m1, m2, m3];
    this.floor = new Mesh(new Cube(7, 0.01, 7), this.showNormals);
    this.instances = [];
    for(var i=0; i<50; i++) {
        var pos = geom.randomVec3().scale(3);
        pos.y *= 0.1;
        var s = geom.randomFloat(0.1, 1);
        //s /= pos.lengthSquared();
        var scale = new Vec3(s,s,s);
        this.instances.push({
            position: pos,
            scale: scale,
            t: pos.y,
            uniforms: {
                diffuseColor: Color.fromHSL(geom.randomFloat(0, 1), 0.85, 0.5),
                specularColor: Color.fromHSL(geom.randomFloat(0, 1), 0.85, 0.15),
                //diffuseColor: Color.Red,
                //ambientColor: Color.Red,
                //specularColor: Color.Red
            }
        })
    }
    for(var i=0; i<20; i++) {
        var pos = geom.randomVec3().scale(7);
        //pos.y *= 0.1;
        pos.x = -4;
        pos.y += 4;
        var s = geom.randomFloat(0.5, 1);
        //s /= pos.lengthSquared();
        var scale = new Vec3(s,s*2,s*2);
        this.instances.push({
            position: pos,
            scale: scale,
            t: pos.y,
            uniforms: {
                diffuseColor: Color.fromHSL(geom.randomFloat(0, 1), 0.85, 0.5),
                specularColor: Color.fromHSL(geom.randomFloat(0, 1), 0.85, 0.15),
                ambientColor: Color.Black,
            }
        })
    }
    for(var i=0; i<20; i++) {
        var pos = geom.randomVec3().scale(7);
        //pos.y *= 0.1;
        pos.x = 4;
        pos.y += 4;
        var s = geom.randomFloat(0.5, 1);
        //s /= pos.lengthSquared();
        var scale = new Vec3(s,s*2,s*2);
        this.instances.push({
            position: pos,
            scale: scale,
            t: pos.y,
            uniforms: {
                diffuseColor: Color.fromHSL(geom.randomFloat(0, 1), 0.85, 0.5),
                specularColor: Color.fromHSL(geom.randomFloat(0, 1), 0.85, 0.15),
                ambientColor: Color.Black,
            }
        })
    }
    for(var i=0; i<40; i++) {
        var pos = geom.randomVec3().scale(7);
        //pos.y *= 0.1;
        pos.z = -4;
        pos.y += 4;
        var s = geom.randomFloat(0.5, 1);
        //s /= pos.lengthSquared();
        var scale = new Vec3(s*2,s*2,s);
        this.instances.push({
            position: pos,
            scale: scale,
            t: pos.y,
            uniforms: {
                diffuseColor: Color.fromHSL(geom.randomFloat(0, 1), 0.85, 0.5),
                specularColor: Color.fromHSL(geom.randomFloat(0, 1), 0.85, 0.15),
                ambientColor: Color.Black,
            }
        })
    }
    for(var i=0; i<20; i++) {
        var pos = geom.randomVec3().scale(7);
        //pos.y *= 0.1;
        pos.y = 7;
        var s = geom.randomFloat(0.5, 1);
        //s /= pos.lengthSquared();
        var scale = new Vec3(s*5,s,s*5);
        this.instances.push({
            position: pos,
            scale: scale,
            t: pos.y,
            uniforms: {
                diffuseColor: Color.fromHSL(geom.randomFloat(0, 1), 0.85, 0.5),
                specularColor: Color.fromHSL(geom.randomFloat(0, 1), 0.85, 0.15),
                ambientColor: Color.Black,
            }
        })
    }
    //this.floor.position.y = -0.5;

    this.camera = new PerspectiveCamera(60, this.width / this.height, 0.1, 20);
    this.camera.setTarget(new Vec3(0, 2, 0));
    this.camera.setPosition(new Vec3(0, 3, 6));
    //this.arcball = new Arcball(this, this.camera);
    //this.arcball.setTarget(new Vec3(0, 2, 0));
    //this.arcball.setPosition(new Vec3(0, 3, 6));

    var rtWidth = this.width;
    var rtHeight = this.height;

    //create textures for offscreen rendering
    var colorBuf  = this.colorBuf = Texture2D.create(rtWidth, rtHeight, { format: this.gl.RGBA, type: this.gl.UNSIGNED_BYTE });
    var normalBuf = this.normalBuf = Texture2D.create(rtWidth, rtHeight, { bpp: 32 });
    var depthBuf  = this.depthBuf = Texture2D.create(rtWidth, rtHeight, { format: this.gl.DEPTH_COMPONENT, type: this.gl.UNSIGNED_SHORT });
    var depthBuf2  = this.depthBuf2 = Texture2D.create(rtWidth, rtHeight, { bpp: 32 });
    var positionBuf  = this.positionBuf = Texture2D.create(rtWidth, rtHeight, { bpp: 32 });

    this.colorRenderTarget = new RenderTarget(rtWidth, rtHeight, { color: colorBuf, depth: depthBuf });
    this.depthRenderTarget = new RenderTarget(rtWidth, rtHeight, { color: depthBuf2, depth: depthBuf });
    this.normalRenderTarget = new RenderTarget(rtWidth, rtHeight, { color: normalBuf, depth: depthBuf });
    this.positionRenderTarget = new RenderTarget(rtWidth, rtHeight, { color: positionBuf, depth: depthBuf });

    //this.screenImageColor = new ScreenImage(colorBuf, 0, 0, rtWidth, rtHeight, this.width, this.height);
    //this.screenImageDepth = new ScreenImage(depthBuf, 0, 0, rtWidth, rtHeight, this.width, this.height);
    //this.screenImageNormal = new ScreenImage(normalBuf, 0, 0, rtWidth, rtHeight, this.width, this.height);
    //this.screenImagePosition = new ScreenImage(positionBuf, 0, 0, rtWidth, rtHeight, this.width, this.height);

    this.screenImageSSR = new ScreenImage(normalBuf, 0, 0, rtWidth, rtHeight, this.width, this.height);

    this.lineBuilder = new LineBuilder();
    this.lines = new Mesh(this.lineBuilder, new ShowColors(), { lines: true });

    this.ssrShader = Program.load('./fx/SSR.glsl');

    this.on('mouseMoved', function(e) {
      this.camera.setPosition(new Vec3(
        5 * (e.x - this.width/2)/this.width,
        2 - 2 * (e.y - this.height/2)/this.height,
        6
      ));
    }.bind(this));
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Red);

    this.colorRenderTarget.bind();
    glu.enableDepthReadAndWrite(true);
    glu.clearColorAndDepth(Color.Black);
      this.scene[0].setMaterial(this.diffuse);
      this.scene[0].drawInstances(this.camera, this.instances);
      this.floor.setMaterial(this.solidColor);
      this.solidColor.uniforms.color = Color.Red;
      this.floor.draw(this.camera);
    this.colorRenderTarget.unbind();

    this.normalRenderTarget.bind();
    glu.enableDepthReadAndWrite(true, false);
    glu.clearColorAndDepth(Color.Black);
    this.scene[0].setMaterial(this.showNormals);
    this.scene[0].drawInstances(this.camera, this.instances);
    this.floor.setMaterial(this.showNormals);
    this.floor.draw(this.camera);
    this.normalRenderTarget.unbind();

    this.depthRenderTarget.bind();
    glu.enableDepthReadAndWrite(true, false);
    glu.clearColorAndDepth(Color.Black);
    this.showDepth.uniforms.near = this.camera.getNear();
    this.showDepth.uniforms.far = this.camera.getFar();
    this.scene[0].setMaterial(this.showDepth);
    this.scene[0].drawInstances(this.camera, this.instances);
    this.floor.setMaterial(this.showDepth);
    this.floor.draw(this.camera);
    this.depthRenderTarget.unbind();

    this.positionRenderTarget.bind();
    glu.enableDepthReadAndWrite(true, false);
    glu.clearColorAndDepth(Color.Black);
    this.scene[0].setMaterial(this.showPosition);
    this.scene[0].drawInstances(this.camera, this.instances);
    this.floor.setMaterial(this.showPosition);
    this.floor.draw(this.camera);
    this.positionRenderTarget.unbind();

    glu.viewport(0, 0, this.width, this.height);
    glu.enableDepthReadAndWrite(false);
    //this.screenImageColor.draw();
    //this.screenImageDepth.draw();
    //this.screenImageNormal.draw();

    this.ssrShader.use();
    this.ssrShader.uniforms.colorMap(0);
    this.ssrShader.uniforms.depthMap(1);
    this.ssrShader.uniforms.normalMap(2);
    this.ssrShader.uniforms.positionMap(3);
    this.ssrShader.uniforms.near(this.camera.getNear());
    this.ssrShader.uniforms.far(this.camera.getFar());
    this.ssrShader.uniforms.fov(this.camera.getFov());
    this.ssrShader.uniforms.aspectRatio(this.camera.getAspectRatio());
    this.ssrShader.uniforms.projectionMatrix(this.camera.getProjectionMatrix());
    this.colorBuf.bind(0);
    this.depthBuf.bind(1);
    //this.depthBuf2.bind(1);
    this.normalBuf.bind(2);
    this.positionBuf.bind(3);
    this.screenImageSSR.draw(null, this.ssrShader);

    glu.enableDepthReadAndWrite(false);
    this.lineBuilder.reset();
    var pos = new Vec3(-0.5, 0, 0.5);
    var n = new Vec3(0, 1, 0);
    var ecN = n.dup().transformMat4(this.camera.getViewMatrix().dup().invert().transpose()).normalize();
    var ecPos = pos.dup().transformMat4(this.camera.getViewMatrix());
    var ecI = ecPos.dup().normalize();
    var ecR = ecI.dup().sub(ecN.dup().scale(2 * ecN.dot(ecI))).normalize();
    var ecT = ecI.dup().cross(ecR).normalize();
    var ecNPos = ecPos.dup().add(ecN);
    var ecRPos = ecPos.dup().add(ecR);
    var ecTPos = ecPos.dup().add(ecT);
    var nPos = ecNPos.dup().transformMat4(this.camera.getViewMatrix().dup().invert());
    var rPos = ecRPos.dup().transformMat4(this.camera.getViewMatrix().dup().invert());
    var tPos = ecTPos.dup().transformMat4(this.camera.getViewMatrix().dup().invert());
    this.gl.lineWidth(5);
    this.lineBuilder.addLine(pos, rPos, Color.Green);
    this.lineBuilder.addLine(pos, tPos, Color.Red);
    this.lineBuilder.addLine(pos, nPos, Color.White);

    this.instances.forEach(function(p, pi) {
      p.position.y = p.t - 0.2 +  0.2 * Math.cos(10 * p.t + Time.seconds * 0.0);
    })
    //this.lines.draw(this.camera);
  }
});
