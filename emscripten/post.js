function __ZN2v82V837AdjustAmountOfExternalAllocatedMemoryEi() {}
function __ZN2v811HandleScopeC1Ev() {}
function __ZN2v816FunctionTemplate3NewEPFNS_6HandleINS_5ValueEEERKNS_9ArgumentsEES3_NS1_INS_9SignatureEEE() {}

function getSlice(ptr, len) {
  return HEAP8.slice(ptr, len);
}
Module['getSlice'] = getSlice;

function getFile(name) {
  var obj = FS.findObject(name);
  return obj.contents;
}
Module['getFile'] = getFile;

module['exports'] = Module;

function ccall(ident, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var func = Module.demangled[ident];
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
Module["ccall"] = ccall;
if (!Module.demangled) { Module.demangled = {}; }
Module.demangled['INT_cairo_image_surface_get_width'] = _INT_cairo_image_surface_get_width;
Module.demangled['INT_cairo_image_surface_get_height'] = _INT_cairo_image_surface_get_height;
Module.demangled['cairo_surface_write_to_png'] = _cairo_surface_write_to_png;
Module.demangled['cairo_rectangle'] = _cairo_rectangle;
Module.demangled['INT_cairo_save'] = _INT_cairo_save;
Module.demangled['INT_cairo_set_operator'] = _INT_cairo_set_operator;
Module.demangled['cairo_fill'] = _cairo_fill;
Module.demangled['INT_cairo_restore'] = _INT_cairo_restore;
Module.demangled['INT_cairo_translate'] = _INT_cairo_translate;
Module.demangled['INT_cairo_new_path'] = _INT_cairo_new_path;
Module.demangled['cairo_arc_negative'] = _cairo_arc_negative;
Module.demangled['cairo_arc'] = _cairo_arc;
Module.demangled['cairo_rectangle'] = _cairo_rectangle;
Module.demangled['INT_cairo_move_to'] = _INT_cairo_move_to;
Module.demangled['INT_cairo_line_to'] = _INT_cairo_line_to;
Module.demangled['cairo_clip'] = _cairo_clip;
Module.demangled['INT_cairo_scale'] = _INT_cairo_scale;
Module.demangled['INT_cairo_set_source_surface'] = _INT_cairo_set_source_surface;
Module.demangled['cairo_paint_with_alpha'] = _cairo_paint_with_alpha;
Module.demangled['INT_cairo_set_line_cap'] = _INT_cairo_set_line_cap;
Module.demangled['INT_cairo_set_line_join'] = _INT_cairo_set_line_join;
Module.demangled['INT_cairo_set_line_width'] = _INT_cairo_set_line_width;
