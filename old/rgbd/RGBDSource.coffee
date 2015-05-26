define (require) ->
	{ Texture2D } = require('pex/gl')
	{ Platform } = require('pex/sys')
	{ Time } = require('pex/utils')
	class RGBDSource
		playing: true
		seek: 0
		constructor: ({@image, @video, @textureSize, @depthRect, @colorRect, @boundingBox, @rotate, @channels, @groundLevel}) ->
			@rotate ?= false
			@ready = false
			if @image
				@texture = @imageTexture = Texture2D.load(@image, () => @ready = true)
			if @video
				@videoTexture = Texture2D.create(200, 200)
				gl = @videoTexture.gl
				@videoTexture.bind()
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

		initVideo: () ->
			@videoElem = document.createElement('video')
			@videoElem.preload = 'auto';
			@videoElem.type = 'video/webm; codecs="vp8, vorbis"'
			@videoElem.src = @video
			@videoElem.volume = 0
			#document.body.appendChild(@videoElem)
			@videoElem.addEventListener('canplaythrough', (() => @ready = true; @videoElem.play()), true)
			@videoElem.addEventListener('ended', (() => @videoElem.play()), true)

		update: () ->
			@texture = @imageTexture

			if @video
				if @playing && !@videoElem then @initVideo()
				if @playing && @videoElem.paused then @videoElem.play()
				if !@playing && @videoElem && !@videoElem.paused then @videoElem.pause()
				if @playing && @ready
					@texture = @videoTexture
					if Time.frameNumber % 2 == 0
						if @videoElem.readyState == @videoElem.HAVE_ENOUGH_DATA
							@seek = @videoElem.currentTime
							if @playing
								gl = @texture.gl
								@texture.bind()
								gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
								gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, @videoElem)
			return @ready