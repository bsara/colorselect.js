class PickAColor.BoundElement

  _element: null


  width:  0
  height: 0

  position: {
    top:    0
    left:   0
    bottom: 0
    right:  0
  }



  init: (element) ->
    if !element?
      throw "PickAColor.BoundElement.init: `element` cannot be null or undefined"
    @_element = $(element)

    # TODO: set width
    # TODO: set height
    # TODO: set posistion