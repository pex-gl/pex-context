#<depth>
#    <fovx>570.342224121</fovx>
#    <fovx>570.342224121</fovx>
#    <ppx>320.000000000</ppx>
#    <ppy>240.000000000</ppy>
#    <width>640.000000000</width>
#    <height>480.000000000</height>
#    <minDepth>0.000000000</minDepth>
#    <maxDepth>5999.999511719</maxDepth>
#</depth>

define (require) ->
  { IO } = require('pex/sys')

  class RGBDConfig
    @load = (path, callback) ->
      IO.loadTextFile path, (xml) ->
        config = @parse(xml)
        callback(config) if callback

    @parse = (xml) ->
      config = {}
      lines = xml.split('\n')
      lines.forEach (line) ->
        match = line.match(/<([^>]+)>([^<]+)<\/([^>]+)>/)
        if match
          tagName = match[1]
          tagValue = match[2]
          config[tagName] = Number(tagValue)
      config

