var TextureCube = require('pex-glu').TextureCube;
var Platform = require('pex-sys').Platform;
var IO = require('../sys/IO');

function log2(x) {
  return Math.log(x) / Math.LN2;
}

//https://github.com/playcanvas/engine/blob/master/src/resources/resources_texture.js
//https://github.com/dariomanesku/cmft/issues/7#issuecomment-69516844
function loadDDS(gl, file) {
  var texture = new TextureCube();
  var fullFilePath = file;

  IO.loadBinaryFile(file, function(buf) {
    var header = new Uint32Array(buf);

    var width = header[4];
    var height = header[3];
    var mips = Math.max(header[7], 1);
    var isFourCc = header[20] === 4;
    var fcc = header[21];
    var bpp = header[22];

    var fccDxt1 = 827611204; // DXT1
    var fccDxt5 = 894720068; // DXT5
    var fccFp32 = 116; // RGBA32f

    var format = null;
    var compressed = false;
    var floating = false;
    if (isFourCc) {
        if (fcc===fccDxt1) {
            format = 'PIXELFORMAT_DXT1';
            compressed = true;
        } else if (fcc===fccDxt5) {
            format = 'PIXELFORMAT_DXT5';
            compressed = true;
        } else if (fcc===fccFp32) {
            format = 'PIXELFORMAT_RGBA32F';
            floating = true;
        }
    }
    else {
        if (bpp===32) {
            format = 'PIXELFORMAT_R8_G8_B8_A8';
        }
    }

    var headerSize = 128;
    var requiredMips = Math.round(log2(Math.max(width, height)) + 1);

    console.log('loadDDS', header[1], width, height, bpp, 'format:' + format, fcc, mips, requiredMips);

    //check for DX10 header
    if (fcc == 808540228) {
      var dx10Header = new Uint32Array(buf.slice(128, 128 + 20));
      headerSize = 128 + 20;
      console.log('loadDDS', 'DX10 Header found');
      var format = dx10Header[0];
      var resourceDimension = dx10Header[1];
      var miscFlag = dx10Header[2];
      var arraySize = dx10Header[3];
      var miscFlags2 = dx10Header[4];

      var D3D10_RESOURCE_DIMENSION_TEXTURE2D = 3;
      var DXGI_FORMAT_R32G32B32A32_FLOAT = 2;
      if (resourceDimension == D3D10_RESOURCE_DIMENSION_TEXTURE2D && format == DXGI_FORMAT_R32G32B32A32_FLOAT) {
        floating = true;
        format = 'PIXELFORMAT_RGBA32F';
      }
      console.log('loadDDS DX10', format, resourceDimension, miscFlag, arraySize, miscFlags2);
    }

    var cantLoad = !format || (mips !== requiredMips && compressed);
    if (cantLoad) {
        var errEnd = ". Empty texture will be created instead.";
        if (!format) {
            console.error("This DDS pixel format is currently unsupported" + errEnd);
        } else {
            console.error("DDS has " + mips + " mips, but engine requires " + requiredMips + " for DXT format. " + errEnd);
        }
        return new TextureCube();
    }

    var texOptions = {
        width: width,
        height: height,
        format: format
    };

    texture.width = width;
    texture.height = height;

    var mipWidth = width;
    var mipHeight = height;
    var mipSize;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture.handle);

    var cubeMapTargets = [
      gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    ];

    console.log('loadDDS', width, height, 'mips:', mips, 'float:', floating);

    if (Platform.isBrowser) {
      var textureFloatExt = gl.getExtension('OES_texture_float');
      var textureFloatLinerExt = gl.getExtension('OES_texture_float_linear');
    }

    //http://msdn.microsoft.com/en-us/library/windows/desktop/bb205577(v=vs.85).aspx
    for(var j=0; j<6; j++) {
      for(var i=0; i<mips; i++) {
        var mipWidth = width / Math.pow(2, i);
        var mipHeight = height / Math.pow(2, i);
        var bpp = floating ? 4 * 4 : 4;
        mipSize = mipWidth * mipHeight * bpp;
        var offset = headerSize;
        offset += width * height * bpp * (1 - Math.pow(0.25, i)) / (1 - 0.25);
        offset += j * width * height * bpp * (1 - Math.pow(0.25, mips)) / (1 - 0.25);
        var texDataSize = mipWidth * mipHeight * 4;
        var texData = floating ? new Float32Array(buf.slice(offset, offset + mipSize)) : new Uint8Array(buf.slice(offset, offset + mipSize));
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture.handle);
        if (Platform.isBrowser) {
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        }
        gl.texImage2D(cubeMapTargets[j], i, gl.RGBA, mipWidth, mipHeight, 0, gl.RGBA, floating ? gl.FLOAT : gl.UNSIGNED_BYTE, texData);
      }
    }

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    texture.ready = true;
  })
  //gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  return texture;
}

module.exports = loadDDS;