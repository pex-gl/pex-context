//Code ported by Marcin Ignac (2014)
//Based on Java implementation from
//https://code.google.com/r/cys12345-research/source/browse/hdr/image_processor/RGBE.java?r=7d84e9fd866b24079dbe61fa0a966ce8365f5726
var radiancePattern = "#\\?RADIANCE"
var commentPattern = "#.*"
var gammaPattern = "GAMMA=";
var exposurePattern = "EXPOSURE=\\s*([0-9]*[.][0-9]*)";
var formatPattern = "FORMAT=32-bit_rle_rgbe";
var widthHeightPattern = "-Y ([0-9]+) \\+X ([0-9]+)";

function parseHdr(buffer) {
  var fileOffset = 0;
  var len = buffer.length;

  var NEW_LINE = 10;

  function readLine() {
    var buf = "";
    do {
      var b = buffer[fileOffset];
      if (b == NEW_LINE) {
        ++fileOffset
        break;
      }
      buf += String.fromCharCode(b);
    } while(++fileOffset < len);
    return buf;
  }

  function readBuf(buf) {
    var bytesRead = 0;
    do {
      buf[bytesRead++] = buffer[fileOffset];
    } while(++fileOffset < len && bytesRead < buf.length);
    return bytesRead;
  }

  function readBufOffset(buf, offset, length) {
    var bytesRead = 0;
    do {
      buf[offset + bytesRead++] = buffer[fileOffset];
    } while(++fileOffset < len && bytesRead < length);
    return bytesRead;
  }

  var width = 0;
  var height = 0;
  var exposure = 1;
  var gamma = 1;
  var rle = false;

  for(var i=0; i<20; i++) {
    var line = readLine();
    var match;
    if (match = line.match(radiancePattern)) {
    }
    else if (match = line.match(formatPattern)) {
      rle = true;
    }
    else if (match = line.match(exposurePattern)) {
      exposure = Number(match[1]);
    }
    else if (match = line.match(commentPattern)) {
    }
    else if (match = line.match(widthHeightPattern)) {
      height = Number(match[1]);
      width = Number(match[2]);
      break;
    }
  }

  if (!rle) {
    throw "File is not run length encoded!";
  }

  var data = new Array(width * height * 4);
  var rgbe = new Array(4);
  var scanline_buffer = null;
  var ptr;
  var ptr_end;
  var count;
  var buf = new Array(2);
  var scanline_width = width;
  var num_scanlines = height;
  var dataOffset = 0;

  while (num_scanlines > 0) {
    if (readBuf(rgbe) < rgbe.length) {
      throw "Error reading bytes: expected " + rgbe.length;
    }
    if ((((rgbe[2] & 0xFF)<<8) | (rgbe[3] & 0xFF)) != scanline_width) {
      throw "Wrong scanline width " + (((rgbe[2] & 0xFF)<<8) | (rgbe[3] & 0xFF)) + ", expected " + scanline_width;
    }

    if (scanline_buffer == null) {
      scanline_buffer = new Array(4*scanline_width);
    }

    ptr = 0;
    /* read each of the four channels for the scanline into the buffer */
    for (var i=0; i<4; i++) {
      ptr_end = (i+1)*scanline_width;
      while(ptr < ptr_end) {
        if (readBuf(buf) < buf.length) {
          throw "Error reading 2-byte buffer";
        }
        if ((buf[0] & 0xFF) > 128) {
          /* a run of the same value */
          count = (buf[0] & 0xFF) - 128;
          if ((count == 0) || (count > ptr_end - ptr)) {
            throw "Bad scanline data";
          }
          while(count-- > 0)
            scanline_buffer[ptr++] = buf[1];
        }
        else {
          /* a non-run */
          count = buf[0] & 0xFF;
          if ((count == 0) || (count > ptr_end - ptr)) {
            console.log(count, ptr_end - ptr);
            throw "Bad scanline data";
          }
          scanline_buffer[ptr++] = buf[1];
          if (--count > 0) {
            if (readBufOffset(scanline_buffer, ptr, count) < count) {
              throw "Error reading non-run data";
            }
            ptr += count;
          }
        }
      }
    }

    var maxRGB = 0;
    var maxA = 0;

    /* copy byte data to output */
    for(var i = 0; i < scanline_width; i++) {
      data[dataOffset++] = scanline_buffer[i];
      data[dataOffset++] = scanline_buffer[i+scanline_width];
      data[dataOffset++] = scanline_buffer[i+2*scanline_width];
      data[dataOffset++] = scanline_buffer[i+3*scanline_width];
      maxRGB = Math.max(maxRGB, data[dataOffset-4],data[dataOffset-3], data[dataOffset-2])
      maxA = Math.max(maxA, data[dataOffset-1])
    }
    console.log(maxRGB, maxA);
    num_scanlines--;
  }

  return {
    width: width,
    height: height,
    exposure: exposure,
    gamma: gamma,
    data: data
  }
}

module.exports = parseHdr;