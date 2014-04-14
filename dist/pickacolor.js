/*!
 * pickacolor.js - v0.0.1 - https://github.com/bsara/pickacolor.js
 *
 * Authors:
 *   Brandon Sara AKA bsara (Owner)
 *   Stefan Petre www.eyecon.ro (Original Author and Owner of "Color Picker" - http://www.eyecon.ro/colorpicker/)
 *
 * License:
 *   Copyright (c) 2014 Brandon Dale Sara
 *   Dual licensed under the MIT and GPL-3.0 licenses (https://github.com/bsara/pickacolor.js/blob/master/LICENSES)
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
                     + '<div class="' + pickerCSSClass + '-color"><div><div></div></div></div>'
                     + '<div class="' + pickerCSSClass + '-hue"><div></div></div>'
                     + '<div class="' + pickerCSSClass + '-new-color"></div>'
                     + '<div class="' + pickerCSSClass + '-current-color"></div>'
                     + '<div class="' + pickerCSSClass + '-hex"><input type="text" maxlength="6" size="6" /></div>'
                     + '<div class="' + pickerCSSClass + '-rgb-r ' + pickerCSSClass + '-field"><input type="text" maxlength="3" size="3" /><span></span></div>'
                     + '<div class="' + pickerCSSClass + '-rgb-g ' + pickerCSSClass + '-field"><input type="text" maxlength="3" size="3" /><span></span></div>'
                     + '<div class="' + pickerCSSClass + '-rgb-b ' + pickerCSSClass + '-field"><input type="text" maxlength="3" size="3" /><span></span></div>'
                     + '<div class="' + pickerCSSClass + '-hsb-h ' + pickerCSSClass + '-field"><input type="text" maxlength="3" size="3" /><span></span></div>'
                     + '<div class="' + pickerCSSClass + '-hsb-s ' + pickerCSSClass + '-field"><input type="text" maxlength="3" size="3" /><span></span></div>'
                     + '<div class="' + pickerCSSClass + '-hsb-b ' + pickerCSSClass + '-field"><input type="text" maxlength="3" size="3" /><span></span></div>'
                     + '<div class="' + pickerCSSClass + '-submit"></div>'
                   + '</div>';

    var defaults = {
      allCaps:        true,
      defaultColor:   "ff0000",
      livePreview:    true,
      onBeforeShow:   function(){},
      onChange:       function () {},
      onHide:         function () {},
      onShow:         function () {},
      onSubmit:       function () {},
      pickerPosition: "bottom-left",
      popup:          true,
      popupEvent:     "click"
    };


    var fillRGBFields = function (hsb, picker) {
      var rgb = hsbToRGB(hsb);
      $(picker).data(pickerCSSClass).fields
                                 .eq(1).val(rgb.r).end()
                                 .eq(2).val(rgb.g).end()
                                 .eq(3).val(rgb.b).end();
    };

    var fillHSBFields = function (hsb, picker) {
      $(picker).data(pickerCSSClass).fields
                                 .eq(4).val(hsb.h).end()
                                 .eq(5).val(hsb.s).end()
                                 .eq(6).val(hsb.b).end();
    };

    var fillHexFields = function (hsb, picker) {
      var hex = hsbToHex(hsb);
      // TODO: Apply `allCaps` functionality
      $(picker).data(pickerCSSClass).fields.eq(0).val(hex).end();
    };


    var setSelector = function (hsb, picker) {
      $(picker).data(pickerCSSClass).selector.css("backgroundColor", "#" + hsbToHex({h: hsb.h, s: 100, b: 100}));
      $(picker).data(pickerCSSClass).selectorIndic.css({
        left: parseInt(150 * hsb.s/100, 10),
        top:  parseInt(150 * (100-hsb.b)/100, 10)
      });
    };

    var setHue = function (hsb, picker) {
      $(picker).data(pickerCSSClass).hue.css("top", parseInt(150 - 150 * hsb.h/360, 10));
    };

    var setCurrentColor = function (hsb, picker) {
      $(picker).data(pickerCSSClass).currentColor.css("backgroundColor", "#" + hsbToHex(hsb));
    };

    var setNewColor = function (hsb, picker) {
      $(picker).data(pickerCSSClass).newColor.css("backgroundColor", "#" + hsbToHex(hsb));
    };


    var keyup = function (ev) {
      var pressedKey = ev.charCode || ev.keyCode || -1;
      if ((pressedKey > charMin && pressedKey <= 90) || pressedKey === 32) {
        return false;
      }
      var picker = $(this).parent().parent();
      if (picker.data(pickerCSSClass).livePreview === true) {
        change.apply(this);
      }
    };

    var change = function (ev) {
      var pickers = $(this).parent().parent();
      var color;
      if (this.parentNode.className.indexOf("-hex") > 0) {
        pickers.data(pickerCSSClass).color = color = hexToHSB(fixHex(this.value));
      } else if (this.parentNode.className.indexOf("-hsb") > 0) {
        pickers.data(pickerCSSClass).color = color = fixHSB({
          h: parseInt(pickers.data(pickerCSSClass).fields.eq(4).val(), 10),
          s: parseInt(pickers.data(pickerCSSClass).fields.eq(5).val(), 10),
          b: parseInt(pickers.data(pickerCSSClass).fields.eq(6).val(), 10)
        });
      } else {
        pickers.data(pickerCSSClass).color = color = rgbToHSB(fixRGB({
          r: parseInt(pickers.data(pickerCSSClass).fields.eq(1).val(), 10),
          g: parseInt(pickers.data(pickerCSSClass).fields.eq(2).val(), 10),
          b: parseInt(pickers.data(pickerCSSClass).fields.eq(3).val(), 10)
        }));
      }

      var picker = pickers.get(0);

      if (ev) {
        fillRGBFields(color, picker);
        fillHexFields(color, picker);
        fillHSBFields(color, picker);
      }

      setSelector(color, picker);
      setHue(color, picker);
      setNewColor(color, picker);

      pickers.data(pickerCSSClass).onChange.apply(pickers, [color, hsbToHex(color), hsbToRGB(color)]);
    };

    var blur = function (ev) {
      var picker = $(this).parent().parent();
      picker.data(pickerCSSClass).fields.parent().removeClass(pickerCSSClass + "-focus");
    };

    var focus = function () {
      charMin = this.parentNode.className.indexOf("-hex") > 0 ? 70 : 65;
      $(this).parent().parent().data(pickerCSSClass).fields.parent().removeClass(pickerCSSClass + "-focus");
      $(this).parent().addClass(pickerCSSClass + "-focus");
    };


    var downIncrement = function (ev) {
      var field = $(this).parent().find("input").focus();
      var current = {
        el: $(this).parent().addClass(pickerCSSClass + "-slider"),
        max: this.parentNode.className.indexOf("-hsb-h") > 0 ? 360 : (this.parentNode.className.indexOf("-hsb") > 0 ? 100 : 255),
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
      ev.data.el.removeClass(pickerCSSClass + "-slider").find("input").focus();
      $(document).unbind("mouseup", upIncrement);
      $(document).unbind("mousemove", moveIncrement);
      return false;
    };


    var downHue = function (ev) {
      var current = {
        picker: $(this).parent(),
        y: $(this).offset().top
      };
      current.preview = current.picker.data(pickerCSSClass).livePreview;
      $(document).bind("mouseup", current, upHue);
      $(document).bind("mousemove", current, moveHue);
    };

    var moveHue = function (ev) {
      change.apply(
        ev.data.picker.data(pickerCSSClass)
          .fields
          .eq(4)
          .val(parseInt(360*(150 - Math.max(0,Math.min(150,(ev.pageY - ev.data.y))))/150, 10))
          .get(0),
        [ev.data.preview]
      );
      return false;
    };

    var upHue = function (ev) {
      fillRGBFields(ev.data.picker.data(pickerCSSClass).color, ev.data.picker.get(0));
      fillHexFields(ev.data.picker.data(pickerCSSClass).color, ev.data.picker.get(0));
      $(document).unbind("mouseup", upHue);
      $(document).unbind("mousemove", moveHue);
      return false;
    };


    var downSelector = function (ev) {
      var current = {
        picker: $(this).parent(),
        pos: $(this).offset()
      };
      current.preview = current.picker.data(pickerCSSClass).livePreview;
      $(document).bind("mouseup", current, upSelector);
      $(document).bind("mousemove", current, moveSelector);
    };

    var moveSelector = function (ev) {
      change.apply(
        ev.data.picker.data(pickerCSSClass)
                   .fields
                   .eq(6).val(parseInt(100*(150 - Math.max(0,Math.min(150,(ev.pageY - ev.data.pos.top))))/150, 10)).end()
                   .eq(5).val(parseInt(100*(Math.max(0,Math.min(150,(ev.pageX - ev.data.pos.left))))/150, 10)).get(0),
        [ev.data.preview]
      );
      return false;
    };

    var upSelector = function (ev) {
      fillRGBFields(ev.data.picker.data(pickerCSSClass).color, ev.data.picker.get(0));
      fillHexFields(ev.data.picker.data(pickerCSSClass).color, ev.data.picker.get(0));
      $(document).unbind("mouseup", upSelector);
      $(document).unbind("mousemove", moveSelector);
      return false;
    };


    var enterSubmit = function (ev) {
      $(this).addClass(pickerCSSClass + "-focus");
    };

    var leaveSubmit = function (ev) {
      $(this).removeClass(pickerCSSClass + "-focus");
    };

    var clickSubmit = function (ev) {
      var pickers = $(this).parent();
      var color = pickers.data(pickerCSSClass).color;
      pickers.data(pickerCSSClass).origColor = color;
      setCurrentColor(color, pickers.get(0));
      pickers.data(pickerCSSClass).onSubmit(color, hsbToHex(color), hsbToRGB(color), pickers.data(pickerCSSClass).el);
    };


    var show = function (ev) {
      var pickers = $("#" + $(this).data("pickacolorId"));
      var picker = pickers.get(0);

      pickers.data(pickerCSSClass).onBeforeShow.apply(this, [picker]);

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

      // BUG: Repositioning issues with new positioning options

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

      pickers.css({ left: pickerPosition.left + "px", top: pickerPosition.top + "px" });

      if (pickers.data(pickerCSSClass).onShow.apply(this, [picker]) !== false) {
        pickers.show();
      }
      $(document).bind("mousedown", { pickers: pickers }, hide);

      return false;
    };

    var hide = function (ev) {
      var pickers = ev.data.pickers;
      var picker = pickers.get(0);

      if (!isChildOf(picker, ev.target, picker)) {
        if (ev.data.pickers.data(pickerCSSClass).onHide.apply(this, [picker]) !== false) {
          ev.data.pickers.hide();
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


    var restoreOriginal = function (ev) {
      $(ev.data.inputElement).PickAColorSetColor($(this).parent().data(pickerCSSClass).origColor);
    };

    return {
      init: function (opt) {
        opt = $.extend({}, defaults, opt||{});

        if (typeof opt.defaultColor === "string") {
          opt.defaultColor = hexToHSB(opt.defaultColor);
        } else if (opt.defaultColor.r !== undefined && opt.defaultColor.g !== undefined && opt.defaultColor.b !== undefined) {
          opt.defaultColor = rgbToHSB(opt.defaultColor);
        } else if (opt.defaultColor.h !== undefined && opt.defaultColor.s !== undefined && opt.defaultColor.b !== undefined) {
          opt.defaultColor = fixHSB(opt.defaultColor);
        } else {
          return this;
        }

        return this.each(function () {
          if (!$(this).data("pickacolorId")) {
            var options = $.extend({}, opt);
            options.origColor = opt.defaultColor;

            var id = pickerCSSClass + parseInt(Math.random() * 1000);
            $(this).data("pickacolorId", id);

            var pickers = $(htmlString).attr("id", id);
            if (options.popup) {
              pickers.appendTo(document.body);
            } else {
              pickers.appendTo(this).show();
            }

            options.fields = pickers.find("input")
                                    .bind("keyup",  keyup)
                                    .bind("change", change)
                                    .bind("blur",   blur)
                                    .bind("focus",  focus);

            pickers.find("span").bind("mousedown", downIncrement).end()
                   .find(">div." + pickerCSSClass + "-current-color").on("click", { inputElement: this }, restoreOriginal);
            options.selector = pickers.find("div." + pickerCSSClass + "-color").bind("mousedown", downSelector);
            options.selectorIndic = options.selector.find("div div");
            options.el = this;
            options.hue = pickers.find("div." + pickerCSSClass + "-hue div");

            pickers.find("div." + pickerCSSClass + "-hue").bind("mousedown", downHue);
            options.newColor = pickers.find("div." + pickerCSSClass + "-new-color");
            options.currentColor = pickers.find("div." + pickerCSSClass + "-current-color");

            pickers.data(pickerCSSClass, options);

            pickers.find("div." + pickerCSSClass + "-submit")
              .bind("mouseenter", enterSubmit)
              .bind("mouseleave", leaveSubmit)
              .bind("click", clickSubmit);

            var picker = pickers.get(0);

            fillRGBFields(options.defaultColor, picker);
            fillHSBFields(options.defaultColor, picker);
            fillHexFields(options.defaultColor, picker);

            setHue(options.defaultColor, picker);
            setSelector(options.defaultColor, picker);
            setCurrentColor(options.defaultColor, picker);
            setNewColor(options.defaultColor, picker);

            if (!options.popup) {
              pickers.css({
                position: "relative",
                display:  "block"
              });
              return;
            }

            $(this).bind(options.popupEvent, { pickerPosition: options.pickerPosition }, show);
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
            var pickers = $("#" + $(this).data("pickacolorId"));

            pickers.data(pickerCSSClass).color = color;
            pickers.data(pickerCSSClass).origColor = color;

            var picker = pickers.get(0);

            fillRGBFields(color, picker);
            fillHSBFields(color, picker);
            fillHexFields(color, picker);

            setHue(color, picker);
            setSelector(color, picker);
            setCurrentColor(color, picker);
            setNewColor(color, picker);

            pickers.data(pickerCSSClass).onChange.apply(pickers, [color, hsbToHex(color), hsbToRGB(color)]);
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