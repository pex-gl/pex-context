define(["pex/core/Context", "pex/core/Vec3", "pex/core/Vec4", "pex/core/Color", "pex/core/Geometry", "pex/core/Mesh", "pex/materials/ShowColorMaterial"], 
  function(Context, Vec3, Vec4, Color, Geometry, Mesh, ShowColorMaterial) {
  function ParticleSystemRenderer() {
    this.material = new ShowColorMaterial({pointSize:5});
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
      geometry.vertices.push(p.position.subbed(p.position.subbed(p.prevPosition).normalize().scale(ParticleSystemRenderer.tailLength)));
      var c = p.color.dup();
      c.a *= 0.2 + 0.8 * ParticleSystemRenderer.globalAlpha;
      geometry.colors.push(c);
      geometry.colors.push(Color.None);
    });
    this.mesh = new Mesh(geometry, this.material, {primitiveType:gl.LINES});
  };

  ParticleSystemRenderer.prototype.draw = function(camera) {
    this.mesh.draw(camera);
  };

  return ParticleSystemRenderer;
});