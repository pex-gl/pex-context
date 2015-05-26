define([
  "pex/core/Context",
  "pex/core/Color",
  "pex/core/Mesh",
  "pex/core/Vec3",
  "pex/core/Ray",
  "pex/geom/LineBuilder",
  "pex/materials/ShowColorMaterial",
  "sys",
  "events"
  ],
  function(Context, Color, Mesh, Vec3, Ray, LineBuilder, ShowColorMaterial, sys, events) {

  function GizmoController(window) {
    this.window = window;
    this.gl = Context.currentContext.gl;
    this.gizmos = [];

    this.lineBuilder = new LineBuilder();
    this.lineMaterial = new ShowColorMaterial();

    var self = this;

    window.on("mouseMoved", function(e) { self.onMouseMoved(e); })
    window.on("leftMouseDown", function(e) { self.onLeftMouseDown(e); })
    window.on("mouseDragged", function(e) { self.onMouseDragged(e); })
    window.on("leftMouseUp", function(e) { self.onLeftMouseUp(e); })
  }

  sys.inherits(GizmoController, events.EventEmitter);

  GizmoController.prototype.onMouseMoved = function(e) {
    if (!this.camera) return;
    this.hitTest(e);
  }

  GizmoController.prototype.onLeftMouseDown = function(e) {
    this.nearestHit = this.hitTest(e);
    if (this.nearestHit) {
      e.gizmo = this.nearestHit;
      this.emit("gizmoMouseDown", e)
    }
  }

  GizmoController.prototype.onMouseDragged = function(e) {
    if (this.nearestHit) {
      e.gizmo = this.nearestHit;
      this.emit("gizmoMouseDragged", e);
    }
  }

  GizmoController.prototype.onLeftMouseUp = function(e) {
    if (this.nearestHit) {
      e.gizmo = this.nearestHit;
      this.emit("gizmoMouseUp", e)
      this.nearestHit = null;
    }
  }

  GizmoController.prototype.hitTest = function(e) {
    if (!this.camera) return null;

    this.hitGizmo = null;

    worldRay = this.camera.getWorldRay(e.x, e.y, this.window.width, this.window.height);

    var camPos = this.camera.getPosition();

    var nearestHit = null;
    var nearestHitDistance = Number.POSITIVE_INFINITY;
    for(var i=0; i<this.gizmos.length; i++) {
      var g = this.gizmos[i];
      g.highlighted = false;
      if (g.type == "point") {
        var hitPoints = worldRay.hitTestSphere(g.position, g.radius);
        for(var j=0; j<hitPoints.length; j++) {
          var dist = hitPoints[j].dup().sub(camPos).length();
          if (dist < nearestHitDistance) {
            nearestHitDistance = dist;
            nearestHit = g;
          }
        }
      }
    }

    if (nearestHit) {
      nearestHit.highlighted = true;
    }
    return nearestHit;
  }

  GizmoController.prototype.addPoint = function(p, data, color) {
    this.gizmos.push({
      type: "point",
      radius: 0.01,
      position: p,
      color: color || Color.Red,
      data: data,
      active: true
    })
  }

  GizmoController.prototype.addPlane = function(p, normal, up, data) {
    this.gizmos.push({
      type: "plane",
      radius: 0.6, 
      position: p,
      normal: normal,
      up: up,
      color: Color.Blue,
      data: data,
      active: true
    })
  }

  GizmoController.prototype.removeAllGizmosWithTag = function(tag) {
    for(var i=0; i<this.gizmos.length; i++) {
      if(this.gizmos[i].data.tag == tag) {
        this.gizmos.splice(i, 1);
        i--;
      }
    }
  }

  GizmoController.prototype.highlight = function(gizmo, state, radio) {
  }

  GizmoController.prototype.draw = function(camera) {
    var gl = this.gl;
    this.camera = camera;

    this.lineBuilder.reset();

    for(var i=0; i<this.gizmos.length; i++) {
      var g = this.gizmos[i];
      var color = g.highlighted ? Color.Yellow : g.color;
      switch(g.type) {
        case "point":
          this.lineBuilder.addGizmo(g.position, g.radius, color)
        break;
        case "plane":
          this.lineBuilder.addPlane(g.position, g.normal, g.up, g.radius, color)
        break;

      }
    }
    if (this.linesMesh) this.linesMesh.dispose();
    this.linesMesh = new Mesh(this.lineBuilder, this.lineMaterial, { primitiveType:gl.LINES });

    gl.disable(gl.DEPTH_TEST);
    this.linesMesh.draw(camera);
  }

  return GizmoController;
});