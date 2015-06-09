var TextureCube = require('pex-glu').TextureCube;
var fs          = require('fs');



function log2(x) {
  return Math.log(x) / Math.LN2;
}

function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}

function loadDDSMipMaps(gl, path) {
  var levels = ['m00', 'm01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07'];
  var sides = ['c00', 'c01', 'c02', 'c03', 'c04', 'c05'];

  var cubeMapFiles = [];
  levels.forEach(function(level) {
    sides.forEach(function(side) {
      cubeMapFiles.push(path.replace('##', level).replace('##', side));
    });
  });

  cubeMapFilesData = cubeMapFiles.map(loadDDS);

  var cubeMapTargets = [
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
  ];

  var mips = levels.length;

  var texture = new TextureCube();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture.handle);

  var width = 128;
  var height = 128;
  var floating = true;

  texture.width = 128;
  texture.height = 128;
  texture.depth = 128;

  var image = 0;
  //http://msdn.microsoft.com/en-us/library/windows/desktop/bb205577(v=vs.85).aspx
  for(var i=0; i<mips; i++) {
    for(var j=0; j<6; j++) {
      var mipWidth = width / Math.pow(2, i);
      var mipHeight = height / Math.pow(2, i);

      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture.handle);
      gl.texImage2D(cubeMapTargets[j], i, gl.RGBA, mipWidth, mipHeight, 0, gl.RGBA, floating ? gl.FLOAT : gl.UNSIGNED_BYTE, cubeMapFilesData[image++]);
    }
  }

  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

  return texture;
}

function loadDDS(path) {
  var data = fs.readFileSync(path);
  var buf = toArrayBuffer(data);
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

  //check for DX10 header
  if (fcc == 808540228) {
    var dx10Header = new Uint32Array(buf.slice(128, 128 + 20));
    headerSize = 128 + 20;
    console.log('DX10 Header found');
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
    console.log(format, resourceDimension, miscFlag, arraySize, miscFlags2);
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

  var offset = headerSize;
  var bpp = floating ? 4 * 4 : 4;
  var mipSize = width * height * bpp;

  var texData = floating ? new Float32Array(buf.slice(offset, offset + mipSize)) : new Uint8Array(buf.slice(offset, offset + mipSize));

  return texData;
}

module.exports = loadDDSMipMaps;
