class PickAColor.Picker

  PICKER_POSITIONS: [
    'top-left'
    'top-right'

    'bottom-left'
    'bottom-right'

    'left'
    'left-top'
    'left-bottom'

    'right'
    'right-top'
    'right-bottom'
  ]


  _id:            null

  _boundElement:  null
  _pickerElement: null

  _color:         null
  _currentColor:  null
  _newColor:      null
  _origColor:     null

  allCaps:        true
  defaultColor:   'FF0000'
  isStatic:       false
  livePreview:    true
  pickerPosition: 'bottom-left'
  popupEvent:     'click'



  init: (boundElement, options) ->
    @_boundElement = new PickAColor.BoundElement(boundElement)

    @_id = "PickAColorPicker#{parseInt(Math.random() * 1000)}"

    if !options?
      options = {}

    @allCaps        = options.allCaps        if options.allCaps? && typeof options.allCaps == 'boolean'
    @defaultColor   = options.defaultColor   if options.defaultColor? && typeof options.allCaps == 'string'
    @isStatic       = options.isStatic       if options.isStatic? && typeof options.isStatic == 'boolean'
    @livePreview    = options.livePreview    if options.livePreview? && typeof options.livePreview == 'boolean'
    @pickerPosition = options.pickerPosition if options.pickerPosition? && typeof options.pickerPosition == 'string' && PickAColor.Picker.PICKER_POSITIONS.indexOf(options.pickerPosition) > -1
    @popupEvent     = options.popupEvent     if options.popupEvent? && typeof options.popupEvent == 'string'

    # TODO: Implement
    return


  getColorAsHex: ->
    # TODO: Implement
    return


  getColorAsHSB: ->
    return _color


  getColorAsRGB: ->
    # TODO: Implement
    return


  _setColor: (color) ->
    # TODO: Implement
    return


  _resetColor: ->
    # TODO: Implement
    return


  _submit: ->
    # TODO: Implement
    return


  _cancel: ->
    # TODO: Implement
    return


  _show: ->
    if (@onBeforeShow.apply(this, [ this ]) != false)
      return

    pickerExactPosition = {
      top:    0
      left:   0
      bottom: 0
      right:  0
    }

    switch @pickerPosition
      when 'top-left':
        pickerExactPosition.top  = _boundElement.position.top - _pickerElement.HEIGHT
        pickerExactPosition.left = _boundElement.position.left
        break
      when 'top-right':
        pickerExactPosition.top  = _boundElement.position.top - _pickerElement.HEIGHT
        pickerExactPosition.left = _boundElement.position.right - _pickerElement.WIDTH
        break
      when 'bottom-left':
        pickerExactPosition.top  = _boundElement.position.bottom
        pickerExactPosition.left = _boundElement.position.left
        break
      when 'bottom-right':
        pickerExactPosition.top  = _boundElement.position.bottom
        pickerExactPosition.left = _boundElement.position.right - _pickerElement.WIDTH
        break
      when 'left':
        pickerExactPosition.top  = _boundElement.position.top - ((_pickerElement.HEIGHT / 2) - (this.offsetHeight / 2))
        pickerExactPosition.left = _boundElement.position.left - _pickerElement.WIDTH
        break
      when 'left-top':
        pickerExactPosition.top  = _boundElement.position.top
        pickerExactPosition.left = _boundElement.position.left - _pickerElement.WIDTH
        break
      when 'left-bottom':
        pickerExactPosition.top  = _boundElement.position.bottom - _pickerElement.HEIGHT
        pickerExactPosition.left = _boundElement.position.left - _pickerElement.WIDTH
        break
      when 'right'
        pickerExactPosition.top  = _boundElement.position.top - ((_pickerElement.HEIGHT / 2) - (this.offsetHeight / 2))
        pickerExactPosition.left = _boundElement.position.right
        break
      when 'right-top':
        pickerExactPosition.top  = _boundElement.position.top
        pickerExactPosition.left = _boundElement.position.right
        break
      when 'right-bottom':
        pickerExactPosition.top  = _boundElement.position.bottom - _pickerElement.HEIGHT
        pickerExactPosition.left = _boundElement.position.right
        break

    viewPort = getViewport()

    windowBoundaries = {
      top:    0
      left:   0
      bottom: viewPort.t + viewPort.h
      right:  viewPort.l + viewPort.w
    }

    # BUG: Repositioning issues with new positioning options

    if (pickerExactPosition.top < windowBoundaries.top)
      pickerExactPosition.top = 0
    else if (pickerExactPosition.bottom  > windowBoundaries.bottom)
      pickerExactPosition.top -= this.offsetHeight + _pickerElement.HEIGHT

    if (pickerExactPosition.left < windowBoundaries.left)
      pickerExactPosition.left = 0
    else if (pickerExactPosition.right > windowBoundaries.right)
      pickerExactPosition.left -= _pickerElement.WIDTH

    _pickerElement.setPosition(pickerExactPosition)


    _pickerElement.show()
    @onShow.apply(this, [ this ])

    $(document).on('mousedown', @_hide)


    return false


  _hide: ->
    # TODO: Implement
    return


  #--------------------------------------#
  # Event Handlers                       #
  #--------------------------------------#

  onBeforeCancel: (picker) ->
    return true


  onBeforeShow: (picker) ->
    return true


  onCancel: (hsb, hex, rgb, pickerElement) ->
    return


  onChange: (hsb, hex, rgb) ->
    return


  onHide: (pickerElement) ->
    return


  onShow: (pickerElement) ->
    return


  onSubmit: (hsb, hex, rgb, pickerElement) ->
    return