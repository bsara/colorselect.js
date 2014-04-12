/**
 * pickacolor.js
 * Author: Brandon Sara (bsara)
 * Original Author of "Color Picker": Stefan Petre www.eyecon.ro
 *
 * Dual licensed under the MIT and GPL-3.0 licenses
 */

(function ($) {
  var PickAColor = function () {
    var pickerCSSClass = "pickacolor";
    var pickerHeight   = 176;
    var pickerWidth    = 356;

    var ids = {};
    var inAction;
    var charMin = 65;
    var visible;
    var htmlString = '<div class="' + pickerCSSClass + '">'
                     + '<div class="' + pickerCSSClass + '_color"><div><div></div></div></div>'
                     + '<div class="' + pickerCSSClass + '_hue"><div></div></div>'
                     + '<div class="' + pickerCSSClass + '_new_color"></div>'
                     + '<div class="' + pickerCSSClass + '_current_color"></div>'
                     + '<div class="' + pickerCSSClass + '_hex"><input type="text" maxlength="6" size="6" /></div>'
                     + '<div class="' + pickerCSSClass + '_rgb_r ' + pickerCSSClass + '_field"><input type="text" maxlength="3" size="3" /><span></span></div>'
                     + '<div class="' + pickerCSSClass + '_rgb_g ' + pickerCSSClass + '_field"><input type="text" maxlength="3" size="3" /><span></span></div>'
                     + '<div class="' + pickerCSSClass + '_rgb_b ' + pickerCSSClass + '_field"><input type="text" maxlength="3" size="3" /><span></span></div>'
                     + '<div class="' + pickerCSSClass + '_hsb_h ' + pickerCSSClass + '_field"><input type="text" maxlength="3" size="3" /><span></span></div>'
                     + '<div class="' + pickerCSSClass + '_hsb_s ' + pickerCSSClass + '_field"><input type="text" maxlength="3" size="3" /><span></span></div>'
                     + '<div class="' + pickerCSSClass + '_hsb_b ' + pickerCSSClass + '_field"><input type="text" maxlength="3" size="3" /><span></span></div>'
                     + '<div class="' + pickerCSSClass + '_submit"></div>'
                   + '</div>';
    var defaults = {
      eventName: "click",
      onShow: function () {},
      onBeforeShow: function(){},
      onHide: function () {},
      onChange: function () {},
      onSubmit: function () {},
      color: "ff0000",
      livePreview: true,
      flat: false,
      position: "bottom"
    };

    var fillRGBFields = function (hsb, cal) {
      var rgb = hsbToRGB(hsb);
      $(cal).data(pickerCSSClass).fields
                                 .eq(1).val(rgb.r).end()
                                 .eq(2).val(rgb.g).end()
                                 .eq(3).val(rgb.b).end();
    };
    var fillHSBFields = function (hsb, cal) {
      $(cal).data(pickerCSSClass).fields
                                 .eq(4).val(hsb.h).end()
                                 .eq(5).val(hsb.s).end()
                                 .eq(6).val(hsb.b).end();
    };
    var fillHexFields = function (hsb, cal) {
      $(cal).data(pickerCSSClass).fields.eq(0).val(hsbToHex(hsb)).end();
    };

    var setSelector = function (hsb, cal) {
      $(cal).data(pickerCSSClass).selector.css("backgroundColor", "#" + hsbToHex({h: hsb.h, s: 100, b: 100}));
      $(cal).data(pickerCSSClass).selectorIndic.css({
        left: parseInt(150 * hsb.s/100, 10),
        top:  parseInt(150 * (100-hsb.b)/100, 10)
      });
    };
    var setHue = function (hsb, cal) {
      $(cal).data(pickerCSSClass).hue.css("top", parseInt(150 - 150 * hsb.h/360, 10));
    };
    var setCurrentColor = function (hsb, cal) {
      $(cal).data(pickerCSSClass).currentColor.css("backgroundColor", "#" + hsbToHex(hsb));
    };
    var setNewColor = function (hsb, cal) {
      $(cal).data(pickerCSSClass).newColor.css("backgroundColor", "#" + hsbToHex(hsb));
    };

    var keyup = function (ev) {
      var pressedKey = ev.charCode || ev.keyCode || -1;
      if ((pressedKey > charMin && pressedKey <= 90) || pressedKey === 32) {
        return false;
      }
      var cal = $(this).parent().parent();
      if (cal.data(pickerCSSClass).livePreview === true) {
        change.apply(this);
      }
    };

    var change = function (ev) {
      var cal = $(this).parent().parent();
      var color;
      if (this.parentNode.className.indexOf("_hex") > 0) {
        cal.data(pickerCSSClass).color = color = hexToHSB(fixHex(this.value));
      } else if (this.parentNode.className.indexOf("_hsb") > 0) {
        cal.data(pickerCSSClass).color = color = fixHSB({
          h: parseInt(cal.data(pickerCSSClass).fields.eq(4).val(), 10),
          s: parseInt(cal.data(pickerCSSClass).fields.eq(5).val(), 10),
          b: parseInt(cal.data(pickerCSSClass).fields.eq(6).val(), 10)
        });
      } else {
        cal.data(pickerCSSClass).color = color = rgbToHSB(fixRGB({
          r: parseInt(cal.data(pickerCSSClass).fields.eq(1).val(), 10),
          g: parseInt(cal.data(pickerCSSClass).fields.eq(2).val(), 10),
          b: parseInt(cal.data(pickerCSSClass).fields.eq(3).val(), 10)
        }));
      }
      if (ev) {
        fillRGBFields(color, cal.get(0));
        fillHexFields(color, cal.get(0));
        fillHSBFields(color, cal.get(0));
      }

      setSelector(color, cal.get(0));
      setHue(color, cal.get(0));
      setNewColor(color, cal.get(0));

      cal.data(pickerCSSClass).onChange.apply(cal, [color, hsbToHex(color), hsbToRGB(color)]);
    };

    var blur = function (ev) {
      var cal = $(this).parent().parent();
      cal.data(pickerCSSClass).fields.parent().removeClass(pickerCSSClass + "_focus");
    };

    var focus = function () {
      charMin = this.parentNode.className.indexOf("_hex") > 0 ? 70 : 65;
      $(this).parent().parent().data(pickerCSSClass).fields.parent().removeClass(pickerCSSClass + "_focus");
      $(this).parent().addClass(pickerCSSClass + "_focus");
    };

    var downIncrement = function (ev) {
      var field = $(this).parent().find("input").focus();
      var current = {
        el: $(this).parent().addClass(pickerCSSClass + "_slider"),
        max: this.parentNode.className.indexOf("_hsb_h") > 0 ? 360 : (this.parentNode.className.indexOf("_hsb") > 0 ? 100 : 255),
        y: ev.pageY,
        field: field,
        val: parseInt(field.val(), 10),
        preview: $(this).parent().parent().data(pickerCSSClass).livePreview
      };
      $(document).bind("mouseup", current, upIncrement);
      $(document).bind("mousemove", current, moveIncrement);
    };
    var moveIncrement = function (ev) {
      ev.data.field.val(Math.max(0, Math.min(ev.data.max, parseInt(ev.data.val + ev.pageY - ev.data.y, 10))));
      if (ev.data.preview) {
        change.apply(ev.data.field.get(0), [true]);
      }
      return false;
    };
    var upIncrement = function (ev) {
      change.apply(ev.data.field.get(0), [true]);
      ev.data.el.removeClass(pickerCSSClass + "_slider").find("input").focus();
      $(document).unbind("mouseup", upIncrement);
      $(document).unbind("mousemove", moveIncrement);
      return false;
    };

    var downHue = function (ev) {
      var current = {
        cal: $(this).parent(),
        y: $(this).offset().top
      };
      current.preview = current.cal.data(pickerCSSClass).livePreview;
      $(document).bind("mouseup", current, upHue);
      $(document).bind("mousemove", current, moveHue);
    };
    var moveHue = function (ev) {
      change.apply(
        ev.data.cal.data(pickerCSSClass)
          .fields
          .eq(4)
          .val(parseInt(360*(150 - Math.max(0,Math.min(150,(ev.pageY - ev.data.y))))/150, 10))
          .get(0),
        [ev.data.preview]
      );
      return false;
    };
    var upHue = function (ev) {
      fillRGBFields(ev.data.cal.data(pickerCSSClass).color, ev.data.cal.get(0));
      fillHexFields(ev.data.cal.data(pickerCSSClass).color, ev.data.cal.get(0));
      $(document).unbind("mouseup", upHue);
      $(document).unbind("mousemove", moveHue);
      return false;
    };

    var downSelector = function (ev) {
      var current = {
        cal: $(this).parent(),
        pos: $(this).offset()
      };
      current.preview = current.cal.data(pickerCSSClass).livePreview;
      $(document).bind("mouseup", current, upSelector);
      $(document).bind("mousemove", current, moveSelector);
    };
    var moveSelector = function (ev) {
      change.apply(
        ev.data.cal.data(pickerCSSClass)
                   .fields
                   .eq(6).val(parseInt(100*(150 - Math.max(0,Math.min(150,(ev.pageY - ev.data.pos.top))))/150, 10)).end()
                   .eq(5).val(parseInt(100*(Math.max(0,Math.min(150,(ev.pageX - ev.data.pos.left))))/150, 10)).get(0),
        [ev.data.preview]
      );
      return false;
    };
    var upSelector = function (ev) {
      fillRGBFields(ev.data.cal.data(pickerCSSClass).color, ev.data.cal.get(0));
      fillHexFields(ev.data.cal.data(pickerCSSClass).color, ev.data.cal.get(0));
      $(document).unbind("mouseup", upSelector);
      $(document).unbind("mousemove", moveSelector);
      return false;
    };

    var enterSubmit = function (ev) {
      $(this).addClass(pickerCSSClass + "_focus");
    };
    var leaveSubmit = function (ev) {
      $(this).removeClass(pickerCSSClass + "_focus");
    };
    var clickSubmit = function (ev) {
      var cal = $(this).parent();
      var color = cal.data(pickerCSSClass).color;
      cal.data(pickerCSSClass).origColor = color;
      setCurrentColor(color, cal.get(0));
      cal.data(pickerCSSClass).onSubmit(color, hsbToHex(color), hsbToRGB(color), cal.data(pickerCSSClass).el);
    };

    var show = function (ev) {
      var cal = $("#" + $(this).data("pickacolorId"));
      cal.data(pickerCSSClass).onBeforeShow.apply(this, [cal.get(0)]);

      var inputPosition    = $(this).offset();
      inputPosition.bottom = inputPosition.top + this.offsetHeight;
      inputPosition.right  = inputPosition.left + this.offsetWidth;

      var pickerPosition = {};

      switch (ev.data.pickerPosition) {
        case "top-left":
          pickerPosition.top  = inputPosition.top - pickerHeight;
          pickerPosition.left = inputPosition.left;
          break;
        case "top-right":
          pickerPosition.top  = inputPosition.top - pickerHeight;
          pickerPosition.left = inputPosition.right - pickerWidth;
          break;
        case "bottom-left":
          pickerPosition.top  = inputPosition.bottom;
          pickerPosition.left = inputPosition.left;
          break;
        case "bottom-right":
          pickerPosition.top  = inputPosition.bottom;
          pickerPosition.left = inputPosition.right - pickerWidth;
          break;
        case "left":
          pickerPosition.top  = inputPosition.top - ((pickerHeight / 2) - (this.offsetHeight / 2));
          pickerPosition.left = inputPosition.left - pickerWidth;
          break;
        case "left-top":
          pickerPosition.top  = inputPosition.top;
          pickerPosition.left = inputPosition.left - pickerWidth;
          break;
        case "left-bottom":
          pickerPosition.top  = inputPosition.bottom - pickerHeight;
          pickerPosition.left = inputPosition.left - pickerWidth;
          break;
        case "right":
          pickerPosition.top  = inputPosition.top - ((pickerHeight / 2) - (this.offsetHeight / 2));
          pickerPosition.left = inputPosition.right;
          break;
        case "right-top":
          pickerPosition.top  = inputPosition.top;
          pickerPosition.left = inputPosition.right;
          break;
        case "right-bottom":
          pickerPosition.top  = inputPosition.bottom - pickerHeight;
          pickerPosition.left = inputPosition.right;
          break;
      }

      var viewPort = getViewport();

      pickerPosition.bottom = pickerPosition.top + pickerHeight;
      pickerPosition.right  = pickerPosition.left + pickerWidth;

      var windowBoundaries = {
        top:    0,
        left:   0,
        bottom: viewPort.t + viewPort.h,
        right:  viewPort.l + viewPort.w
      };

      if (pickerPosition.top < windowBoundaries.top) {
        pickerPosition.top = 0;
      } else if (pickerPosition.bottom  > windowBoundaries.bottom) {
        pickerPosition.top -= this.offsetHeight + pickerHeight;
      }

      if (pickerPosition.left < windowBoundaries.left) {
        pickerPosition.left = 0;
      } else if (pickerPosition.right > windowBoundaries.right) {
        pickerPosition.left -= pickerWidth;
      }

      cal.css({ left: pickerPosition.left + "px", top: pickerPosition.top + "px" });

      if (cal.data(pickerCSSClass).onShow.apply(this, [cal.get(0)]) !== false) {
        cal.show();
      }
      $(document).bind("mousedown", { cal: cal }, hide);

      return false;
    };

    var hide = function (ev) {
      if (!isChildOf(ev.data.cal.get(0), ev.target, ev.data.cal.get(0))) {
        if (ev.data.cal.data(pickerCSSClass).onHide.apply(this, [ev.data.cal.get(0)]) !== false) {
          ev.data.cal.hide();
        }
        $(document).unbind("mousedown", hide);
      }
    };

    var isChildOf = function(parentEl, el, container) {
      if (parentEl === el) {
        return true;
      }
      if (parentEl.contains) {
        return parentEl.contains(el);
      }
      if ( parentEl.compareDocumentPosition ) {
        return !!(parentEl.compareDocumentPosition(el) & 16);
      }
      var prEl = el.parentNode;
      while(prEl && prEl !== container) {
        if (prEl === parentEl) {
          return true;
        }
        prEl = prEl.parentNode;
      }
      return false;
    };

    var getViewport = function () {
      var m = document.compatMode === "CSS1Compat";
      return {
        l : window.pageXOffset || (m ? document.documentElement.scrollLeft : document.body.scrollLeft),
        t : window.pageYOffset || (m ? document.documentElement.scrollTop : document.body.scrollTop),
        w : window.innerWidth || (m ? document.documentElement.clientWidth : document.body.clientWidth),
        h : window.innerHeight || (m ? document.documentElement.clientHeight : document.body.clientHeight)
      };
    };

    var fixHSB = function (hsb) {
      return {
        h: Math.min(360, Math.max(0, hsb.h)),
        s: Math.min(100, Math.max(0, hsb.s)),
        b: Math.min(100, Math.max(0, hsb.b))
      };
    };
    var fixRGB = function (rgb) {
      return {
        r: Math.min(255, Math.max(0, rgb.r)),
        g: Math.min(255, Math.max(0, rgb.g)),
        b: Math.min(255, Math.max(0, rgb.b))
      };
    };
    var fixHex = function (hex) {
      var len = 6 - hex.length;
      if (len > 0) {
        var o = [];
        for (var i = 0; i < len; i++) {
          o.push("0");
        }
        o.push(hex);
        hex = o.join("");
      }
      return hex;
    };

    var hexToRGB = function (hex) {
      var hexInt = parseInt(((hex.indexOf("#") > -1) ? hex.substring(1) : hex), 16);
      return {r: hexInt >> 16, g: (hexInt & 0x00FF00) >> 8, b: (hexInt & 0x0000FF)};
    };

    var hexToHSB = function (hex) {
      return rgbToHSB(hexToRGB(hex));
    };

    var rgbToHSB = function (rgb) {
      var hsb = {
        h: 0,
        s: 0,
        b: 0
      };
      var min = Math.min(rgb.r, rgb.g, rgb.b);
      var max = Math.max(rgb.r, rgb.g, rgb.b);
      var delta = max - min;
      hsb.b = max;
      if (max !== 0) {
        // TODO: Figure out why this is blank!
      }
      hsb.s = max !== 0 ? 255 * delta / max : 0;
      if (hsb.s !== 0) {
        if (rgb.r === max) {
          hsb.h = (rgb.g - rgb.b) / delta;
        } else if (rgb.g === max) {
          hsb.h = 2 + (rgb.b - rgb.r) / delta;
        } else {
          hsb.h = 4 + (rgb.r - rgb.g) / delta;
        }
      } else {
        hsb.h = -1;
      }
      hsb.h *= 60;
      if (hsb.h < 0) {
        hsb.h += 360;
      }
      hsb.s *= 100/255;
      hsb.b *= 100/255;
      return hsb;
    };

    var hsbToRGB = function (hsb) {
      var rgb = {};

      var h = Math.round(hsb.h);
      var s = Math.round(hsb.s*255/100);
      var v = Math.round(hsb.b*255/100);

      if (s === 0) {
        rgb.r = v;
        rgb.g = v;
        rgb.b = v;
      } else {
        var t1 = v;
        var t2 = (255 - s) * v / 255;
        var t3 = (t1 - t2) * (h % 60) / 60;

        if (h === 360) {
          h = 0;
        }

        if (h < 60) {
          rgb.r = t1;
          rgb.g = t2 + t3;
          rgb.b = t2;
        } else if (h < 120) {
          rgb.r = t1 - t3;
          rgb.g = t1;
          rgb.b = t2;
        } else if (h < 180) {
          rgb.r = t2;
          rgb.g = t1;
          rgb.b = t2 + t3;
        } else if (h < 240) {
          rgb.r = t2;
          rgb.g = t1 - t3;
          rgb.b = t1;
        } else if (h < 300) {
          rgb.r = t2 + t3;
          rgb.g = t2;
          rgb.b = t1;
        } else if (h < 360) {
          rgb.r = t1;
          rgb.g = t2;
          rgb.b = t1 - t3;
        } else {
          rgb.r=0;
          rgb.g=0;
          rgb.b=0;
        }
      }
      return { r:Math.round(rgb.r), g:Math.round(rgb.g), b:Math.round(rgb.b) };
    };

    var rgbToHex = function (rgb) {
      var hex = [
        rgb.r.toString(16),
        rgb.g.toString(16),
        rgb.b.toString(16)
      ];
      $.each(hex, function (nr, val) {
        if (val.length === 1) {
          hex[nr] = "0" + val;
        }
      });
      return hex.join("");
    };

    var hsbToHex = function (hsb) {
      return rgbToHex(hsbToRGB(hsb));
    };

    var restoreOriginal = function () {
      var cal = $(this).parent();

      var originalColor = cal.data(pickerCSSClass).origColor;
      cal.data(pickerCSSClass).color = originalColor;

      fillRGBFields(originalColor, cal.get(0));
      fillHexFields(originalColor, cal.get(0));
      fillHSBFields(originalColor, cal.get(0));

      setSelector(originalColor, cal.get(0));
      setHue(originalColor, cal.get(0));
      setNewColor(originalColor, cal.get(0));
    };

    return {
      init: function (opt) {
        opt = $.extend({}, defaults, opt||{});

        if (typeof opt.color === "string") {
          opt.color = hexToHSB(opt.color);
        } else if (opt.color.r !== undefined && opt.color.g !== undefined && opt.color.b !== undefined) {
          opt.color = rgbToHSB(opt.color);
        } else if (opt.color.h !== undefined && opt.color.s !== undefined && opt.color.b !== undefined) {
          opt.color = fixHSB(opt.color);
        } else {
          return this;
        }

        return this.each(function () {
          if (!$(this).data("pickacolorId")) {
            var options = $.extend({}, opt);
            options.origColor = opt.color;

            var id = pickerCSSClass + parseInt(Math.random() * 1000);
            $(this).data("pickacolorId", id);

            var cal = $(htmlString).attr("id", id);
            if (options.flat) {
              cal.appendTo(this).show();
            } else {
              cal.appendTo(document.body);
            }

            options.fields = cal.find("input")
                                .bind("keyup",  keyup)
                                .bind("change", change)
                                .bind("blur",   blur)
                                .bind("focus",  focus);

            cal.find("span").bind("mousedown", downIncrement).end()
               .find(">div." + pickerCSSClass + "_current_color").bind("click", restoreOriginal);
            options.selector = cal.find("div." + pickerCSSClass + "_color").bind("mousedown", downSelector);
            options.selectorIndic = options.selector.find("div div");
            options.el = this;
            options.hue = cal.find("div." + pickerCSSClass + "_hue div");

            cal.find("div." + pickerCSSClass + "_hue").bind("mousedown", downHue);
            options.newColor = cal.find("div." + pickerCSSClass + "_new_color");
            options.currentColor = cal.find("div." + pickerCSSClass + "_current_color");

            cal.data(pickerCSSClass, options);

            cal.find("div." + pickerCSSClass + "_submit")
              .bind("mouseenter", enterSubmit)
              .bind("mouseleave", leaveSubmit)
              .bind("click", clickSubmit);

            fillRGBFields(options.color, cal.get(0));
            fillHSBFields(options.color, cal.get(0));
            fillHexFields(options.color, cal.get(0));

            setHue(options.color, cal.get(0));
            setSelector(options.color, cal.get(0));
            setCurrentColor(options.color, cal.get(0));
            setNewColor(options.color, cal.get(0));

            if (options.flat) {
              cal.css({
                position: "relative",
                display:  "block"
              });
              return;
            }

            $(this).bind(options.eventName, { pickerPosition: options.position }, show);
          }
        });
      },

      showPicker: function() {
        return this.each( function () {
          if ($(this).data("pickacolorId")) {
            show.apply(this);
          }
        });
      },

      hidePicker: function() {
        return this.each( function () {
          if ($(this).data("pickacolorId")) {
            $("#" + $(this).data("pickacolorId")).hide();
          }
        });
      },

      setColor: function(color) {
        if (typeof color === "string") {
          color = hexToHSB(color);
        } else if (color.r !== undefined && color.g !== undefined && color.b !== undefined) {
          color = rgbToHSB(color);
        } else if (color.h !== undefined && color.s !== undefined && color.b !== undefined) {
          color = fixHSB(color);
        } else {
          return this;
        }
        return this.each(function(){
          if ($(this).data("pickacolorId")) {
            var cal = $("#" + $(this).data("pickacolorId"));

            cal.data(pickerCSSClass).color = color;
            cal.data(pickerCSSClass).origColor = color;

            fillRGBFields(color, cal.get(0));
            fillHSBFields(color, cal.get(0));
            fillHexFields(color, cal.get(0));

            setHue(color, cal.get(0));
            setSelector(color, cal.get(0));
            setCurrentColor(color, cal.get(0));
            setNewColor(color, cal.get(0));
          }
        });
      }
    };
  }();


  $.fn.extend({
    PickAColor:         PickAColor.init,
    PickAColorHide:     PickAColor.hidePicker,
    PickAColorShow:     PickAColor.showPicker,
    PickAColorSetColor: PickAColor.setColor
  });
})(jQuery);