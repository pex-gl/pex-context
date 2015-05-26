define([
  'pex/gl/Context', 'pex/geom/Vec2', 'pex/geom/Vec3', 'pex/geom/Vec4',
  'pex/utils/Time', 'pex/gl/Texture2D',
  'pex/gl/Mesh', 'materials/PlanktonMaterial', 'pex/geom/Geometry', 'pex/geom/gen/Cube', 'pex/materials/SolidColor', 'pex/geom/Face3'],
  function(Context, Vec2, Vec3, Vec4, Time, Texture2D, Mesh, PlanktonMaterial, Geometry, Cube, SolidColor, Face3) {

  var NUM_PARTICLES = 50000;

  function sequence(start, end) {
    if (end === undefined) {
      end = start;
      start = 0;
    }
    var result = [];
    for(var i=start; i<end; i++) {
      result.push(i);
    }
    return result;
  }

  function argsArray(argvArray) {
    var args = [];
    for(var i in argvArray) {
      args.push(argvArray[i]);
    }
    return args;
  }

  function combine() { //f0, f1, f2, ...
    var args = argsArray(arguments);
    return function(i) {
      return args.reduce(function(o, f) {
        return f(o, i);
      }, null);
    };
  }

  function objectMaker() {
    return function(o, i) {
      return { id: i };
    };
  }

  function addPropFunc(name, valueFunc) {
    return function(o) {
      o[name] = valueFunc();
      return o;
    };
  }

  function randomPointInBoundsGen(bounds) {
    return function() {
      return Vec3.fromValues(
        bounds.x + (Math.random() - 0.5) * bounds.width,
        bounds.y + (Math.random() - 0.5) * bounds.height,
        bounds.z + (Math.random() - 0.5) * bounds.depth
      );
    };
  }

  function randomVectorGen(scale) {
    scale = (scale === undefined) ? 1 : scale;
    return function() {
      return (Vec3.fromValues(scale * (2*Math.random() - 1), scale * (2*Math.random() - 1), 0))
    };
  }

  function combineUpdate(deltaTime ) {//, f0, f1, f2, ...
    var args = argsArray(arguments);
    var deltaTime = args.shift();
    return function(o, i) {
      return args.reduce(function(o, f) {
        return f(o, deltaTime);
      }, o);
    };
  }

  function applyPullBack(strength) {
    return function(p, deltaTime) {
      if (!p.oldPosition) {
        p.oldPosition = Vec3.create();
        p.tmpForce = Vec3.create();
        p.scaledVelocity = Vec3.create();
        Vec3.copy(p.oldPosition, p.position);
      }
      Vec3.sub(p.tmpForce, p.oldPosition, p.position);
      Vec3.scale(p.tmpForce, p.tmpForce, strength);
      Vec3.add(p.force, p.force, p.tmpForce);
      return p;
    };
  }

  function applyVelocity() {
    return function(p, deltaTime) {
      Vec3.add(p.velocity, p.velocity, p.force);
      Vec3.set(p.force, 0, 0, 0);

      var speed = Vec3.length(p.velocity);
      if (speed > 300) {
        Vec3.scale(p.velocity, p.velocity, 1/speed * 300);
      }
      else if (speed > 100) {
        Vec3.scale(p.velocity, p.velocity, 0.99);
      }

      Vec3.scale(p.scaledVelocity, p.velocity, deltaTime);
      Vec3.add(p.position, p.position, p.scaledVelocity);

      return p;
    };
  }

  function applyFriction(strength) {
    return function(p, deltaTime) {
      Vec3.scale(p.velocity, p.velocity, 1.0 - strength);
      return p;
    };
  }

  function applyAttraction(centerPoint, radius, strength) {
    function r() {
      if (isNaN(radius)) return radius();
      else return radius;
    }
    return function(p, deltaTime) {
      if (!p.tmpForce) p.tmpForce = Vec3.create();
      Vec3.sub(p.tmpForce, centerPoint, p.position);
      var distance = Vec3.length(p.tmpForce);
      if (distance < r()) {
        var s = strength * (1.0 - distance/r());
        Vec3.normalize(p.tmpForce, p.tmpForce);
        Vec3.scale(p.tmpForce, p.tmpForce, s);
        Vec3.add(p.force, p.force, p.tmpForce);
      }
      return p;
    };
  }


  /*
  function prop(o, name, value) {
    o[name] = vlaue;
    return o;
  }

  function randomPointInRectGen(rect) {
    return function() {
      return new Vec3(
        rect.x + Math.random() * rect.width,
        rect.y + Math.random() * rect.height,
        Math.random() * rect.width
      );
    };
  }



  function addProp(name, value) {
    return function(o) {
      o[name] = value;
      return o;
    };
  }

  function applyGravity(gravityVec) {
    return function(p, deltaTime) {
      p.velocity.add(gravityVec.scaled(deltaTime));
      return p;
    };
  }






  function applyAttraction2D(centerPoint, radius, strength) {
    function r() {
      if (isNaN(radius)) return radius();
      else return radius;
    }
    return function(p, deltaTime) {
      var center = centerPoint.dup();
      center.z = 0;
      var pos = p.position.dup();
      pos.z = 0;
      var force = center.subbed(pos);
      var distance = force.length();
      if (distance < r()) {
        var s = strength * (1.0 - distance/r());
        force.normalize();
        force.scale(s);
        p.force.add(new Vec3(force.x, force.y, 0));
      }

      return p;
    };
  }

  function applyBounce(bounds, damping) {
    return function(p, deltaTime) {
      if (p.position.y > bounds.y + bounds.height) { p.position.y = bounds.y + bounds.height; p.velocity.y = -Math.abs(p.velocity.y) * damping; }
      if (p.position.x < bounds.x) { p.position.x = bounds.x; p.velocity.x = Math.abs(p.velocity.x) * damping; }
      if (p.position.x > bounds.x + bounds.width) { p.position.x = bounds.x + bounds.width; p.velocity.x = -Math.abs(p.velocity.x) * damping; }
      if (p.position.y < bounds.y) { p.position.y = bounds.y; p.velocity.y = Math.abs(p.velocity.y) * damping; }

      return p;
    };
  }

  function getter(obj, propertyName) {
    return function() {
      return obj[propertyName];
    };
  }

  */
  function Plankton(bounds) {
    this.particles = [];
    this.bounds = bounds;
    this.init();
  }

  Plankton.prototype.init = function() {
    this.particles = sequence(NUM_PARTICLES).map(combine(
      objectMaker(),
      addPropFunc("position", randomPointInBoundsGen(this.bounds)),
      addPropFunc("velocity", randomVectorGen(0)),
      addPropFunc("force", randomVectorGen(0))
    ));
    this.makeMesh();
  };

  Plankton.prototype.makeMesh = function() {
    var material = new PlanktonMaterial({
      pointSize: 20,
      color: Vec4.fromValues(1.0, 1.0, 1.0, 0.5),
      texture: Texture2D.load("assets/plankton.png")
    });
    var geometry = new Geometry({
      position : {
        type : 'Vec3',
        length : NUM_PARTICLES
      },
      normal : {
        type : 'Vec3',
        length : NUM_PARTICLES
      }
    });
    var gl = Context.currentContext.gl;
    this.mesh = new Mesh(geometry, material, { primitiveType : gl.POINTS });
  }

  Plankton.prototype.update = function(animals) {
    Time.starMeasuringTime();
    this.particles.forEach(combineUpdate(
        Time.delta,
        //applyGravity(new Vec3(0, -0.0, 0))
        applyAttraction(animals[0].agent.location, 0.15 * animals[0].scale, -0.2 * animals[0].scale),
        applyAttraction(animals[1].agent.location, 0.15 * animals[1].scale, -0.2 * animals[1].scale),
        applyAttraction(animals[2].agent.location, 0.15 * animals[2].scale, -0.2 * animals[2].scale),
        applyAttraction(animals[3].agent.location, 0.15 * animals[3].scale, -0.2 * animals[3].scale),
        applyAttraction(animals[4].agent.location, 0.15 * animals[4].scale, -0.2 * animals[4].scale),
        applyAttraction(animals[5].agent.location, 0.15 * animals[5].scale, -0.2 * animals[5].scale),
        applyAttraction(animals[6].agent.location, 0.15 * animals[6].scale, -0.2 * animals[6].scale),
        applyAttraction(animals[7].agent.location, 0.15 * animals[7].scale, -0.2 * animals[7].scale),
        applyPullBack(0.1),
        applyVelocity(),
        applyFriction(0.1)
      )
    );

    var positions = this.mesh.geometry.attribs.position.data;
    var normals = this.mesh.geometry.attribs.normal.data;
    this.mesh.geometry.attribs.position.isDirty = true;
    this.mesh.geometry.attribs.normal.isDirty = true;
    var positionsValues = [];
    this.particles.forEach(function(p, i) {
      Vec3.set(positions[i], p.position[0], p.position[1], p.position[2]);
      Vec3.set(normals[i], p.position[0], p.position[1], p.position[2]);
    });

    Time.endMeasuringTime('plantkon');
  };

  Plankton.prototype.draw = function(camera, timeSpeed) {
    //this.mesh.material.uniforms.time = Time.seconds * timeSpeed;
    this.mesh.draw(camera);
  };

  return Plankton;
});