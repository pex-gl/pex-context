define(['pex/gl/Texture2D', 'utils/ScreenImage'], function(Texture2D, ScreenImage) {
  function BackgroundImageFader() {
    this.images = [];
    this.currentImage = 0;
    this.screenImage = new ScreenImage(null);
  }

  BackgroundImageFader.prototype.addImage = function(url) {
    this.images.push(Texture2D.load(url));
  }

  BackgroundImageFader.prototype.draw = function() {
    if (this.currentImage < this.images.length) {
      this.screenImage.setImage(this.images[this.currentImage]);
    }

    this.screenImage.draw();
  }

  BackgroundImageFader.prototype.setCurrentImage = function(i) {
    this.currentImage = i;
  }

  return BackgroundImageFader;
});