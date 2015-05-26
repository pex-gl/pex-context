define(['pex/gl/Texture2D', 'pex/gl/ScreenImage', 'pex/gl/Program', 'lib/text!utils/BackgroundImageFader.glsl'],
  function(Texture2D, ScreenImage, Program, BackgroundImageFaderGLSL) {
  function BackgroundImageFader() {
    this.images = [];
    this.currentImage = 0;
    this.screenImage = new ScreenImage(null);
    this.program = new Program(BackgroundImageFaderGLSL);
    this.fade = 0;
    this.targetFade = 0;
    this.brightness = 1;
    this.brightness2 = 1;
  }

  BackgroundImageFader.prototype.addImage = function(url) {
    this.images.push(Texture2D.load(url));
  }

  BackgroundImageFader.prototype.draw = function() {
    this.fade += (this.targetFade - this.fade) * 0.01;
    if (this.images.length >= 2) {
      this.images[0].bind(0);
      this.images[1].bind(1);
      this.program.use();
      this.program.uniforms.image(0);
      this.program.uniforms.image2(1);
      this.program.uniforms.fade(this.fade);
      this.program.uniforms.brightness(this.brightness);
      this.program.uniforms.brightness2(this.brightness2);
      this.screenImage.draw(null, this.program);
    }
  }

  return BackgroundImageFader;
});