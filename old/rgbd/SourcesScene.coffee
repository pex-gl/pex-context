define (require) ->
  { Vec2, Vec3, Mat4, Rect, BoundingBox } = require('pex/geom')
  { Color } = require('pex/color')
  { Platform } = require('pex/sys')
  FileListLoader = require('utils/FileListLoader')
  RGBDConfig = require('./RGBDConfig')
  RGBDSource = require('./RGBDSource')
  RGBDMesh = require('./RGBDMesh')

  class Range
    constructor: (@min, @max) ->

  arrayToMatrix = (a) ->
    m = new Mat4()
    m.a11 = a[ 0]; m.a21 = a[ 1]; m.a31 = a[ 2]; m.a41 = a[ 3];
    m.a12 = a[ 4]; m.a22 = a[ 5]; m.a32 = a[ 6]; m.a42 = a[ 7];
    m.a13 = a[ 8]; m.a23 = a[ 9]; m.a33 = a[10]; m.a43 = a[11];
    m.a14 = a[12]; m.a24 = a[13]; m.a34 = a[14]; m.a44 = a[15];
    m

  eastToNorth = arrayToMatrix([
    0.981072  , 0.00656891, -0.0347343, 0
    -0.0108849, 0.0552883 , -0.978296 , 0
    -0.0170464, 0.989516  , 0.064136  , 0
    88.1066   , -2478.57  , 2317.1    , 1
  ])

  southToEast = arrayToMatrix([
    0.98549  , 0.000936639, 0.0545441 , 0
    0.0457432, -0.0533124 , -0.966846 , 0
    0.0139733, 0.979619   , -0.0116734, 0
    -94.4681 , -2407.71   ,  2395.83  , 1
  ])

  westToSouth = arrayToMatrix([
    0.975498   , -0.0209898, -0.0117508 , 0
    -0.00202263, -0.0280472, -0.933555  , 0
    0.052469   , 0.960172  , 0.000256468, 0
    -59.6155   , -2314.71  , 2291.14    , 1
  ])


  sourceDescriptions = [
    {
      image: 'assets/videos/03_Anthony/03_Anthony.png'
      video: 'assets/videos/03_Anthony/03_Anthony_Combo_LG.webmhd.webm'
      configs: [
        'assets/videos/03_Anthony/xml/01_NORTH_TAKE_07_19_13_43_16_comp_0_07_21_15_27_32_depthProperties.xml'
        'assets/videos/03_Anthony/xml/02_EAST_03_TAKE_07_19_13_43_04_comp_0_07_21_18_58_22_depthProperties.xml'
        'assets/videos/03_Anthony/xml/03_SOUTH_03_TAKE_07_19_13_43_52_comp_0_07_22_08_58_19_depthProperties.xml'
        'assets/videos/03_Anthony/xml/04_WEST_03_TAKE_07_19_13_43_53_comp_0_07_22_01_35_03_depthProperties.xml'
      ]
    },
    {
      image: 'assets/videos/02_Ondine/02_Ondine.png'
      video: 'assets/videos/02_Ondine/02_Ondine_Combo_LG.webmhd.webm'
      configs: [
        'assets/videos/02_Ondine/xml/02_TAKE_07_19_13_28_10_comp_1_align_08_09_11_35_07_NORTH.xml'
        'assets/videos/02_Ondine/xml/02_TAKE_07_19_13_27_58_comp_1_align_08_09_11_35_19_EAST.xml'
        'assets/videos/02_Ondine/xml/02_TAKE_07_19_13_28_09_comp_1_align_08_09_12_59_32_SOUTH.xml'
        'assets/videos/02_Ondine/xml/02_TAKE_07_19_13_28_26_comp_1_align_08_09_11_34_49_WEST.xml'
      ]
    },
    {
      image: 'assets/videos/04_redJacket/04_redJacket_Combo_still.png'
      video: 'assets/videos/04_redJacket/04_redJacket_Combo_LG.webmhd.webm'
      configs: [
        'assets/videos/04_redJacket/xml/04_TAKE_07_19_14_03_37_comp_1_align_08_15_00_55_37_NORTH.xml'
        'assets/videos/04_redJacket/xml/04_TAKE_07_19_14_03_33_comp_3_align_08_15_00_56_13_EAST.xml'
        'assets/videos/04_redJacket/xml/04_TAKE_07_19_14_03_30_comp_1_align_08_15_00_56_47_SOUTH.xml'
        'assets/videos/04_redJacket/xml/04_TAKE_07_19_14_03_42_comp_1_align_08_15_00_57_29_WEST.xml'
      ]
    },
    {
      image: 'assets/videos/05_Luca/05_Luca_Combo_still.png'
      video: 'assets/videos/05_Luca/05_Luca_Combo_LG.webmhd.webm'
      configs: [
        'assets/videos/05_Luca/xml/05_TAKE_07_19_14_24_34_comp_0_08_15_02_19_37_NORTH.xml'
        'assets/videos/05_Luca/xml/05_TAKE_07_19_14_24_22_comp_3_Align_08_15_02_19_23_EAST.xml'
        'assets/videos/05_Luca/xml/05_TAKE_07_19_14_24_27_comp_1_align_08_15_02_19_02_SOUTH.xml'
        'assets/videos/05_Luca/xml/05_TAKE_07_19_14_24_45_comp_1_align_08_15_02_18_22_WEST.xml'
      ]
    },
    {
      image: 'assets/videos/07_mrHat/07_mrHat_Combo_still.png'
      video: 'assets/videos/07_mrHat/07_mrHat_Combo.webmhd.webm'
      configs: [
        'assets/videos/07_mrHat/xml/07_TAKE_07_19_15_21_10_comp_1_align_08_22_22_15_03_NORTH.xml'
        'assets/videos/07_mrHat/xml/07_TAKE_07_19_15_21_09_comp_2_align_08_22_22_14_08_EAST.xml'
        'assets/videos/07_mrHat/xml/07_TAKE_07_19_15_21_09_comp_1_align_08_22_22_13_34_SOUTH.xml'
        'assets/videos/07_mrHat/xml/07_TAKE_07_19_15_21_25_comp_1_align_08_22_22_12_37_WEST.xml'
      ]
    },
    {
      image: 'assets/videos/10_anthonyOndine/10_anthonyOndine_still.png'
      video: 'assets/videos/10_anthonyOndine/10_anthonyOndine.webmhd.webm'
      configs: [
        'assets/videos/10_anthonyOndine/xml/10_TAKE_07_19_15_55_06_comp_1_align_08_22_20_22_12_NORTH.xml'
        'assets/videos/10_anthonyOndine/xml/10_TAKE_07_19_15_55_18_comp_3_align_08_22_20_19_47_EAST.xml'
        'assets/videos/10_anthonyOndine/xml/10_TAKE_07_19_15_55_00_comp_1_align_08_22_20_18_34_SOUTH.xml'
        'assets/videos/10_anthonyOndine/xml/10_TAKE_07_19_15_55_05_comp_1_align_08_22_20_23_29_WEST.xml'
      ]
    },
    {
      image: 'assets/videos/11_twoGuys/11_twoGuys_align_still.png'
      video: 'assets/videos/11_twoGuys/11_twoGuys_align.webmhd.webm'
      configs: [
        'assets/videos/11_twoGuys/xml/11_TAKE_07_19_16_03_42_comp_1_align_08_22_16_09_00_NORTH.xml'
        'assets/videos/11_twoGuys/xml/11_TAKE_07_19_16_03_34_comp_4_align_08_22_16_19_53_EAST.xml'
        'assets/videos/11_twoGuys/xml/11_TAKE_07_19_16_03_45_comp_2_align_08_22_16_08_19_SOUTH.xml'
        'assets/videos/11_twoGuys/xml/11_TAKE_07_19_16_03_46_comp_1_align_08_22_17_49_05_WEST.xml'
      ]
    }
  ]

  #sourceDescriptions = sourceDescriptions.slice(0, 1)

  class SourcesScene
    sources: null
    constructor: (window, onLoadComplete) ->
      @sources = []
      @cameraTarget = new Vec3( 0.41942750910425, -350,  2639)
      @modelCenter = new Vec3( @cameraTarget.x, @cameraTarget.y + 225 + 100, @cameraTarget.z);
      @modelBaseCenter = new Vec3(@cameraTarget.x, @cameraTarget.y - 770 + 100, @cameraTarget.z)
      @modelGroundLevel = -1970.0
      boundingBoxSize = new Vec3(1200, 2000, 1200)
      @boundingBox = BoundingBox.fromPositionSize(
        @modelCenter,
        boundingBoxSize
      );
      @effectBoundingBox = BoundingBox.fromPositionSize(
        @modelCenter,
        new Vec3(boundingBoxSize.x*2, boundingBoxSize.y, boundingBoxSize.z*2)
      );

      totalLoaded = 0

      sourceDescriptions.slice(0, 8).forEach (sourceDescription, sourceIndex) =>
        FileListLoader.loadTextFiles sourceDescription.configs, (configFilesXmls) =>
          configs = configFilesXmls.map (xml) -> RGBDConfig.parse(xml)
          @initSources(configs, sourceDescription.image, sourceDescription.video, sourceIndex)
          ++totalLoaded
          console.log('SourcesScene.totalLoaded', totalLoaded)
          if totalLoaded == sourceDescriptions.length
            onLoadComplete(this) if onLoadComplete

    initSources: (configs, image, video, sourceId) ->
      westMatrix = new Mat4()
      southMatrix = new Mat4().asMul(westMatrix, westToSouth)
      eastMatrix = new Mat4().asMul(southMatrix, southToEast)
      northMatrix = new Mat4().asMul(eastMatrix, eastToNorth)

      names = ['North', 'East', 'South', 'West']
      matrices = [northMatrix, eastMatrix, southMatrix, westMatrix]
      colors = [new Color(0, 0, 1), new Color(1, 1, 0), new Color(1, 0, 0), new Color(0, 1, 0)]

      @channels = channels = []
      for i in [0..3]
        channels[i] =
          name: names[i]
          color: colors[i]
          offset: new Vec3(i * 320, 0)
          fov: new Vec2(configs[i].fovx, configs[i].fovy)
          depthRange: new Range(configs[i].minDepth, configs[i].maxDepth)
          kinectMatrix: matrices[i]
          matrix: new Mat4().identity().rotate(-Math.PI/2, 0, 0, 1).mul(matrices[i])
          enabled: true

      @sources[sourceId] = new RGBDSource({
        image: image
        video: if Platform.isBrowser then video else null
        textureSize: new Vec2(1280, 480)
        depthRect: new Rect(0, 240, 320, 240)
        colorRect: new Rect(0, 0, 320, 240)
        groundLevel: @modelGroundLevel
        channels: channels
        boundingBox: @boundingBox
      })

      @sources.forEach (source,i ) ->
        source.name = (source.image || source.video).replace('assets/', '')
        source.value = i

      if !@mesh
        @mesh = new RGBDMesh(@sources[sourceId])
        @lowResMesh = new RGBDMesh(@sources[sourceId], 2)