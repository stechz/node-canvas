/**
 * Compat for changes from node 0.4.x to 0.6.x.
 */
try {
  try {
    module.exports = require('../build/Release/canvas');
  } catch (e) { try {
    module.exports = require('../build/default/canvas');
  } catch (e) {
    throw e;
  }}
} catch(e) {
  // Fall back to a JS implementation.

  var fs = require('fs');
  var code = require('../emscripten/ccanvas');
  function $(d, ret, params) {
    return code.cwrap(d, ret, params);
  }

  function CanvasGradient(x1, y1, x2, y2, r1, r2) {
    if (r1 === undefined || r2 === undefined) {
      var cons = $(
          'Gradient::Gradient(double, double, double, double)',
          undefined,
          ['i32', 'double', 'double', 'double', 'double']);
    } else {
      var cons = $(
          'Gradient::Gradient(double, double, double, double, double, double)',
          undefined,
          ['i32', 'double', 'double', 'double', 'double', 'double', 'double']);
    }

    this.ptr_ = $('operator new(unsigned int)', 'i32', ['number'])(256);
    cons(this.ptr_, x1, y1, x2, y2, r1, r2);
  }

  CanvasGradient.prototype = {
    addColorStop: function(offset, color) {
      $('Gradient::addColorStop(double, char const*)',
          undefined, ['i32', 'double', 'string'])
          (this.ptr_, offset, color);
    }
  };

  function PixelArray() {
  }

  PixelArray.prototype = {
  };

  function Image() {
    this.source_ = null;
    this.ptr_ = $('operator new(unsigned int)', 'i32', ['number'])(256);
    $('Image::Image()', undefined, ['i32'])(this.ptr_);
    $('Image::setDataMode(Image::data_mode_t)', undefined, ['i32', 'i32'])
        (this.ptr_, 2);
    this.surface =
        $('Image::surface()', 'i32', ['i32']).bind(null, this.ptr_);
  }

  Image.prototype = {
  };

  Object.defineProperty(Image.prototype, 'width', {
    get: function() {
      return this.width_;
    }
  });

  Object.defineProperty(Image.prototype, 'height', {
    get: function() {
      return this.height_;
    }
  });

  Object.defineProperty(Image.prototype, 'source', {
    get: function() {
      return this.source_;
    },

    set: function(src) {
      var onerr = this.onerror;
      var onload = this.onload;
      var self = this;
      function result(status) {
        if (status) {
          if (onerr) {
            onerr(new Error('Could not load file or buffer'));
          }
        } else {
          if (onload) {
            self.width_ =
                $('INT_cairo_image_surface_get_width', 'i32', ['i32'])
                (self.surface());
            self.height_ =
                $('INT_cairo_image_surface_get_height', 'i32', ['i32'])
                (self.surface());
            onload();
          }
        }
      }

      $('Image::clearData()', undefined, ['i32'])(this.ptr_);
      var loadFromBuffer = $(
          'Image::loadFromBuffer(unsigned char*, unsigned int)',
          'i32', ['i32', 'array', 'i32']);

      if (Buffer.isBuffer(src)) {
        result(loadFromBuffer(this.ptr_, src, src.length));
      } else {
        var buffer = fs.readFile(src, function(err, data) {
          result(loadFromBuffer(self.ptr_, data, data.length));
        });
      }
    }
  });

  function Canvas(width, height) {
    var cons = $('Canvas::Canvas(int, int, canvas_type_t)',
        undefined, ['i32', 'number', 'number', 'number']);
    this.ptr_ = $('operator new(unsigned int)', 'i32', ['number'])(256);
    cons(this.ptr_, width, height, 0);
    this.surface =
        $('Canvas::surface()', 'i32', ['i32']).bind(null, this.ptr_);
    this.width = width;
    this.height = height;
  }

  Canvas.prototype = {
    streamPNGSync: function(callback) {
      var write = $('cairo_surface_write_to_png', 'i32', ['i32', 'string']);
      write(this.surface(), 'stream.png');
      var contents = code.getFile('stream.png');
      var buf = new Buffer(contents.length);
      for (var i = 0; i < contents.length; i++) {
        buf[i] = contents[i];
      }
      callback(null, buf, buf.length);
    }
  };

  function Context2d(canvas) {
    var cons = $('Context2d::Context2d(Canvas*)', undefined, ['i32', 'i32']);
    this.ptr_ = $('operator new(unsigned int)', 'i32', ['number'])(256);
    cons(this.ptr_, canvas.ptr_);
  }

  //proto->SetAccessor(String::NewSymbol("patternQuality"), GetPatternQuality, SetPatternQuality);
  //proto->SetAccessor(String::NewSymbol("globalCompositeOperation"), GetGlobalCompositeOperation, SetGlobalCompositeOperation);
  //proto->SetAccessor(String::NewSymbol("globalAlpha"), GetGlobalAlpha, SetGlobalAlpha);
  //proto->SetAccessor(String::NewSymbol("shadowColor"), GetShadowColor, SetShadowColor);
  //proto->SetAccessor(String::NewSymbol("fillColor"), GetFillColor);
  //proto->SetAccessor(String::NewSymbol("strokeColor"), GetStrokeColor);
  //proto->SetAccessor(String::NewSymbol("miterLimit"), GetMiterLimit, SetMiterLimit);
  //proto->SetAccessor(String::NewSymbol("shadowOffsetX"), GetShadowOffsetX, SetShadowOffsetX);
  //proto->SetAccessor(String::NewSymbol("shadowOffsetY"), GetShadowOffsetY, SetShadowOffsetY);
  //proto->SetAccessor(String::NewSymbol("shadowBlur"), GetShadowBlur, SetShadowBlur);
  //proto->SetAccessor(String::NewSymbol("antialias"), GetAntiAlias, SetAntiAlias);
  //proto->SetAccessor(String::NewSymbol("textDrawingMode"), GetTextDrawingMode, SetTextDrawingMode);

  Context2d.prototype = {
    context: function() {
      return $('Context2d::context()', 'i32', ['i32'])(this.ptr_);
    },

    clearRect: function(x, y, w, h) {
      if (w == 0 || h == 0) {
        return;
      }
      var ctx = this.context();
      $('Context2d::savePath()', undefined, ['i32'])(this.ptr_);
      $('cairo_rectangle', undefined,
          ['i32', 'double', 'double', 'double', 'double'])(ctx, x, y, w, h);
      $('INT_cairo_save', undefined, ['i32']) (ctx);
      $('INT_cairo_set_operator', undefined,
          ['i32', 'i32']) (ctx, 0, y, w, h);
      $('cairo_fill', undefined, ['i32']) (ctx);
      $('Context2d::restorePath()', undefined, ['i32'])(this.ptr_);
      $('INT_cairo_restore', undefined, ['i32']) (ctx);
    },

    translate: function(x, y) {
      var ctx = this.context();
      x = x || 0;
      y = y || 0;
      $('INT_cairo_translate', undefined, ['i32', 'double', 'double'])
          (ctx, x, y);
    },

    beginPath: function() {
      $('INT_cairo_new_path', undefined, ['i32'])(this.context());
    },

    _setStrokeColor: function(color) {
      $('Context2d::setStrokeColor(char const*)',
          undefined, ['i32', 'string'])
          (this.ptr_, color);
    },

    _setStrokePattern: function(pattern) {
      if (pattern.addColorStop && pattern.ptr_) {
        $('Context2d::setStrokeGradient(Gradient*)', undefined,
            ['i32', 'i32'])(this.ptr_, pattern.ptr_);
      }
    },

    _setFillColor: function(color) {
      $('Context2d::setFillColor(char const*)',
          undefined, ['i32', 'string'])
          (this.ptr_, color);
    },

    _setFillPattern: function(pattern) {
      if (pattern.addColorStop && pattern.ptr_) {
        $('Context2d::setFillGradient(Gradient*)', undefined,
            ['i32', 'i32'])(this.ptr_, pattern.ptr_);
      }
    },

    arc: function(a0, a1, a2, a3, a4, ccw) {
      var ctx = this.context();
      if (ccw && Math.PI * 2 != a4) {
        $('cairo_arc_negative', undefined,
            ['i32', 'double', 'double', 'double', 'double'])
            (ctx, a0, a1, a2, a3, a4);
      } else {
        $('cairo_arc', undefined,
            ['i32', 'double', 'double', 'double', 'double'])
            (ctx, a0, a1, a2, a3, a4);
      }
    },

    stroke: function(preserve) {
      $('Context2d::stroke(bool)', undefined, ['i1', 'bool'])
          (this.ptr_, preserve);
    },

    strokeRect: function(x, y, w, h) {
      if (w == 0 || h == 0) {
        return;
      }
      var ctx = this.context();
      $('Context2d::savePath()', undefined, ['i32'])(this.ptr_);
      $('cairo_rectangle', undefined,
          ['i32', 'double', 'double', 'double', 'double'])(ctx, x, y, w, h);
      this.stroke();
      $('Context2d::restorePath()', undefined, ['i32'])(this.ptr_);
    },

    fill: function(preserve) {
      $('Context2d::fill(bool)', undefined, ['i1', 'bool'])
          (this.ptr_, preserve);
    },

    moveTo: function(x, y) {
      $('INT_cairo_move_to', undefined, ['double', 'double'])
          (this.context(), x, y);
    },

    lineTo: function(x, y) {
      $('INT_cairo_line_to', undefined, ['double', 'double'])
          (this.context(), x, y);
    },

    save: function() {
      $('Context2d::save()', undefined, ['i32'])(this.ptr_);
    },

    restore: function() {
      $('Context2d::restore()', undefined, ['i32'])(this.ptr_);
    },

    fillRect: function(x, y, w, h) {
      if (w == 0 || h == 0) {
        return;
      }
      var ctx = this.context();
      $('Context2d::savePath()', undefined, ['i32'])(this.ptr_);
      $('cairo_rectangle', undefined,
          ['i32', 'double', 'double', 'double', 'double'])(ctx, x, y, w, h);
      this.fill();
      $('Context2d::restorePath()', undefined, ['i32'])(this.ptr_);
    },

    drawImage: function(img, sx, sy, sw, sh, dx, dy, dw, dh) {
      if (!img.width || !img.height) {
        throw new Error('Invalid image.');
      }
      if (arguments.length <= 5) {
        dx = sx;
        dy = sy;
        if (arguments.length == 5) {
          dw = sw;
          dh = sh;
        } else {
          dw = img.width;
          dh = img.height;
        }
        sw = 0;
        sy = 0;
        sw = this.width;
        sh = this.height;
      } else if (arguments.length != 9) {
        throw new Error('Invalid arguments');
      }

      var ctx = this.context();
      $('INT_cairo_save', undefined, ['i32'])(ctx);
      $('Context2d::savePath()', undefined, ['i32'])(this.ptr_);
      $('cairo_rectangle', undefined,
          ['i32', 'double', 'double', 'double', 'double'])
          (ctx, dx, dy, dw, dh);
      $('cairo_clip', undefined, ['i32'])(ctx);
      $('Context2d::restorePath()', undefined, ['i32'])(this.ptr_);

      if (dw != sw || dh != sh) {
        $('INT_cairo_scale', undefined, ['i32', 'double', 'double'])
            (ctx, dw / sw, dh / sh);
      }

      $('INT_cairo_set_source_surface', undefined,
          ['i32', 'i32', 'double', 'double'])
          (ctx, img.surface(), dx / (dw / sw) - sx, dy / (dh / sh) - sy);
      // TODO pattern quality
      // TODO globalAlpha
      $('cairo_paint_with_alpha', undefined, ['i32', 'double'])(ctx, 1);
    }
  };

  Object.defineProperty(Context2d.prototype, 'lineCap', {
    get: function() { return this.lineCap_; },
    set: function(lc) {
      var type;
      if (lc == 'butt') {
        type = 0;
      } else if (lc == 'round') {
        type = 1;
      } else if (lc == 'square') {
        type = 2;
      } else {
        return;
      }
      this.lineCap_ = lc;
      $('INT_cairo_set_line_cap', undefined, ['i32', 'i32'])
          (this.context(), type);
    }
  });

  Object.defineProperty(Context2d.prototype, 'lineJoin', {
    get: function() { return this.lineJoin_; },
    set: function(lj) {
      var type;
      if (lc == 'miter') {
        type = 0;
      } else if (lc == 'round') {
        type = 1;
      } else if (lc == 'bevel') {
        type = 2;
      } else {
        return;
      }
      this.lineJoin_ = lj;
      $('INT_cairo_set_line_join', undefined, ['i32', 'i32'])
          (this.context(), type);
    }
  });

  Object.defineProperty(Context2d.prototype, 'lineWidth', {
    get: function() { return this.lineWidth_; },
    set: function(lw) {
      if (lw > 0) {
        this.lineWidth_ = lw;
        $('INT_cairo_set_line_width', undefined, ['i32', 'double'])
            (this.context(), lw);
      }
    }
  });

  module.exports = {
    Canvas: Canvas,
    CanvasRenderingContext2d: Context2d,
    Image: Image,
    CanvasPixelArray: PixelArray,
    CanvasGradient: CanvasGradient
  };

  console.log('ready to roll');
}
