# Compiling the dependencies

This was the result of a lot of trial and error, and I don't remember the
precise steps I took. This is more of a rough outline than instructions.

Luckily, you don't have to compile it to try it out. Just gunzip
`ccanvas.js.gz` in the `emscripten` directory to run the examples.

## Emscripten

You'll need to set up emscripten and your own compiled version of clang.  You
can start here: https://github.com/kripken/emscripten/

## libpng

Download libpng: http://www.libpng.org/pub/png/libpng.html

Compile using `emconfigure ./configure` and `emmake make`.

Remove all the object files that are for examples (anything with a `main`) and
make sure there aren't object files with duplicate symbols. I think libpng
compiles the same files two different ways: `libpng-xxx.o` and
`libpng12-xxx.o`.

## cairo and pixman

Download cairo and pixman: http://www.cairographics.org/download/

pixman should be fairly straightforward. For cairo, there will be some issues
around finding these dependencies you just made. You can copy `pixman.pc` and
`libpng.pc` to your cairo directory, and edit them to point to the right
directories. The linking flags aren't important. Only the includes need to
work.

cairo doesn't compile completely for me, but it gets far enough for all the
necessary object files.

## zlib

emscripten comes with zlib. You will need to compile it. zlib can be found in
`tests/zlib`.

## Producing ccanvas.js

Run `emscripten/emcc.sh` from the root directory. You will need to edit
`emscripten/emcc.me.sh` to point to where your source directories are located.

# Working demos

The following are working for me in `examples`:
- `clock.js`
- `crop.js`
- `gradients.js`
- `state.js`

## Follow-up work

This is mostly a proof of concept at this point. I think it has a lot of
potential. The examples run in less than 2 seconds for O2 builds on my machine,
which includes parsing time.

- Get the rest of the examples working. The biggest API needed right now is
  pixel data access to canvas elements and lots of misc API implementations.
- Profiling the JS to see what can be made faster. I'm guessing we lose some
  speed without fast pixel pushing, and I'm not sure what can really be done
  about that without some access to vector primitives.
- Benchmark to node-canvas with compiled version.
- JPEG/GIF support.
- There is probably a much better way to do `binding.js` with an automated
  approach.

# Acknowledgements

- Without emscripten, this wouldn't have been possible. Special thanks to
  my friend kripken for help with bugs. :)
- Thanks to node-module for writing a node version of canvas!
