class PickAColor.PickerElement

  CSS_CLASS: "pickacolor"

  WIDTH:  0
  HEIGHT: 0

  HTML = '<div class="' + PickAColor.PickerElement.CSS_CLASS + '">' +
            '<div class="' + PickAColor.PickerElement.CSS_CLASS + '-color"><div><div></div></div></div>' +
            '<div class="' + PickAColor.PickerElement.CSS_CLASS + '-hue"><div></div></div>' +
            '<div class="' + PickAColor.PickerElement.CSS_CLASS + '-new-color"></div>' +
            '<div class="' + PickAColor.PickerElement.CSS_CLASS + '-current-color"></div>' +
            '<div class="' + PickAColor.PickerElement.CSS_CLASS + '-hex"><input type="text" maxlength="6" size="6" /></div>' +
            '<div class="' + PickAColor.PickerElement.CSS_CLASS + '-rgb-r ' + PickAColor.PickerElement.CSS_CLASS + '-field"><input type="text" maxlength="3" size="3" /><span></span></div>' +
            '<div class="' + PickAColor.PickerElement.CSS_CLASS + '-rgb-g ' + PickAColor.PickerElement.CSS_CLASS + '-field"><input type="text" maxlength="3" size="3" /><span></span></div>' +
            '<div class="' + PickAColor.PickerElement.CSS_CLASS + '-rgb-b ' + PickAColor.PickerElement.CSS_CLASS + '-field"><input type="text" maxlength="3" size="3" /><span></span></div>' +
            '<div class="' + PickAColor.PickerElement.CSS_CLASS + '-hsb-h ' + PickAColor.PickerElement.CSS_CLASS + '-field"><input type="text" maxlength="3" size="3" /><span></span></div>' +
            '<div class="' + PickAColor.PickerElement.CSS_CLASS + '-hsb-s ' + PickAColor.PickerElement.CSS_CLASS + '-field"><input type="text" maxlength="3" size="3" /><span></span></div>' +
            '<div class="' + PickAColor.PickerElement.CSS_CLASS + '-hsb-b ' + PickAColor.PickerElement.CSS_CLASS + '-field"><input type="text" maxlength="3" size="3" /><span></span></div>' +
            '<div class="' + PickAColor.PickerElement.CSS_CLASS + '-cancel"></div>' +
            '<div class="' + PickAColor.PickerElement.CSS_CLASS + '-submit"></div>' +
          '</div>'


  _element:      null
  _boundElement: null

  _hueElement:           null
  _newColorElement:      null
  _origColorElement:     null
  _selectorElement:      null
  _selectorIndicElement: null

  position: {
    top:    0
    left:   0
    bottom: 0
    right:  0
  }



  init: (id, isStatic, boundElement, popupEvent) ->
    if !id?
      throw "PickAColor.PickerElement.init: `id` cannot be null or undefined"


    @_element      = $(htmlString)[0].attr('id', id)
    @_boundElement = boundElement

    @_hueElement           = @_element.find(".#{PickAColor.PickerElement.CSS_CLASS}-hue div")
    @_newColorElement      = @_element.find(".#{PickAColor.PickerElement.CSS_CLASS}-new-color")
    @_origColorElement     = @_element.find(".#{PickAColor.PickerElement.CSS_CLASS}-current-color")
    @_selectorElement      = @_element.find(".#{PickAColor.PickerElement.CSS_CLASS}-color")
    @_selectorIndicElement = @_element.find('div div')


    if (isStatic != false)
      @_element.appendTo(boundElement)
      @show()
    else
      @_element.appendTo(document.body)


    @_element.find('span').on('mousedown', @_downIncrement)
    @_element.find(".#{PickAColor.PickerElement.CSS_CLASS}-current-color").on('click', @_onClickOriginalColor)
    @_element.find(".#{PickAColor.PickerElement.CSS_CLASS}-cancel")
             .on('mouseenter', @_onButtonGiveFocus)
             .on('mouseleave', @_onButtonLoseFocus)
             .on('click', @_onClickCancel)
    @_element.find(".#{PickAColor.PickerElement.CSS_CLASS}-submit")
             .on('mouseenter', @_onButtonGiveFocus)
             .on('mouseleave', @_onButtonLoseFocus)
             .on('click', @_onClickSubmit)


    # TODO: finish setting up object


    $(@_boundElement).on(popupEvent, show)


  setColor: (hsbColor) ->
    # TODO: Implement
    @_element.hue.css('top', parseInt(150 - 150 * hsb.h / 360, 10))
    return


  setPosition: (newPosition) ->
    $(@_element).css({ top: "#{newPosition.top}px", left: "#{newPosition.left}px" })
    @position = newPosition


  show: ->
    $(@_element).show()


  hide: ->
    $(@_element).hide()


  _updateHue: (color) ->
    # TODO: Implement
    return