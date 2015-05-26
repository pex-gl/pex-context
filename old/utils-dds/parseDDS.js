//Code ported by Marcin Ignac (2014)
//Based on C++ implementation from ORGRE Engine http://ogre.org
var radiancePattern = "#\\?RADIANCE"
var commentPattern = "#.*"
var gammaPattern = "GAMMA=";
var exposurePattern = "EXPOSURE=\\s*([0-9]*[.][0-9]*)";
var formatPattern = "FORMAT=32-bit_rle_rgbe";
var widthHeightPattern = "-Y ([0-9]+) \\+X ([0-9]+)";

//var DDSCAPS_COMPLEX = 0x00000008;
//var DDSCAPS_TEXTURE = 0x00001000;
var DDSCAPS_MIPMAP = 0x00400000;
var DDSCAPS2_CUBEMAP = 0x00000200;
//var DDSCAPS2_CUBEMAP_POSITIVEX = 0x00000400;
//var DDSCAPS2_CUBEMAP_NEGATIVEX = 0x00000800;
//var DDSCAPS2_CUBEMAP_POSITIVEY = 0x00001000;
//var DDSCAPS2_CUBEMAP_NEGATIVEY = 0x00002000;
//var DDSCAPS2_CUBEMAP_POSITIVEZ = 0x00004000;
//var DDSCAPS2_CUBEMAP_NEGATIVEZ = 0x00008000;
var DDSCAPS2_VOLUME = 0x00200000;

var DDPF_FOURCC = 0x00000004;
var DDPF_RGB = 0x00000040;

var D3DFMT_R16F            = 111;
var D3DFMT_G16R16F         = 112;
var D3DFMT_A16B16G16R16F   = 113;
var D3DFMT_R32F            = 114;
var D3DFMT_G32R32F         = 115;
var D3DFMT_A32B32G32R32F   = 116;

function FOURCC(c0, c1, c2, c3) {
  return (c0.charCodeAt(0) | (c1.charCodeAt(0) << 8) | (c2.charCodeAt(0) << 16) | (c3.charCodeAt(0) << 24));
}

function buf2UInt(buf) {
  return (buf[0] | (buf[1] << 8) | (buf[2] << 16) | (buf[3] << 24));
}

function parseDDS(buffer, verbose) {
  verbose = true;

  var fileOffset = 0;
  var len = buffer.length;

  var NEW_LINE = 10;

  function readBuf(buf, numChars) {
    var bytesRead = 0;
    do {
      buf[bytesRead++] = buffer[fileOffset];
    } while(++fileOffset < len && bytesRead < numChars);
    return bytesRead;
  }

  function readUInt(buf) {
    readBuf(buf, 4);
    return buf2UInt(buf);
  }

  function readUIntArray(buf, n) {
    var result = [];
    for(var i=0; i<n; i++) {
      readBuf(buf, 4);
      result.push(buf2UInt(buf));
    }
  }

  function readFloat(buf) {
    var f = buffer.readFloatLE(fileOffset);
    fileOffset += 4;
    return f;
  }

  var buf = new Array(4);

  //read file type
  var fileType = readUInt(buf);
  if (FOURCC('D', 'D', 'S', ' ') != fileType) {
    throw 'Not a DDS file ' + buf + ' ' + FOURCC('D', 'D', 'S', ' ') + ' != ' + fileType;
    return;
  }

  //read header
  var size = readUInt(buf);
  var flags = readUInt(buf);
  var height = readUInt(buf);
  var width = readUInt(buf);
  var sizeOrPitch = readUInt(buf);
  var depth = readUInt(buf);
  var mipMapCount = readUInt(buf);

  var reserved1 = readUIntArray(buf, 11);

  //pixel format
  var pixelFormatSize = readUInt(buf);
  var pixelFormatFlags = readUInt(buf);
  var pixelFormatFourCC = readUInt(buf);
  var pixelFormatRgbBits = readUInt(buf);
  var pixelFormatRedMask = readUInt(buf);
  var pixelFormatGreenMask = readUInt(buf);
  var pixelFormatBlueMask = readUInt(buf);
  var pixelFormatAlphaMask = readUInt(buf);

  //caps
  var caps1 = readUInt(buf);
  var caps2 = readUInt(buf);
  var caps3 = readUInt(buf);
  var caps4 = readUInt(buf);

  //reserved
  var reserved2 = readUInt(buf);


  if (verbose) console.log('DDS', 'size', size, 'flags', flags, 'height', height, 'width', width, 'sizeOrPitch', sizeOrPitch, 'depth', depth, 'mipMapCount', mipMapCount);
  console.log(fileOffset);

  if (caps1 & DDSCAPS_MIPMAP) {
    console.log('DDS has mipmaps', mipMapCount - 1);
  }

  if (caps2 & DDSCAPS2_CUBEMAP) {
    throw 'DDS Cube maps not supported';
  }
  else if (caps2 & DDSCAPS2_VOLUME) {
    throw 'DDS Volumetric textures not supported';
  }

  var pixelFormat = undefined;

  if (pixelFormatFlags & DDPF_FOURCC) {
    throw 'DDS FourCC pixel format not supported';
  }
  else {
    console.log('DDS rgbBits', pixelFormatRgbBits);
    //console.log('DDS expectedFileSize', width * height);
  }

  if (mipMapCount) {
    var mipMapLevel = 0;
    var totalSize = fileOffset;
    while (mipMapLevel < mipMapCount) {
      console.log('DDS mipmap', mipMapLevel, '/', mipMapCount - 1, width, height);

      var data = [];
      for(var i=0; i<width*height*3; i+=3) {
        if (i < 1024*500) {
          data.push(readFloat() * 255);
          data.push(readFloat() * 255);
          data.push(readFloat() * 255);
          //if (Math.random() > 0.99) console.log(readFloat());
          data.push(255);
          //data.push(0);
        }
        else {
          //data.push(Math.floor(Math.random() * 255))
          data.push(255, 0, 0, 255);
        }
      }

      return {
        width: width,
        height: height,
        exposure: 1,
        gamma: 1,
        data: data
      }

      totalSize += width * height * 3 * pixelFormatRgbBits / 8;
      width /= 2;
      height /= 2;
      mipMapLevel++;
    }
    console.log('DDS totalSize', totalSize, 3 * 5592532 - totalSize);
  }
  else {
  }

  return {
    //width: width,
    //height: height,
    //exposure: exposure,
    //gamma: gamma,
    //data: data
  }
}

module.exports = parseDDS;