/*!
 * pickacolor.js - v0.0.1 - https://github.com/bsara/pickacolor.js
 *
 * Authors:
 *   Brandon Sara <bsara> (Owner)
 *   Stefan Petre www.eyecon.ro (Original Author and Owner of "Color Picker" - http://www.eyecon.ro/colorpicker/)
 *
 * License:
 *   Copyright (c) 2014 Brandon Dale Sara
 *   Dual licensed under the MIT and GPL-3.0 licenses (https://github.com/bsara/pickacolor.js/blob/master/LICENSES)
 */

(function ($) {
  var PickAColor = function () {
    var pickerCSSClass = 'pickacolor';
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
                     + '<div class="' + pickerCSSClass + '-cancel"></div>'
                     + '<div class="' + pickerCSSClass + '-submit"></div>'
                   + '</div>';

    var defaults = {
      allCaps:        true,
      defaultColor:   'FF0000',
      livePreview:    true,
      onBeforeCancel: function () {},
      onBeforeShow:   function () {},
      onCancel:       function () {},
      onChange:       function () {},
      onHide:         function () {},
      onShow:         function () {},
      onSubmit:       function () {},
      pickerPosition: 'bottom-left',
      popup:          true,
      popupEvent:     'click'
    };


    var fillRGBFields = function (hsb, pickerElement) {
      var picker = $(pickerElement).data(pickerCSSClass);
      var rgb = hsbToRGB(hsb);

      picker.fields
            .eq(1).val(rgb.r).end()
            .eq(2).val(rgb.g).end()
            .eq(3).val(rgb.b).end();
    };

    var fillHSBFields = function (hsb, pickerElement) {
      var picker = $(pickerElement).data(pickerCSSClass);

      picker.fields
            .eq(4).val(hsb.h).end()
            .eq(5).val(hsb.s).end()
            .eq(6).val(hsb.b).end();
    };

    var fillHexFields = function (hsb, pickerElement) {
      var picker = $(pickerElement).data(pickerCSSClass);
      var hex = hsbToHex(hsb);

      if (picker.allCaps) {
        hex = hex.toUpperCase();
      }

      picker.fields.eq(0).val(hex).end();
    };


    var setSelector = function (hsb, pickerElement) {
      var picker = $(pickerElement).data(pickerCSSClass);

      picker.selector.css('backgroundColor', "#" + hsbToHex({h: hsb.h, s: 100, b: 100}));
      picker.selectorIndic.css({
        left: parseInt(150 * hsb.s / 100, 10),
        top:  parseInt(150 * (100 - hsb.b) / 100, 10)
      });
    };

    var setHue = function (hsb, pickerElement) {
      var picker = $(pickerElement).data(pickerCSSClass);
      picker.hue.css('top', parseInt(150 - 150 * hsb.h / 360, 10));
    };

    var setCurrentColor = function (hsb, pickerElement) {
      var picker = $(pickerElement).data(pickerCSSClass);
      picker.currentColor.css('backgroundColor', "#" + hsbToHex(hsb));
    };

    var setNewColor = function (hsb, pickerElement) {
      var picker = $(pickerElement).data(pickerCSSClass);
      picker.newColor.css('backgroundColor', "#" + hsbToHex(hsb));
    };

    var setColor = function (color) {
      if (typeof color === 'string') {
        color = hexToHSB(color);
      } else if (color.r !== undefined && color.g !== undefined && color.b !== undefined) {
        color = rgbToHSB(color);
      } else if (color.h !== undefined && color.s !== undefined && color.b !== undefined) {
        color = fixHSB(color);
      } else {
        return this;
      }
      return this.each(function(){
        if ($(this).data('pickacolorId')) {
          var pickerElements = $("#" + $(this).data('pickacolorId'));
          var pickerElement = pickerElements.get(0);
          var picker = pickerElements.data(pickerCSSClass);

          picker.color = color;
          picker.origColor = color;

          fillRGBFields(color, pickerElement);
          fillHSBFields(color, pickerElement);
          fillHexFields(color, pickerElement);

          setHue(color, pickerElement);
          setSelector(color, pickerElement);
          setCurrentColor(color, pickerElement);
          setNewColor(color, pickerElement);

          picker.onChange.apply(pickerElements, [color, hsbToHex(color), hsbToRGB(color)]);
        }
      });
    };

    var resetColor = function (ev) {
      var picker = $(this).parent().data(pickerCSSClass);
      setColor(picker.origColor);
    };


    var keyup = function (ev) {
      var pressedKey = ev.charCode || ev.keyCode || -1;
      if ((pressedKey > charMin && pressedKey <= 90) || pressedKey === 32) {
        return false;
      }

      var picker = $(this).parent().parent().data(pickerCSSClass);

      if (picker.livePreview === true) {
        change.apply(this);
      }
    };

    var change = function (ev) {
      var pickerElements = $(this).parent().parent();
      var pickerElement = pickerElements.get(0);
      var picker = pickerElements.data(pickerCSSClass);

      var color;

      if (this.parentNode.className.indexOf('-hex') > 0) {
        picker.color = color = hexToHSB(fixHex(this.value));
      } else if (this.parentNode.className.indexOf('-hsb') > 0) {
        picker.color = color = fixHSB({
          h: parseInt(picker.fields.eq(4).val(), 10),
          s: parseInt(picker.fields.eq(5).val(), 10),
          b: parseInt(picker.fields.eq(6).val(), 10)
        });
      } else {
        picker.color = color = rgbToHSB(fixRGB({
          r: parseInt(picker.fields.eq(1).val(), 10),
          g: parseInt(picker.fields.eq(2).val(), 10),
          b: parseInt(picker.fields.eq(3).val(), 10)
        }));
      }

      if (ev) {
        fillRGBFields(color, pickerElement);
        fillHexFields(color, pickerElement);
        fillHSBFields(color, pickerElement);
      }

      setSelector(color, pickerElement);
      setHue(color, pickerElement);
      setNewColor(color, pickerElement);

      picker.onChange.apply(pickerElements, [color, hsbToHex(color), hsbToRGB(color)]);
    };

    var blur = function (ev) {
      var picker = $(this).parent().parent();
      picker.data(pickerCSSClass).fields.parent().removeClass(pickerCSSClass + '-focus');
    };

    var focus = function () {
      charMin = (this.parentNode.className.indexOf('-hex') > 0) ? 70 : 65;

      $(this).parent().parent().data(pickerCSSClass).fields.parent().removeClass(pickerCSSClass + '-focus');
      $(this).parent().addClass(pickerCSSClass + '-focus');
    };


    var downIncrement = function (ev) {
      var inputField = $(this).parent().find('input').focus();

      var current = {
        el:         $(this).parent().addClass(pickerCSSClass + '-slider'),
        max:        (this.parentNode.className.indexOf('-hsb-h') > 0) ? 360 : (this.parentNode.className.indexOf('-hsb') > 0 ? 100 : 255),
        y:          ev.pageY,
        inputField: inputField,
        val:        parseInt(inputField.val(), 10),
        preview:    $(this).parent().parent().data(pickerCSSClass).livePreview
      };

      $(document).on('mouseup', current, upIncrement);
      $(document).on('mousemove', current, moveIncrement);
    };

    var moveIncrement = function (ev) {
      ev.data.inputField.val(Math.max(0, Math.min(ev.data.max, parseInt(ev.data.val + ev.pageY - ev.data.y, 10))));
      if (ev.data.preview) {
        change.apply(ev.data.inputField.get(0), [true]);
      }
      return false;
    };

    var upIncrement = function (ev) {
      change.apply(ev.data.inputField.get(0), [true]);

      ev.data.el.removeClass(pickerCSSClass + '-slider').find('input').focus();

      $(document).off('mouseup', upIncrement);
      $(document).off('mousemove', moveIncrement);

      return false;
    };


    var downHue = function (ev) {
      var current = {
        pickerElements: $(this).parent(),
        y: $(this).offset().top
      };

      current.preview = current.pickerElements.data(pickerCSSClass).livePreview;

      $(document).on('mouseup', current, upHue);
      $(document).on('mousemove', current, moveHue);
    };

    var moveHue = function (ev) {
      var picker = ev.data.pickerElements.data(pickerCSSClass);

      change.apply(
        picker.fields
              .eq(4)
              .val(parseInt(360 * (150 - Math.max(0, Math.min(150, (ev.pageY - ev.data.y)))) / 150, 10))
              .get(0),
        [ev.data.preview]
      );

      return false;
    };

    var upHue = function (ev) {
      var pickerElement = ev.data.pickerElements.get(0);
      var picker = ev.data.pickerElements.data(pickerCSSClass);

      fillRGBFields(picker.color, pickerElement);
      fillHexFields(picker.color, pickerElement);

      $(document).off('mouseup', upHue);
      $(document).off('mousemove', moveHue);

      return false;
    };


    var downSelector = function (ev) {
      var current = {
        pickerElements: $(this).parent(),
        pos: $(this).offset()
      };

      current.preview = current.pickerElements.data(pickerCSSClass).livePreview;

      $(document).on('mouseup', current, upSelector);
      $(document).on('mousemove', current, moveSelector);
    };

    var moveSelector = function (ev) {
      var picker = ev.data.pickerElements.data(pickerCSSClass);

      change.apply(
        picker.fields
              .eq(6).val(parseInt(100 * (150 - Math.max(0, Math.min(150, (ev.pageY - ev.data.pos.top)))) / 150, 10)).end()
              .eq(5).val(parseInt(100 * (Math.max(0, Math.min(150, (ev.pageX - ev.data.pos.left)))) / 150, 10)).get(0),
        [ev.data.preview]
      );
      return false;
    };

    var upSelector = function (ev) {
      var pickerElement = ev.data.pickerElements.get(0);
      var picker = ev.data.pickerElements.data(pickerCSSClass);

      fillRGBFields(picker.color, pickerElement);
      fillHexFields(picker.color, pickerElement);

      $(document).off('mouseup', upSelector);
      $(document).off('mousemove', moveSelector);

      return false;
    };


    var giveFocus = function (ev) {
      $(this).addClass(pickerCSSClass + '-focus');
    };

    var loseFocus = function (ev) {
      $(this).removeClass(pickerCSSClass + '-focus');
    };


    var clickCancel = function (ev) {
      cancel(ev);
    };


    var clickSubmit = function (ev) {
      submit(ev);
    };


    var show = function (ev) {
      var pickerElements = $("#" + $(this).data('pickacolorId'));
      var pickerElement = pickerElements.get(0);
      var picker = pickerElements.data(pickerCSSClass);

      picker.onBeforeShow.apply(this, [picker]);

      var inputPosition    = $(this).offset();
      inputPosition.bottom = inputPosition.top + this.offsetHeight;
      inputPosition.right  = inputPosition.left + this.offsetWidth;

      var pickerPosition = {};

      switch (ev.data.pickerPosition) {
        case 'top-left':
          pickerPosition.top  = inputPosition.top - pickerHeight;
          pickerPosition.left = inputPosition.left;
          break;
        case 'top-right':
          pickerPosition.top  = inputPosition.top - pickerHeight;
          pickerPosition.left = inputPosition.right - pickerWidth;
          break;
        case 'bottom-left':
          pickerPosition.top  = inputPosition.bottom;
          pickerPosition.left = inputPosition.left;
          break;
        case 'bottom-right':
          pickerPosition.top  = inputPosition.bottom;
          pickerPosition.left = inputPosition.right - pickerWidth;
          break;
        case 'left':
          pickerPosition.top  = inputPosition.top - ((pickerHeight / 2) - (this.offsetHeight / 2));
          pickerPosition.left = inputPosition.left - pickerWidth;
          break;
        case 'left-top':
          pickerPosition.top  = inputPosition.top;
          pickerPosition.left = inputPosition.left - pickerWidth;
          break;
        case 'left-bottom':
          pickerPosition.top  = inputPosition.bottom - pickerHeight;
          pickerPosition.left = inputPosition.left - pickerWidth;
          break;
        case 'right':
          pickerPosition.top  = inputPosition.top - ((pickerHeight / 2) - (this.offsetHeight / 2));
          pickerPosition.left = inputPosition.right;
          break;
        case 'right-top':
          pickerPosition.top  = inputPosition.top;
          pickerPosition.left = inputPosition.right;
          break;
        case 'right-bottom':
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

      pickerElements.css({ left: pickerPosition.left + "px", top: pickerPosition.top + "px" });

      if (picker.onShow.apply(this, [pickerElement]) !== false) {
        pickerElements.show();
      }
      $(document).bind('mousedown', { pickerElements: pickerElements }, hide);

      return false;
    };

    var hide = function (ev) {
      var pickerElements = ev.data.pickerElements;
      var pickerElement = pickerElements.get(0);
      var picker = pickerElements.data(pickerCSSClass);

      if (!isChildOf(pickerElement, ev.target, pickerElement)) {
        if (picker.onHide.apply(this, [pickerElement]) !== false) {
          pickerElements.hide();
        }
        $(document).unbind('mousedown', hide);
      }
    };

    var cancel = function (ev) {
      var picker = $(this).parent().data(pickerCSSClass);

      if (picker.onBeforeCancel(picker.color, hsbToHex(picker.color), hsbToRGB(picker.color), picker.el)) {
        setColor(picker.origColor);
        hide();

        picker.onCancel();
      }
    };

    var submit = function (ev) {
      var pickers = $(this).parent();
      var picker = pickers.data(pickerCSSClass);
      var color = picker.color;

      picker.origColor = color;
      setCurrentColor(color, pickers.get(0));

      picker.onSubmit(color, hsbToHex(color), hsbToRGB(color), picker.el);
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
      var m = document.compatMode === 'CSS1Compat';
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
      return {
        r: hexInt >> 16,
        g: (hexInt & 0x00FF00) >> 8,
        b: (hexInt & 0x0000FF)};
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
      hsb.s = ((max !== 0) ? 255 * delta / max : 0);
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
      hsb.s *= 100 / 255;
      hsb.b *= 100 / 255;
      return hsb;
    };

    var hsbToRGB = function (hsb) {
      var rgb = {};

      var h = Math.round(hsb.h);
      var s = Math.round(hsb.s * 255 / 100);
      var v = Math.round(hsb.b * 255 / 100);

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
          rgb.r = 0;
          rgb.g = 0;
          rgb.b = 0;
        }
      }

      return {
        r:Math.round(rgb.r),
        g:Math.round(rgb.g),
        b:Math.round(rgb.b)
      };
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

    return {
      init: function (opt) {
        opt = $.extend({}, defaults, opt||{});

        if (typeof opt.defaultColor === 'string') {
          opt.defaultColor = hexToHSB(opt.defaultColor);
        } else if (opt.defaultColor.r !== undefined && opt.defaultColor.g !== undefined && opt.defaultColor.b !== undefined) {
          opt.defaultColor = rgbToHSB(opt.defaultColor);
        } else if (opt.defaultColor.h !== undefined && opt.defaultColor.s !== undefined && opt.defaultColor.b !== undefined) {
          opt.defaultColor = fixHSB(opt.defaultColor);
        } else {
          return this;
        }

        return this.each(function () {
          if (!$(this).data('pickacolorId')) {
            var options = $.extend({}, opt);
            options.origColor = opt.defaultColor;

            var id = pickerCSSClass + parseInt(Math.random() * 1000);
            $(this).data('pickacolorId', id);

            var pickerElements = $(htmlString).attr('id', id);
            if (options.popup) {
              pickerElements.appendTo(document.body);
            } else {
              pickerElements.appendTo(this).show();
            }

            options.fields = pickerElements.find('input')
                                           .bind('keyup',  keyup)
                                           .bind('change', change)
                                           .bind('blur',   blur)
                                           .bind('focus',  focus);

            pickerElements.find('span').bind('mousedown', downIncrement).end()
                          .find('>div.' + pickerCSSClass + '-current-color').on('click', { inputElement: this }, resetColor);

            options.selector = pickers.find('div.' + pickerCSSClass + '-color').bind('mousedown', downSelector);
            options.selectorIndic = options.selector.find('div div');
            options.el = this;
            options.hue = pickers.find('div.' + pickerCSSClass + '-hue div');

            pickerElements.find('div.' + pickerCSSClass + '-hue').bind('mousedown', downHue);
            options.newColor = pickers.find('div.' + pickerCSSClass + '-new-color');
            options.currentColor = pickers.find('div.' + pickerCSSClass + '-current-color');

            pickerElements.data(pickerCSSClass, options);

            pickerElements.find('div.' + pickerCSSClass + '-cancel')
                          .on('mouseenter', giveFocus)
                          .on('mouseleave', loseFocus)
                          .on('click', clickCancel);

            pickerElements.find('div.' + pickerCSSClass + '-submit')
                          .on('mouseenter', giveFocus)
                          .on('mouseleave', loseFocus)
                          .on('click', clickSubmit);

            var pickerElement = pickers.get(0);

            fillRGBFields(options.defaultColor, pickerElement);
            fillHSBFields(options.defaultColor, pickerElement);
            fillHexFields(options.defaultColor, pickerElement);

            setHue(options.defaultColor, pickerElement);
            setSelector(options.defaultColor, pickerElement);
            setCurrentColor(options.defaultColor, pickerElement);
            setNewColor(options.defaultColor, pickerElement);

            if (!options.popup) {
              pickerElements.css({
                position: 'relative',
                display:  'block'
              });
              return;
            }

            $(this).bind(options.popupEvent, { pickerPosition: options.pickerPosition }, show);
          }
        });
      },

      showPicker: function() {
        return this.each( function () {
          if ($(this).data('pickacolorId')) {
            show.apply(this);
          }
        });
      },

      hidePicker: function() {
        return this.each( function () {
          if ($(this).data('pickacolorId')) {
            $("#" + $(this).data('pickacolorId')).hide();
          }
        });
      },

      resetColor: function() {
        return this.each( function () {
          var blah = 0;
        });
      },

      setColor: function(color) {
      }
    };
  }();


  $.fn.extend({
    PickAColor:           PickAColor.init,
    PickAColorHide:       PickAColor.hidePicker,
    PickAColorShow:       PickAColor.showPicker,
    PickAColorResetColor: PickAColor.resetColor,
    PickAColorSetColor:   PickAColor.setColor
  });
})(jQuery);