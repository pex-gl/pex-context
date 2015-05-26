define (require) ->
  Config = require('flora/game/Config')

  class VideosPanel
    constructor: () ->
      if (typeof(document) == 'undefined') then return
      videoElements = document.querySelectorAll("#videos video")
      @professorVideo = document.querySelector("#professorVideo video")
      @professorImage = document.querySelector("#professorVideo img")

      for i in [0...3]
        videoElements[i].setAttribute('src', Config.projection.videos[i].path)
        videoElements[i].parentNode.style.left = (40 + i * 297 + i * (1050-80-3*297)/2) + 'px';

      @professorVideo.setAttribute('src', Config.projection.professorVideo.path)

      @professorVideoOpacity = 0

    showFeedback: (state) ->
      if (typeof(document) == 'undefined') then return
      @professorVideoOpacity = if state then 1 else 0
      @professorVideo.style.opacity = @professorVideoOpacity
      @professorImage.style.opacity = @professorVideoOpacity