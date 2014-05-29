/*!
 * pickacolor.js - v0.0.14 - https://github.com/bsara/pickacolor.js
 *
 * Authors:
 *   Brandon Sara <bsara>
 *   Stefan Petre www.eyecon.ro (Original Author and Owner of "Color Picker" - http://www.eyecon.ro/colorpicker/)
 *   Rob Foster
 *
 * License:
 *   Copyright (c) 2014 Brandon Dale Sara
 *   Dual licensed under the MIT and GPL-3.0 licenses (https://github.com/bsara/pickacolor.js/blob/master/LICENSES)
 */

window.PickAColor = {};

(function ($) {
  var PickAColor = function () {
    var defaults = {
      allCaps        : true,
      defaultColor   : 'FF0000',
      hideButtons    : true,
      livePreview    : true,
      onBeforeCancel : function (picker) { return true; },
      onBeforeShow   : function (picker) { return true; },
      onCancel       : function (hsb, hex, rgb, pickerElement) {},
      onChange       : function (hsb, hex, rgb) {},
      onHide         : function (pickerElement) {},
      onShow         : function (pickerElement) {},
      onSubmit       : function (hsb, hex, rgb, pickerElement) {},
      pickerPosition : 'bottom-left',
      popup          : true,
      popupEvent     : 'click',
      type           : 'simple'
    };

    var pickerCSSClass  = 'pickacolor';
    var pickerIdDataKey = 'pickAColorPickerId';
    var pickerDataKey   = 'pickAColor';
    var pickerDimens    = {
      advanced : { height: 176, width: 356 },
      simple   : { height: 176, width: 210 }
    };

    var ids = {};
    var inAction;
    var charMin = 65;
    var visible;

    var cancelButtonHTML = '<div class="' + pickerCSSClass + '-cancel"></div>';
    var submitButtonHTML = '<div class="' + pickerCSSClass + '-submit"></div>';
    var innerHTML = '<div class="' + pickerCSSClass + '-color"><div><div></div></div></div>'
                  + '<div class="' + pickerCSSClass + '-hue"><div></div></div>'
                  + '<div class="' + pickerCSSClass + '-new-color"></div>'
                  + '<div class="' + pickerCSSClass + '-current-color"></div>'
                  + '<div class="' + pickerCSSClass + '-hex">'
                    + '<input type="text" class="' + pickerCSSClass + '-input" maxlength="6" size="6" /><span></span>'
                  + '</div>'
                  + '<div class="' + pickerCSSClass + '-rgb-r ' + pickerCSSClass + '-field">'
                    + '<input type="text" class="' + pickerCSSClass + '-input" maxlength="3" size="3" /><span></span>'
                  + '</div>'
                  + '<div class="' + pickerCSSClass + '-rgb-g ' + pickerCSSClass + '-field">'
                    + '<input type="text" class="' + pickerCSSClass + '-input" maxlength="3" size="3" /><span></span>'
                  + '</div>'
                  + '<div class="' + pickerCSSClass + '-rgb-b ' + pickerCSSClass + '-field">'
                    + '<input type="text" class="' + pickerCSSClass + '-input" maxlength="3" size="3" /><span></span>'
                  + '</div>'
                  + '<div class="' + pickerCSSClass + '-hsb-h ' + pickerCSSClass + '-field">'
                    + '<input type="text" class="' + pickerCSSClass + '-input" maxlength="3" size="3" /><span></span>'
                  + '</div>'
                  + '<div class="' + pickerCSSClass + '-hsb-s ' + pickerCSSClass + '-field">'
                    + '<input type="text" class="' + pickerCSSClass + '-input" maxlength="3" size="3" /><span></span>'
                  + '</div>'
                  + '<div class="' + pickerCSSClass + '-hsb-b ' + pickerCSSClass + '-field">'
                    + '<input type="text" class="' + pickerCSSClass + '-input" maxlength="3" size="3" /><span></span>'
                  + '</div>'
                  + cancelButtonHTML
                  + submitButtonHTML;

    var htmlStringAdvanced = '<div class="' + pickerCSSClass + '-advanced">' + innerHTML + '</div>';
    var htmlStringSimple = '<div class="' + pickerCSSClass + '-simple">' + innerHTML + '</div>';


    var fillRGBFields = function (hsb, pickerElement) {
      var picker = $(pickerElement).data(pickerDataKey);
      var rgb = hsbToRGB(hsb);

      picker.fields
            .eq(1).val(rgb.r).end()
            .eq(2).val(rgb.g).end()
            .eq(3).val(rgb.b).end();
    };

    var fillHSBFields = function (hsb, pickerElement) {
      var picker = $(pickerElement).data(pickerDataKey);

      picker.fields
            .eq(4).val(hsb.h).end()
            .eq(5).val(hsb.s).end()
            .eq(6).val(hsb.b).end();
    };

    var fillHexFields = function (hsb, pickerElement) {
      var picker = $(pickerElement).data(pickerDataKey);
      var hex = hsbToHex(hsb, picker.allCaps);

      picker.fields.eq(0).val(hex).end();
    };


    var setSelector = function (hsb, pickerElement) {
      var picker = $(pickerElement).data(pickerDataKey);

      picker.selector.css('backgroundColor', "#" + hsbToHex({h: hsb.h, s: 100, b: 100}), picker.allCaps);
      picker.selectorIndic.css({
        left: parseInt(150 * hsb.s / 100, 10),
        top:  parseInt(150 * (100 - hsb.b) / 100, 10)
      });
    };

    var setHue = function (hsb, pickerElement) {
      var picker = $(pickerElement).data(pickerDataKey);
      picker.hue.css('top', parseInt(150 - 150 * hsb.h / 360, 10));
    };

    var setCurrentColor = function (hsb, pickerElement) {
      var picker = $(pickerElement).data(pickerDataKey);
      picker.currentColor.css('backgroundColor', "#" + hsbToHex(hsb, picker.allCaps));
    };

    var setNewColor = function (hsb, pickerElement) {
      var picker = $(pickerElement).data(pickerDataKey);
      picker.newColor.css('backgroundColor', "#" + hsbToHex(hsb, picker.allCaps));
    };

    var resetColor = function (ev) {
      var picker = $(this).parent().data(pickerDataKey);

      if (picker.livePreview === true) {
        change.apply(this);
      }
    };


    var keyup = function (ev) {
      var pressedKey = ev.charCode || ev.keyCode || -1;
      if ((pressedKey > charMin && pressedKey <= 90) || pressedKey === 32) {
        return false;
      }

      var picker = $(this).parent().parent().data(pickerDataKey);

      if (picker.livePreview === true) {
        change.apply(this);
      }
    };

    var change = function (ev) {
      var pickerElements = ((this.parentNode.className === pickerCSSClass) ? $(this).parent() : $(this).parent().parent());
      var pickerElement = pickerElements.get(0);
      var picker = pickerElements.data(pickerDataKey);

      var color;

      if (this.parentNode.className.indexOf('-hex') > 0) {
        picker.color = color = hexToHSB(fixHex(this.value));
      } else if (this.parentNode.className.indexOf('-hsb') > 0) {
        picker.color = color = fixHSB({
          h: parseInt(picker.fields.eq(4).val(), 10),
          s: parseInt(picker.fields.eq(5).val(), 10),
          b: parseInt(picker.fields.eq(6).val(), 10)
        });
      } else if (this.parentNode.className.indexOf('-rgb') > 0) {
        picker.color = color = rgbToHSB(fixRGB({
          r: parseInt(picker.fields.eq(1).val(), 10),
          g: parseInt(picker.fields.eq(2).val(), 10),
          b: parseInt(picker.fields.eq(3).val(), 10)
        }));
      } else if (this.parentNode.className === pickerCSSClass) {
        picker.color = color = picker.origColor;
      }

      if (ev) {
        fillRGBFields(color, pickerElement);
        fillHexFields(color, pickerElement);
        fillHSBFields(color, pickerElement);
      }

      setSelector(color, pickerElement);
      setHue(color, pickerElement);
      setNewColor(color, pickerElement);

      picker.onChange.apply(pickerElements, [ color, hsbToHex(color, picker.allCaps), hsbToRGB(color) ]);
    };

    var blur = function (ev) {
      var picker = $(this).parent().parent();
      picker.data(pickerDataKey).fields.parent().removeClass(pickerCSSClass + '-focus');
    };

    var focus = function () {
      charMin = (this.parentNode.className.indexOf('-hex') > 0) ? 70 : 65;

      $(this).parent().parent().data(pickerDataKey).fields.parent().removeClass(pickerCSSClass + '-focus');
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
        preview:    $(this).parent().parent().data(pickerDataKey).livePreview
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

      current.preview = current.pickerElements.data(pickerDataKey).livePreview;

      $(document).on('mouseup', current, upHue);
      $(document).on('mousemove', current, moveHue);
    };

    var moveHue = function (ev) {
      var picker = ev.data.pickerElements.data(pickerDataKey);

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
      var picker = ev.data.pickerElements.data(pickerDataKey);

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

      current.preview = current.pickerElements.data(pickerDataKey).livePreview;

      $(document).on('mouseup', current, upSelector);
      $(document).on('mousemove', current, moveSelector);
    };

    var moveSelector = function (ev) {
      var picker = ev.data.pickerElements.data(pickerDataKey);

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
      var picker = ev.data.pickerElements.data(pickerDataKey);

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
      cancel.apply(this);
    };


    var clickSubmit = function (ev) {
      submit.apply($(this));
    };


    var show = function (ev) {
      var pickerElements = $("#" + $(this).data(pickerIdDataKey));
      var pickerElement = pickerElements.get(0);
      var picker = pickerElements.data(pickerDataKey);

      picker.onBeforeShow.apply(this, [ picker ]);

      var inputPosition    = $(this).offset();
      inputPosition.bottom = inputPosition.top + this.offsetHeight;
      inputPosition.right  = inputPosition.left + this.offsetWidth;

      var pickerPosition = {};

      var pickerHeight = (picker.isAdvanced ? pickerDimens.advanced.height : pickerDimens.simple.height);
      var pickerWidth  = (picker.isAdvanced ? pickerDimens.advanced.width  : pickerDimens.simple.width);

      switch (picker.pickerPosition) {
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

      if (pickerPosition.top < windowBoundaries.top) {
        pickerPosition.top = (picker.pickerPosition.startsWith('top') ? inputPosition.bottom : 0);
      } else if (pickerPosition.bottom  > windowBoundaries.bottom) {
        pickerPosition.top -= (picker.pickerPosition.startsWith('bottom') ? (this.offsetHeight + pickerHeight) : (pickerPosition.bottom - windowBoundaries.bottom));
      }

      if (pickerPosition.left < windowBoundaries.left) {
        if (picker.pickerPosition === 'left') {
          pickerPosition.left = inputPosition.right;
        } else {
          pickerPosition.left = 0;
        }

        if (picker.pickerPosition === 'left-bottom') {

        } else if (picker.pickerPosition === 'left-top') {
          pickerPosition.top -= this.offsetHeight;
          pickerPosition.top += this.offsetHeight;
        }
      } else if (pickerPosition.right > windowBoundaries.right) {
        if (picker.pickerPosition === 'right') {
          pickerPosition.left = (inputPosition.left - pickerWidth);
        } else {
          pickerPosition.left -= (pickerPosition.right - windowBoundaries.right);
        }

        if (picker.pickerPosition === 'right-bottom') {
          pickerPosition.top -= this.offsetHeight;
        } else if (picker.pickerPosition === 'right-top') {
          pickerPosition.top += this.offsetHeight;
        }
      }

      pickerElements.css({ left: pickerPosition.left + "px", top: pickerPosition.top + "px" });

      if (picker.onShow.apply(this, [ pickerElement ]) !== false) {
        pickerElements.show();
      }

      $(document).on('mousedown', { pickerElements: pickerElements }, hide);

      return false;
    };

    var hide = function (ev) {
      var pickerElements = ev.data.pickerElements;
      var pickerElement = pickerElements.get(0);
      var picker = pickerElements.data(pickerDataKey);

      if (!isChildOf(pickerElement, ev.target, pickerElement)) {
        if (picker.onHide.apply(this, [ pickerElement ]) !== false) {
          pickerElements.hide();
        }
        $(document).off('mousedown', hide);
      }
    };

    var cancel = function (ev) {
      var pickerElements = $(this).parent();
      var pickerElement = pickerElements.get(0);
      var picker = pickerElements.data(pickerDataKey);

      if (picker.onBeforeCancel.apply(pickerElements, [ picker ])) {
        resetColor.apply(this);

        $(picker.el).PickAColorHide();

        picker.onCancel.apply(pickerElements, [ picker.origColor, hsbToHex(picker.origColor, picker.allCaps), hsbToRGB(picker.origColor), pickerElement ]);
      }
    };

    var submit = function (ev) {
      var pickerElements = $(this).parent();
      var pickerElement = pickerElements.get(0);
      var picker = pickerElements.data(pickerDataKey);

      var color = picker.color;

      picker.origColor = color;
      setCurrentColor(color, pickerElement);

      picker.onSubmit.apply(pickerElements, [ color, hsbToHex(color, picker.allCaps), hsbToRGB(color), pickerElement ]);
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
        r: Math.round(rgb.r),
        g: Math.round(rgb.g),
        b: Math.round(rgb.b)
      };
    };


    var rgbToHex = function (rgb, allCaps) {
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

      hexString = hex.join("");
      if (allCaps) {
        hexString = hexString.toUpperCase();
      }

      return hexString;
    };

    var hsbToHex = function (hsb, allCaps) {
      return rgbToHex(hsbToRGB(hsb), allCaps);
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
          if (!$(this).data(pickerIdDataKey)) {
            var options    = $.extend({}, opt);
            var id         = pickerCSSClass + parseInt(Math.random() * 1000);
            var isAdvanced = (options.type === 'advanced');
            var htmlString = isAdvanced ? htmlStringAdvanced : htmlStringSimple;

            if (options.hideButtons === true) {
              htmlString = htmlString.replace(cancelButtonHTML, "")
                                     .replace(submitButtonHTML, "");
            }

            var pickerElements = $(htmlString).attr('id', id);


            if (options.popup) {
              pickerElements.appendTo(document.body);
            } else {
              pickerElements.appendTo(this).show();
            }


            options.el = this;
            $(options.el).data(pickerIdDataKey, id);

            options.currentColor  = pickerElements.find('.' + pickerCSSClass + '-current-color');
            options.fields        = pickerElements.find('input');
            options.hue           = pickerElements.find('.' + pickerCSSClass + '-hue div');
            options.isAdvanced    = isAdvanced;
            options.newColor      = pickerElements.find('.' + pickerCSSClass + '-new-color');
            options.origColor     = opt.defaultColor;
            options.selector      = pickerElements.find('.' + pickerCSSClass + '-color').on('mousedown', downSelector);
            options.selectorIndic = options.selector.find('div div');


            pickerElements.find('.' + pickerCSSClass + '-hue')
                          .on('mousedown', downHue);

            if (isAdvanced) {
              options.fields.on('keyup',  keyup)
                            .on('change', change)
                            .on('blur',   blur)
                            .on('focus',  focus);

              pickerElements.find('span')
                            .on('mousedown', downIncrement);

              pickerElements.find('.' + pickerCSSClass + '-current-color')
                            .on('click', resetColor);

              if (options.hideButtons === false) {
                pickerElements.find('.' + pickerCSSClass + '-cancel')
                              .on('mouseenter', giveFocus)
                              .on('mouseleave', loseFocus)
                              .on('click',      clickCancel);

                pickerElements.find('.' + pickerCSSClass + '-submit')
                              .on('mouseenter', giveFocus)
                              .on('mouseleave', loseFocus)
                              .on('click',      clickSubmit);
              }
            }


            pickerElements.data(pickerDataKey, options);


            var pickerElement = pickerElements.get(0);

            fillRGBFields(options.defaultColor, pickerElement);
            fillHSBFields(options.defaultColor, pickerElement);
            fillHexFields(options.defaultColor, pickerElement);

            setHue(options.defaultColor, pickerElement);
            setSelector(options.defaultColor, pickerElement);
            setCurrentColor(options.defaultColor, pickerElement);
            setNewColor(options.defaultColor, pickerElement);


            if (!options.popup) {
              pickerElements.css({ position: 'relative', display:  'block' });
              return;
            }
            $(this).on(options.popupEvent, { pickerPosition: options.pickerPosition }, show);
          }
        });
      },


      hidePicker: function() {
        return this.each( function () {
          if ($(this).data(pickerIdDataKey)) {
            $("#" + $(this).data(pickerIdDataKey)).hide();
          }
        });
      },


      setColor: function(color) {
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
          if ($(this).data(pickerIdDataKey)) {
            var pickerElements = $('#' + $(this).data(pickerIdDataKey));
            var pickerElement = pickerElements.get(0);
            var picker = pickerElements.data(pickerDataKey);

            picker.color = color;
            picker.origColor = color;

            fillRGBFields(color, pickerElement);
            fillHSBFields(color, pickerElement);
            fillHexFields(color, pickerElement);

            setHue(color, pickerElement);
            setSelector(color, pickerElement);
            setCurrentColor(color, pickerElement);
            setNewColor(color, pickerElement);

            picker.onChange.apply(pickerElements, [ color, hsbToHex(color, picker.allCaps), hsbToRGB(color) ]);
          }
        });
      },


      showPicker: function() {
        return this.each( function () {
          if ($(this).data(pickerIdDataKey)) {
            show.apply(this);
          }
        });
      }
    };
  }();


  $.fn.extend({
    PickAColor:           PickAColor.init,
    PickAColorHide:       PickAColor.hidePicker,
    PickAColorSetColor:   PickAColor.setColor,
    PickAColorShow:       PickAColor.showPicker
  });
})(jQuery);




if (typeof String.prototype.startsWith !== 'function') {
  String.prototype.startsWith = function(startString) {
    return (this.slice(0, startString.length) === startString);
  };
}


if (typeof String.prototype.endsWith !== 'function') {
  String.prototype.endsWith = function(endString) {
    return (this.slice(-endString.length) === endString);
  };
}