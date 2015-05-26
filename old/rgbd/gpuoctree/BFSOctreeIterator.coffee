define (require) ->
  class BFSOCtreeIterator
    constructor: (@octree) ->
      @stack = [ @octree.root ]

    next: () ->
      cell = @stack.shift()
      if cell
        @stack.push(childCell) for childCell in cell.children
      return cell

    reset: () ->
      @stack.length = 0
      @stack.push( @octree.root )