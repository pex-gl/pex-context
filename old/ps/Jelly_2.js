define([
  'pex/geom/Vec2', 'pex/geom/Vec3', 'pex/geom/Vec4', 'pex/geom/Face3', 'pex/gl/Mesh', 'pex/materials', 'materials/JellyMaterial',
  'pex/geom/Geometry', 'pex/utils/Time', 'pex/gl/Context'
  ],
  function(Vec2, Vec3, Vec4, Face3, Mesh, materials, JellyMaterial, Geometry, Time, Context) {

  function Jelly(name, agent, scale, color) {
    this.name = name;
    this.agent = agent;
    this.wind = 0.00002;
    this.gravity = 0.0001;
    this.scale = scale || 1;
    this.color = color;
    this.colorShift = 0;
    this.time = 0;

    this.joints = [
      Vec3.fromValues(0,0,0),
      Vec3.fromValues(0,0,0),
      Vec3.fromValues(0,0,0),
      Vec3.fromValues(0,0,0),
      Vec3.fromValues(0,0,0),
      Vec3.fromValues(0,0,0),
      Vec3.fromValues(0,0,0),
      Vec3.fromValues(0,0,0),
      Vec3.fromValues(0,0,0)
    ],
    this.joints2 = [
      Vec3.fromValues(0,0,0),
      Vec3.fromValues(0,0,0),
      Vec3.fromValues(0,0,0),
      Vec3.fromValues(0,0,0),
      Vec3.fromValues(0,0,0),
      Vec3.fromValues(0,0,0),
      Vec3.fromValues(0,0,0),
      Vec3.fromValues(0,0,0),
      Vec3.fromValues(0,0,0)
    ];
    this.tentacles = [];

    var d = 0.01;
    var numTentacles = 1;
    var totalNumNodes = 0;
    for(var i=0; i<numTentacles; i++) {
      var tentacle = {
        nodes:[],
        offset: Vec3.fromValues((Math.random()-0.5) * d, (Math.random()-0.5) * d, 0),
        length: d + Math.random() * d,
        spacing: d + Math.random() * d,
        friction: d * 0.8 + Math.random() * d * 0.5
      };
      var numNodes = Math.floor(14);
      totalNumNodes += numNodes;
      for(var j=0; j<numNodes; j++) {
        var node = {};
        node.position = Vec3.fromValues(0,j * tentacle.spacing,0);
        node.oldPosition = Vec3.fromValues(0,0,0);
        node.velocity = Vec3.fromValues(0,0,0);
        tentacle.nodes.push(node);
      }
      this.tentacles.push(tentacle);
    }

    this.material = new JellyMaterial({color: Vec4.fromValues(1, 1, 1, 0.1)});

    //tmp vectors
    this.dir = Vec3.create();
    this.forward = Vec3.create();
    this.right = Vec3.create();
    this.up = Vec3.create();

    //-numTentacles because we skip last node in each tentacle
    var numVertices = (totalNumNodes - numTentacles) * 2 * 3 * 2;

    this.geometry = new Geometry({
      position : {
        type: 'Vec3',
        length : numVertices
      },
      texCoord : {
        type : 'Vec2',
        length : numVertices
      }
    });

    this.update();
  }

  Jelly.prototype.updateTentacles = function() {
    var dir = this.dir;
    this.tentacles.forEach(function(tentacle, ti) {
      var nodes = tentacle.nodes;
      nodes[0].position[0] = this.agent.position[0];
      nodes[0].position[1] = this.agent.position[1];
      nodes[0].position[2] = 0;

      var velocityAngle = Math.atan2(this.agent.velocity[1], this.agent.velocity[0]);

      var vx = Math.cos(velocityAngle);
      var vy = Math.sin(velocityAngle);

      for(var i=1; i<nodes.length; i++) {
        var node = nodes[i];
        nodes[i].position[0] = nodes[0].position[0] - i * tentacle.spacing * vx;
        nodes[i].position[1] = nodes[0].position[1] - i * tentacle.spacing * vy;
        nodes[i].position[2] = nodes[0].position[2];
      }

      /*
      var k = (ti - this.tentacles.length/2);
      nodes[1].position[0] = nodes[0].position[0] - vx * tentacle.spacing;
      nodes[1].position[1] = nodes[0].position[1] - vy * tentacle.spacing;
      nodes[1].position[2] = nodes[0].position[2];

      var prev = nodes[0];
      for(var i=1; i<nodes.length; i++) {
        var node = nodes[i];

        //where the node is now
        Vec3.add(node.position, node.position, node.velocity);

        //where is it going?
        Vec3.sub(dir, prev.position, node.position);
        Vec3.normalize(dir, dir);
        Vec3.scale(dir, dir, tentacle.spacing * tentacle.length)

        //push it away keeping constraints
        Vec3.sub(node.position, prev.position, dir);
        Vec3.sub(node.velocity, node.position, node.oldPosition);
        Vec3.scale(node.velocity, node.velocity, 1 - tentacle.friction);

        node.velocity[0] += this.wind;
        node.velocity[1] += this.gravity;

        Vec3.copy(node.oldPosition, node.position);

        prev = node;
      }
      */
    }.bind(this));
  };

  Jelly.prototype.rebuildTentacles = function(lineBuilder) {
    var geom = this.geometry;
    var positions = geom.attribs.position.data;
    var texCoords = geom.attribs.texCoord.data;
    var faces = geom.faces;

    var startSize = 0.1 * this.scale;

    var forward = this.forward;
    var right  = this.right;
    var up = this.up;

    var vertexIndex = 0;

    var firstTime = (this.mesh === undefined);

    geom.attribs.position.isDirty = true;
    geom.attribs.texCoord.isDirty = firstTime;

    if (this.agent.energy) {
      this.time += Time.delta * 4 * (0.2 + 0.8 * this.agent.energy);
    }

    var vertexPosition = this.vertexPosition || Vec3.create();

    for(i=0; i<this.tentacles.length; i++) {
      tentacle = this.tentacles[i];
      for(j=0; j<tentacle.nodes.length-1; j++) {
        for(var k=0; k<3; k++) {
          var t = (j + k/3) / (tentacle.nodes.length - 1);
          t = 1.0 - t;
          var size = startSize * (0.1 + Math.abs(Math.sin(t * t * Math.PI * 0.7)));

          size *= 0.75 + 0.25 * Math.cos(this.time + t * 5);
          var node = tentacle.nodes[j];
          var nextNode = tentacle.nodes[j+1];

          Vec3.sub(forward, nextNode.position, node.position);

          Vec3.scale(vertexPosition, forward, 1/3 * k);
          Vec3.add(vertexPosition, vertexPosition, node.position);

          if (j == 0) {
            if (forward[0] > forward[1]) Vec3.set(up, 0, 1, 0);
            else Vec3.set(up, 1, 0, 0);
            Vec3.normalize(forward, forward);
          }

          Vec3.cross(right, forward, up);
          Vec3.normalize(right, right);
          Vec3.cross(up, right, forward);
          Vec3.normalize(up ,up);
          Vec3.scale(up, up, size);

          for(var l=0; l<2; l++) {
            Vec3.scale(positions[vertexIndex], up, l);
            Vec3.add(positions[vertexIndex], positions[vertexIndex], vertexPosition);
            Vec3.sub(positions[vertexIndex  ], positions[vertexIndex], up);
            Vec3.scale(positions[vertexIndex+1], up, l+1);
            Vec3.add(positions[vertexIndex+1], positions[vertexIndex+1], vertexPosition);
            Vec3.sub(positions[vertexIndex+1], positions[vertexIndex+1], up);

            if (lineBuilder) lineBuilder.addLine(node.position, positions[vertexIndex  ]);
            if (lineBuilder) lineBuilder.addLine(node.position, positions[vertexIndex+1]);
            //if (lineBuilder) lineBuilder.addLine(node.position, nextNode.position);

            if (firstTime) {
              Vec2.set(texCoords[vertexIndex  ], 0, (j)/(tentacle.nodes.length-1));
              Vec2.set(texCoords[vertexIndex+1], 1, (j)/(tentacle.nodes.length-1));

              if (j < tentacle.nodes.length - 2) {
               faces.push(new Face3(vertexIndex + 0, vertexIndex + 1, vertexIndex + 4));
               faces.push(new Face3(vertexIndex + 1, vertexIndex + 4, vertexIndex + 5));
              }
            }

            vertexIndex += 2;
          }
        }
      }
    }

    if (firstTime) {
      this.mesh = new Mesh(this.geometry, this.material
      //  , { primitiveType : Context.currentContext.gl.LINES}
      );
    }
  };

  Jelly.prototype.update = function(lineBuilder) {
    this.updateTentacles();
    this.rebuildTentacles(lineBuilder);

    if (lineBuilder) {
      lineBuilder.addCross(this.agent.position);
      lineBuilder.addCross(this.agent.target);
      var vel = Vec3.create();
      Vec3.scale(vel, this.agent.velocity, 20);
      Vec3.add(vel, vel, this.agent.position);
      lineBuilder.addLine(this.agent.position, vel, Vec4.fromValues(1, 1, 0, 1))
    }
  };

  Jelly.prototype.draw = function(camera) {
    var gl = Context.currentContext.gl;
    gl.enable(gl.BLEND);
    gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
    gl.blendFuncSeparate( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA );
    gl.depthMask(0);

    var speed = this.agent.speed;//Vec3.length(this.agent.velocity);
    if (speed < 0) speed = 0;
    if (speed > 1) speed = 1;

    this.colorShift += Time.delta * speed * 1;

    this.mesh.material.uniforms.shift = this.colorShift;
    this.mesh.material.uniforms.energy = this.agent.energy;
    this.mesh.material.uniforms.color = this.color;
    this.mesh.draw(camera);

    gl.disable(gl.BLEND);
    gl.depthMask(1)
  };

  return Jelly;
});