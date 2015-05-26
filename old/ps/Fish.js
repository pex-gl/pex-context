define([
  'pex/geom/Vec2', 'pex/geom/Vec3', 'pex/geom/Vec4', 'pex/geom/Face3', 'pex/gl/Mesh', 'pex/materials', 'materials/FishMaterial',
  'pex/geom/Geometry', 'pex/utils/Time', 'pex/gl/Context'
  ],
  function(Vec2, Vec3, Vec4, Face3, Mesh, materials, JellyMaterial, Geometry, Time, Context) {

  function Fish(name, agent, scale, color) {
    this.name = name;
    this.agent = agent;
    this.wind = 0.00002;
    this.gravity = 0.0001;
    this.scale = scale || 1;
    this.color = color;
    this.colorShift = 0;

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

    var d = 0.12;
    var numTentacles = 3;
    var totalNumNodes = 0;
    for(var i=0; i<numTentacles; i++) {
      var tentacle = {
        nodes:[],
        offset: Vec3.fromValues((Math.random()-0.5) * d, (Math.random()-0.5) * d, 0),
        length: d + Math.random() * d,
        spacing: d * 1.5,
        friction: 2 * (d * 0.8 + Math.random() * d * 0.5)
      };
      var numNodes = 10;
      if (i > 0) numNodes = 6;
      totalNumNodes += numNodes;
      for(var j=0; j<numNodes; j++) {
        var node = {};
        node.position = Vec3.fromValues(0,0,0);
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

  Fish.prototype.updateTentacles = function() {
    var dir = this.dir;

    var velocityAngle = Math.atan2(this.agent.velocity[1], this.agent.velocity[0]);

    this.tentacles.forEach(function(tentacle, ti) {
      var nodes = tentacle.nodes;
      nodes[0].position[0] = this.agent.position[0];
      nodes[0].position[1] = this.agent.position[1];
      nodes[0].position[2] = 0;

      var spreadAngle = 30;
      var k = 1;
      if (ti == 1) k = -1;

      var prev = nodes[0];
      for(var i=1; i<nodes.length; i++) {
        var node = nodes[i];

        //where the node is now
        Vec3.add(node.position, node.position, node.velocity);

        //where is it going?
        Vec3.sub(dir, prev.position, node.position);
        Vec3.normalize(dir, dir);
        Vec3.scale(dir, dir, tentacle.spacing * tentacle.length * this.scale)

        //push it away keeping constraints
        Vec3.sub(node.position, prev.position, dir);
        Vec3.sub(node.velocity, node.position, node.oldPosition);
        Vec3.scale(node.velocity, node.velocity, 1 - tentacle.friction);

        node.velocity[0] += this.wind;
        node.velocity[1] += this.gravity;

        Vec3.copy(node.oldPosition, node.position);

        prev = node;
      }

      if (ti > 0) {
        for(var j=1; j<nodes.length; j++) {
          var node = nodes[j];
          nodes[j].position[0] = nodes[j-1].position[0] - tentacle.spacing * 0.18 * this.scale * Math.cos(velocityAngle + k*Math.PI*spreadAngle/180)
          nodes[j].position[1] = nodes[j-1].position[1] - tentacle.spacing * 0.18 * this.scale * Math.sin(velocityAngle + k*Math.PI*spreadAngle/180)
          nodes[j].position[2] = nodes[j-1].position[2];
        }
      }
    }.bind(this));
  };

  Fish.prototype.rebuildTentacles = function(lineBuilder) {
    var geom = this.geometry;
    var positions = geom.attribs.position.data;
    var texCoords = geom.attribs.texCoord.data;
    var faces = geom.faces;

    var startSize = 0.04 * this.scale;

    var forward = this.forward;
    var right  = this.right;
    var up = this.up;

    var firstTime = (this.mesh === undefined);

    geom.attribs.position.isDirty = true;
    geom.attribs.texCoord.isDirty = firstTime;

    var vertexIndex = 0;

    var vertexPosition = this.vertexPosition || Vec3.create();

    for(i=0; i<this.tentacles.length; i++) {
      tentacle = this.tentacles[i];
      for(j=0; j<tentacle.nodes.length-1; j++) {
        var node = tentacle.nodes[j];
        var nextNode = tentacle.nodes[j+1];

        for(var k=0; k<3; k++) {
          var t = (j + k/3) / (tentacle.nodes.length - 1);
          t = 1.0 - t;
          //var size = startSize * (0.1 + Math.sin(Math.PI * t));
          //var size = startSize * (1.0 - j / tentacle.nodes.length);
          var falloff = Math.pow(Math.sin(t * Math.PI), 0.2);
          var size = startSize * (0.1 + Math.max(0, Math.sin(t * t * t * Math.PI)));
          if (i > 0) size *= 0.4;

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

            if (lineBuilder) lineBuilder.addLine(vertexPosition, positions[vertexIndex  ]);
            if (lineBuilder) lineBuilder.addLine(vertexPosition, positions[vertexIndex+1]);

            if (firstTime) {
              Vec2.set(texCoords[vertexIndex  ], 0 + l * 0.5, (j + k/3)/(tentacle.nodes.length-1));
              Vec2.set(texCoords[vertexIndex+1], 0.5 + l * 0.5, (j + k/3)/(tentacle.nodes.length-1));

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

    if (!this.mesh) {
      this.mesh = new Mesh(this.geometry, this.material);
    }
  };

  Fish.prototype.update = function(lineBuilder) {
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

  Fish.prototype.draw = function(camera) {
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

  return Fish;
});