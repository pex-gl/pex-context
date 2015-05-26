define (require) ->
  { min, sin, cos, PI } = Math
  class LSystemRenderer
    constructor: (@instance) ->
      @stack = []
      @twirl = 1
      @angle = 25
      @partLen = 0.1
      #console.log(@instance)
    draw: (canvas, paint) ->
      paint.setColor(255, 255, 150, 255);
      paint.setStroke();
      paint.setFlags(paint.kAntiAliasFlag)
      a = -90
      partLenRatio = @partLen
      th = 0
      partLenBase = 50
      length = 1;
      for i in [0..@instance.length-1]
        if @instance[i] != 'F' then break
        else length++
      partLenBase /= length
      angle /= length
      partLen = partLenBase * min(1.0, (partLenRatio - th)/(0.2))
      #var leafMinSize:Number = 5.0;
      #var leafMaxSize:Number = 10.0;
      px = cx = canvas.width / 2
      py = cy = canvas.height * 0.8
      angle = @angle
      level = 1

      for i in [0..@instance.length-1]
        paint.setStrokeWidth(5 / level)
        paint.setColor(255/level, 255/level, 150/level, 255);
        symbol = @instance[i]
        switch symbol[0]
          when 'F'
            a += @twirl;
            cx = cx + partLen*cos(a*PI/180)
            cy = cy + partLen*sin(a*PI/180)
            canvas.drawLine(paint, px, py, cx, cy)
            px = cx
            py = cy
          when 'I'
            a += @twirl;
            cx = cx + partLen*cos(a*PI/180)
            cy = cy + partLen*sin(a*PI/180)
            canvas.drawLine(paint, px, py, cx, cy)
            px = cx
            py = cy
          when 'L'
            paint.setColor(255, 255, 150, 50);
            cx = cx + partLen/2*cos(a*PI/180);
            cy = cy + partLen/2*sin(a*PI/180);
            canvas.drawLine(paint, px, py, cx, cy)
            #canvas.drawCircle(paint, cx, cy, 3);
            paint.setColor(255, 255, 150, 255);
            #var leaf:Shape = _leafs["leaf_"+i];
            #leaf.x = cx;
            #leaf.y = cy;
            #leaf.scaleX = leaf.scaleX + (1.0-leaf.scaleX)*0.1;
            #leaf.scaleY = leaf.scaleY + (1.0-leaf.scaleY)*0.1;
            #leaf.alpha = leafAlpha;
          when '-'
            a -= angle
          when '+'
            a += angle
          when '!'
            lineWidth *= 0.98;
            #lineStyle(lineWidth, lineColor, lineAlpha);
          when '['
            @stack.push({cx:cx, cy:cy, a:a, lineWidth:lineWidth, partLen:partLen, th:th, level:level});
            lineWidth *= 0.8;
            #lineStyle(lineWidth, lineColor);
            th += 0.1;
            level++
            #if partLenRatio < th
            #  partLen = 0;
            #else
            #  partLen = partLenBase * min(1.0, (partLenRatio - th)/(0.2))
          when ']'
            state = @stack.pop()
            cx = state.cx
            cy = state.cy
            a  = state.a
            px = cx
            py = cy
            level = state.level
            lineWidth = state.lineWidth
            #lineStyle(lineWidth, lineColor, lineAlpha)
            #partLen = state.partLen
            th = state.th
