define(["pex/core/Context", "pex/core/Vec3", "pex/core/Vec4", "pex/core/Color", "pex/core/Geometry", "pex/core/Mesh", "materials/TexturedPointSprite", "pex/core/Texture2D"], 
  function(Context, Vec3, Vec4, Color, Geometry, Mesh, TexturedMaterial, Texture2D) {
  function ParticleSystemRenderer() {
    this.material = new TexturedMaterial({pointSize:10, texture:Texture2D.load("assets/particle.png")});
    this.particleSystem = null;
    this.mesh = null;
  }

  ParticleSystemRenderer.tailLength = 0.2;
  ParticleSystemRenderer.globalAlpha = 1;

  ParticleSystemRenderer.prototype.update = function() {
    var gl = Context.currentContext.gl;
    if (this.mesh) this.mesh.dispose();
    var geometry = new Geometry();
    geometry.vertices = [];
    geometry.colors = [];
    this.particleSystem.particles.forEach(function(p) {
      geometry.vertices.push(p.position);
      //geometry.vertices.push(p.position.subbed(p.position.subbed(p.prevPosition).normalize().scale(ParticleSystemRenderer.tailLength)));
      var c = p.color.dup();
      c.a *= 0.2 + 0.8 * ParticleSystemRenderer.globalAlpha;
      geometry.colors.push(c);
    });
    this.mesh = new Mesh(geometry, this.material, {primitiveType:gl.POINTS});
  };

  ParticleSystemRenderer.prototype.draw = function(camera) {
    this.mesh.draw(camera);
  };

  return ParticleSystemRenderer;
});