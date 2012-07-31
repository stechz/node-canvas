#!/bin/bash
set -e

if [ ! -d emscripten ]; then
  echo Could not find emscripten directory. Are you running from project root?
  exit 1
fi

if [ ! -f emscripten/emcc.me.sh ]; then
  cat << EOF > emscripten/emcc.me.sh
NODE=/usr/local/include/node
EMSCRIPTEN=$HOME/projects/emscripten/
LIBPNG=$HOME/Downloads/libpng-1.2.50/
PIXMAN=$HOME/Downloads/pixman-0.26.2/
CAIRO=$HOME/Downloads/cairo-1.12.2/
PATH=\$EMSCRIPTEN:\$PATH
EMSCRIPTEN_FLAGS=-g  # for debugging
# EMSCRIPTEN_FLAGS=-O2  # for optimized
EOF
  echo Generated 'emscripten/emcc.me.sh'. Please edit it and re-run 'emcc.sh'.
  exit 1
fi

cat << EOF > /tmp/postjs.js
var fname = eval('process')['argv'][2];
var fname2 = eval('process')['argv'][2];
var demangle = cwrap('__cxa_demangle', 'string', ['string']);
var path = require('path');
var fs = require('fs');
var outjs = fs.readFileSync(fname, 'utf-8');
var stream = fs.createWriteStream(fname2);
w = stream['write'].bind(stream);
w(outjs);
w('\nif (!Module.demangled) { Module.demangled = {}; }');
outjs.replace(/^function _(\w+)/gm, function(_, match) {
  var d = demangle(match);
  if (d && d != '(null)') {
    w('\nModule.demangled["' + d + '"] = _' + match + ';');
  }
});
stream['end']();
EOF

source emscripten/emcc.me.sh
PRE_JS='var Module={ "noInitialRun":true };'
echo $PRE_JS > /tmp/prejs.js

emcc -DEMSCRIPTEN -I$EMSCRIPTEN/third_party -I$CAIRO -I$NODE \
    $EMSCRIPTEN/third_party/gcc_demangler.c -o emscripten/demangler.js \
    --pre-js /tmp/prejs.js --post-js /tmp/postjs.js

emcc -DEMSCRIPTEN -I$CAIRO -I$NODE $EMSCRIPTEN_FLAGS \
    src/Canvas.cc src/CanvasGradient.cc src/CanvasPattern.cc \
    src/CanvasRenderingContext2d.cc src/color.cc src/Image.cc \
    src/ImageData.cc src/init.cc src/PixelArray.cc \
    -o emscripten/canvas.o

emcc --pre-js /tmp/prejs.js --post-js emscripten/post.js \
    emscripten/canvas.o \
    $LIBPNG/*.o $PIXMAN/pixman/*.o $CAIRO/src/*.o $EMSCRIPTEN/tests/zlib/*.o \
    $EMSCRIPTEN_FLAGS -o emscripten/ccanvas.js \
    --js-transform "node emscripten/demangler.js"
