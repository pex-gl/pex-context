/**
 * Basic mouse events
 * @type {{MOUSE_DOWN: string, MOUSE_PRESSED: string, MOUSE_UP: string, MOUSE_MOVE: string, MOUSE_STOP: string, MOUSE_DRAG: string, MOUSE_OUT: string, MOUSE_ENTER: string, MOUSE_LEAVE: string, MOUSE_WHEEL: string}}
 */
var MouseEvent = {
    MOUSE_DOWN : 'mousedown',
    MOUSE_PRESSED : 'mousepressed',
    MOUSE_UP : 'mouseup',
    MOUSE_MOVE : 'mousemove',
    MOUSE_STOP : 'mousestop',
    MOUSE_DRAG : 'mousedrag',
    MOUSE_OUT : 'mouseout',
    MOUSE_ENTER : 'mouseenter',
    MOUSE_LEAVE : 'mouseleave',
    MOUSE_WHEEL : 'mousewheel'
};

module.exports = MouseEvent;