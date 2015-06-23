var Platform = require('./Platform');

var requestAnimFrame    = null;

if (Platform.isBrowser) {
  requestAnimFrame = function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
      window.setTimeout(callback, 1000 / 60);
    };
  }();
}

var WebGLContextNames = [
    'experimental-webgl2',
    'webgl2',
    'experimental-webgl',
    'webgl'
];

var DefaultWebGLContextOptions = {
    alpha                           : true,
    depth                           : true,
    stencil                         : false,
    antialias                       : true,
    premultipliedAlpha              : true,
    preserveDrawingBuffer           : false,
    preferLowPowerToHighPerformance : false,
    failIfMajorPerformanceCaveat    : false
};

function getWebGLContext(canvas, contextOptions) {
    var gl = null;
    for(var i=0; i<WebGLContextNames.length; i++) {
        try {
            gl = canvas.getContext(WebGLContextNames[i], contextOptions);
            if (gl) {
                break;
            }
        }
        catch (err) {
        }
    }
    return gl;
}

function simpleWindow(obj) {
    //TODO: add option to provide canvas reference
    canvas = document.createElement('canvas');

    //TODO: add fullscreen / fullwindow support
    //TODO: add retina DPI x2 support
    //TODO: add default width, height support
    canvas.width = obj.settings.width;
    canvas.height = obj.settings.height;
    obj.width = canvas.width;
    obj.height = canvas.height;

    //TODO: add MSAA multisample support
    //TODO: add stencil option support
    //TODO: add premultipliedAlpha support
    //TODO: add preserveDrawingBuffer support
    var contextOptions = DefaultWebGLContextOptions;

    function drawloop() {
        obj.draw();
        requestAnimFrame(drawloop);
    }

    //TODO: add framerate support?
    function go() {
        obj.gl = getWebGLContext(canvas, contextOptions);

        if (obj.gl === null) {
            throw new Error('WindowBrowser: No WebGL context is available.');
        }

        obj.init();
        requestAnimFrame(drawloop);
    }

    if (!canvas.parentNode) {
        //Window already loaded, or script inside body
        if (document.body) {
            document.body.appendChild(canvas);
            go();
        }
        else {
            //Wait for window to load
            window.addEventListener('load', function() {
                document.body.appendChild(canvas);
                go();
            }, false);
        }
    }
    else {
        //Canvas element node already attached, ready to go
        go();
    }
}

var WindowBrowser = {
    simpleWindow : simpleWindow
}

module.exports = WindowBrowser;
