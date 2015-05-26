define (require) ->
  pex = require('pex')

  { Window, Platform } = pex.sys
  { PerspectiveCamera, Arcball, Scene } = pex.scene
  { SolidColor, Diffuse, ShowDepth, ShowNormals } = pex.materials
  { Mesh, Texture2D, RenderTarget, Viewport, ScreenImage } = pex.gl
  { hem, Vec3, Geometry, Edge, Mat4, Spline3D } = pex.geom
  { Cube, Octahedron, Sphere, Dodecahedron, Icosahedron, LineBuilder } = pex.geom.gen
  { Color } = pex.color
  { Time, MathUtils } = pex.utils
  { map } = MathUtils
  { cos, sin, PI, sqrt, abs, random, floor, min, max, exp, log } = Math
  { GUI } = pex.gui

  pex.require ['flora/plants/lsys', 'lib/PerlinNoise'], (lsys, Cylinder, PerlinNoise) ->
    { LSystem, LSystemRenderer, Rule } = lsys
    console.log(lsys)
    Window.create
      settings:
        fullscreen: Platform.isBrowser
        type: '2d3d'
      init: () ->
        ###
        chwast = new LSystem("F", [
          new Rule("F", "F[+F]F[-F]F")
        ])

        chwast2 = new LSystem("F", [
          new Rule("F", "F+F--F+F")
        ])

        wodorost = new LSystem("F", [
          new Rule("F", "FF-[-F+F+F]+[+F-F-F]")
        ])

        tree = new LSystem("X", [
          new Rule("X", "F-[[X]+X]+F[+FX]-X"),
          new Rule("F", "FF")
        ])

        widelkiSys = new LSystem("X", [
          new Rule("X", "F[+X][-X]FX"),
          new Rule("F", "FF")
        ])

        mech = new LSystem("X", [
          new Rule("X", "F[+X]F[-X]+X"),
          new Rule("F", "FF")
        ])

        leafs = new LSystem("X", [
          new Rule("X", "F-[[X]+X]+F[+FX]-XL"),
          new Rule("F", "FF")
        ])

        leafs2 = new LSystem("X", [
          new Rule("X", "F-[[LX]+X]+F[L+FX]-XL"),
          new Rule("F", "FF")
        ])

        leafs3 = new LSystem("X", [
          new Rule("X", "F-[[LX]+X]+F[L+FX]-XL"),
          new Rule("F", "F!F")
        ])

        leafs4 = new LSystem("X", [
          new Rule("X", "XX"),
          new Rule("F", "FF")
        ])

        newPlant = new LSystem("F", [
          new Rule("F", "FF[---L][--L][-L][+L][++L][+++L]"),
          new Rule("L", "[+F][++F][+++F]")
        ])

        herb1 = new LSystem("a", [
          new Rule("a", "F[+L][-L]a"),
          new Rule("a", "F[-L]A"),
          new Rule("L", "FF[+F][-F]"),
          new Rule("A", "K")
        ])

        herb2 = new LSystem("a", [
          new Rule("a", "F[+L][-L]a"),
          new Rule("a", "F[+L][-L]A"),
          new Rule("A", "F[+L][-L][-b][+b]a"),
          new Rule("A", "F[+L][-L][-B][+B]B"),
          new Rule("b", "F[+L][-L]b"),
          new Rule("b", "F[+L][-L]B"),
          new Rule("B", "F[K]B"),
        ])

        c = 0.05
        herb3 = new LSystem("a", [
          new Rule("a", "I[L]a", c),
          new Rule("a", "I[L]A", c),
          new Rule("A", "I[L][+b]-A", c),
          new Rule("A", "I[L][-b]+B", c),
          new Rule("b", "I[L]-b", c),
          new Rule("b", "I[L]+B", c),
          new Rule("B", "I[L][-c]-B", c),
          new Rule("B", "I[L][+c]+C", c),
          new Rule("c", "I[L]c", c),
          new Rule("c", "I[L]C", c),
          new Rule("C", "I[K]C", c),
          new Rule("C", "K"),
          #new Rule("L", "[-F][+F]")
          new Rule("I", "F")
        ])
        ###
        herb4 = new LSystem([["F",0]],[
          #new Rule("F", "F[+F][-F]F")
          #new Rule(["F"], ["F"],["["],["+"],["F"],["]"],["["],["-"],["F"],["]"],["F"],["]"],)
          new Rule(["F", 5], [["I"],["F"]])
          new Rule(["F", 8], [["F"],["["],["+"],["F"],["]"],["["],["-"],["F"],["]"]])
          new Rule(["F", 14], [["I"],["F"]])
          new Rule(["F", 15], [["F"],["["],["+"],["F"],["]"],["["],["-"],["F"],["]"]])
        ])

        @lsystemRenderer = new LSystemRenderer(herb4.generate(10))

        @on('mouseMoved', (e) =>
          @lsystemRenderer.twirl = MathUtils.map(e.x, 0, @width, -25, 25)
          @lsystemRenderer.angle = MathUtils.map(e.y, 0, @height, 70, 0)
        )

      draw: () ->
        @canvas.drawColor(40, 40, 40, 255);
        if @lsystemRenderer then @lsystemRenderer.draw(@canvas, @paint)