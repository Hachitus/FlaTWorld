/*! Hammer.JS - v2.0.6 - 2015-12-23
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2015 Jorik Tangelder;
 * Licensed under the  license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean=false} [merge]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.allow = true; // used by Input.TouchMouse to disable mouse events
    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down, and mouse events are allowed (see the TouchMouse input)
        if (!this.pressed || !this.allow) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */
function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        // when we're in a touch event, so  block all upcoming mouse events
        // most mobile browser also emit mouseevents, right after touchstart
        if (isTouch) {
            this.mouse.allow = false;
        } else if (isMouse && !this.mouse.allow) {
            return;
        }

        // reset the allowMouse when we're done
        if (inputEvent & (INPUT_END | INPUT_CANCEL)) {
            this.mouse.allow = true;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        // not needed with native support for the touchAction property
        if (NATIVE_TOUCH_ACTION) {
            return;
        }

        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE);
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.6';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    each(manager.options.cssProps, function(value, name) {
        element.style[prefixed(element.style, name)] = add ? value : '';
    });
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (typeof define === 'function' && define.amd) {
    define(function() {
        return Hammer;
    });
} else if (typeof module != 'undefined' && module.exports) {
    module.exports = Hammer;
} else {
    window[exportName] = Hammer;
}

})(window, document, 'Hammer');
(function () {
  'use strict';

  var has = Object.prototype.hasOwnProperty;

  //
  // We store our EE objects in a plain object whose properties are event names.
  // If `Object.create(null)` is not supported we prefix the event names with a
  // `~` to make sure that the built-in object properties are not overridden or
  // used as an attack vector.
  // We also assume that `Object.create(null)` is available when the event name
  // is an ES6 Symbol.
  //
  var prefix = typeof Object.create !== 'function' ? '~' : false;

  /**
   * Representation of a single EventEmitter function.
   *
   * @param {Function} fn Event handler to be called.
   * @param {Mixed} context Context for function execution.
   * @param {Boolean} [once=false] Only emit once
   * @api private
   */
  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }

  /**
   * Minimal EventEmitter interface that is molded against the Node.js
   * EventEmitter interface.
   *
   * @constructor
   * @api public
   */
  function EventEmitter() { /* Nothing to set */ }

  /**
   * Hold the assigned EventEmitters by name.
   *
   * @type {Object}
   * @private
   */
  EventEmitter.prototype._events = undefined;

  /**
   * Return an array listing the events for which the emitter has registered
   * listeners.
   *
   * @returns {Array}
   * @api public
   */
  EventEmitter.prototype.eventNames = function eventNames() {
    var events = this._events
      , names = []
      , name;

    if (!events) return names;

    for (name in events) {
      if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
    }

    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }

    return names;
  };

  /**
   * Return a list of assigned event listeners.
   *
   * @param {String} event The events that should be listed.
   * @param {Boolean} exists We only need to know if there are listeners.
   * @returns {Array|Boolean}
   * @api public
   */
  EventEmitter.prototype.listeners = function listeners(event, exists) {
    var evt = prefix ? prefix + event : event
      , available = this._events && this._events[evt];

    if (exists) return !!available;
    if (!available) return [];
    if (available.fn) return [available.fn];

    for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
      ee[i] = available[i].fn;
    }

    return ee;
  };

  /**
   * Emit an event to all registered event listeners.
   *
   * @param {String} event The name of the event.
   * @returns {Boolean} Indication if we've emitted an event.
   * @api public
   */
  EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;

    if (!this._events || !this._events[evt]) return false;

    var listeners = this._events[evt]
      , len = arguments.length
      , args
      , i;

    if ('function' === typeof listeners.fn) {
      if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

      switch (len) {
        case 1: return listeners.fn.call(listeners.context), true;
        case 2: return listeners.fn.call(listeners.context, a1), true;
        case 3: return listeners.fn.call(listeners.context, a1, a2), true;
        case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
        case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
        case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }

      for (i = 1, args = new Array(len -1); i < len; i++) {
        args[i - 1] = arguments[i];
      }

      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length
        , j;

      for (i = 0; i < length; i++) {
        if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

        switch (len) {
          case 1: listeners[i].fn.call(listeners[i].context); break;
          case 2: listeners[i].fn.call(listeners[i].context, a1); break;
          case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
          default:
            if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
              args[j - 1] = arguments[j];
            }

            listeners[i].fn.apply(listeners[i].context, args);
        }
      }
    }

    return true;
  };

  /**
   * Register a new EventListener for the given event.
   *
   * @param {String} event Name of the event.
   * @param {Function} fn Callback function.
   * @param {Mixed} [context=this] The context of the function.
   * @api public
   */
  EventEmitter.prototype.on = function on(event, fn, context) {
    var listener = new EE(fn, context || this)
      , evt = prefix ? prefix + event : event;

    if (!this._events) this._events = prefix ? {} : Object.create(null);
    if (!this._events[evt]) this._events[evt] = listener;
    else {
      if (!this._events[evt].fn) this._events[evt].push(listener);
      else this._events[evt] = [
        this._events[evt], listener
      ];
    }

    return this;
  };

  /**
   * Add an EventListener that's only called once.
   *
   * @param {String} event Name of the event.
   * @param {Function} fn Callback function.
   * @param {Mixed} [context=this] The context of the function.
   * @api public
   */
  EventEmitter.prototype.once = function once(event, fn, context) {
    var listener = new EE(fn, context || this, true)
      , evt = prefix ? prefix + event : event;

    if (!this._events) this._events = prefix ? {} : Object.create(null);
    if (!this._events[evt]) this._events[evt] = listener;
    else {
      if (!this._events[evt].fn) this._events[evt].push(listener);
      else this._events[evt] = [
        this._events[evt], listener
      ];
    }

    return this;
  };

  /**
   * Remove event listeners.
   *
   * @param {String} event The event we want to remove.
   * @param {Function} fn The listener that we need to find.
   * @param {Mixed} context Only remove listeners matching this context.
   * @param {Boolean} once Only remove once listeners.
   * @api public
   */
  EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;

    if (!this._events || !this._events[evt]) return this;

    var listeners = this._events[evt]
      , events = [];

    if (fn) {
      if (listeners.fn) {
        if (
             listeners.fn !== fn
          || (once && !listeners.once)
          || (context && listeners.context !== context)
        ) {
          events.push(listeners);
        }
      } else {
        for (var i = 0, length = listeners.length; i < length; i++) {
          if (
               listeners[i].fn !== fn
            || (once && !listeners[i].once)
            || (context && listeners[i].context !== context)
          ) {
            events.push(listeners[i]);
          }
        }
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) {
      this._events[evt] = events.length === 1 ? events[0] : events;
    } else {
      delete this._events[evt];
    }

    return this;
  };

  /**
   * Remove all listeners or only the listeners for the specified event.
   *
   * @param {String} event The event want to remove all listeners for.
   * @api public
   */
  EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    if (!this._events) return this;

    if (event) delete this._events[prefix ? prefix + event : event];
    else this._events = prefix ? {} : Object.create(null);

    return this;
  };

  //
  // Alias methods names because people roll like that.
  //
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  //
  // This function doesn't apply anymore.
  //
  EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
    return this;
  };

  //
  // Expose the prefix.
  //
  EventEmitter.prefixed = prefix;

  //
  // Expose the module.
  //
  window.EventEmitter = EventEmitter;
})();
/*
 * Hamster.js v1.0.5
 * (c) 2013 Monospaced http://monospaced.com
 * License: MIT
 */

(function(window, document){
'use strict';

/**
 * Hamster
 * use this to create instances
 * @returns {Hamster.Instance}
 * @constructor
 */
var Hamster = function(element) {
  return new Hamster.Instance(element);
};

// default event name
Hamster.SUPPORT = 'wheel';

// default DOM methods
Hamster.ADD_EVENT = 'addEventListener';
Hamster.REMOVE_EVENT = 'removeEventListener';
Hamster.PREFIX = '';

// until browser inconsistencies have been fixed...
Hamster.READY = false;

Hamster.Instance = function(element){
  if (!Hamster.READY) {
    // fix browser inconsistencies
    Hamster.normalise.browser();

    // Hamster is ready...!
    Hamster.READY = true;
  }

  this.element = element;

  // store attached event handlers
  this.handlers = [];

  // return instance
  return this;
};

/**
 * create new hamster instance
 * all methods should return the instance itself, so it is chainable.
 * @param   {HTMLElement}       element
 * @returns {Hamster.Instance}
 * @constructor
 */
Hamster.Instance.prototype = {
  /**
   * bind events to the instance
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   * @returns {Hamster.Instance}
   */
  wheel: function onEvent(handler, useCapture){
    Hamster.event.add(this, Hamster.SUPPORT, handler, useCapture);

    // handle MozMousePixelScroll in older Firefox
    if (Hamster.SUPPORT === 'DOMMouseScroll') {
      Hamster.event.add(this, 'MozMousePixelScroll', handler, useCapture);
    }

    return this;
  },

  /**
   * unbind events to the instance
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   * @returns {Hamster.Instance}
   */
  unwheel: function offEvent(handler, useCapture){
    // if no handler argument,
    // unbind the last bound handler (if exists)
    if (handler === undefined && (handler = this.handlers.slice(-1)[0])) {
      handler = handler.original;
    }

    Hamster.event.remove(this, Hamster.SUPPORT, handler, useCapture);

    // handle MozMousePixelScroll in older Firefox
    if (Hamster.SUPPORT === 'DOMMouseScroll') {
      Hamster.event.remove(this, 'MozMousePixelScroll', handler, useCapture);
    }

    return this;
  }
};

Hamster.event = {
  /**
   * cross-browser 'addWheelListener'
   * @param   {Instance}    hamster
   * @param   {String}      eventName
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   */
  add: function add(hamster, eventName, handler, useCapture){
    // store the original handler
    var originalHandler = handler;

    // redefine the handler
    handler = function(originalEvent){

      if (!originalEvent) {
        originalEvent = window.event;
      }

      // create a normalised event object,
      // and normalise "deltas" of the mouse wheel
      var event = Hamster.normalise.event(originalEvent),
          delta = Hamster.normalise.delta(originalEvent);

      // fire the original handler with normalised arguments
      return originalHandler(event, delta[0], delta[1], delta[2]);

    };

    // cross-browser addEventListener
    hamster.element[Hamster.ADD_EVENT](Hamster.PREFIX + eventName, handler, useCapture || false);

    // store original and normalised handlers on the instance
    hamster.handlers.push({
      original: originalHandler,
      normalised: handler
    });
  },

  /**
   * removeWheelListener
   * @param   {Instance}    hamster
   * @param   {String}      eventName
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   */
  remove: function remove(hamster, eventName, handler, useCapture){
    // find the normalised handler on the instance
    var originalHandler = handler,
        lookup = {},
        handlers;
    for (var i = 0, len = hamster.handlers.length; i < len; ++i) {
      lookup[hamster.handlers[i].original] = hamster.handlers[i];
    }
    handlers = lookup[originalHandler];
    handler = handlers.normalised;

    // cross-browser removeEventListener
    hamster.element[Hamster.REMOVE_EVENT](Hamster.PREFIX + eventName, handler, useCapture || false);

    // remove original and normalised handlers from the instance
    for (var h in hamster.handlers) {
      if (hamster.handlers[h] == handlers) {
        hamster.handlers.splice(h, 1);
        break;
      }
    }
  }
};

/**
 * these hold the lowest deltas,
 * used to normalise the delta values
 * @type {Number}
 */
var lowestDelta,
    lowestDeltaXY;

Hamster.normalise = {
  /**
   * fix browser inconsistencies
   */
  browser: function normaliseBrowser(){
    // detect deprecated wheel events
    if (!('onwheel' in document || document.documentMode >= 9)) {
      Hamster.SUPPORT = document.onmousewheel !== undefined ?
                        'mousewheel' : // webkit and IE < 9 support at least "mousewheel"
                        'DOMMouseScroll'; // assume remaining browsers are older Firefox
    }

    // detect deprecated event model
    if (!window.addEventListener) {
      // assume IE < 9
      Hamster.ADD_EVENT = 'attachEvent';
      Hamster.REMOVE_EVENT = 'detachEvent';
      Hamster.PREFIX = 'on';
    }

  },

  /**
   * create a normalised event object
   * @param   {Function}    originalEvent
   * @returns {Object}      event
   */
  event: function normaliseEvent(originalEvent){
    var event = {
          // keep a reference to the original event object
          originalEvent: originalEvent,
          target: originalEvent.target || originalEvent.srcElement,
          type: 'wheel',
          deltaMode: originalEvent.type === 'MozMousePixelScroll' ? 0 : 1,
          deltaX: 0,
          delatZ: 0,
          preventDefault: function(){
            if (originalEvent.preventDefault) {
              originalEvent.preventDefault();
            } else {
              originalEvent.returnValue = false;
            }
          },
          stopPropagation: function(){
            if (originalEvent.stopPropagation) {
              originalEvent.stopPropagation();
            } else {
              originalEvent.cancelBubble = false;
            }
          }
        };

    // calculate deltaY (and deltaX) according to the event

    // 'mousewheel'
    if (originalEvent.wheelDelta) {
      event.deltaY = - 1/40 * originalEvent.wheelDelta;
    }
    // webkit
    if (originalEvent.wheelDeltaX) {
      event.deltaX = - 1/40 * originalEvent.wheelDeltaX;
    }

    // 'DomMouseScroll'
    if (originalEvent.detail) {
      event.deltaY = originalEvent.detail;
    }

    return event;
  },

  /**
   * normalise 'deltas' of the mouse wheel
   * @param   {Function}    originalEvent
   * @returns {Array}       deltas
   */
  delta: function normaliseDelta(originalEvent){
    var delta = 0,
      deltaX = 0,
      deltaY = 0,
      absDelta = 0,
      absDeltaXY = 0,
      fn;

    // normalise deltas according to the event

    // 'wheel' event
    if (originalEvent.deltaY) {
      deltaY = originalEvent.deltaY * -1;
      delta  = deltaY;
    }
    if (originalEvent.deltaX) {
      deltaX = originalEvent.deltaX;
      delta  = deltaX * -1;
    }

    // 'mousewheel' event
    if (originalEvent.wheelDelta) {
      delta = originalEvent.wheelDelta;
    }
    // webkit
    if (originalEvent.wheelDeltaY) {
      deltaY = originalEvent.wheelDeltaY;
    }
    if (originalEvent.wheelDeltaX) {
      deltaX = originalEvent.wheelDeltaX * -1;
    }

    // 'DomMouseScroll' event
    if (originalEvent.detail) {
      delta = originalEvent.detail * -1;
    }

    // look for lowest delta to normalize the delta values
    absDelta = Math.abs(delta);
    if (!lowestDelta || absDelta < lowestDelta) {
      lowestDelta = absDelta;
    }
    absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
    if (!lowestDeltaXY || absDeltaXY < lowestDeltaXY) {
      lowestDeltaXY = absDeltaXY;
    }

    // convert deltas to whole numbers
    fn = delta > 0 ? 'floor' : 'ceil';
    delta  = Math[fn](delta / lowestDelta);
    deltaX = Math[fn](deltaX / lowestDeltaXY);
    deltaY = Math[fn](deltaY / lowestDeltaXY);

    return [delta, deltaX, deltaY];
  }
};

// Expose Hamster to the global object
window.Hamster = Hamster;

// requireJS module definition
if (typeof window.define === 'function' && window.define.amd) {
  window.define('hamster', [], function(){
    return Hamster;
  });
}

})(window, window.document);
/*!

 handlebars v4.0.5

Copyright (C) 2011-2015 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@license
*/
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Handlebars"] = factory();
	else
		root["Handlebars"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _handlebarsRuntime = __webpack_require__(2);

	var _handlebarsRuntime2 = _interopRequireDefault(_handlebarsRuntime);

	// Compiler imports

	var _handlebarsCompilerAst = __webpack_require__(21);

	var _handlebarsCompilerAst2 = _interopRequireDefault(_handlebarsCompilerAst);

	var _handlebarsCompilerBase = __webpack_require__(22);

	var _handlebarsCompilerCompiler = __webpack_require__(27);

	var _handlebarsCompilerJavascriptCompiler = __webpack_require__(28);

	var _handlebarsCompilerJavascriptCompiler2 = _interopRequireDefault(_handlebarsCompilerJavascriptCompiler);

	var _handlebarsCompilerVisitor = __webpack_require__(25);

	var _handlebarsCompilerVisitor2 = _interopRequireDefault(_handlebarsCompilerVisitor);

	var _handlebarsNoConflict = __webpack_require__(20);

	var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);

	var _create = _handlebarsRuntime2['default'].create;
	function create() {
	  var hb = _create();

	  hb.compile = function (input, options) {
	    return _handlebarsCompilerCompiler.compile(input, options, hb);
	  };
	  hb.precompile = function (input, options) {
	    return _handlebarsCompilerCompiler.precompile(input, options, hb);
	  };

	  hb.AST = _handlebarsCompilerAst2['default'];
	  hb.Compiler = _handlebarsCompilerCompiler.Compiler;
	  hb.JavaScriptCompiler = _handlebarsCompilerJavascriptCompiler2['default'];
	  hb.Parser = _handlebarsCompilerBase.parser;
	  hb.parse = _handlebarsCompilerBase.parse;

	  return hb;
	}

	var inst = create();
	inst.create = create;

	_handlebarsNoConflict2['default'](inst);

	inst.Visitor = _handlebarsCompilerVisitor2['default'];

	inst['default'] = inst;

	exports['default'] = inst;
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	exports["default"] = function (obj) {
	  return obj && obj.__esModule ? obj : {
	    "default": obj
	  };
	};

	exports.__esModule = true;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = __webpack_require__(3)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _handlebarsBase = __webpack_require__(4);

	var base = _interopRequireWildcard(_handlebarsBase);

	// Each of these augment the Handlebars object. No need to setup here.
	// (This is done to easily share code between commonjs and browse envs)

	var _handlebarsSafeString = __webpack_require__(18);

	var _handlebarsSafeString2 = _interopRequireDefault(_handlebarsSafeString);

	var _handlebarsException = __webpack_require__(6);

	var _handlebarsException2 = _interopRequireDefault(_handlebarsException);

	var _handlebarsUtils = __webpack_require__(5);

	var Utils = _interopRequireWildcard(_handlebarsUtils);

	var _handlebarsRuntime = __webpack_require__(19);

	var runtime = _interopRequireWildcard(_handlebarsRuntime);

	var _handlebarsNoConflict = __webpack_require__(20);

	var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);

	// For compatibility and usage outside of module systems, make the Handlebars object a namespace
	function create() {
	  var hb = new base.HandlebarsEnvironment();

	  Utils.extend(hb, base);
	  hb.SafeString = _handlebarsSafeString2['default'];
	  hb.Exception = _handlebarsException2['default'];
	  hb.Utils = Utils;
	  hb.escapeExpression = Utils.escapeExpression;

	  hb.VM = runtime;
	  hb.template = function (spec) {
	    return runtime.template(spec, hb);
	  };

	  return hb;
	}

	var inst = create();
	inst.create = create;

	_handlebarsNoConflict2['default'](inst);

	inst['default'] = inst;

	exports['default'] = inst;
	module.exports = exports['default'];

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	exports["default"] = function (obj) {
	  if (obj && obj.__esModule) {
	    return obj;
	  } else {
	    var newObj = {};

	    if (obj != null) {
	      for (var key in obj) {
	        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
	      }
	    }

	    newObj["default"] = obj;
	    return newObj;
	  }
	};

	exports.__esModule = true;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;
	exports.HandlebarsEnvironment = HandlebarsEnvironment;

	var _utils = __webpack_require__(5);

	var _exception = __webpack_require__(6);

	var _exception2 = _interopRequireDefault(_exception);

	var _helpers = __webpack_require__(7);

	var _decorators = __webpack_require__(15);

	var _logger = __webpack_require__(17);

	var _logger2 = _interopRequireDefault(_logger);

	var VERSION = '4.0.5';
	exports.VERSION = VERSION;
	var COMPILER_REVISION = 7;

	exports.COMPILER_REVISION = COMPILER_REVISION;
	var REVISION_CHANGES = {
	  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
	  2: '== 1.0.0-rc.3',
	  3: '== 1.0.0-rc.4',
	  4: '== 1.x.x',
	  5: '== 2.0.0-alpha.x',
	  6: '>= 2.0.0-beta.1',
	  7: '>= 4.0.0'
	};

	exports.REVISION_CHANGES = REVISION_CHANGES;
	var objectType = '[object Object]';

	function HandlebarsEnvironment(helpers, partials, decorators) {
	  this.helpers = helpers || {};
	  this.partials = partials || {};
	  this.decorators = decorators || {};

	  _helpers.registerDefaultHelpers(this);
	  _decorators.registerDefaultDecorators(this);
	}

	HandlebarsEnvironment.prototype = {
	  constructor: HandlebarsEnvironment,

	  logger: _logger2['default'],
	  log: _logger2['default'].log,

	  registerHelper: function registerHelper(name, fn) {
	    if (_utils.toString.call(name) === objectType) {
	      if (fn) {
	        throw new _exception2['default']('Arg not supported with multiple helpers');
	      }
	      _utils.extend(this.helpers, name);
	    } else {
	      this.helpers[name] = fn;
	    }
	  },
	  unregisterHelper: function unregisterHelper(name) {
	    delete this.helpers[name];
	  },

	  registerPartial: function registerPartial(name, partial) {
	    if (_utils.toString.call(name) === objectType) {
	      _utils.extend(this.partials, name);
	    } else {
	      if (typeof partial === 'undefined') {
	        throw new _exception2['default']('Attempting to register a partial called "' + name + '" as undefined');
	      }
	      this.partials[name] = partial;
	    }
	  },
	  unregisterPartial: function unregisterPartial(name) {
	    delete this.partials[name];
	  },

	  registerDecorator: function registerDecorator(name, fn) {
	    if (_utils.toString.call(name) === objectType) {
	      if (fn) {
	        throw new _exception2['default']('Arg not supported with multiple decorators');
	      }
	      _utils.extend(this.decorators, name);
	    } else {
	      this.decorators[name] = fn;
	    }
	  },
	  unregisterDecorator: function unregisterDecorator(name) {
	    delete this.decorators[name];
	  }
	};

	var log = _logger2['default'].log;

	exports.log = log;
	exports.createFrame = _utils.createFrame;
	exports.logger = _logger2['default'];

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports.extend = extend;
	exports.indexOf = indexOf;
	exports.escapeExpression = escapeExpression;
	exports.isEmpty = isEmpty;
	exports.createFrame = createFrame;
	exports.blockParams = blockParams;
	exports.appendContextPath = appendContextPath;
	var escape = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  "'": '&#x27;',
	  '`': '&#x60;',
	  '=': '&#x3D;'
	};

	var badChars = /[&<>"'`=]/g,
	    possible = /[&<>"'`=]/;

	function escapeChar(chr) {
	  return escape[chr];
	}

	function extend(obj /* , ...source */) {
	  for (var i = 1; i < arguments.length; i++) {
	    for (var key in arguments[i]) {
	      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
	        obj[key] = arguments[i][key];
	      }
	    }
	  }

	  return obj;
	}

	var toString = Object.prototype.toString;

	exports.toString = toString;
	// Sourced from lodash
	// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
	/* eslint-disable func-style */
	var isFunction = function isFunction(value) {
	  return typeof value === 'function';
	};
	// fallback for older versions of Chrome and Safari
	/* istanbul ignore next */
	if (isFunction(/x/)) {
	  exports.isFunction = isFunction = function (value) {
	    return typeof value === 'function' && toString.call(value) === '[object Function]';
	  };
	}
	exports.isFunction = isFunction;

	/* eslint-enable func-style */

	/* istanbul ignore next */
	var isArray = Array.isArray || function (value) {
	  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
	};

	exports.isArray = isArray;
	// Older IE versions do not directly support indexOf so we must implement our own, sadly.

	function indexOf(array, value) {
	  for (var i = 0, len = array.length; i < len; i++) {
	    if (array[i] === value) {
	      return i;
	    }
	  }
	  return -1;
	}

	function escapeExpression(string) {
	  if (typeof string !== 'string') {
	    // don't escape SafeStrings, since they're already safe
	    if (string && string.toHTML) {
	      return string.toHTML();
	    } else if (string == null) {
	      return '';
	    } else if (!string) {
	      return string + '';
	    }

	    // Force a string conversion as this will be done by the append regardless and
	    // the regex test will do this transparently behind the scenes, causing issues if
	    // an object's to string has escaped characters in it.
	    string = '' + string;
	  }

	  if (!possible.test(string)) {
	    return string;
	  }
	  return string.replace(badChars, escapeChar);
	}

	function isEmpty(value) {
	  if (!value && value !== 0) {
	    return true;
	  } else if (isArray(value) && value.length === 0) {
	    return true;
	  } else {
	    return false;
	  }
	}

	function createFrame(object) {
	  var frame = extend({}, object);
	  frame._parent = object;
	  return frame;
	}

	function blockParams(params, ids) {
	  params.path = ids;
	  return params;
	}

	function appendContextPath(contextPath, id) {
	  return (contextPath ? contextPath + '.' : '') + id;
	}

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;

	var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

	function Exception(message, node) {
	  var loc = node && node.loc,
	      line = undefined,
	      column = undefined;
	  if (loc) {
	    line = loc.start.line;
	    column = loc.start.column;

	    message += ' - ' + line + ':' + column;
	  }

	  var tmp = Error.prototype.constructor.call(this, message);

	  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
	  for (var idx = 0; idx < errorProps.length; idx++) {
	    this[errorProps[idx]] = tmp[errorProps[idx]];
	  }

	  /* istanbul ignore else */
	  if (Error.captureStackTrace) {
	    Error.captureStackTrace(this, Exception);
	  }

	  if (loc) {
	    this.lineNumber = line;
	    this.column = column;
	  }
	}

	Exception.prototype = new Error();

	exports['default'] = Exception;
	module.exports = exports['default'];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;
	exports.registerDefaultHelpers = registerDefaultHelpers;

	var _helpersBlockHelperMissing = __webpack_require__(8);

	var _helpersBlockHelperMissing2 = _interopRequireDefault(_helpersBlockHelperMissing);

	var _helpersEach = __webpack_require__(9);

	var _helpersEach2 = _interopRequireDefault(_helpersEach);

	var _helpersHelperMissing = __webpack_require__(10);

	var _helpersHelperMissing2 = _interopRequireDefault(_helpersHelperMissing);

	var _helpersIf = __webpack_require__(11);

	var _helpersIf2 = _interopRequireDefault(_helpersIf);

	var _helpersLog = __webpack_require__(12);

	var _helpersLog2 = _interopRequireDefault(_helpersLog);

	var _helpersLookup = __webpack_require__(13);

	var _helpersLookup2 = _interopRequireDefault(_helpersLookup);

	var _helpersWith = __webpack_require__(14);

	var _helpersWith2 = _interopRequireDefault(_helpersWith);

	function registerDefaultHelpers(instance) {
	  _helpersBlockHelperMissing2['default'](instance);
	  _helpersEach2['default'](instance);
	  _helpersHelperMissing2['default'](instance);
	  _helpersIf2['default'](instance);
	  _helpersLog2['default'](instance);
	  _helpersLookup2['default'](instance);
	  _helpersWith2['default'](instance);
	}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _utils = __webpack_require__(5);

	exports['default'] = function (instance) {
	  instance.registerHelper('blockHelperMissing', function (context, options) {
	    var inverse = options.inverse,
	        fn = options.fn;

	    if (context === true) {
	      return fn(this);
	    } else if (context === false || context == null) {
	      return inverse(this);
	    } else if (_utils.isArray(context)) {
	      if (context.length > 0) {
	        if (options.ids) {
	          options.ids = [options.name];
	        }

	        return instance.helpers.each(context, options);
	      } else {
	        return inverse(this);
	      }
	    } else {
	      if (options.data && options.ids) {
	        var data = _utils.createFrame(options.data);
	        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.name);
	        options = { data: data };
	      }

	      return fn(context, options);
	    }
	  });
	};

	module.exports = exports['default'];

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _utils = __webpack_require__(5);

	var _exception = __webpack_require__(6);

	var _exception2 = _interopRequireDefault(_exception);

	exports['default'] = function (instance) {
	  instance.registerHelper('each', function (context, options) {
	    if (!options) {
	      throw new _exception2['default']('Must pass iterator to #each');
	    }

	    var fn = options.fn,
	        inverse = options.inverse,
	        i = 0,
	        ret = '',
	        data = undefined,
	        contextPath = undefined;

	    if (options.data && options.ids) {
	      contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
	    }

	    if (_utils.isFunction(context)) {
	      context = context.call(this);
	    }

	    if (options.data) {
	      data = _utils.createFrame(options.data);
	    }

	    function execIteration(field, index, last) {
	      if (data) {
	        data.key = field;
	        data.index = index;
	        data.first = index === 0;
	        data.last = !!last;

	        if (contextPath) {
	          data.contextPath = contextPath + field;
	        }
	      }

	      ret = ret + fn(context[field], {
	        data: data,
	        blockParams: _utils.blockParams([context[field], field], [contextPath + field, null])
	      });
	    }

	    if (context && typeof context === 'object') {
	      if (_utils.isArray(context)) {
	        for (var j = context.length; i < j; i++) {
	          if (i in context) {
	            execIteration(i, i, i === context.length - 1);
	          }
	        }
	      } else {
	        var priorKey = undefined;

	        for (var key in context) {
	          if (context.hasOwnProperty(key)) {
	            // We're running the iterations one step out of sync so we can detect
	            // the last iteration without have to scan the object twice and create
	            // an itermediate keys array.
	            if (priorKey !== undefined) {
	              execIteration(priorKey, i - 1);
	            }
	            priorKey = key;
	            i++;
	          }
	        }
	        if (priorKey !== undefined) {
	          execIteration(priorKey, i - 1, true);
	        }
	      }
	    }

	    if (i === 0) {
	      ret = inverse(this);
	    }

	    return ret;
	  });
	};

	module.exports = exports['default'];

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _exception = __webpack_require__(6);

	var _exception2 = _interopRequireDefault(_exception);

	exports['default'] = function (instance) {
	  instance.registerHelper('helperMissing', function () /* [args, ]options */{
	    if (arguments.length === 1) {
	      // A missing field in a {{foo}} construct.
	      return undefined;
	    } else {
	      // Someone is actually trying to call something, blow up.
	      throw new _exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
	    }
	  });
	};

	module.exports = exports['default'];

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _utils = __webpack_require__(5);

	exports['default'] = function (instance) {
	  instance.registerHelper('if', function (conditional, options) {
	    if (_utils.isFunction(conditional)) {
	      conditional = conditional.call(this);
	    }

	    // Default behavior is to render the positive path if the value is truthy and not empty.
	    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
	    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
	    if (!options.hash.includeZero && !conditional || _utils.isEmpty(conditional)) {
	      return options.inverse(this);
	    } else {
	      return options.fn(this);
	    }
	  });

	  instance.registerHelper('unless', function (conditional, options) {
	    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
	  });
	};

	module.exports = exports['default'];

/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;

	exports['default'] = function (instance) {
	  instance.registerHelper('log', function () /* message, options */{
	    var args = [undefined],
	        options = arguments[arguments.length - 1];
	    for (var i = 0; i < arguments.length - 1; i++) {
	      args.push(arguments[i]);
	    }

	    var level = 1;
	    if (options.hash.level != null) {
	      level = options.hash.level;
	    } else if (options.data && options.data.level != null) {
	      level = options.data.level;
	    }
	    args[0] = level;

	    instance.log.apply(instance, args);
	  });
	};

	module.exports = exports['default'];

/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;

	exports['default'] = function (instance) {
	  instance.registerHelper('lookup', function (obj, field) {
	    return obj && obj[field];
	  });
	};

	module.exports = exports['default'];

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _utils = __webpack_require__(5);

	exports['default'] = function (instance) {
	  instance.registerHelper('with', function (context, options) {
	    if (_utils.isFunction(context)) {
	      context = context.call(this);
	    }

	    var fn = options.fn;

	    if (!_utils.isEmpty(context)) {
	      var data = options.data;
	      if (options.data && options.ids) {
	        data = _utils.createFrame(options.data);
	        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]);
	      }

	      return fn(context, {
	        data: data,
	        blockParams: _utils.blockParams([context], [data && data.contextPath])
	      });
	    } else {
	      return options.inverse(this);
	    }
	  });
	};

	module.exports = exports['default'];

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;
	exports.registerDefaultDecorators = registerDefaultDecorators;

	var _decoratorsInline = __webpack_require__(16);

	var _decoratorsInline2 = _interopRequireDefault(_decoratorsInline);

	function registerDefaultDecorators(instance) {
	  _decoratorsInline2['default'](instance);
	}

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _utils = __webpack_require__(5);

	exports['default'] = function (instance) {
	  instance.registerDecorator('inline', function (fn, props, container, options) {
	    var ret = fn;
	    if (!props.partials) {
	      props.partials = {};
	      ret = function (context, options) {
	        // Create a new partials stack frame prior to exec.
	        var original = container.partials;
	        container.partials = _utils.extend({}, original, props.partials);
	        var ret = fn(context, options);
	        container.partials = original;
	        return ret;
	      };
	    }

	    props.partials[options.args[0]] = options.fn;

	    return ret;
	  });
	};

	module.exports = exports['default'];

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _utils = __webpack_require__(5);

	var logger = {
	  methodMap: ['debug', 'info', 'warn', 'error'],
	  level: 'info',

	  // Maps a given level value to the `methodMap` indexes above.
	  lookupLevel: function lookupLevel(level) {
	    if (typeof level === 'string') {
	      var levelMap = _utils.indexOf(logger.methodMap, level.toLowerCase());
	      if (levelMap >= 0) {
	        level = levelMap;
	      } else {
	        level = parseInt(level, 10);
	      }
	    }

	    return level;
	  },

	  // Can be overridden in the host environment
	  log: function log(level) {
	    level = logger.lookupLevel(level);

	    if (typeof console !== 'undefined' && logger.lookupLevel(logger.level) <= level) {
	      var method = logger.methodMap[level];
	      if (!console[method]) {
	        // eslint-disable-line no-console
	        method = 'log';
	      }

	      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        message[_key - 1] = arguments[_key];
	      }

	      console[method].apply(console, message); // eslint-disable-line no-console
	    }
	  }
	};

	exports['default'] = logger;
	module.exports = exports['default'];

/***/ },
/* 18 */
/***/ function(module, exports) {

	// Build out our basic SafeString type
	'use strict';

	exports.__esModule = true;
	function SafeString(string) {
	  this.string = string;
	}

	SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
	  return '' + this.string;
	};

	exports['default'] = SafeString;
	module.exports = exports['default'];

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = __webpack_require__(3)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;
	exports.checkRevision = checkRevision;
	exports.template = template;
	exports.wrapProgram = wrapProgram;
	exports.resolvePartial = resolvePartial;
	exports.invokePartial = invokePartial;
	exports.noop = noop;

	var _utils = __webpack_require__(5);

	var Utils = _interopRequireWildcard(_utils);

	var _exception = __webpack_require__(6);

	var _exception2 = _interopRequireDefault(_exception);

	var _base = __webpack_require__(4);

	function checkRevision(compilerInfo) {
	  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
	      currentRevision = _base.COMPILER_REVISION;

	  if (compilerRevision !== currentRevision) {
	    if (compilerRevision < currentRevision) {
	      var runtimeVersions = _base.REVISION_CHANGES[currentRevision],
	          compilerVersions = _base.REVISION_CHANGES[compilerRevision];
	      throw new _exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
	    } else {
	      // Use the embedded version info since the runtime doesn't know about this revision yet
	      throw new _exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
	    }
	  }
	}

	function template(templateSpec, env) {
	  /* istanbul ignore next */
	  if (!env) {
	    throw new _exception2['default']('No environment passed to template');
	  }
	  if (!templateSpec || !templateSpec.main) {
	    throw new _exception2['default']('Unknown template object: ' + typeof templateSpec);
	  }

	  templateSpec.main.decorator = templateSpec.main_d;

	  // Note: Using env.VM references rather than local var references throughout this section to allow
	  // for external users to override these as psuedo-supported APIs.
	  env.VM.checkRevision(templateSpec.compiler);

	  function invokePartialWrapper(partial, context, options) {
	    if (options.hash) {
	      context = Utils.extend({}, context, options.hash);
	      if (options.ids) {
	        options.ids[0] = true;
	      }
	    }

	    partial = env.VM.resolvePartial.call(this, partial, context, options);
	    var result = env.VM.invokePartial.call(this, partial, context, options);

	    if (result == null && env.compile) {
	      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
	      result = options.partials[options.name](context, options);
	    }
	    if (result != null) {
	      if (options.indent) {
	        var lines = result.split('\n');
	        for (var i = 0, l = lines.length; i < l; i++) {
	          if (!lines[i] && i + 1 === l) {
	            break;
	          }

	          lines[i] = options.indent + lines[i];
	        }
	        result = lines.join('\n');
	      }
	      return result;
	    } else {
	      throw new _exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
	    }
	  }

	  // Just add water
	  var container = {
	    strict: function strict(obj, name) {
	      if (!(name in obj)) {
	        throw new _exception2['default']('"' + name + '" not defined in ' + obj);
	      }
	      return obj[name];
	    },
	    lookup: function lookup(depths, name) {
	      var len = depths.length;
	      for (var i = 0; i < len; i++) {
	        if (depths[i] && depths[i][name] != null) {
	          return depths[i][name];
	        }
	      }
	    },
	    lambda: function lambda(current, context) {
	      return typeof current === 'function' ? current.call(context) : current;
	    },

	    escapeExpression: Utils.escapeExpression,
	    invokePartial: invokePartialWrapper,

	    fn: function fn(i) {
	      var ret = templateSpec[i];
	      ret.decorator = templateSpec[i + '_d'];
	      return ret;
	    },

	    programs: [],
	    program: function program(i, data, declaredBlockParams, blockParams, depths) {
	      var programWrapper = this.programs[i],
	          fn = this.fn(i);
	      if (data || depths || blockParams || declaredBlockParams) {
	        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
	      } else if (!programWrapper) {
	        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
	      }
	      return programWrapper;
	    },

	    data: function data(value, depth) {
	      while (value && depth--) {
	        value = value._parent;
	      }
	      return value;
	    },
	    merge: function merge(param, common) {
	      var obj = param || common;

	      if (param && common && param !== common) {
	        obj = Utils.extend({}, common, param);
	      }

	      return obj;
	    },

	    noop: env.VM.noop,
	    compilerInfo: templateSpec.compiler
	  };

	  function ret(context) {
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    var data = options.data;

	    ret._setup(options);
	    if (!options.partial && templateSpec.useData) {
	      data = initData(context, data);
	    }
	    var depths = undefined,
	        blockParams = templateSpec.useBlockParams ? [] : undefined;
	    if (templateSpec.useDepths) {
	      if (options.depths) {
	        depths = context !== options.depths[0] ? [context].concat(options.depths) : options.depths;
	      } else {
	        depths = [context];
	      }
	    }

	    function main(context /*, options*/) {
	      return '' + templateSpec.main(container, context, container.helpers, container.partials, data, blockParams, depths);
	    }
	    main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams);
	    return main(context, options);
	  }
	  ret.isTop = true;

	  ret._setup = function (options) {
	    if (!options.partial) {
	      container.helpers = container.merge(options.helpers, env.helpers);

	      if (templateSpec.usePartial) {
	        container.partials = container.merge(options.partials, env.partials);
	      }
	      if (templateSpec.usePartial || templateSpec.useDecorators) {
	        container.decorators = container.merge(options.decorators, env.decorators);
	      }
	    } else {
	      container.helpers = options.helpers;
	      container.partials = options.partials;
	      container.decorators = options.decorators;
	    }
	  };

	  ret._child = function (i, data, blockParams, depths) {
	    if (templateSpec.useBlockParams && !blockParams) {
	      throw new _exception2['default']('must pass block params');
	    }
	    if (templateSpec.useDepths && !depths) {
	      throw new _exception2['default']('must pass parent depths');
	    }

	    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
	  };
	  return ret;
	}

	function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
	  function prog(context) {
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    var currentDepths = depths;
	    if (depths && context !== depths[0]) {
	      currentDepths = [context].concat(depths);
	    }

	    return fn(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), currentDepths);
	  }

	  prog = executeDecorators(fn, prog, container, depths, data, blockParams);

	  prog.program = i;
	  prog.depth = depths ? depths.length : 0;
	  prog.blockParams = declaredBlockParams || 0;
	  return prog;
	}

	function resolvePartial(partial, context, options) {
	  if (!partial) {
	    if (options.name === '@partial-block') {
	      partial = options.data['partial-block'];
	    } else {
	      partial = options.partials[options.name];
	    }
	  } else if (!partial.call && !options.name) {
	    // This is a dynamic partial that returned a string
	    options.name = partial;
	    partial = options.partials[partial];
	  }
	  return partial;
	}

	function invokePartial(partial, context, options) {
	  options.partial = true;
	  if (options.ids) {
	    options.data.contextPath = options.ids[0] || options.data.contextPath;
	  }

	  var partialBlock = undefined;
	  if (options.fn && options.fn !== noop) {
	    options.data = _base.createFrame(options.data);
	    partialBlock = options.data['partial-block'] = options.fn;

	    if (partialBlock.partials) {
	      options.partials = Utils.extend({}, options.partials, partialBlock.partials);
	    }
	  }

	  if (partial === undefined && partialBlock) {
	    partial = partialBlock;
	  }

	  if (partial === undefined) {
	    throw new _exception2['default']('The partial ' + options.name + ' could not be found');
	  } else if (partial instanceof Function) {
	    return partial(context, options);
	  }
	}

	function noop() {
	  return '';
	}

	function initData(context, data) {
	  if (!data || !('root' in data)) {
	    data = data ? _base.createFrame(data) : {};
	    data.root = context;
	  }
	  return data;
	}

	function executeDecorators(fn, prog, container, depths, data, blockParams) {
	  if (fn.decorator) {
	    var props = {};
	    prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams, depths);
	    Utils.extend(prog, props);
	  }
	  return prog;
	}

/***/ },
/* 20 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/* global window */
	'use strict';

	exports.__esModule = true;

	exports['default'] = function (Handlebars) {
	  /* istanbul ignore next */
	  var root = typeof global !== 'undefined' ? global : window,
	      $Handlebars = root.Handlebars;
	  /* istanbul ignore next */
	  Handlebars.noConflict = function () {
	    if (root.Handlebars === Handlebars) {
	      root.Handlebars = $Handlebars;
	    }
	    return Handlebars;
	  };
	};

	module.exports = exports['default'];
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	var AST = {
	  // Public API used to evaluate derived attributes regarding AST nodes
	  helpers: {
	    // a mustache is definitely a helper if:
	    // * it is an eligible helper, and
	    // * it has at least one parameter or hash segment
	    helperExpression: function helperExpression(node) {
	      return node.type === 'SubExpression' || (node.type === 'MustacheStatement' || node.type === 'BlockStatement') && !!(node.params && node.params.length || node.hash);
	    },

	    scopedId: function scopedId(path) {
	      return (/^\.|this\b/.test(path.original)
	      );
	    },

	    // an ID is simple if it only has one part, and that part is not
	    // `..` or `this`.
	    simpleId: function simpleId(path) {
	      return path.parts.length === 1 && !AST.helpers.scopedId(path) && !path.depth;
	    }
	  }
	};

	// Must be exported as an object rather than the root of the module as the jison lexer
	// must modify the object to operate properly.
	exports['default'] = AST;
	module.exports = exports['default'];

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(1)['default'];

	var _interopRequireWildcard = __webpack_require__(3)['default'];

	exports.__esModule = true;
	exports.parse = parse;

	var _parser = __webpack_require__(23);

	var _parser2 = _interopRequireDefault(_parser);

	var _whitespaceControl = __webpack_require__(24);

	var _whitespaceControl2 = _interopRequireDefault(_whitespaceControl);

	var _helpers = __webpack_require__(26);

	var Helpers = _interopRequireWildcard(_helpers);

	var _utils = __webpack_require__(5);

	exports.parser = _parser2['default'];

	var yy = {};
	_utils.extend(yy, Helpers);

	function parse(input, options) {
	  // Just return if an already-compiled AST was passed in.
	  if (input.type === 'Program') {
	    return input;
	  }

	  _parser2['default'].yy = yy;

	  // Altering the shared object here, but this is ok as parser is a sync operation
	  yy.locInfo = function (locInfo) {
	    return new yy.SourceLocation(options && options.srcName, locInfo);
	  };

	  var strip = new _whitespaceControl2['default'](options);
	  return strip.accept(_parser2['default'].parse(input));
	}

/***/ },
/* 23 */
/***/ function(module, exports) {

	/* istanbul ignore next */
	/* Jison generated parser */
	"use strict";

	var handlebars = (function () {
	    var parser = { trace: function trace() {},
	        yy: {},
	        symbols_: { "error": 2, "root": 3, "program": 4, "EOF": 5, "program_repetition0": 6, "statement": 7, "mustache": 8, "block": 9, "rawBlock": 10, "partial": 11, "partialBlock": 12, "content": 13, "COMMENT": 14, "CONTENT": 15, "openRawBlock": 16, "rawBlock_repetition_plus0": 17, "END_RAW_BLOCK": 18, "OPEN_RAW_BLOCK": 19, "helperName": 20, "openRawBlock_repetition0": 21, "openRawBlock_option0": 22, "CLOSE_RAW_BLOCK": 23, "openBlock": 24, "block_option0": 25, "closeBlock": 26, "openInverse": 27, "block_option1": 28, "OPEN_BLOCK": 29, "openBlock_repetition0": 30, "openBlock_option0": 31, "openBlock_option1": 32, "CLOSE": 33, "OPEN_INVERSE": 34, "openInverse_repetition0": 35, "openInverse_option0": 36, "openInverse_option1": 37, "openInverseChain": 38, "OPEN_INVERSE_CHAIN": 39, "openInverseChain_repetition0": 40, "openInverseChain_option0": 41, "openInverseChain_option1": 42, "inverseAndProgram": 43, "INVERSE": 44, "inverseChain": 45, "inverseChain_option0": 46, "OPEN_ENDBLOCK": 47, "OPEN": 48, "mustache_repetition0": 49, "mustache_option0": 50, "OPEN_UNESCAPED": 51, "mustache_repetition1": 52, "mustache_option1": 53, "CLOSE_UNESCAPED": 54, "OPEN_PARTIAL": 55, "partialName": 56, "partial_repetition0": 57, "partial_option0": 58, "openPartialBlock": 59, "OPEN_PARTIAL_BLOCK": 60, "openPartialBlock_repetition0": 61, "openPartialBlock_option0": 62, "param": 63, "sexpr": 64, "OPEN_SEXPR": 65, "sexpr_repetition0": 66, "sexpr_option0": 67, "CLOSE_SEXPR": 68, "hash": 69, "hash_repetition_plus0": 70, "hashSegment": 71, "ID": 72, "EQUALS": 73, "blockParams": 74, "OPEN_BLOCK_PARAMS": 75, "blockParams_repetition_plus0": 76, "CLOSE_BLOCK_PARAMS": 77, "path": 78, "dataName": 79, "STRING": 80, "NUMBER": 81, "BOOLEAN": 82, "UNDEFINED": 83, "NULL": 84, "DATA": 85, "pathSegments": 86, "SEP": 87, "$accept": 0, "$end": 1 },
	        terminals_: { 2: "error", 5: "EOF", 14: "COMMENT", 15: "CONTENT", 18: "END_RAW_BLOCK", 19: "OPEN_RAW_BLOCK", 23: "CLOSE_RAW_BLOCK", 29: "OPEN_BLOCK", 33: "CLOSE", 34: "OPEN_INVERSE", 39: "OPEN_INVERSE_CHAIN", 44: "INVERSE", 47: "OPEN_ENDBLOCK", 48: "OPEN", 51: "OPEN_UNESCAPED", 54: "CLOSE_UNESCAPED", 55: "OPEN_PARTIAL", 60: "OPEN_PARTIAL_BLOCK", 65: "OPEN_SEXPR", 68: "CLOSE_SEXPR", 72: "ID", 73: "EQUALS", 75: "OPEN_BLOCK_PARAMS", 77: "CLOSE_BLOCK_PARAMS", 80: "STRING", 81: "NUMBER", 82: "BOOLEAN", 83: "UNDEFINED", 84: "NULL", 85: "DATA", 87: "SEP" },
	        productions_: [0, [3, 2], [4, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [13, 1], [10, 3], [16, 5], [9, 4], [9, 4], [24, 6], [27, 6], [38, 6], [43, 2], [45, 3], [45, 1], [26, 3], [8, 5], [8, 5], [11, 5], [12, 3], [59, 5], [63, 1], [63, 1], [64, 5], [69, 1], [71, 3], [74, 3], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [56, 1], [56, 1], [79, 2], [78, 1], [86, 3], [86, 1], [6, 0], [6, 2], [17, 1], [17, 2], [21, 0], [21, 2], [22, 0], [22, 1], [25, 0], [25, 1], [28, 0], [28, 1], [30, 0], [30, 2], [31, 0], [31, 1], [32, 0], [32, 1], [35, 0], [35, 2], [36, 0], [36, 1], [37, 0], [37, 1], [40, 0], [40, 2], [41, 0], [41, 1], [42, 0], [42, 1], [46, 0], [46, 1], [49, 0], [49, 2], [50, 0], [50, 1], [52, 0], [52, 2], [53, 0], [53, 1], [57, 0], [57, 2], [58, 0], [58, 1], [61, 0], [61, 2], [62, 0], [62, 1], [66, 0], [66, 2], [67, 0], [67, 1], [70, 1], [70, 2], [76, 1], [76, 2]],
	        performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$
	        /**/) {

	            var $0 = $$.length - 1;
	            switch (yystate) {
	                case 1:
	                    return $$[$0 - 1];
	                    break;
	                case 2:
	                    this.$ = yy.prepareProgram($$[$0]);
	                    break;
	                case 3:
	                    this.$ = $$[$0];
	                    break;
	                case 4:
	                    this.$ = $$[$0];
	                    break;
	                case 5:
	                    this.$ = $$[$0];
	                    break;
	                case 6:
	                    this.$ = $$[$0];
	                    break;
	                case 7:
	                    this.$ = $$[$0];
	                    break;
	                case 8:
	                    this.$ = $$[$0];
	                    break;
	                case 9:
	                    this.$ = {
	                        type: 'CommentStatement',
	                        value: yy.stripComment($$[$0]),
	                        strip: yy.stripFlags($$[$0], $$[$0]),
	                        loc: yy.locInfo(this._$)
	                    };

	                    break;
	                case 10:
	                    this.$ = {
	                        type: 'ContentStatement',
	                        original: $$[$0],
	                        value: $$[$0],
	                        loc: yy.locInfo(this._$)
	                    };

	                    break;
	                case 11:
	                    this.$ = yy.prepareRawBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
	                    break;
	                case 12:
	                    this.$ = { path: $$[$0 - 3], params: $$[$0 - 2], hash: $$[$0 - 1] };
	                    break;
	                case 13:
	                    this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], false, this._$);
	                    break;
	                case 14:
	                    this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], true, this._$);
	                    break;
	                case 15:
	                    this.$ = { open: $$[$0 - 5], path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
	                    break;
	                case 16:
	                    this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
	                    break;
	                case 17:
	                    this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
	                    break;
	                case 18:
	                    this.$ = { strip: yy.stripFlags($$[$0 - 1], $$[$0 - 1]), program: $$[$0] };
	                    break;
	                case 19:
	                    var inverse = yy.prepareBlock($$[$0 - 2], $$[$0 - 1], $$[$0], $$[$0], false, this._$),
	                        program = yy.prepareProgram([inverse], $$[$0 - 1].loc);
	                    program.chained = true;

	                    this.$ = { strip: $$[$0 - 2].strip, program: program, chain: true };

	                    break;
	                case 20:
	                    this.$ = $$[$0];
	                    break;
	                case 21:
	                    this.$ = { path: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 2], $$[$0]) };
	                    break;
	                case 22:
	                    this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
	                    break;
	                case 23:
	                    this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
	                    break;
	                case 24:
	                    this.$ = {
	                        type: 'PartialStatement',
	                        name: $$[$0 - 3],
	                        params: $$[$0 - 2],
	                        hash: $$[$0 - 1],
	                        indent: '',
	                        strip: yy.stripFlags($$[$0 - 4], $$[$0]),
	                        loc: yy.locInfo(this._$)
	                    };

	                    break;
	                case 25:
	                    this.$ = yy.preparePartialBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
	                    break;
	                case 26:
	                    this.$ = { path: $$[$0 - 3], params: $$[$0 - 2], hash: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 4], $$[$0]) };
	                    break;
	                case 27:
	                    this.$ = $$[$0];
	                    break;
	                case 28:
	                    this.$ = $$[$0];
	                    break;
	                case 29:
	                    this.$ = {
	                        type: 'SubExpression',
	                        path: $$[$0 - 3],
	                        params: $$[$0 - 2],
	                        hash: $$[$0 - 1],
	                        loc: yy.locInfo(this._$)
	                    };

	                    break;
	                case 30:
	                    this.$ = { type: 'Hash', pairs: $$[$0], loc: yy.locInfo(this._$) };
	                    break;
	                case 31:
	                    this.$ = { type: 'HashPair', key: yy.id($$[$0 - 2]), value: $$[$0], loc: yy.locInfo(this._$) };
	                    break;
	                case 32:
	                    this.$ = yy.id($$[$0 - 1]);
	                    break;
	                case 33:
	                    this.$ = $$[$0];
	                    break;
	                case 34:
	                    this.$ = $$[$0];
	                    break;
	                case 35:
	                    this.$ = { type: 'StringLiteral', value: $$[$0], original: $$[$0], loc: yy.locInfo(this._$) };
	                    break;
	                case 36:
	                    this.$ = { type: 'NumberLiteral', value: Number($$[$0]), original: Number($$[$0]), loc: yy.locInfo(this._$) };
	                    break;
	                case 37:
	                    this.$ = { type: 'BooleanLiteral', value: $$[$0] === 'true', original: $$[$0] === 'true', loc: yy.locInfo(this._$) };
	                    break;
	                case 38:
	                    this.$ = { type: 'UndefinedLiteral', original: undefined, value: undefined, loc: yy.locInfo(this._$) };
	                    break;
	                case 39:
	                    this.$ = { type: 'NullLiteral', original: null, value: null, loc: yy.locInfo(this._$) };
	                    break;
	                case 40:
	                    this.$ = $$[$0];
	                    break;
	                case 41:
	                    this.$ = $$[$0];
	                    break;
	                case 42:
	                    this.$ = yy.preparePath(true, $$[$0], this._$);
	                    break;
	                case 43:
	                    this.$ = yy.preparePath(false, $$[$0], this._$);
	                    break;
	                case 44:
	                    $$[$0 - 2].push({ part: yy.id($$[$0]), original: $$[$0], separator: $$[$0 - 1] });this.$ = $$[$0 - 2];
	                    break;
	                case 45:
	                    this.$ = [{ part: yy.id($$[$0]), original: $$[$0] }];
	                    break;
	                case 46:
	                    this.$ = [];
	                    break;
	                case 47:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 48:
	                    this.$ = [$$[$0]];
	                    break;
	                case 49:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 50:
	                    this.$ = [];
	                    break;
	                case 51:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 58:
	                    this.$ = [];
	                    break;
	                case 59:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 64:
	                    this.$ = [];
	                    break;
	                case 65:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 70:
	                    this.$ = [];
	                    break;
	                case 71:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 78:
	                    this.$ = [];
	                    break;
	                case 79:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 82:
	                    this.$ = [];
	                    break;
	                case 83:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 86:
	                    this.$ = [];
	                    break;
	                case 87:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 90:
	                    this.$ = [];
	                    break;
	                case 91:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 94:
	                    this.$ = [];
	                    break;
	                case 95:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 98:
	                    this.$ = [$$[$0]];
	                    break;
	                case 99:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 100:
	                    this.$ = [$$[$0]];
	                    break;
	                case 101:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	            }
	        },
	        table: [{ 3: 1, 4: 2, 5: [2, 46], 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 1: [3] }, { 5: [1, 4] }, { 5: [2, 2], 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10, 13: 11, 14: [1, 12], 15: [1, 20], 16: 17, 19: [1, 23], 24: 15, 27: 16, 29: [1, 21], 34: [1, 22], 39: [2, 2], 44: [2, 2], 47: [2, 2], 48: [1, 13], 51: [1, 14], 55: [1, 18], 59: 19, 60: [1, 24] }, { 1: [2, 1] }, { 5: [2, 47], 14: [2, 47], 15: [2, 47], 19: [2, 47], 29: [2, 47], 34: [2, 47], 39: [2, 47], 44: [2, 47], 47: [2, 47], 48: [2, 47], 51: [2, 47], 55: [2, 47], 60: [2, 47] }, { 5: [2, 3], 14: [2, 3], 15: [2, 3], 19: [2, 3], 29: [2, 3], 34: [2, 3], 39: [2, 3], 44: [2, 3], 47: [2, 3], 48: [2, 3], 51: [2, 3], 55: [2, 3], 60: [2, 3] }, { 5: [2, 4], 14: [2, 4], 15: [2, 4], 19: [2, 4], 29: [2, 4], 34: [2, 4], 39: [2, 4], 44: [2, 4], 47: [2, 4], 48: [2, 4], 51: [2, 4], 55: [2, 4], 60: [2, 4] }, { 5: [2, 5], 14: [2, 5], 15: [2, 5], 19: [2, 5], 29: [2, 5], 34: [2, 5], 39: [2, 5], 44: [2, 5], 47: [2, 5], 48: [2, 5], 51: [2, 5], 55: [2, 5], 60: [2, 5] }, { 5: [2, 6], 14: [2, 6], 15: [2, 6], 19: [2, 6], 29: [2, 6], 34: [2, 6], 39: [2, 6], 44: [2, 6], 47: [2, 6], 48: [2, 6], 51: [2, 6], 55: [2, 6], 60: [2, 6] }, { 5: [2, 7], 14: [2, 7], 15: [2, 7], 19: [2, 7], 29: [2, 7], 34: [2, 7], 39: [2, 7], 44: [2, 7], 47: [2, 7], 48: [2, 7], 51: [2, 7], 55: [2, 7], 60: [2, 7] }, { 5: [2, 8], 14: [2, 8], 15: [2, 8], 19: [2, 8], 29: [2, 8], 34: [2, 8], 39: [2, 8], 44: [2, 8], 47: [2, 8], 48: [2, 8], 51: [2, 8], 55: [2, 8], 60: [2, 8] }, { 5: [2, 9], 14: [2, 9], 15: [2, 9], 19: [2, 9], 29: [2, 9], 34: [2, 9], 39: [2, 9], 44: [2, 9], 47: [2, 9], 48: [2, 9], 51: [2, 9], 55: [2, 9], 60: [2, 9] }, { 20: 25, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 36, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 4: 37, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 39: [2, 46], 44: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 4: 38, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 44: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 13: 40, 15: [1, 20], 17: 39 }, { 20: 42, 56: 41, 64: 43, 65: [1, 44], 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 4: 45, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 5: [2, 10], 14: [2, 10], 15: [2, 10], 18: [2, 10], 19: [2, 10], 29: [2, 10], 34: [2, 10], 39: [2, 10], 44: [2, 10], 47: [2, 10], 48: [2, 10], 51: [2, 10], 55: [2, 10], 60: [2, 10] }, { 20: 46, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 47, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 48, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 42, 56: 49, 64: 43, 65: [1, 44], 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 33: [2, 78], 49: 50, 65: [2, 78], 72: [2, 78], 80: [2, 78], 81: [2, 78], 82: [2, 78], 83: [2, 78], 84: [2, 78], 85: [2, 78] }, { 23: [2, 33], 33: [2, 33], 54: [2, 33], 65: [2, 33], 68: [2, 33], 72: [2, 33], 75: [2, 33], 80: [2, 33], 81: [2, 33], 82: [2, 33], 83: [2, 33], 84: [2, 33], 85: [2, 33] }, { 23: [2, 34], 33: [2, 34], 54: [2, 34], 65: [2, 34], 68: [2, 34], 72: [2, 34], 75: [2, 34], 80: [2, 34], 81: [2, 34], 82: [2, 34], 83: [2, 34], 84: [2, 34], 85: [2, 34] }, { 23: [2, 35], 33: [2, 35], 54: [2, 35], 65: [2, 35], 68: [2, 35], 72: [2, 35], 75: [2, 35], 80: [2, 35], 81: [2, 35], 82: [2, 35], 83: [2, 35], 84: [2, 35], 85: [2, 35] }, { 23: [2, 36], 33: [2, 36], 54: [2, 36], 65: [2, 36], 68: [2, 36], 72: [2, 36], 75: [2, 36], 80: [2, 36], 81: [2, 36], 82: [2, 36], 83: [2, 36], 84: [2, 36], 85: [2, 36] }, { 23: [2, 37], 33: [2, 37], 54: [2, 37], 65: [2, 37], 68: [2, 37], 72: [2, 37], 75: [2, 37], 80: [2, 37], 81: [2, 37], 82: [2, 37], 83: [2, 37], 84: [2, 37], 85: [2, 37] }, { 23: [2, 38], 33: [2, 38], 54: [2, 38], 65: [2, 38], 68: [2, 38], 72: [2, 38], 75: [2, 38], 80: [2, 38], 81: [2, 38], 82: [2, 38], 83: [2, 38], 84: [2, 38], 85: [2, 38] }, { 23: [2, 39], 33: [2, 39], 54: [2, 39], 65: [2, 39], 68: [2, 39], 72: [2, 39], 75: [2, 39], 80: [2, 39], 81: [2, 39], 82: [2, 39], 83: [2, 39], 84: [2, 39], 85: [2, 39] }, { 23: [2, 43], 33: [2, 43], 54: [2, 43], 65: [2, 43], 68: [2, 43], 72: [2, 43], 75: [2, 43], 80: [2, 43], 81: [2, 43], 82: [2, 43], 83: [2, 43], 84: [2, 43], 85: [2, 43], 87: [1, 51] }, { 72: [1, 35], 86: 52 }, { 23: [2, 45], 33: [2, 45], 54: [2, 45], 65: [2, 45], 68: [2, 45], 72: [2, 45], 75: [2, 45], 80: [2, 45], 81: [2, 45], 82: [2, 45], 83: [2, 45], 84: [2, 45], 85: [2, 45], 87: [2, 45] }, { 52: 53, 54: [2, 82], 65: [2, 82], 72: [2, 82], 80: [2, 82], 81: [2, 82], 82: [2, 82], 83: [2, 82], 84: [2, 82], 85: [2, 82] }, { 25: 54, 38: 56, 39: [1, 58], 43: 57, 44: [1, 59], 45: 55, 47: [2, 54] }, { 28: 60, 43: 61, 44: [1, 59], 47: [2, 56] }, { 13: 63, 15: [1, 20], 18: [1, 62] }, { 15: [2, 48], 18: [2, 48] }, { 33: [2, 86], 57: 64, 65: [2, 86], 72: [2, 86], 80: [2, 86], 81: [2, 86], 82: [2, 86], 83: [2, 86], 84: [2, 86], 85: [2, 86] }, { 33: [2, 40], 65: [2, 40], 72: [2, 40], 80: [2, 40], 81: [2, 40], 82: [2, 40], 83: [2, 40], 84: [2, 40], 85: [2, 40] }, { 33: [2, 41], 65: [2, 41], 72: [2, 41], 80: [2, 41], 81: [2, 41], 82: [2, 41], 83: [2, 41], 84: [2, 41], 85: [2, 41] }, { 20: 65, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 26: 66, 47: [1, 67] }, { 30: 68, 33: [2, 58], 65: [2, 58], 72: [2, 58], 75: [2, 58], 80: [2, 58], 81: [2, 58], 82: [2, 58], 83: [2, 58], 84: [2, 58], 85: [2, 58] }, { 33: [2, 64], 35: 69, 65: [2, 64], 72: [2, 64], 75: [2, 64], 80: [2, 64], 81: [2, 64], 82: [2, 64], 83: [2, 64], 84: [2, 64], 85: [2, 64] }, { 21: 70, 23: [2, 50], 65: [2, 50], 72: [2, 50], 80: [2, 50], 81: [2, 50], 82: [2, 50], 83: [2, 50], 84: [2, 50], 85: [2, 50] }, { 33: [2, 90], 61: 71, 65: [2, 90], 72: [2, 90], 80: [2, 90], 81: [2, 90], 82: [2, 90], 83: [2, 90], 84: [2, 90], 85: [2, 90] }, { 20: 75, 33: [2, 80], 50: 72, 63: 73, 64: 76, 65: [1, 44], 69: 74, 70: 77, 71: 78, 72: [1, 79], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 72: [1, 80] }, { 23: [2, 42], 33: [2, 42], 54: [2, 42], 65: [2, 42], 68: [2, 42], 72: [2, 42], 75: [2, 42], 80: [2, 42], 81: [2, 42], 82: [2, 42], 83: [2, 42], 84: [2, 42], 85: [2, 42], 87: [1, 51] }, { 20: 75, 53: 81, 54: [2, 84], 63: 82, 64: 76, 65: [1, 44], 69: 83, 70: 77, 71: 78, 72: [1, 79], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 26: 84, 47: [1, 67] }, { 47: [2, 55] }, { 4: 85, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 39: [2, 46], 44: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 47: [2, 20] }, { 20: 86, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 4: 87, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 26: 88, 47: [1, 67] }, { 47: [2, 57] }, { 5: [2, 11], 14: [2, 11], 15: [2, 11], 19: [2, 11], 29: [2, 11], 34: [2, 11], 39: [2, 11], 44: [2, 11], 47: [2, 11], 48: [2, 11], 51: [2, 11], 55: [2, 11], 60: [2, 11] }, { 15: [2, 49], 18: [2, 49] }, { 20: 75, 33: [2, 88], 58: 89, 63: 90, 64: 76, 65: [1, 44], 69: 91, 70: 77, 71: 78, 72: [1, 79], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 65: [2, 94], 66: 92, 68: [2, 94], 72: [2, 94], 80: [2, 94], 81: [2, 94], 82: [2, 94], 83: [2, 94], 84: [2, 94], 85: [2, 94] }, { 5: [2, 25], 14: [2, 25], 15: [2, 25], 19: [2, 25], 29: [2, 25], 34: [2, 25], 39: [2, 25], 44: [2, 25], 47: [2, 25], 48: [2, 25], 51: [2, 25], 55: [2, 25], 60: [2, 25] }, { 20: 93, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 75, 31: 94, 33: [2, 60], 63: 95, 64: 76, 65: [1, 44], 69: 96, 70: 77, 71: 78, 72: [1, 79], 75: [2, 60], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 75, 33: [2, 66], 36: 97, 63: 98, 64: 76, 65: [1, 44], 69: 99, 70: 77, 71: 78, 72: [1, 79], 75: [2, 66], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 75, 22: 100, 23: [2, 52], 63: 101, 64: 76, 65: [1, 44], 69: 102, 70: 77, 71: 78, 72: [1, 79], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 75, 33: [2, 92], 62: 103, 63: 104, 64: 76, 65: [1, 44], 69: 105, 70: 77, 71: 78, 72: [1, 79], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 33: [1, 106] }, { 33: [2, 79], 65: [2, 79], 72: [2, 79], 80: [2, 79], 81: [2, 79], 82: [2, 79], 83: [2, 79], 84: [2, 79], 85: [2, 79] }, { 33: [2, 81] }, { 23: [2, 27], 33: [2, 27], 54: [2, 27], 65: [2, 27], 68: [2, 27], 72: [2, 27], 75: [2, 27], 80: [2, 27], 81: [2, 27], 82: [2, 27], 83: [2, 27], 84: [2, 27], 85: [2, 27] }, { 23: [2, 28], 33: [2, 28], 54: [2, 28], 65: [2, 28], 68: [2, 28], 72: [2, 28], 75: [2, 28], 80: [2, 28], 81: [2, 28], 82: [2, 28], 83: [2, 28], 84: [2, 28], 85: [2, 28] }, { 23: [2, 30], 33: [2, 30], 54: [2, 30], 68: [2, 30], 71: 107, 72: [1, 108], 75: [2, 30] }, { 23: [2, 98], 33: [2, 98], 54: [2, 98], 68: [2, 98], 72: [2, 98], 75: [2, 98] }, { 23: [2, 45], 33: [2, 45], 54: [2, 45], 65: [2, 45], 68: [2, 45], 72: [2, 45], 73: [1, 109], 75: [2, 45], 80: [2, 45], 81: [2, 45], 82: [2, 45], 83: [2, 45], 84: [2, 45], 85: [2, 45], 87: [2, 45] }, { 23: [2, 44], 33: [2, 44], 54: [2, 44], 65: [2, 44], 68: [2, 44], 72: [2, 44], 75: [2, 44], 80: [2, 44], 81: [2, 44], 82: [2, 44], 83: [2, 44], 84: [2, 44], 85: [2, 44], 87: [2, 44] }, { 54: [1, 110] }, { 54: [2, 83], 65: [2, 83], 72: [2, 83], 80: [2, 83], 81: [2, 83], 82: [2, 83], 83: [2, 83], 84: [2, 83], 85: [2, 83] }, { 54: [2, 85] }, { 5: [2, 13], 14: [2, 13], 15: [2, 13], 19: [2, 13], 29: [2, 13], 34: [2, 13], 39: [2, 13], 44: [2, 13], 47: [2, 13], 48: [2, 13], 51: [2, 13], 55: [2, 13], 60: [2, 13] }, { 38: 56, 39: [1, 58], 43: 57, 44: [1, 59], 45: 112, 46: 111, 47: [2, 76] }, { 33: [2, 70], 40: 113, 65: [2, 70], 72: [2, 70], 75: [2, 70], 80: [2, 70], 81: [2, 70], 82: [2, 70], 83: [2, 70], 84: [2, 70], 85: [2, 70] }, { 47: [2, 18] }, { 5: [2, 14], 14: [2, 14], 15: [2, 14], 19: [2, 14], 29: [2, 14], 34: [2, 14], 39: [2, 14], 44: [2, 14], 47: [2, 14], 48: [2, 14], 51: [2, 14], 55: [2, 14], 60: [2, 14] }, { 33: [1, 114] }, { 33: [2, 87], 65: [2, 87], 72: [2, 87], 80: [2, 87], 81: [2, 87], 82: [2, 87], 83: [2, 87], 84: [2, 87], 85: [2, 87] }, { 33: [2, 89] }, { 20: 75, 63: 116, 64: 76, 65: [1, 44], 67: 115, 68: [2, 96], 69: 117, 70: 77, 71: 78, 72: [1, 79], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 33: [1, 118] }, { 32: 119, 33: [2, 62], 74: 120, 75: [1, 121] }, { 33: [2, 59], 65: [2, 59], 72: [2, 59], 75: [2, 59], 80: [2, 59], 81: [2, 59], 82: [2, 59], 83: [2, 59], 84: [2, 59], 85: [2, 59] }, { 33: [2, 61], 75: [2, 61] }, { 33: [2, 68], 37: 122, 74: 123, 75: [1, 121] }, { 33: [2, 65], 65: [2, 65], 72: [2, 65], 75: [2, 65], 80: [2, 65], 81: [2, 65], 82: [2, 65], 83: [2, 65], 84: [2, 65], 85: [2, 65] }, { 33: [2, 67], 75: [2, 67] }, { 23: [1, 124] }, { 23: [2, 51], 65: [2, 51], 72: [2, 51], 80: [2, 51], 81: [2, 51], 82: [2, 51], 83: [2, 51], 84: [2, 51], 85: [2, 51] }, { 23: [2, 53] }, { 33: [1, 125] }, { 33: [2, 91], 65: [2, 91], 72: [2, 91], 80: [2, 91], 81: [2, 91], 82: [2, 91], 83: [2, 91], 84: [2, 91], 85: [2, 91] }, { 33: [2, 93] }, { 5: [2, 22], 14: [2, 22], 15: [2, 22], 19: [2, 22], 29: [2, 22], 34: [2, 22], 39: [2, 22], 44: [2, 22], 47: [2, 22], 48: [2, 22], 51: [2, 22], 55: [2, 22], 60: [2, 22] }, { 23: [2, 99], 33: [2, 99], 54: [2, 99], 68: [2, 99], 72: [2, 99], 75: [2, 99] }, { 73: [1, 109] }, { 20: 75, 63: 126, 64: 76, 65: [1, 44], 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 5: [2, 23], 14: [2, 23], 15: [2, 23], 19: [2, 23], 29: [2, 23], 34: [2, 23], 39: [2, 23], 44: [2, 23], 47: [2, 23], 48: [2, 23], 51: [2, 23], 55: [2, 23], 60: [2, 23] }, { 47: [2, 19] }, { 47: [2, 77] }, { 20: 75, 33: [2, 72], 41: 127, 63: 128, 64: 76, 65: [1, 44], 69: 129, 70: 77, 71: 78, 72: [1, 79], 75: [2, 72], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 5: [2, 24], 14: [2, 24], 15: [2, 24], 19: [2, 24], 29: [2, 24], 34: [2, 24], 39: [2, 24], 44: [2, 24], 47: [2, 24], 48: [2, 24], 51: [2, 24], 55: [2, 24], 60: [2, 24] }, { 68: [1, 130] }, { 65: [2, 95], 68: [2, 95], 72: [2, 95], 80: [2, 95], 81: [2, 95], 82: [2, 95], 83: [2, 95], 84: [2, 95], 85: [2, 95] }, { 68: [2, 97] }, { 5: [2, 21], 14: [2, 21], 15: [2, 21], 19: [2, 21], 29: [2, 21], 34: [2, 21], 39: [2, 21], 44: [2, 21], 47: [2, 21], 48: [2, 21], 51: [2, 21], 55: [2, 21], 60: [2, 21] }, { 33: [1, 131] }, { 33: [2, 63] }, { 72: [1, 133], 76: 132 }, { 33: [1, 134] }, { 33: [2, 69] }, { 15: [2, 12] }, { 14: [2, 26], 15: [2, 26], 19: [2, 26], 29: [2, 26], 34: [2, 26], 47: [2, 26], 48: [2, 26], 51: [2, 26], 55: [2, 26], 60: [2, 26] }, { 23: [2, 31], 33: [2, 31], 54: [2, 31], 68: [2, 31], 72: [2, 31], 75: [2, 31] }, { 33: [2, 74], 42: 135, 74: 136, 75: [1, 121] }, { 33: [2, 71], 65: [2, 71], 72: [2, 71], 75: [2, 71], 80: [2, 71], 81: [2, 71], 82: [2, 71], 83: [2, 71], 84: [2, 71], 85: [2, 71] }, { 33: [2, 73], 75: [2, 73] }, { 23: [2, 29], 33: [2, 29], 54: [2, 29], 65: [2, 29], 68: [2, 29], 72: [2, 29], 75: [2, 29], 80: [2, 29], 81: [2, 29], 82: [2, 29], 83: [2, 29], 84: [2, 29], 85: [2, 29] }, { 14: [2, 15], 15: [2, 15], 19: [2, 15], 29: [2, 15], 34: [2, 15], 39: [2, 15], 44: [2, 15], 47: [2, 15], 48: [2, 15], 51: [2, 15], 55: [2, 15], 60: [2, 15] }, { 72: [1, 138], 77: [1, 137] }, { 72: [2, 100], 77: [2, 100] }, { 14: [2, 16], 15: [2, 16], 19: [2, 16], 29: [2, 16], 34: [2, 16], 44: [2, 16], 47: [2, 16], 48: [2, 16], 51: [2, 16], 55: [2, 16], 60: [2, 16] }, { 33: [1, 139] }, { 33: [2, 75] }, { 33: [2, 32] }, { 72: [2, 101], 77: [2, 101] }, { 14: [2, 17], 15: [2, 17], 19: [2, 17], 29: [2, 17], 34: [2, 17], 39: [2, 17], 44: [2, 17], 47: [2, 17], 48: [2, 17], 51: [2, 17], 55: [2, 17], 60: [2, 17] }],
	        defaultActions: { 4: [2, 1], 55: [2, 55], 57: [2, 20], 61: [2, 57], 74: [2, 81], 83: [2, 85], 87: [2, 18], 91: [2, 89], 102: [2, 53], 105: [2, 93], 111: [2, 19], 112: [2, 77], 117: [2, 97], 120: [2, 63], 123: [2, 69], 124: [2, 12], 136: [2, 75], 137: [2, 32] },
	        parseError: function parseError(str, hash) {
	            throw new Error(str);
	        },
	        parse: function parse(input) {
	            var self = this,
	                stack = [0],
	                vstack = [null],
	                lstack = [],
	                table = this.table,
	                yytext = "",
	                yylineno = 0,
	                yyleng = 0,
	                recovering = 0,
	                TERROR = 2,
	                EOF = 1;
	            this.lexer.setInput(input);
	            this.lexer.yy = this.yy;
	            this.yy.lexer = this.lexer;
	            this.yy.parser = this;
	            if (typeof this.lexer.yylloc == "undefined") this.lexer.yylloc = {};
	            var yyloc = this.lexer.yylloc;
	            lstack.push(yyloc);
	            var ranges = this.lexer.options && this.lexer.options.ranges;
	            if (typeof this.yy.parseError === "function") this.parseError = this.yy.parseError;
	            function popStack(n) {
	                stack.length = stack.length - 2 * n;
	                vstack.length = vstack.length - n;
	                lstack.length = lstack.length - n;
	            }
	            function lex() {
	                var token;
	                token = self.lexer.lex() || 1;
	                if (typeof token !== "number") {
	                    token = self.symbols_[token] || token;
	                }
	                return token;
	            }
	            var symbol,
	                preErrorSymbol,
	                state,
	                action,
	                a,
	                r,
	                yyval = {},
	                p,
	                len,
	                newState,
	                expected;
	            while (true) {
	                state = stack[stack.length - 1];
	                if (this.defaultActions[state]) {
	                    action = this.defaultActions[state];
	                } else {
	                    if (symbol === null || typeof symbol == "undefined") {
	                        symbol = lex();
	                    }
	                    action = table[state] && table[state][symbol];
	                }
	                if (typeof action === "undefined" || !action.length || !action[0]) {
	                    var errStr = "";
	                    if (!recovering) {
	                        expected = [];
	                        for (p in table[state]) if (this.terminals_[p] && p > 2) {
	                            expected.push("'" + this.terminals_[p] + "'");
	                        }
	                        if (this.lexer.showPosition) {
	                            errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
	                        } else {
	                            errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1 ? "end of input" : "'" + (this.terminals_[symbol] || symbol) + "'");
	                        }
	                        this.parseError(errStr, { text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected });
	                    }
	                }
	                if (action[0] instanceof Array && action.length > 1) {
	                    throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
	                }
	                switch (action[0]) {
	                    case 1:
	                        stack.push(symbol);
	                        vstack.push(this.lexer.yytext);
	                        lstack.push(this.lexer.yylloc);
	                        stack.push(action[1]);
	                        symbol = null;
	                        if (!preErrorSymbol) {
	                            yyleng = this.lexer.yyleng;
	                            yytext = this.lexer.yytext;
	                            yylineno = this.lexer.yylineno;
	                            yyloc = this.lexer.yylloc;
	                            if (recovering > 0) recovering--;
	                        } else {
	                            symbol = preErrorSymbol;
	                            preErrorSymbol = null;
	                        }
	                        break;
	                    case 2:
	                        len = this.productions_[action[1]][1];
	                        yyval.$ = vstack[vstack.length - len];
	                        yyval._$ = { first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column };
	                        if (ranges) {
	                            yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
	                        }
	                        r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
	                        if (typeof r !== "undefined") {
	                            return r;
	                        }
	                        if (len) {
	                            stack = stack.slice(0, -1 * len * 2);
	                            vstack = vstack.slice(0, -1 * len);
	                            lstack = lstack.slice(0, -1 * len);
	                        }
	                        stack.push(this.productions_[action[1]][0]);
	                        vstack.push(yyval.$);
	                        lstack.push(yyval._$);
	                        newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
	                        stack.push(newState);
	                        break;
	                    case 3:
	                        return true;
	                }
	            }
	            return true;
	        }
	    };
	    /* Jison generated lexer */
	    var lexer = (function () {
	        var lexer = { EOF: 1,
	            parseError: function parseError(str, hash) {
	                if (this.yy.parser) {
	                    this.yy.parser.parseError(str, hash);
	                } else {
	                    throw new Error(str);
	                }
	            },
	            setInput: function setInput(input) {
	                this._input = input;
	                this._more = this._less = this.done = false;
	                this.yylineno = this.yyleng = 0;
	                this.yytext = this.matched = this.match = '';
	                this.conditionStack = ['INITIAL'];
	                this.yylloc = { first_line: 1, first_column: 0, last_line: 1, last_column: 0 };
	                if (this.options.ranges) this.yylloc.range = [0, 0];
	                this.offset = 0;
	                return this;
	            },
	            input: function input() {
	                var ch = this._input[0];
	                this.yytext += ch;
	                this.yyleng++;
	                this.offset++;
	                this.match += ch;
	                this.matched += ch;
	                var lines = ch.match(/(?:\r\n?|\n).*/g);
	                if (lines) {
	                    this.yylineno++;
	                    this.yylloc.last_line++;
	                } else {
	                    this.yylloc.last_column++;
	                }
	                if (this.options.ranges) this.yylloc.range[1]++;

	                this._input = this._input.slice(1);
	                return ch;
	            },
	            unput: function unput(ch) {
	                var len = ch.length;
	                var lines = ch.split(/(?:\r\n?|\n)/g);

	                this._input = ch + this._input;
	                this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
	                //this.yyleng -= len;
	                this.offset -= len;
	                var oldLines = this.match.split(/(?:\r\n?|\n)/g);
	                this.match = this.match.substr(0, this.match.length - 1);
	                this.matched = this.matched.substr(0, this.matched.length - 1);

	                if (lines.length - 1) this.yylineno -= lines.length - 1;
	                var r = this.yylloc.range;

	                this.yylloc = { first_line: this.yylloc.first_line,
	                    last_line: this.yylineno + 1,
	                    first_column: this.yylloc.first_column,
	                    last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
	                };

	                if (this.options.ranges) {
	                    this.yylloc.range = [r[0], r[0] + this.yyleng - len];
	                }
	                return this;
	            },
	            more: function more() {
	                this._more = true;
	                return this;
	            },
	            less: function less(n) {
	                this.unput(this.match.slice(n));
	            },
	            pastInput: function pastInput() {
	                var past = this.matched.substr(0, this.matched.length - this.match.length);
	                return (past.length > 20 ? '...' : '') + past.substr(-20).replace(/\n/g, "");
	            },
	            upcomingInput: function upcomingInput() {
	                var next = this.match;
	                if (next.length < 20) {
	                    next += this._input.substr(0, 20 - next.length);
	                }
	                return (next.substr(0, 20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
	            },
	            showPosition: function showPosition() {
	                var pre = this.pastInput();
	                var c = new Array(pre.length + 1).join("-");
	                return pre + this.upcomingInput() + "\n" + c + "^";
	            },
	            next: function next() {
	                if (this.done) {
	                    return this.EOF;
	                }
	                if (!this._input) this.done = true;

	                var token, match, tempMatch, index, col, lines;
	                if (!this._more) {
	                    this.yytext = '';
	                    this.match = '';
	                }
	                var rules = this._currentRules();
	                for (var i = 0; i < rules.length; i++) {
	                    tempMatch = this._input.match(this.rules[rules[i]]);
	                    if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
	                        match = tempMatch;
	                        index = i;
	                        if (!this.options.flex) break;
	                    }
	                }
	                if (match) {
	                    lines = match[0].match(/(?:\r\n?|\n).*/g);
	                    if (lines) this.yylineno += lines.length;
	                    this.yylloc = { first_line: this.yylloc.last_line,
	                        last_line: this.yylineno + 1,
	                        first_column: this.yylloc.last_column,
	                        last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length };
	                    this.yytext += match[0];
	                    this.match += match[0];
	                    this.matches = match;
	                    this.yyleng = this.yytext.length;
	                    if (this.options.ranges) {
	                        this.yylloc.range = [this.offset, this.offset += this.yyleng];
	                    }
	                    this._more = false;
	                    this._input = this._input.slice(match[0].length);
	                    this.matched += match[0];
	                    token = this.performAction.call(this, this.yy, this, rules[index], this.conditionStack[this.conditionStack.length - 1]);
	                    if (this.done && this._input) this.done = false;
	                    if (token) return token;else return;
	                }
	                if (this._input === "") {
	                    return this.EOF;
	                } else {
	                    return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), { text: "", token: null, line: this.yylineno });
	                }
	            },
	            lex: function lex() {
	                var r = this.next();
	                if (typeof r !== 'undefined') {
	                    return r;
	                } else {
	                    return this.lex();
	                }
	            },
	            begin: function begin(condition) {
	                this.conditionStack.push(condition);
	            },
	            popState: function popState() {
	                return this.conditionStack.pop();
	            },
	            _currentRules: function _currentRules() {
	                return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
	            },
	            topState: function topState() {
	                return this.conditionStack[this.conditionStack.length - 2];
	            },
	            pushState: function begin(condition) {
	                this.begin(condition);
	            } };
	        lexer.options = {};
	        lexer.performAction = function anonymous(yy, yy_, $avoiding_name_collisions, YY_START
	        /**/) {

	            function strip(start, end) {
	                return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng - end);
	            }

	            var YYSTATE = YY_START;
	            switch ($avoiding_name_collisions) {
	                case 0:
	                    if (yy_.yytext.slice(-2) === "\\\\") {
	                        strip(0, 1);
	                        this.begin("mu");
	                    } else if (yy_.yytext.slice(-1) === "\\") {
	                        strip(0, 1);
	                        this.begin("emu");
	                    } else {
	                        this.begin("mu");
	                    }
	                    if (yy_.yytext) return 15;

	                    break;
	                case 1:
	                    return 15;
	                    break;
	                case 2:
	                    this.popState();
	                    return 15;

	                    break;
	                case 3:
	                    this.begin('raw');return 15;
	                    break;
	                case 4:
	                    this.popState();
	                    // Should be using `this.topState()` below, but it currently
	                    // returns the second top instead of the first top. Opened an
	                    // issue about it at https://github.com/zaach/jison/issues/291
	                    if (this.conditionStack[this.conditionStack.length - 1] === 'raw') {
	                        return 15;
	                    } else {
	                        yy_.yytext = yy_.yytext.substr(5, yy_.yyleng - 9);
	                        return 'END_RAW_BLOCK';
	                    }

	                    break;
	                case 5:
	                    return 15;
	                    break;
	                case 6:
	                    this.popState();
	                    return 14;

	                    break;
	                case 7:
	                    return 65;
	                    break;
	                case 8:
	                    return 68;
	                    break;
	                case 9:
	                    return 19;
	                    break;
	                case 10:
	                    this.popState();
	                    this.begin('raw');
	                    return 23;

	                    break;
	                case 11:
	                    return 55;
	                    break;
	                case 12:
	                    return 60;
	                    break;
	                case 13:
	                    return 29;
	                    break;
	                case 14:
	                    return 47;
	                    break;
	                case 15:
	                    this.popState();return 44;
	                    break;
	                case 16:
	                    this.popState();return 44;
	                    break;
	                case 17:
	                    return 34;
	                    break;
	                case 18:
	                    return 39;
	                    break;
	                case 19:
	                    return 51;
	                    break;
	                case 20:
	                    return 48;
	                    break;
	                case 21:
	                    this.unput(yy_.yytext);
	                    this.popState();
	                    this.begin('com');

	                    break;
	                case 22:
	                    this.popState();
	                    return 14;

	                    break;
	                case 23:
	                    return 48;
	                    break;
	                case 24:
	                    return 73;
	                    break;
	                case 25:
	                    return 72;
	                    break;
	                case 26:
	                    return 72;
	                    break;
	                case 27:
	                    return 87;
	                    break;
	                case 28:
	                    // ignore whitespace
	                    break;
	                case 29:
	                    this.popState();return 54;
	                    break;
	                case 30:
	                    this.popState();return 33;
	                    break;
	                case 31:
	                    yy_.yytext = strip(1, 2).replace(/\\"/g, '"');return 80;
	                    break;
	                case 32:
	                    yy_.yytext = strip(1, 2).replace(/\\'/g, "'");return 80;
	                    break;
	                case 33:
	                    return 85;
	                    break;
	                case 34:
	                    return 82;
	                    break;
	                case 35:
	                    return 82;
	                    break;
	                case 36:
	                    return 83;
	                    break;
	                case 37:
	                    return 84;
	                    break;
	                case 38:
	                    return 81;
	                    break;
	                case 39:
	                    return 75;
	                    break;
	                case 40:
	                    return 77;
	                    break;
	                case 41:
	                    return 72;
	                    break;
	                case 42:
	                    yy_.yytext = yy_.yytext.replace(/\\([\\\]])/g, '$1');return 72;
	                    break;
	                case 43:
	                    return 'INVALID';
	                    break;
	                case 44:
	                    return 5;
	                    break;
	            }
	        };
	        lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/, /^(?:\{\{\{\{(?=[^/]))/, /^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/, /^(?:[^\x00]*?(?=(\{\{\{\{)))/, /^(?:[\s\S]*?--(~)?\}\})/, /^(?:\()/, /^(?:\))/, /^(?:\{\{\{\{)/, /^(?:\}\}\}\})/, /^(?:\{\{(~)?>)/, /^(?:\{\{(~)?#>)/, /^(?:\{\{(~)?#\*?)/, /^(?:\{\{(~)?\/)/, /^(?:\{\{(~)?\^\s*(~)?\}\})/, /^(?:\{\{(~)?\s*else\s*(~)?\}\})/, /^(?:\{\{(~)?\^)/, /^(?:\{\{(~)?\s*else\b)/, /^(?:\{\{(~)?\{)/, /^(?:\{\{(~)?&)/, /^(?:\{\{(~)?!--)/, /^(?:\{\{(~)?![\s\S]*?\}\})/, /^(?:\{\{(~)?\*?)/, /^(?:=)/, /^(?:\.\.)/, /^(?:\.(?=([=~}\s\/.)|])))/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}(~)?\}\})/, /^(?:(~)?\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@)/, /^(?:true(?=([~}\s)])))/, /^(?:false(?=([~}\s)])))/, /^(?:undefined(?=([~}\s)])))/, /^(?:null(?=([~}\s)])))/, /^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/, /^(?:as\s+\|)/, /^(?:\|)/, /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)|]))))/, /^(?:\[(\\\]|[^\]])*\])/, /^(?:.)/, /^(?:$)/];
	        lexer.conditions = { "mu": { "rules": [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44], "inclusive": false }, "emu": { "rules": [2], "inclusive": false }, "com": { "rules": [6], "inclusive": false }, "raw": { "rules": [3, 4, 5], "inclusive": false }, "INITIAL": { "rules": [0, 1, 44], "inclusive": true } };
	        return lexer;
	    })();
	    parser.lexer = lexer;
	    function Parser() {
	        this.yy = {};
	    }Parser.prototype = parser;parser.Parser = Parser;
	    return new Parser();
	})();exports.__esModule = true;
	exports['default'] = handlebars;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _visitor = __webpack_require__(25);

	var _visitor2 = _interopRequireDefault(_visitor);

	function WhitespaceControl() {
	  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	  this.options = options;
	}
	WhitespaceControl.prototype = new _visitor2['default']();

	WhitespaceControl.prototype.Program = function (program) {
	  var doStandalone = !this.options.ignoreStandalone;

	  var isRoot = !this.isRootSeen;
	  this.isRootSeen = true;

	  var body = program.body;
	  for (var i = 0, l = body.length; i < l; i++) {
	    var current = body[i],
	        strip = this.accept(current);

	    if (!strip) {
	      continue;
	    }

	    var _isPrevWhitespace = isPrevWhitespace(body, i, isRoot),
	        _isNextWhitespace = isNextWhitespace(body, i, isRoot),
	        openStandalone = strip.openStandalone && _isPrevWhitespace,
	        closeStandalone = strip.closeStandalone && _isNextWhitespace,
	        inlineStandalone = strip.inlineStandalone && _isPrevWhitespace && _isNextWhitespace;

	    if (strip.close) {
	      omitRight(body, i, true);
	    }
	    if (strip.open) {
	      omitLeft(body, i, true);
	    }

	    if (doStandalone && inlineStandalone) {
	      omitRight(body, i);

	      if (omitLeft(body, i)) {
	        // If we are on a standalone node, save the indent info for partials
	        if (current.type === 'PartialStatement') {
	          // Pull out the whitespace from the final line
	          current.indent = /([ \t]+$)/.exec(body[i - 1].original)[1];
	        }
	      }
	    }
	    if (doStandalone && openStandalone) {
	      omitRight((current.program || current.inverse).body);

	      // Strip out the previous content node if it's whitespace only
	      omitLeft(body, i);
	    }
	    if (doStandalone && closeStandalone) {
	      // Always strip the next node
	      omitRight(body, i);

	      omitLeft((current.inverse || current.program).body);
	    }
	  }

	  return program;
	};

	WhitespaceControl.prototype.BlockStatement = WhitespaceControl.prototype.DecoratorBlock = WhitespaceControl.prototype.PartialBlockStatement = function (block) {
	  this.accept(block.program);
	  this.accept(block.inverse);

	  // Find the inverse program that is involed with whitespace stripping.
	  var program = block.program || block.inverse,
	      inverse = block.program && block.inverse,
	      firstInverse = inverse,
	      lastInverse = inverse;

	  if (inverse && inverse.chained) {
	    firstInverse = inverse.body[0].program;

	    // Walk the inverse chain to find the last inverse that is actually in the chain.
	    while (lastInverse.chained) {
	      lastInverse = lastInverse.body[lastInverse.body.length - 1].program;
	    }
	  }

	  var strip = {
	    open: block.openStrip.open,
	    close: block.closeStrip.close,

	    // Determine the standalone candiacy. Basically flag our content as being possibly standalone
	    // so our parent can determine if we actually are standalone
	    openStandalone: isNextWhitespace(program.body),
	    closeStandalone: isPrevWhitespace((firstInverse || program).body)
	  };

	  if (block.openStrip.close) {
	    omitRight(program.body, null, true);
	  }

	  if (inverse) {
	    var inverseStrip = block.inverseStrip;

	    if (inverseStrip.open) {
	      omitLeft(program.body, null, true);
	    }

	    if (inverseStrip.close) {
	      omitRight(firstInverse.body, null, true);
	    }
	    if (block.closeStrip.open) {
	      omitLeft(lastInverse.body, null, true);
	    }

	    // Find standalone else statments
	    if (!this.options.ignoreStandalone && isPrevWhitespace(program.body) && isNextWhitespace(firstInverse.body)) {
	      omitLeft(program.body);
	      omitRight(firstInverse.body);
	    }
	  } else if (block.closeStrip.open) {
	    omitLeft(program.body, null, true);
	  }

	  return strip;
	};

	WhitespaceControl.prototype.Decorator = WhitespaceControl.prototype.MustacheStatement = function (mustache) {
	  return mustache.strip;
	};

	WhitespaceControl.prototype.PartialStatement = WhitespaceControl.prototype.CommentStatement = function (node) {
	  /* istanbul ignore next */
	  var strip = node.strip || {};
	  return {
	    inlineStandalone: true,
	    open: strip.open,
	    close: strip.close
	  };
	};

	function isPrevWhitespace(body, i, isRoot) {
	  if (i === undefined) {
	    i = body.length;
	  }

	  // Nodes that end with newlines are considered whitespace (but are special
	  // cased for strip operations)
	  var prev = body[i - 1],
	      sibling = body[i - 2];
	  if (!prev) {
	    return isRoot;
	  }

	  if (prev.type === 'ContentStatement') {
	    return (sibling || !isRoot ? /\r?\n\s*?$/ : /(^|\r?\n)\s*?$/).test(prev.original);
	  }
	}
	function isNextWhitespace(body, i, isRoot) {
	  if (i === undefined) {
	    i = -1;
	  }

	  var next = body[i + 1],
	      sibling = body[i + 2];
	  if (!next) {
	    return isRoot;
	  }

	  if (next.type === 'ContentStatement') {
	    return (sibling || !isRoot ? /^\s*?\r?\n/ : /^\s*?(\r?\n|$)/).test(next.original);
	  }
	}

	// Marks the node to the right of the position as omitted.
	// I.e. {{foo}}' ' will mark the ' ' node as omitted.
	//
	// If i is undefined, then the first child will be marked as such.
	//
	// If mulitple is truthy then all whitespace will be stripped out until non-whitespace
	// content is met.
	function omitRight(body, i, multiple) {
	  var current = body[i == null ? 0 : i + 1];
	  if (!current || current.type !== 'ContentStatement' || !multiple && current.rightStripped) {
	    return;
	  }

	  var original = current.value;
	  current.value = current.value.replace(multiple ? /^\s+/ : /^[ \t]*\r?\n?/, '');
	  current.rightStripped = current.value !== original;
	}

	// Marks the node to the left of the position as omitted.
	// I.e. ' '{{foo}} will mark the ' ' node as omitted.
	//
	// If i is undefined then the last child will be marked as such.
	//
	// If mulitple is truthy then all whitespace will be stripped out until non-whitespace
	// content is met.
	function omitLeft(body, i, multiple) {
	  var current = body[i == null ? body.length - 1 : i - 1];
	  if (!current || current.type !== 'ContentStatement' || !multiple && current.leftStripped) {
	    return;
	  }

	  // We omit the last node if it's whitespace only and not preceeded by a non-content node.
	  var original = current.value;
	  current.value = current.value.replace(multiple ? /\s+$/ : /[ \t]+$/, '');
	  current.leftStripped = current.value !== original;
	  return current.leftStripped;
	}

	exports['default'] = WhitespaceControl;
	module.exports = exports['default'];

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _exception = __webpack_require__(6);

	var _exception2 = _interopRequireDefault(_exception);

	function Visitor() {
	  this.parents = [];
	}

	Visitor.prototype = {
	  constructor: Visitor,
	  mutating: false,

	  // Visits a given value. If mutating, will replace the value if necessary.
	  acceptKey: function acceptKey(node, name) {
	    var value = this.accept(node[name]);
	    if (this.mutating) {
	      // Hacky sanity check: This may have a few false positives for type for the helper
	      // methods but will generally do the right thing without a lot of overhead.
	      if (value && !Visitor.prototype[value.type]) {
	        throw new _exception2['default']('Unexpected node type "' + value.type + '" found when accepting ' + name + ' on ' + node.type);
	      }
	      node[name] = value;
	    }
	  },

	  // Performs an accept operation with added sanity check to ensure
	  // required keys are not removed.
	  acceptRequired: function acceptRequired(node, name) {
	    this.acceptKey(node, name);

	    if (!node[name]) {
	      throw new _exception2['default'](node.type + ' requires ' + name);
	    }
	  },

	  // Traverses a given array. If mutating, empty respnses will be removed
	  // for child elements.
	  acceptArray: function acceptArray(array) {
	    for (var i = 0, l = array.length; i < l; i++) {
	      this.acceptKey(array, i);

	      if (!array[i]) {
	        array.splice(i, 1);
	        i--;
	        l--;
	      }
	    }
	  },

	  accept: function accept(object) {
	    if (!object) {
	      return;
	    }

	    /* istanbul ignore next: Sanity code */
	    if (!this[object.type]) {
	      throw new _exception2['default']('Unknown type: ' + object.type, object);
	    }

	    if (this.current) {
	      this.parents.unshift(this.current);
	    }
	    this.current = object;

	    var ret = this[object.type](object);

	    this.current = this.parents.shift();

	    if (!this.mutating || ret) {
	      return ret;
	    } else if (ret !== false) {
	      return object;
	    }
	  },

	  Program: function Program(program) {
	    this.acceptArray(program.body);
	  },

	  MustacheStatement: visitSubExpression,
	  Decorator: visitSubExpression,

	  BlockStatement: visitBlock,
	  DecoratorBlock: visitBlock,

	  PartialStatement: visitPartial,
	  PartialBlockStatement: function PartialBlockStatement(partial) {
	    visitPartial.call(this, partial);

	    this.acceptKey(partial, 'program');
	  },

	  ContentStatement: function ContentStatement() /* content */{},
	  CommentStatement: function CommentStatement() /* comment */{},

	  SubExpression: visitSubExpression,

	  PathExpression: function PathExpression() /* path */{},

	  StringLiteral: function StringLiteral() /* string */{},
	  NumberLiteral: function NumberLiteral() /* number */{},
	  BooleanLiteral: function BooleanLiteral() /* bool */{},
	  UndefinedLiteral: function UndefinedLiteral() /* literal */{},
	  NullLiteral: function NullLiteral() /* literal */{},

	  Hash: function Hash(hash) {
	    this.acceptArray(hash.pairs);
	  },
	  HashPair: function HashPair(pair) {
	    this.acceptRequired(pair, 'value');
	  }
	};

	function visitSubExpression(mustache) {
	  this.acceptRequired(mustache, 'path');
	  this.acceptArray(mustache.params);
	  this.acceptKey(mustache, 'hash');
	}
	function visitBlock(block) {
	  visitSubExpression.call(this, block);

	  this.acceptKey(block, 'program');
	  this.acceptKey(block, 'inverse');
	}
	function visitPartial(partial) {
	  this.acceptRequired(partial, 'name');
	  this.acceptArray(partial.params);
	  this.acceptKey(partial, 'hash');
	}

	exports['default'] = Visitor;
	module.exports = exports['default'];

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;
	exports.SourceLocation = SourceLocation;
	exports.id = id;
	exports.stripFlags = stripFlags;
	exports.stripComment = stripComment;
	exports.preparePath = preparePath;
	exports.prepareMustache = prepareMustache;
	exports.prepareRawBlock = prepareRawBlock;
	exports.prepareBlock = prepareBlock;
	exports.prepareProgram = prepareProgram;
	exports.preparePartialBlock = preparePartialBlock;

	var _exception = __webpack_require__(6);

	var _exception2 = _interopRequireDefault(_exception);

	function validateClose(open, close) {
	  close = close.path ? close.path.original : close;

	  if (open.path.original !== close) {
	    var errorNode = { loc: open.path.loc };

	    throw new _exception2['default'](open.path.original + " doesn't match " + close, errorNode);
	  }
	}

	function SourceLocation(source, locInfo) {
	  this.source = source;
	  this.start = {
	    line: locInfo.first_line,
	    column: locInfo.first_column
	  };
	  this.end = {
	    line: locInfo.last_line,
	    column: locInfo.last_column
	  };
	}

	function id(token) {
	  if (/^\[.*\]$/.test(token)) {
	    return token.substr(1, token.length - 2);
	  } else {
	    return token;
	  }
	}

	function stripFlags(open, close) {
	  return {
	    open: open.charAt(2) === '~',
	    close: close.charAt(close.length - 3) === '~'
	  };
	}

	function stripComment(comment) {
	  return comment.replace(/^\{\{~?\!-?-?/, '').replace(/-?-?~?\}\}$/, '');
	}

	function preparePath(data, parts, loc) {
	  loc = this.locInfo(loc);

	  var original = data ? '@' : '',
	      dig = [],
	      depth = 0,
	      depthString = '';

	  for (var i = 0, l = parts.length; i < l; i++) {
	    var part = parts[i].part,

	    // If we have [] syntax then we do not treat path references as operators,
	    // i.e. foo.[this] resolves to approximately context.foo['this']
	    isLiteral = parts[i].original !== part;
	    original += (parts[i].separator || '') + part;

	    if (!isLiteral && (part === '..' || part === '.' || part === 'this')) {
	      if (dig.length > 0) {
	        throw new _exception2['default']('Invalid path: ' + original, { loc: loc });
	      } else if (part === '..') {
	        depth++;
	        depthString += '../';
	      }
	    } else {
	      dig.push(part);
	    }
	  }

	  return {
	    type: 'PathExpression',
	    data: data,
	    depth: depth,
	    parts: dig,
	    original: original,
	    loc: loc
	  };
	}

	function prepareMustache(path, params, hash, open, strip, locInfo) {
	  // Must use charAt to support IE pre-10
	  var escapeFlag = open.charAt(3) || open.charAt(2),
	      escaped = escapeFlag !== '{' && escapeFlag !== '&';

	  var decorator = /\*/.test(open);
	  return {
	    type: decorator ? 'Decorator' : 'MustacheStatement',
	    path: path,
	    params: params,
	    hash: hash,
	    escaped: escaped,
	    strip: strip,
	    loc: this.locInfo(locInfo)
	  };
	}

	function prepareRawBlock(openRawBlock, contents, close, locInfo) {
	  validateClose(openRawBlock, close);

	  locInfo = this.locInfo(locInfo);
	  var program = {
	    type: 'Program',
	    body: contents,
	    strip: {},
	    loc: locInfo
	  };

	  return {
	    type: 'BlockStatement',
	    path: openRawBlock.path,
	    params: openRawBlock.params,
	    hash: openRawBlock.hash,
	    program: program,
	    openStrip: {},
	    inverseStrip: {},
	    closeStrip: {},
	    loc: locInfo
	  };
	}

	function prepareBlock(openBlock, program, inverseAndProgram, close, inverted, locInfo) {
	  if (close && close.path) {
	    validateClose(openBlock, close);
	  }

	  var decorator = /\*/.test(openBlock.open);

	  program.blockParams = openBlock.blockParams;

	  var inverse = undefined,
	      inverseStrip = undefined;

	  if (inverseAndProgram) {
	    if (decorator) {
	      throw new _exception2['default']('Unexpected inverse block on decorator', inverseAndProgram);
	    }

	    if (inverseAndProgram.chain) {
	      inverseAndProgram.program.body[0].closeStrip = close.strip;
	    }

	    inverseStrip = inverseAndProgram.strip;
	    inverse = inverseAndProgram.program;
	  }

	  if (inverted) {
	    inverted = inverse;
	    inverse = program;
	    program = inverted;
	  }

	  return {
	    type: decorator ? 'DecoratorBlock' : 'BlockStatement',
	    path: openBlock.path,
	    params: openBlock.params,
	    hash: openBlock.hash,
	    program: program,
	    inverse: inverse,
	    openStrip: openBlock.strip,
	    inverseStrip: inverseStrip,
	    closeStrip: close && close.strip,
	    loc: this.locInfo(locInfo)
	  };
	}

	function prepareProgram(statements, loc) {
	  if (!loc && statements.length) {
	    var firstLoc = statements[0].loc,
	        lastLoc = statements[statements.length - 1].loc;

	    /* istanbul ignore else */
	    if (firstLoc && lastLoc) {
	      loc = {
	        source: firstLoc.source,
	        start: {
	          line: firstLoc.start.line,
	          column: firstLoc.start.column
	        },
	        end: {
	          line: lastLoc.end.line,
	          column: lastLoc.end.column
	        }
	      };
	    }
	  }

	  return {
	    type: 'Program',
	    body: statements,
	    strip: {},
	    loc: loc
	  };
	}

	function preparePartialBlock(open, program, close, locInfo) {
	  validateClose(open, close);

	  return {
	    type: 'PartialBlockStatement',
	    name: open.path,
	    params: open.params,
	    hash: open.hash,
	    program: program,
	    openStrip: open.strip,
	    closeStrip: close && close.strip,
	    loc: this.locInfo(locInfo)
	  };
	}

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint-disable new-cap */

	'use strict';

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;
	exports.Compiler = Compiler;
	exports.precompile = precompile;
	exports.compile = compile;

	var _exception = __webpack_require__(6);

	var _exception2 = _interopRequireDefault(_exception);

	var _utils = __webpack_require__(5);

	var _ast = __webpack_require__(21);

	var _ast2 = _interopRequireDefault(_ast);

	var slice = [].slice;

	function Compiler() {}

	// the foundHelper register will disambiguate helper lookup from finding a
	// function in a context. This is necessary for mustache compatibility, which
	// requires that context functions in blocks are evaluated by blockHelperMissing,
	// and then proceed as if the resulting value was provided to blockHelperMissing.

	Compiler.prototype = {
	  compiler: Compiler,

	  equals: function equals(other) {
	    var len = this.opcodes.length;
	    if (other.opcodes.length !== len) {
	      return false;
	    }

	    for (var i = 0; i < len; i++) {
	      var opcode = this.opcodes[i],
	          otherOpcode = other.opcodes[i];
	      if (opcode.opcode !== otherOpcode.opcode || !argEquals(opcode.args, otherOpcode.args)) {
	        return false;
	      }
	    }

	    // We know that length is the same between the two arrays because they are directly tied
	    // to the opcode behavior above.
	    len = this.children.length;
	    for (var i = 0; i < len; i++) {
	      if (!this.children[i].equals(other.children[i])) {
	        return false;
	      }
	    }

	    return true;
	  },

	  guid: 0,

	  compile: function compile(program, options) {
	    this.sourceNode = [];
	    this.opcodes = [];
	    this.children = [];
	    this.options = options;
	    this.stringParams = options.stringParams;
	    this.trackIds = options.trackIds;

	    options.blockParams = options.blockParams || [];

	    // These changes will propagate to the other compiler components
	    var knownHelpers = options.knownHelpers;
	    options.knownHelpers = {
	      'helperMissing': true,
	      'blockHelperMissing': true,
	      'each': true,
	      'if': true,
	      'unless': true,
	      'with': true,
	      'log': true,
	      'lookup': true
	    };
	    if (knownHelpers) {
	      for (var _name in knownHelpers) {
	        /* istanbul ignore else */
	        if (_name in knownHelpers) {
	          options.knownHelpers[_name] = knownHelpers[_name];
	        }
	      }
	    }

	    return this.accept(program);
	  },

	  compileProgram: function compileProgram(program) {
	    var childCompiler = new this.compiler(),
	        // eslint-disable-line new-cap
	    result = childCompiler.compile(program, this.options),
	        guid = this.guid++;

	    this.usePartial = this.usePartial || result.usePartial;

	    this.children[guid] = result;
	    this.useDepths = this.useDepths || result.useDepths;

	    return guid;
	  },

	  accept: function accept(node) {
	    /* istanbul ignore next: Sanity code */
	    if (!this[node.type]) {
	      throw new _exception2['default']('Unknown type: ' + node.type, node);
	    }

	    this.sourceNode.unshift(node);
	    var ret = this[node.type](node);
	    this.sourceNode.shift();
	    return ret;
	  },

	  Program: function Program(program) {
	    this.options.blockParams.unshift(program.blockParams);

	    var body = program.body,
	        bodyLength = body.length;
	    for (var i = 0; i < bodyLength; i++) {
	      this.accept(body[i]);
	    }

	    this.options.blockParams.shift();

	    this.isSimple = bodyLength === 1;
	    this.blockParams = program.blockParams ? program.blockParams.length : 0;

	    return this;
	  },

	  BlockStatement: function BlockStatement(block) {
	    transformLiteralToPath(block);

	    var program = block.program,
	        inverse = block.inverse;

	    program = program && this.compileProgram(program);
	    inverse = inverse && this.compileProgram(inverse);

	    var type = this.classifySexpr(block);

	    if (type === 'helper') {
	      this.helperSexpr(block, program, inverse);
	    } else if (type === 'simple') {
	      this.simpleSexpr(block);

	      // now that the simple mustache is resolved, we need to
	      // evaluate it by executing `blockHelperMissing`
	      this.opcode('pushProgram', program);
	      this.opcode('pushProgram', inverse);
	      this.opcode('emptyHash');
	      this.opcode('blockValue', block.path.original);
	    } else {
	      this.ambiguousSexpr(block, program, inverse);

	      // now that the simple mustache is resolved, we need to
	      // evaluate it by executing `blockHelperMissing`
	      this.opcode('pushProgram', program);
	      this.opcode('pushProgram', inverse);
	      this.opcode('emptyHash');
	      this.opcode('ambiguousBlockValue');
	    }

	    this.opcode('append');
	  },

	  DecoratorBlock: function DecoratorBlock(decorator) {
	    var program = decorator.program && this.compileProgram(decorator.program);
	    var params = this.setupFullMustacheParams(decorator, program, undefined),
	        path = decorator.path;

	    this.useDecorators = true;
	    this.opcode('registerDecorator', params.length, path.original);
	  },

	  PartialStatement: function PartialStatement(partial) {
	    this.usePartial = true;

	    var program = partial.program;
	    if (program) {
	      program = this.compileProgram(partial.program);
	    }

	    var params = partial.params;
	    if (params.length > 1) {
	      throw new _exception2['default']('Unsupported number of partial arguments: ' + params.length, partial);
	    } else if (!params.length) {
	      if (this.options.explicitPartialContext) {
	        this.opcode('pushLiteral', 'undefined');
	      } else {
	        params.push({ type: 'PathExpression', parts: [], depth: 0 });
	      }
	    }

	    var partialName = partial.name.original,
	        isDynamic = partial.name.type === 'SubExpression';
	    if (isDynamic) {
	      this.accept(partial.name);
	    }

	    this.setupFullMustacheParams(partial, program, undefined, true);

	    var indent = partial.indent || '';
	    if (this.options.preventIndent && indent) {
	      this.opcode('appendContent', indent);
	      indent = '';
	    }

	    this.opcode('invokePartial', isDynamic, partialName, indent);
	    this.opcode('append');
	  },
	  PartialBlockStatement: function PartialBlockStatement(partialBlock) {
	    this.PartialStatement(partialBlock);
	  },

	  MustacheStatement: function MustacheStatement(mustache) {
	    this.SubExpression(mustache);

	    if (mustache.escaped && !this.options.noEscape) {
	      this.opcode('appendEscaped');
	    } else {
	      this.opcode('append');
	    }
	  },
	  Decorator: function Decorator(decorator) {
	    this.DecoratorBlock(decorator);
	  },

	  ContentStatement: function ContentStatement(content) {
	    if (content.value) {
	      this.opcode('appendContent', content.value);
	    }
	  },

	  CommentStatement: function CommentStatement() {},

	  SubExpression: function SubExpression(sexpr) {
	    transformLiteralToPath(sexpr);
	    var type = this.classifySexpr(sexpr);

	    if (type === 'simple') {
	      this.simpleSexpr(sexpr);
	    } else if (type === 'helper') {
	      this.helperSexpr(sexpr);
	    } else {
	      this.ambiguousSexpr(sexpr);
	    }
	  },
	  ambiguousSexpr: function ambiguousSexpr(sexpr, program, inverse) {
	    var path = sexpr.path,
	        name = path.parts[0],
	        isBlock = program != null || inverse != null;

	    this.opcode('getContext', path.depth);

	    this.opcode('pushProgram', program);
	    this.opcode('pushProgram', inverse);

	    path.strict = true;
	    this.accept(path);

	    this.opcode('invokeAmbiguous', name, isBlock);
	  },

	  simpleSexpr: function simpleSexpr(sexpr) {
	    var path = sexpr.path;
	    path.strict = true;
	    this.accept(path);
	    this.opcode('resolvePossibleLambda');
	  },

	  helperSexpr: function helperSexpr(sexpr, program, inverse) {
	    var params = this.setupFullMustacheParams(sexpr, program, inverse),
	        path = sexpr.path,
	        name = path.parts[0];

	    if (this.options.knownHelpers[name]) {
	      this.opcode('invokeKnownHelper', params.length, name);
	    } else if (this.options.knownHelpersOnly) {
	      throw new _exception2['default']('You specified knownHelpersOnly, but used the unknown helper ' + name, sexpr);
	    } else {
	      path.strict = true;
	      path.falsy = true;

	      this.accept(path);
	      this.opcode('invokeHelper', params.length, path.original, _ast2['default'].helpers.simpleId(path));
	    }
	  },

	  PathExpression: function PathExpression(path) {
	    this.addDepth(path.depth);
	    this.opcode('getContext', path.depth);

	    var name = path.parts[0],
	        scoped = _ast2['default'].helpers.scopedId(path),
	        blockParamId = !path.depth && !scoped && this.blockParamIndex(name);

	    if (blockParamId) {
	      this.opcode('lookupBlockParam', blockParamId, path.parts);
	    } else if (!name) {
	      // Context reference, i.e. `{{foo .}}` or `{{foo ..}}`
	      this.opcode('pushContext');
	    } else if (path.data) {
	      this.options.data = true;
	      this.opcode('lookupData', path.depth, path.parts, path.strict);
	    } else {
	      this.opcode('lookupOnContext', path.parts, path.falsy, path.strict, scoped);
	    }
	  },

	  StringLiteral: function StringLiteral(string) {
	    this.opcode('pushString', string.value);
	  },

	  NumberLiteral: function NumberLiteral(number) {
	    this.opcode('pushLiteral', number.value);
	  },

	  BooleanLiteral: function BooleanLiteral(bool) {
	    this.opcode('pushLiteral', bool.value);
	  },

	  UndefinedLiteral: function UndefinedLiteral() {
	    this.opcode('pushLiteral', 'undefined');
	  },

	  NullLiteral: function NullLiteral() {
	    this.opcode('pushLiteral', 'null');
	  },

	  Hash: function Hash(hash) {
	    var pairs = hash.pairs,
	        i = 0,
	        l = pairs.length;

	    this.opcode('pushHash');

	    for (; i < l; i++) {
	      this.pushParam(pairs[i].value);
	    }
	    while (i--) {
	      this.opcode('assignToHash', pairs[i].key);
	    }
	    this.opcode('popHash');
	  },

	  // HELPERS
	  opcode: function opcode(name) {
	    this.opcodes.push({ opcode: name, args: slice.call(arguments, 1), loc: this.sourceNode[0].loc });
	  },

	  addDepth: function addDepth(depth) {
	    if (!depth) {
	      return;
	    }

	    this.useDepths = true;
	  },

	  classifySexpr: function classifySexpr(sexpr) {
	    var isSimple = _ast2['default'].helpers.simpleId(sexpr.path);

	    var isBlockParam = isSimple && !!this.blockParamIndex(sexpr.path.parts[0]);

	    // a mustache is an eligible helper if:
	    // * its id is simple (a single part, not `this` or `..`)
	    var isHelper = !isBlockParam && _ast2['default'].helpers.helperExpression(sexpr);

	    // if a mustache is an eligible helper but not a definite
	    // helper, it is ambiguous, and will be resolved in a later
	    // pass or at runtime.
	    var isEligible = !isBlockParam && (isHelper || isSimple);

	    // if ambiguous, we can possibly resolve the ambiguity now
	    // An eligible helper is one that does not have a complex path, i.e. `this.foo`, `../foo` etc.
	    if (isEligible && !isHelper) {
	      var _name2 = sexpr.path.parts[0],
	          options = this.options;

	      if (options.knownHelpers[_name2]) {
	        isHelper = true;
	      } else if (options.knownHelpersOnly) {
	        isEligible = false;
	      }
	    }

	    if (isHelper) {
	      return 'helper';
	    } else if (isEligible) {
	      return 'ambiguous';
	    } else {
	      return 'simple';
	    }
	  },

	  pushParams: function pushParams(params) {
	    for (var i = 0, l = params.length; i < l; i++) {
	      this.pushParam(params[i]);
	    }
	  },

	  pushParam: function pushParam(val) {
	    var value = val.value != null ? val.value : val.original || '';

	    if (this.stringParams) {
	      if (value.replace) {
	        value = value.replace(/^(\.?\.\/)*/g, '').replace(/\//g, '.');
	      }

	      if (val.depth) {
	        this.addDepth(val.depth);
	      }
	      this.opcode('getContext', val.depth || 0);
	      this.opcode('pushStringParam', value, val.type);

	      if (val.type === 'SubExpression') {
	        // SubExpressions get evaluated and passed in
	        // in string params mode.
	        this.accept(val);
	      }
	    } else {
	      if (this.trackIds) {
	        var blockParamIndex = undefined;
	        if (val.parts && !_ast2['default'].helpers.scopedId(val) && !val.depth) {
	          blockParamIndex = this.blockParamIndex(val.parts[0]);
	        }
	        if (blockParamIndex) {
	          var blockParamChild = val.parts.slice(1).join('.');
	          this.opcode('pushId', 'BlockParam', blockParamIndex, blockParamChild);
	        } else {
	          value = val.original || value;
	          if (value.replace) {
	            value = value.replace(/^this(?:\.|$)/, '').replace(/^\.\//, '').replace(/^\.$/, '');
	          }

	          this.opcode('pushId', val.type, value);
	        }
	      }
	      this.accept(val);
	    }
	  },

	  setupFullMustacheParams: function setupFullMustacheParams(sexpr, program, inverse, omitEmpty) {
	    var params = sexpr.params;
	    this.pushParams(params);

	    this.opcode('pushProgram', program);
	    this.opcode('pushProgram', inverse);

	    if (sexpr.hash) {
	      this.accept(sexpr.hash);
	    } else {
	      this.opcode('emptyHash', omitEmpty);
	    }

	    return params;
	  },

	  blockParamIndex: function blockParamIndex(name) {
	    for (var depth = 0, len = this.options.blockParams.length; depth < len; depth++) {
	      var blockParams = this.options.blockParams[depth],
	          param = blockParams && _utils.indexOf(blockParams, name);
	      if (blockParams && param >= 0) {
	        return [depth, param];
	      }
	    }
	  }
	};

	function precompile(input, options, env) {
	  if (input == null || typeof input !== 'string' && input.type !== 'Program') {
	    throw new _exception2['default']('You must pass a string or Handlebars AST to Handlebars.precompile. You passed ' + input);
	  }

	  options = options || {};
	  if (!('data' in options)) {
	    options.data = true;
	  }
	  if (options.compat) {
	    options.useDepths = true;
	  }

	  var ast = env.parse(input, options),
	      environment = new env.Compiler().compile(ast, options);
	  return new env.JavaScriptCompiler().compile(environment, options);
	}

	function compile(input, options, env) {
	  if (options === undefined) options = {};

	  if (input == null || typeof input !== 'string' && input.type !== 'Program') {
	    throw new _exception2['default']('You must pass a string or Handlebars AST to Handlebars.compile. You passed ' + input);
	  }

	  if (!('data' in options)) {
	    options.data = true;
	  }
	  if (options.compat) {
	    options.useDepths = true;
	  }

	  var compiled = undefined;

	  function compileInput() {
	    var ast = env.parse(input, options),
	        environment = new env.Compiler().compile(ast, options),
	        templateSpec = new env.JavaScriptCompiler().compile(environment, options, undefined, true);
	    return env.template(templateSpec);
	  }

	  // Template is only compiled on first use and cached after that point.
	  function ret(context, execOptions) {
	    if (!compiled) {
	      compiled = compileInput();
	    }
	    return compiled.call(this, context, execOptions);
	  }
	  ret._setup = function (setupOptions) {
	    if (!compiled) {
	      compiled = compileInput();
	    }
	    return compiled._setup(setupOptions);
	  };
	  ret._child = function (i, data, blockParams, depths) {
	    if (!compiled) {
	      compiled = compileInput();
	    }
	    return compiled._child(i, data, blockParams, depths);
	  };
	  return ret;
	}

	function argEquals(a, b) {
	  if (a === b) {
	    return true;
	  }

	  if (_utils.isArray(a) && _utils.isArray(b) && a.length === b.length) {
	    for (var i = 0; i < a.length; i++) {
	      if (!argEquals(a[i], b[i])) {
	        return false;
	      }
	    }
	    return true;
	  }
	}

	function transformLiteralToPath(sexpr) {
	  if (!sexpr.path.parts) {
	    var literal = sexpr.path;
	    // Casting to string here to make false and 0 literal values play nicely with the rest
	    // of the system.
	    sexpr.path = {
	      type: 'PathExpression',
	      data: false,
	      depth: 0,
	      parts: [literal.original + ''],
	      original: literal.original + '',
	      loc: literal.loc
	    };
	  }
	}

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _base = __webpack_require__(4);

	var _exception = __webpack_require__(6);

	var _exception2 = _interopRequireDefault(_exception);

	var _utils = __webpack_require__(5);

	var _codeGen = __webpack_require__(29);

	var _codeGen2 = _interopRequireDefault(_codeGen);

	function Literal(value) {
	  this.value = value;
	}

	function JavaScriptCompiler() {}

	JavaScriptCompiler.prototype = {
	  // PUBLIC API: You can override these methods in a subclass to provide
	  // alternative compiled forms for name lookup and buffering semantics
	  nameLookup: function nameLookup(parent, name /* , type*/) {
	    if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
	      return [parent, '.', name];
	    } else {
	      return [parent, '[', JSON.stringify(name), ']'];
	    }
	  },
	  depthedLookup: function depthedLookup(name) {
	    return [this.aliasable('container.lookup'), '(depths, "', name, '")'];
	  },

	  compilerInfo: function compilerInfo() {
	    var revision = _base.COMPILER_REVISION,
	        versions = _base.REVISION_CHANGES[revision];
	    return [revision, versions];
	  },

	  appendToBuffer: function appendToBuffer(source, location, explicit) {
	    // Force a source as this simplifies the merge logic.
	    if (!_utils.isArray(source)) {
	      source = [source];
	    }
	    source = this.source.wrap(source, location);

	    if (this.environment.isSimple) {
	      return ['return ', source, ';'];
	    } else if (explicit) {
	      // This is a case where the buffer operation occurs as a child of another
	      // construct, generally braces. We have to explicitly output these buffer
	      // operations to ensure that the emitted code goes in the correct location.
	      return ['buffer += ', source, ';'];
	    } else {
	      source.appendToBuffer = true;
	      return source;
	    }
	  },

	  initializeBuffer: function initializeBuffer() {
	    return this.quotedString('');
	  },
	  // END PUBLIC API

	  compile: function compile(environment, options, context, asObject) {
	    this.environment = environment;
	    this.options = options;
	    this.stringParams = this.options.stringParams;
	    this.trackIds = this.options.trackIds;
	    this.precompile = !asObject;

	    this.name = this.environment.name;
	    this.isChild = !!context;
	    this.context = context || {
	      decorators: [],
	      programs: [],
	      environments: []
	    };

	    this.preamble();

	    this.stackSlot = 0;
	    this.stackVars = [];
	    this.aliases = {};
	    this.registers = { list: [] };
	    this.hashes = [];
	    this.compileStack = [];
	    this.inlineStack = [];
	    this.blockParams = [];

	    this.compileChildren(environment, options);

	    this.useDepths = this.useDepths || environment.useDepths || environment.useDecorators || this.options.compat;
	    this.useBlockParams = this.useBlockParams || environment.useBlockParams;

	    var opcodes = environment.opcodes,
	        opcode = undefined,
	        firstLoc = undefined,
	        i = undefined,
	        l = undefined;

	    for (i = 0, l = opcodes.length; i < l; i++) {
	      opcode = opcodes[i];

	      this.source.currentLocation = opcode.loc;
	      firstLoc = firstLoc || opcode.loc;
	      this[opcode.opcode].apply(this, opcode.args);
	    }

	    // Flush any trailing content that might be pending.
	    this.source.currentLocation = firstLoc;
	    this.pushSource('');

	    /* istanbul ignore next */
	    if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
	      throw new _exception2['default']('Compile completed with content left on stack');
	    }

	    if (!this.decorators.isEmpty()) {
	      this.useDecorators = true;

	      this.decorators.prepend('var decorators = container.decorators;\n');
	      this.decorators.push('return fn;');

	      if (asObject) {
	        this.decorators = Function.apply(this, ['fn', 'props', 'container', 'depth0', 'data', 'blockParams', 'depths', this.decorators.merge()]);
	      } else {
	        this.decorators.prepend('function(fn, props, container, depth0, data, blockParams, depths) {\n');
	        this.decorators.push('}\n');
	        this.decorators = this.decorators.merge();
	      }
	    } else {
	      this.decorators = undefined;
	    }

	    var fn = this.createFunctionContext(asObject);
	    if (!this.isChild) {
	      var ret = {
	        compiler: this.compilerInfo(),
	        main: fn
	      };

	      if (this.decorators) {
	        ret.main_d = this.decorators; // eslint-disable-line camelcase
	        ret.useDecorators = true;
	      }

	      var _context = this.context;
	      var programs = _context.programs;
	      var decorators = _context.decorators;

	      for (i = 0, l = programs.length; i < l; i++) {
	        if (programs[i]) {
	          ret[i] = programs[i];
	          if (decorators[i]) {
	            ret[i + '_d'] = decorators[i];
	            ret.useDecorators = true;
	          }
	        }
	      }

	      if (this.environment.usePartial) {
	        ret.usePartial = true;
	      }
	      if (this.options.data) {
	        ret.useData = true;
	      }
	      if (this.useDepths) {
	        ret.useDepths = true;
	      }
	      if (this.useBlockParams) {
	        ret.useBlockParams = true;
	      }
	      if (this.options.compat) {
	        ret.compat = true;
	      }

	      if (!asObject) {
	        ret.compiler = JSON.stringify(ret.compiler);

	        this.source.currentLocation = { start: { line: 1, column: 0 } };
	        ret = this.objectLiteral(ret);

	        if (options.srcName) {
	          ret = ret.toStringWithSourceMap({ file: options.destName });
	          ret.map = ret.map && ret.map.toString();
	        } else {
	          ret = ret.toString();
	        }
	      } else {
	        ret.compilerOptions = this.options;
	      }

	      return ret;
	    } else {
	      return fn;
	    }
	  },

	  preamble: function preamble() {
	    // track the last context pushed into place to allow skipping the
	    // getContext opcode when it would be a noop
	    this.lastContext = 0;
	    this.source = new _codeGen2['default'](this.options.srcName);
	    this.decorators = new _codeGen2['default'](this.options.srcName);
	  },

	  createFunctionContext: function createFunctionContext(asObject) {
	    var varDeclarations = '';

	    var locals = this.stackVars.concat(this.registers.list);
	    if (locals.length > 0) {
	      varDeclarations += ', ' + locals.join(', ');
	    }

	    // Generate minimizer alias mappings
	    //
	    // When using true SourceNodes, this will update all references to the given alias
	    // as the source nodes are reused in situ. For the non-source node compilation mode,
	    // aliases will not be used, but this case is already being run on the client and
	    // we aren't concern about minimizing the template size.
	    var aliasCount = 0;
	    for (var alias in this.aliases) {
	      // eslint-disable-line guard-for-in
	      var node = this.aliases[alias];

	      if (this.aliases.hasOwnProperty(alias) && node.children && node.referenceCount > 1) {
	        varDeclarations += ', alias' + ++aliasCount + '=' + alias;
	        node.children[0] = 'alias' + aliasCount;
	      }
	    }

	    var params = ['container', 'depth0', 'helpers', 'partials', 'data'];

	    if (this.useBlockParams || this.useDepths) {
	      params.push('blockParams');
	    }
	    if (this.useDepths) {
	      params.push('depths');
	    }

	    // Perform a second pass over the output to merge content when possible
	    var source = this.mergeSource(varDeclarations);

	    if (asObject) {
	      params.push(source);

	      return Function.apply(this, params);
	    } else {
	      return this.source.wrap(['function(', params.join(','), ') {\n  ', source, '}']);
	    }
	  },
	  mergeSource: function mergeSource(varDeclarations) {
	    var isSimple = this.environment.isSimple,
	        appendOnly = !this.forceBuffer,
	        appendFirst = undefined,
	        sourceSeen = undefined,
	        bufferStart = undefined,
	        bufferEnd = undefined;
	    this.source.each(function (line) {
	      if (line.appendToBuffer) {
	        if (bufferStart) {
	          line.prepend('  + ');
	        } else {
	          bufferStart = line;
	        }
	        bufferEnd = line;
	      } else {
	        if (bufferStart) {
	          if (!sourceSeen) {
	            appendFirst = true;
	          } else {
	            bufferStart.prepend('buffer += ');
	          }
	          bufferEnd.add(';');
	          bufferStart = bufferEnd = undefined;
	        }

	        sourceSeen = true;
	        if (!isSimple) {
	          appendOnly = false;
	        }
	      }
	    });

	    if (appendOnly) {
	      if (bufferStart) {
	        bufferStart.prepend('return ');
	        bufferEnd.add(';');
	      } else if (!sourceSeen) {
	        this.source.push('return "";');
	      }
	    } else {
	      varDeclarations += ', buffer = ' + (appendFirst ? '' : this.initializeBuffer());

	      if (bufferStart) {
	        bufferStart.prepend('return buffer + ');
	        bufferEnd.add(';');
	      } else {
	        this.source.push('return buffer;');
	      }
	    }

	    if (varDeclarations) {
	      this.source.prepend('var ' + varDeclarations.substring(2) + (appendFirst ? '' : ';\n'));
	    }

	    return this.source.merge();
	  },

	  // [blockValue]
	  //
	  // On stack, before: hash, inverse, program, value
	  // On stack, after: return value of blockHelperMissing
	  //
	  // The purpose of this opcode is to take a block of the form
	  // `{{#this.foo}}...{{/this.foo}}`, resolve the value of `foo`, and
	  // replace it on the stack with the result of properly
	  // invoking blockHelperMissing.
	  blockValue: function blockValue(name) {
	    var blockHelperMissing = this.aliasable('helpers.blockHelperMissing'),
	        params = [this.contextName(0)];
	    this.setupHelperArgs(name, 0, params);

	    var blockName = this.popStack();
	    params.splice(1, 0, blockName);

	    this.push(this.source.functionCall(blockHelperMissing, 'call', params));
	  },

	  // [ambiguousBlockValue]
	  //
	  // On stack, before: hash, inverse, program, value
	  // Compiler value, before: lastHelper=value of last found helper, if any
	  // On stack, after, if no lastHelper: same as [blockValue]
	  // On stack, after, if lastHelper: value
	  ambiguousBlockValue: function ambiguousBlockValue() {
	    // We're being a bit cheeky and reusing the options value from the prior exec
	    var blockHelperMissing = this.aliasable('helpers.blockHelperMissing'),
	        params = [this.contextName(0)];
	    this.setupHelperArgs('', 0, params, true);

	    this.flushInline();

	    var current = this.topStack();
	    params.splice(1, 0, current);

	    this.pushSource(['if (!', this.lastHelper, ') { ', current, ' = ', this.source.functionCall(blockHelperMissing, 'call', params), '}']);
	  },

	  // [appendContent]
	  //
	  // On stack, before: ...
	  // On stack, after: ...
	  //
	  // Appends the string value of `content` to the current buffer
	  appendContent: function appendContent(content) {
	    if (this.pendingContent) {
	      content = this.pendingContent + content;
	    } else {
	      this.pendingLocation = this.source.currentLocation;
	    }

	    this.pendingContent = content;
	  },

	  // [append]
	  //
	  // On stack, before: value, ...
	  // On stack, after: ...
	  //
	  // Coerces `value` to a String and appends it to the current buffer.
	  //
	  // If `value` is truthy, or 0, it is coerced into a string and appended
	  // Otherwise, the empty string is appended
	  append: function append() {
	    if (this.isInline()) {
	      this.replaceStack(function (current) {
	        return [' != null ? ', current, ' : ""'];
	      });

	      this.pushSource(this.appendToBuffer(this.popStack()));
	    } else {
	      var local = this.popStack();
	      this.pushSource(['if (', local, ' != null) { ', this.appendToBuffer(local, undefined, true), ' }']);
	      if (this.environment.isSimple) {
	        this.pushSource(['else { ', this.appendToBuffer("''", undefined, true), ' }']);
	      }
	    }
	  },

	  // [appendEscaped]
	  //
	  // On stack, before: value, ...
	  // On stack, after: ...
	  //
	  // Escape `value` and append it to the buffer
	  appendEscaped: function appendEscaped() {
	    this.pushSource(this.appendToBuffer([this.aliasable('container.escapeExpression'), '(', this.popStack(), ')']));
	  },

	  // [getContext]
	  //
	  // On stack, before: ...
	  // On stack, after: ...
	  // Compiler value, after: lastContext=depth
	  //
	  // Set the value of the `lastContext` compiler value to the depth
	  getContext: function getContext(depth) {
	    this.lastContext = depth;
	  },

	  // [pushContext]
	  //
	  // On stack, before: ...
	  // On stack, after: currentContext, ...
	  //
	  // Pushes the value of the current context onto the stack.
	  pushContext: function pushContext() {
	    this.pushStackLiteral(this.contextName(this.lastContext));
	  },

	  // [lookupOnContext]
	  //
	  // On stack, before: ...
	  // On stack, after: currentContext[name], ...
	  //
	  // Looks up the value of `name` on the current context and pushes
	  // it onto the stack.
	  lookupOnContext: function lookupOnContext(parts, falsy, strict, scoped) {
	    var i = 0;

	    if (!scoped && this.options.compat && !this.lastContext) {
	      // The depthed query is expected to handle the undefined logic for the root level that
	      // is implemented below, so we evaluate that directly in compat mode
	      this.push(this.depthedLookup(parts[i++]));
	    } else {
	      this.pushContext();
	    }

	    this.resolvePath('context', parts, i, falsy, strict);
	  },

	  // [lookupBlockParam]
	  //
	  // On stack, before: ...
	  // On stack, after: blockParam[name], ...
	  //
	  // Looks up the value of `parts` on the given block param and pushes
	  // it onto the stack.
	  lookupBlockParam: function lookupBlockParam(blockParamId, parts) {
	    this.useBlockParams = true;

	    this.push(['blockParams[', blockParamId[0], '][', blockParamId[1], ']']);
	    this.resolvePath('context', parts, 1);
	  },

	  // [lookupData]
	  //
	  // On stack, before: ...
	  // On stack, after: data, ...
	  //
	  // Push the data lookup operator
	  lookupData: function lookupData(depth, parts, strict) {
	    if (!depth) {
	      this.pushStackLiteral('data');
	    } else {
	      this.pushStackLiteral('container.data(data, ' + depth + ')');
	    }

	    this.resolvePath('data', parts, 0, true, strict);
	  },

	  resolvePath: function resolvePath(type, parts, i, falsy, strict) {
	    // istanbul ignore next

	    var _this = this;

	    if (this.options.strict || this.options.assumeObjects) {
	      this.push(strictLookup(this.options.strict && strict, this, parts, type));
	      return;
	    }

	    var len = parts.length;
	    for (; i < len; i++) {
	      /* eslint-disable no-loop-func */
	      this.replaceStack(function (current) {
	        var lookup = _this.nameLookup(current, parts[i], type);
	        // We want to ensure that zero and false are handled properly if the context (falsy flag)
	        // needs to have the special handling for these values.
	        if (!falsy) {
	          return [' != null ? ', lookup, ' : ', current];
	        } else {
	          // Otherwise we can use generic falsy handling
	          return [' && ', lookup];
	        }
	      });
	      /* eslint-enable no-loop-func */
	    }
	  },

	  // [resolvePossibleLambda]
	  //
	  // On stack, before: value, ...
	  // On stack, after: resolved value, ...
	  //
	  // If the `value` is a lambda, replace it on the stack by
	  // the return value of the lambda
	  resolvePossibleLambda: function resolvePossibleLambda() {
	    this.push([this.aliasable('container.lambda'), '(', this.popStack(), ', ', this.contextName(0), ')']);
	  },

	  // [pushStringParam]
	  //
	  // On stack, before: ...
	  // On stack, after: string, currentContext, ...
	  //
	  // This opcode is designed for use in string mode, which
	  // provides the string value of a parameter along with its
	  // depth rather than resolving it immediately.
	  pushStringParam: function pushStringParam(string, type) {
	    this.pushContext();
	    this.pushString(type);

	    // If it's a subexpression, the string result
	    // will be pushed after this opcode.
	    if (type !== 'SubExpression') {
	      if (typeof string === 'string') {
	        this.pushString(string);
	      } else {
	        this.pushStackLiteral(string);
	      }
	    }
	  },

	  emptyHash: function emptyHash(omitEmpty) {
	    if (this.trackIds) {
	      this.push('{}'); // hashIds
	    }
	    if (this.stringParams) {
	      this.push('{}'); // hashContexts
	      this.push('{}'); // hashTypes
	    }
	    this.pushStackLiteral(omitEmpty ? 'undefined' : '{}');
	  },
	  pushHash: function pushHash() {
	    if (this.hash) {
	      this.hashes.push(this.hash);
	    }
	    this.hash = { values: [], types: [], contexts: [], ids: [] };
	  },
	  popHash: function popHash() {
	    var hash = this.hash;
	    this.hash = this.hashes.pop();

	    if (this.trackIds) {
	      this.push(this.objectLiteral(hash.ids));
	    }
	    if (this.stringParams) {
	      this.push(this.objectLiteral(hash.contexts));
	      this.push(this.objectLiteral(hash.types));
	    }

	    this.push(this.objectLiteral(hash.values));
	  },

	  // [pushString]
	  //
	  // On stack, before: ...
	  // On stack, after: quotedString(string), ...
	  //
	  // Push a quoted version of `string` onto the stack
	  pushString: function pushString(string) {
	    this.pushStackLiteral(this.quotedString(string));
	  },

	  // [pushLiteral]
	  //
	  // On stack, before: ...
	  // On stack, after: value, ...
	  //
	  // Pushes a value onto the stack. This operation prevents
	  // the compiler from creating a temporary variable to hold
	  // it.
	  pushLiteral: function pushLiteral(value) {
	    this.pushStackLiteral(value);
	  },

	  // [pushProgram]
	  //
	  // On stack, before: ...
	  // On stack, after: program(guid), ...
	  //
	  // Push a program expression onto the stack. This takes
	  // a compile-time guid and converts it into a runtime-accessible
	  // expression.
	  pushProgram: function pushProgram(guid) {
	    if (guid != null) {
	      this.pushStackLiteral(this.programExpression(guid));
	    } else {
	      this.pushStackLiteral(null);
	    }
	  },

	  // [registerDecorator]
	  //
	  // On stack, before: hash, program, params..., ...
	  // On stack, after: ...
	  //
	  // Pops off the decorator's parameters, invokes the decorator,
	  // and inserts the decorator into the decorators list.
	  registerDecorator: function registerDecorator(paramSize, name) {
	    var foundDecorator = this.nameLookup('decorators', name, 'decorator'),
	        options = this.setupHelperArgs(name, paramSize);

	    this.decorators.push(['fn = ', this.decorators.functionCall(foundDecorator, '', ['fn', 'props', 'container', options]), ' || fn;']);
	  },

	  // [invokeHelper]
	  //
	  // On stack, before: hash, inverse, program, params..., ...
	  // On stack, after: result of helper invocation
	  //
	  // Pops off the helper's parameters, invokes the helper,
	  // and pushes the helper's return value onto the stack.
	  //
	  // If the helper is not found, `helperMissing` is called.
	  invokeHelper: function invokeHelper(paramSize, name, isSimple) {
	    var nonHelper = this.popStack(),
	        helper = this.setupHelper(paramSize, name),
	        simple = isSimple ? [helper.name, ' || '] : '';

	    var lookup = ['('].concat(simple, nonHelper);
	    if (!this.options.strict) {
	      lookup.push(' || ', this.aliasable('helpers.helperMissing'));
	    }
	    lookup.push(')');

	    this.push(this.source.functionCall(lookup, 'call', helper.callParams));
	  },

	  // [invokeKnownHelper]
	  //
	  // On stack, before: hash, inverse, program, params..., ...
	  // On stack, after: result of helper invocation
	  //
	  // This operation is used when the helper is known to exist,
	  // so a `helperMissing` fallback is not required.
	  invokeKnownHelper: function invokeKnownHelper(paramSize, name) {
	    var helper = this.setupHelper(paramSize, name);
	    this.push(this.source.functionCall(helper.name, 'call', helper.callParams));
	  },

	  // [invokeAmbiguous]
	  //
	  // On stack, before: hash, inverse, program, params..., ...
	  // On stack, after: result of disambiguation
	  //
	  // This operation is used when an expression like `{{foo}}`
	  // is provided, but we don't know at compile-time whether it
	  // is a helper or a path.
	  //
	  // This operation emits more code than the other options,
	  // and can be avoided by passing the `knownHelpers` and
	  // `knownHelpersOnly` flags at compile-time.
	  invokeAmbiguous: function invokeAmbiguous(name, helperCall) {
	    this.useRegister('helper');

	    var nonHelper = this.popStack();

	    this.emptyHash();
	    var helper = this.setupHelper(0, name, helperCall);

	    var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');

	    var lookup = ['(', '(helper = ', helperName, ' || ', nonHelper, ')'];
	    if (!this.options.strict) {
	      lookup[0] = '(helper = ';
	      lookup.push(' != null ? helper : ', this.aliasable('helpers.helperMissing'));
	    }

	    this.push(['(', lookup, helper.paramsInit ? ['),(', helper.paramsInit] : [], '),', '(typeof helper === ', this.aliasable('"function"'), ' ? ', this.source.functionCall('helper', 'call', helper.callParams), ' : helper))']);
	  },

	  // [invokePartial]
	  //
	  // On stack, before: context, ...
	  // On stack after: result of partial invocation
	  //
	  // This operation pops off a context, invokes a partial with that context,
	  // and pushes the result of the invocation back.
	  invokePartial: function invokePartial(isDynamic, name, indent) {
	    var params = [],
	        options = this.setupParams(name, 1, params);

	    if (isDynamic) {
	      name = this.popStack();
	      delete options.name;
	    }

	    if (indent) {
	      options.indent = JSON.stringify(indent);
	    }
	    options.helpers = 'helpers';
	    options.partials = 'partials';
	    options.decorators = 'container.decorators';

	    if (!isDynamic) {
	      params.unshift(this.nameLookup('partials', name, 'partial'));
	    } else {
	      params.unshift(name);
	    }

	    if (this.options.compat) {
	      options.depths = 'depths';
	    }
	    options = this.objectLiteral(options);
	    params.push(options);

	    this.push(this.source.functionCall('container.invokePartial', '', params));
	  },

	  // [assignToHash]
	  //
	  // On stack, before: value, ..., hash, ...
	  // On stack, after: ..., hash, ...
	  //
	  // Pops a value off the stack and assigns it to the current hash
	  assignToHash: function assignToHash(key) {
	    var value = this.popStack(),
	        context = undefined,
	        type = undefined,
	        id = undefined;

	    if (this.trackIds) {
	      id = this.popStack();
	    }
	    if (this.stringParams) {
	      type = this.popStack();
	      context = this.popStack();
	    }

	    var hash = this.hash;
	    if (context) {
	      hash.contexts[key] = context;
	    }
	    if (type) {
	      hash.types[key] = type;
	    }
	    if (id) {
	      hash.ids[key] = id;
	    }
	    hash.values[key] = value;
	  },

	  pushId: function pushId(type, name, child) {
	    if (type === 'BlockParam') {
	      this.pushStackLiteral('blockParams[' + name[0] + '].path[' + name[1] + ']' + (child ? ' + ' + JSON.stringify('.' + child) : ''));
	    } else if (type === 'PathExpression') {
	      this.pushString(name);
	    } else if (type === 'SubExpression') {
	      this.pushStackLiteral('true');
	    } else {
	      this.pushStackLiteral('null');
	    }
	  },

	  // HELPERS

	  compiler: JavaScriptCompiler,

	  compileChildren: function compileChildren(environment, options) {
	    var children = environment.children,
	        child = undefined,
	        compiler = undefined;

	    for (var i = 0, l = children.length; i < l; i++) {
	      child = children[i];
	      compiler = new this.compiler(); // eslint-disable-line new-cap

	      var index = this.matchExistingProgram(child);

	      if (index == null) {
	        this.context.programs.push(''); // Placeholder to prevent name conflicts for nested children
	        index = this.context.programs.length;
	        child.index = index;
	        child.name = 'program' + index;
	        this.context.programs[index] = compiler.compile(child, options, this.context, !this.precompile);
	        this.context.decorators[index] = compiler.decorators;
	        this.context.environments[index] = child;

	        this.useDepths = this.useDepths || compiler.useDepths;
	        this.useBlockParams = this.useBlockParams || compiler.useBlockParams;
	      } else {
	        child.index = index;
	        child.name = 'program' + index;

	        this.useDepths = this.useDepths || child.useDepths;
	        this.useBlockParams = this.useBlockParams || child.useBlockParams;
	      }
	    }
	  },
	  matchExistingProgram: function matchExistingProgram(child) {
	    for (var i = 0, len = this.context.environments.length; i < len; i++) {
	      var environment = this.context.environments[i];
	      if (environment && environment.equals(child)) {
	        return i;
	      }
	    }
	  },

	  programExpression: function programExpression(guid) {
	    var child = this.environment.children[guid],
	        programParams = [child.index, 'data', child.blockParams];

	    if (this.useBlockParams || this.useDepths) {
	      programParams.push('blockParams');
	    }
	    if (this.useDepths) {
	      programParams.push('depths');
	    }

	    return 'container.program(' + programParams.join(', ') + ')';
	  },

	  useRegister: function useRegister(name) {
	    if (!this.registers[name]) {
	      this.registers[name] = true;
	      this.registers.list.push(name);
	    }
	  },

	  push: function push(expr) {
	    if (!(expr instanceof Literal)) {
	      expr = this.source.wrap(expr);
	    }

	    this.inlineStack.push(expr);
	    return expr;
	  },

	  pushStackLiteral: function pushStackLiteral(item) {
	    this.push(new Literal(item));
	  },

	  pushSource: function pushSource(source) {
	    if (this.pendingContent) {
	      this.source.push(this.appendToBuffer(this.source.quotedString(this.pendingContent), this.pendingLocation));
	      this.pendingContent = undefined;
	    }

	    if (source) {
	      this.source.push(source);
	    }
	  },

	  replaceStack: function replaceStack(callback) {
	    var prefix = ['('],
	        stack = undefined,
	        createdStack = undefined,
	        usedLiteral = undefined;

	    /* istanbul ignore next */
	    if (!this.isInline()) {
	      throw new _exception2['default']('replaceStack on non-inline');
	    }

	    // We want to merge the inline statement into the replacement statement via ','
	    var top = this.popStack(true);

	    if (top instanceof Literal) {
	      // Literals do not need to be inlined
	      stack = [top.value];
	      prefix = ['(', stack];
	      usedLiteral = true;
	    } else {
	      // Get or create the current stack name for use by the inline
	      createdStack = true;
	      var _name = this.incrStack();

	      prefix = ['((', this.push(_name), ' = ', top, ')'];
	      stack = this.topStack();
	    }

	    var item = callback.call(this, stack);

	    if (!usedLiteral) {
	      this.popStack();
	    }
	    if (createdStack) {
	      this.stackSlot--;
	    }
	    this.push(prefix.concat(item, ')'));
	  },

	  incrStack: function incrStack() {
	    this.stackSlot++;
	    if (this.stackSlot > this.stackVars.length) {
	      this.stackVars.push('stack' + this.stackSlot);
	    }
	    return this.topStackName();
	  },
	  topStackName: function topStackName() {
	    return 'stack' + this.stackSlot;
	  },
	  flushInline: function flushInline() {
	    var inlineStack = this.inlineStack;
	    this.inlineStack = [];
	    for (var i = 0, len = inlineStack.length; i < len; i++) {
	      var entry = inlineStack[i];
	      /* istanbul ignore if */
	      if (entry instanceof Literal) {
	        this.compileStack.push(entry);
	      } else {
	        var stack = this.incrStack();
	        this.pushSource([stack, ' = ', entry, ';']);
	        this.compileStack.push(stack);
	      }
	    }
	  },
	  isInline: function isInline() {
	    return this.inlineStack.length;
	  },

	  popStack: function popStack(wrapped) {
	    var inline = this.isInline(),
	        item = (inline ? this.inlineStack : this.compileStack).pop();

	    if (!wrapped && item instanceof Literal) {
	      return item.value;
	    } else {
	      if (!inline) {
	        /* istanbul ignore next */
	        if (!this.stackSlot) {
	          throw new _exception2['default']('Invalid stack pop');
	        }
	        this.stackSlot--;
	      }
	      return item;
	    }
	  },

	  topStack: function topStack() {
	    var stack = this.isInline() ? this.inlineStack : this.compileStack,
	        item = stack[stack.length - 1];

	    /* istanbul ignore if */
	    if (item instanceof Literal) {
	      return item.value;
	    } else {
	      return item;
	    }
	  },

	  contextName: function contextName(context) {
	    if (this.useDepths && context) {
	      return 'depths[' + context + ']';
	    } else {
	      return 'depth' + context;
	    }
	  },

	  quotedString: function quotedString(str) {
	    return this.source.quotedString(str);
	  },

	  objectLiteral: function objectLiteral(obj) {
	    return this.source.objectLiteral(obj);
	  },

	  aliasable: function aliasable(name) {
	    var ret = this.aliases[name];
	    if (ret) {
	      ret.referenceCount++;
	      return ret;
	    }

	    ret = this.aliases[name] = this.source.wrap(name);
	    ret.aliasable = true;
	    ret.referenceCount = 1;

	    return ret;
	  },

	  setupHelper: function setupHelper(paramSize, name, blockHelper) {
	    var params = [],
	        paramsInit = this.setupHelperArgs(name, paramSize, params, blockHelper);
	    var foundHelper = this.nameLookup('helpers', name, 'helper'),
	        callContext = this.aliasable(this.contextName(0) + ' != null ? ' + this.contextName(0) + ' : {}');

	    return {
	      params: params,
	      paramsInit: paramsInit,
	      name: foundHelper,
	      callParams: [callContext].concat(params)
	    };
	  },

	  setupParams: function setupParams(helper, paramSize, params) {
	    var options = {},
	        contexts = [],
	        types = [],
	        ids = [],
	        objectArgs = !params,
	        param = undefined;

	    if (objectArgs) {
	      params = [];
	    }

	    options.name = this.quotedString(helper);
	    options.hash = this.popStack();

	    if (this.trackIds) {
	      options.hashIds = this.popStack();
	    }
	    if (this.stringParams) {
	      options.hashTypes = this.popStack();
	      options.hashContexts = this.popStack();
	    }

	    var inverse = this.popStack(),
	        program = this.popStack();

	    // Avoid setting fn and inverse if neither are set. This allows
	    // helpers to do a check for `if (options.fn)`
	    if (program || inverse) {
	      options.fn = program || 'container.noop';
	      options.inverse = inverse || 'container.noop';
	    }

	    // The parameters go on to the stack in order (making sure that they are evaluated in order)
	    // so we need to pop them off the stack in reverse order
	    var i = paramSize;
	    while (i--) {
	      param = this.popStack();
	      params[i] = param;

	      if (this.trackIds) {
	        ids[i] = this.popStack();
	      }
	      if (this.stringParams) {
	        types[i] = this.popStack();
	        contexts[i] = this.popStack();
	      }
	    }

	    if (objectArgs) {
	      options.args = this.source.generateArray(params);
	    }

	    if (this.trackIds) {
	      options.ids = this.source.generateArray(ids);
	    }
	    if (this.stringParams) {
	      options.types = this.source.generateArray(types);
	      options.contexts = this.source.generateArray(contexts);
	    }

	    if (this.options.data) {
	      options.data = 'data';
	    }
	    if (this.useBlockParams) {
	      options.blockParams = 'blockParams';
	    }
	    return options;
	  },

	  setupHelperArgs: function setupHelperArgs(helper, paramSize, params, useRegister) {
	    var options = this.setupParams(helper, paramSize, params);
	    options = this.objectLiteral(options);
	    if (useRegister) {
	      this.useRegister('options');
	      params.push('options');
	      return ['options=', options];
	    } else if (params) {
	      params.push(options);
	      return '';
	    } else {
	      return options;
	    }
	  }
	};

	(function () {
	  var reservedWords = ('break else new var' + ' case finally return void' + ' catch for switch while' + ' continue function this with' + ' default if throw' + ' delete in try' + ' do instanceof typeof' + ' abstract enum int short' + ' boolean export interface static' + ' byte extends long super' + ' char final native synchronized' + ' class float package throws' + ' const goto private transient' + ' debugger implements protected volatile' + ' double import public let yield await' + ' null true false').split(' ');

	  var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

	  for (var i = 0, l = reservedWords.length; i < l; i++) {
	    compilerWords[reservedWords[i]] = true;
	  }
	})();

	JavaScriptCompiler.isValidJavaScriptVariableName = function (name) {
	  return !JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);
	};

	function strictLookup(requireTerminal, compiler, parts, type) {
	  var stack = compiler.popStack(),
	      i = 0,
	      len = parts.length;
	  if (requireTerminal) {
	    len--;
	  }

	  for (; i < len; i++) {
	    stack = compiler.nameLookup(stack, parts[i], type);
	  }

	  if (requireTerminal) {
	    return [compiler.aliasable('container.strict'), '(', stack, ', ', compiler.quotedString(parts[i]), ')'];
	  } else {
	    return stack;
	  }
	}

	exports['default'] = JavaScriptCompiler;
	module.exports = exports['default'];

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/* global define */
	'use strict';

	exports.__esModule = true;

	var _utils = __webpack_require__(5);

	var SourceNode = undefined;

	try {
	  /* istanbul ignore next */
	  if (false) {
	    // We don't support this in AMD environments. For these environments, we asusme that
	    // they are running on the browser and thus have no need for the source-map library.
	    var SourceMap = require('source-map');
	    SourceNode = SourceMap.SourceNode;
	  }
	} catch (err) {}
	/* NOP */

	/* istanbul ignore if: tested but not covered in istanbul due to dist build  */
	if (!SourceNode) {
	  SourceNode = function (line, column, srcFile, chunks) {
	    this.src = '';
	    if (chunks) {
	      this.add(chunks);
	    }
	  };
	  /* istanbul ignore next */
	  SourceNode.prototype = {
	    add: function add(chunks) {
	      if (_utils.isArray(chunks)) {
	        chunks = chunks.join('');
	      }
	      this.src += chunks;
	    },
	    prepend: function prepend(chunks) {
	      if (_utils.isArray(chunks)) {
	        chunks = chunks.join('');
	      }
	      this.src = chunks + this.src;
	    },
	    toStringWithSourceMap: function toStringWithSourceMap() {
	      return { code: this.toString() };
	    },
	    toString: function toString() {
	      return this.src;
	    }
	  };
	}

	function castChunk(chunk, codeGen, loc) {
	  if (_utils.isArray(chunk)) {
	    var ret = [];

	    for (var i = 0, len = chunk.length; i < len; i++) {
	      ret.push(codeGen.wrap(chunk[i], loc));
	    }
	    return ret;
	  } else if (typeof chunk === 'boolean' || typeof chunk === 'number') {
	    // Handle primitives that the SourceNode will throw up on
	    return chunk + '';
	  }
	  return chunk;
	}

	function CodeGen(srcFile) {
	  this.srcFile = srcFile;
	  this.source = [];
	}

	CodeGen.prototype = {
	  isEmpty: function isEmpty() {
	    return !this.source.length;
	  },
	  prepend: function prepend(source, loc) {
	    this.source.unshift(this.wrap(source, loc));
	  },
	  push: function push(source, loc) {
	    this.source.push(this.wrap(source, loc));
	  },

	  merge: function merge() {
	    var source = this.empty();
	    this.each(function (line) {
	      source.add(['  ', line, '\n']);
	    });
	    return source;
	  },

	  each: function each(iter) {
	    for (var i = 0, len = this.source.length; i < len; i++) {
	      iter(this.source[i]);
	    }
	  },

	  empty: function empty() {
	    var loc = this.currentLocation || { start: {} };
	    return new SourceNode(loc.start.line, loc.start.column, this.srcFile);
	  },
	  wrap: function wrap(chunk) {
	    var loc = arguments.length <= 1 || arguments[1] === undefined ? this.currentLocation || { start: {} } : arguments[1];

	    if (chunk instanceof SourceNode) {
	      return chunk;
	    }

	    chunk = castChunk(chunk, this, loc);

	    return new SourceNode(loc.start.line, loc.start.column, this.srcFile, chunk);
	  },

	  functionCall: function functionCall(fn, type, params) {
	    params = this.generateList(params);
	    return this.wrap([fn, type ? '.' + type + '(' : '(', params, ')']);
	  },

	  quotedString: function quotedString(str) {
	    return '"' + (str + '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\u2028/g, '\\u2028') // Per Ecma-262 7.3 + 7.8.4
	    .replace(/\u2029/g, '\\u2029') + '"';
	  },

	  objectLiteral: function objectLiteral(obj) {
	    var pairs = [];

	    for (var key in obj) {
	      if (obj.hasOwnProperty(key)) {
	        var value = castChunk(obj[key], this);
	        if (value !== 'undefined') {
	          pairs.push([this.quotedString(key), ':', value]);
	        }
	      }
	    }

	    var ret = this.generateList(pairs);
	    ret.prepend('{');
	    ret.add('}');
	    return ret;
	  },

	  generateList: function generateList(entries) {
	    var ret = this.empty();

	    for (var i = 0, len = entries.length; i < len; i++) {
	      if (i) {
	        ret.add(',');
	      }

	      ret.add(castChunk(entries[i], this));
	    }

	    return ret;
	  },

	  generateArray: function generateArray(entries) {
	    var ret = this.generateList(entries);
	    ret.prepend('[');
	    ret.add(']');

	    return ret;
	  }
	};

	exports['default'] = CodeGen;
	module.exports = exports['default'];

/***/ }
/******/ ])
});
;
/*!
 *  howler.js v1.1.29
 *  howlerjs.com
 *
 *  (c) 2013-2016, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

(function() {
  // setup
  var cache = {};

  // setup the audio context
  var ctx = null,
    usingWebAudio = true,
    noAudio = false;
  try {
    if (typeof AudioContext !== 'undefined') {
      ctx = new AudioContext();
    } else if (typeof webkitAudioContext !== 'undefined') {
      ctx = new webkitAudioContext();
    } else {
      usingWebAudio = false;
    }
  } catch(e) {
    usingWebAudio = false;
  }

  if (!usingWebAudio) {
    if (typeof Audio !== 'undefined') {
      try {
        new Audio();
      } catch(e) {
        noAudio = true;
      }
    } else {
      noAudio = true;
    }
  }

  // create a master gain node
  if (usingWebAudio) {
    var masterGain = (typeof ctx.createGain === 'undefined') ? ctx.createGainNode() : ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
  }

  // create global controller
  var HowlerGlobal = function(codecs) {
    this._volume = 1;
    this._muted = false;
    this.usingWebAudio = usingWebAudio;
    this.ctx = ctx;
    this.noAudio = noAudio;
    this._howls = [];
    this._codecs = codecs;
    this.iOSAutoEnable = true;
  };
  HowlerGlobal.prototype = {
    /**
     * Get/set the global volume for all sounds.
     * @param  {Float} vol Volume from 0.0 to 1.0.
     * @return {Howler/Float}     Returns self or current volume.
     */
    volume: function(vol) {
      var self = this;

      // make sure volume is a number
      vol = parseFloat(vol);

      if (vol >= 0 && vol <= 1) {
        self._volume = vol;

        if (usingWebAudio) {
          masterGain.gain.value = vol;
        }

        // loop through cache and change volume of all nodes that are using HTML5 Audio
        for (var key in self._howls) {
          if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === false) {
            // loop through the audio nodes
            for (var i=0; i<self._howls[key]._audioNode.length; i++) {
              self._howls[key]._audioNode[i].volume = self._howls[key]._volume * self._volume;
            }
          }
        }

        return self;
      }

      // return the current global volume
      return (usingWebAudio) ? masterGain.gain.value : self._volume;
    },

    /**
     * Mute all sounds.
     * @return {Howler}
     */
    mute: function() {
      this._setMuted(true);

      return this;
    },

    /**
     * Unmute all sounds.
     * @return {Howler}
     */
    unmute: function() {
      this._setMuted(false);

      return this;
    },

    /**
     * Handle muting and unmuting globally.
     * @param  {Boolean} muted Is muted or not.
     */
    _setMuted: function(muted) {
      var self = this;

      self._muted = muted;

      if (usingWebAudio) {
        masterGain.gain.value = muted ? 0 : self._volume;
      }

      for (var key in self._howls) {
        if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === false) {
          // loop through the audio nodes
          for (var i=0; i<self._howls[key]._audioNode.length; i++) {
            self._howls[key]._audioNode[i].muted = muted;
          }
        }
      }
    },

    /**
     * Check for codec support.
     * @param  {String} ext Audio file extension.
     * @return {Boolean}
     */
    codecs: function(ext) {
      return this._codecs[ext];
    },

    /**
     * iOS will only allow audio to be played after a user interaction.
     * Attempt to automatically unlock audio on the first user interaction.
     * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
     * @return {Howler}
     */
    _enableiOSAudio: function() {
      var self = this;

      // only run this on iOS if audio isn't already eanbled
      if (ctx && (self._iOSEnabled || !/iPhone|iPad|iPod/i.test(navigator.userAgent))) {
        return;
      }

      self._iOSEnabled = false;

      // call this method on touch start to create and play a buffer,
      // then check if the audio actually played to determine if
      // audio has now been unlocked on iOS
      var unlock = function() {
        // create an empty buffer
        var buffer = ctx.createBuffer(1, 1, 22050);
        var source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);

        // play the empty buffer
        if (typeof source.start === 'undefined') {
          source.noteOn(0);
        } else {
          source.start(0);
        }

        // setup a timeout to check that we are unlocked on the next event loop
        setTimeout(function() {
          if ((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
            // update the unlocked state and prevent this check from happening again
            self._iOSEnabled = true;
            self.iOSAutoEnable = false;

            // remove the touch start listener
            window.removeEventListener('touchend', unlock, false);
          }
        }, 0);
      };

      // setup a touch start listener to attempt an unlock in
      window.addEventListener('touchend', unlock, false);

      return self;
    }
  };

  // check for browser codec support
  var audioTest = null;
  var codecs = {};
  if (!noAudio) {
    audioTest = new Audio();
    codecs = {
      mp3: !!audioTest.canPlayType('audio/mpeg;').replace(/^no$/, ''),
      opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
      ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
      wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''),
      aac: !!audioTest.canPlayType('audio/aac;').replace(/^no$/, ''),
      m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
      mp4: !!(audioTest.canPlayType('audio/x-mp4;') || audioTest.canPlayType('audio/mp4;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
      weba: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')
    };
  }

  // allow access to the global audio controls
  var Howler = new HowlerGlobal(codecs);

  // setup the audio object
  var Howl = function(o) {
    var self = this;

    // setup the defaults
    self._autoplay = o.autoplay || false;
    self._buffer = o.buffer || false;
    self._duration = o.duration || 0;
    self._format = o.format || null;
    self._loop = o.loop || false;
    self._loaded = false;
    self._sprite = o.sprite || {};
    self._src = o.src || '';
    self._pos3d = o.pos3d || [0, 0, -0.5];
    self._volume = o.volume !== undefined ? o.volume : 1;
    self._urls = o.urls || [];
    self._rate = o.rate || 1;

    // allow forcing of a specific panningModel ('equalpower' or 'HRTF'),
    // if none is specified, defaults to 'equalpower' and switches to 'HRTF'
    // if 3d sound is used
    self._model = o.model || null;

    // setup event functions
    self._onload = [o.onload || function() {}];
    self._onloaderror = [o.onloaderror || function() {}];
    self._onend = [o.onend || function() {}];
    self._onpause = [o.onpause || function() {}];
    self._onplay = [o.onplay || function() {}];

    self._onendTimer = [];

    // Web Audio or HTML5 Audio?
    self._webAudio = usingWebAudio && !self._buffer;

    // check if we need to fall back to HTML5 Audio
    self._audioNode = [];
    if (self._webAudio) {
      self._setupAudioNode();
    }

    // automatically try to enable audio on iOS
    if (typeof ctx !== 'undefined' && ctx && Howler.iOSAutoEnable) {
      Howler._enableiOSAudio();
    }

    // add this to an array of Howl's to allow global control
    Howler._howls.push(self);

    // load the track
    self.load();
  };

  // setup all of the methods
  Howl.prototype = {
    /**
     * Load an audio file.
     * @return {Howl}
     */
    load: function() {
      var self = this,
        url = null;

      // if no audio is available, quit immediately
      if (noAudio) {
        self.on('loaderror', new Error('No audio support.'));
        return;
      }

      // loop through source URLs and pick the first one that is compatible
      for (var i=0; i<self._urls.length; i++) {
        var ext, urlItem;

        if (self._format) {
          // use specified audio format if available
          ext = self._format;
        } else {
          // figure out the filetype (whether an extension or base64 data)
          urlItem = self._urls[i];
          ext = /^data:audio\/([^;,]+);/i.exec(urlItem);
          if (!ext) {
            ext = /\.([^.]+)$/.exec(urlItem.split('?', 1)[0]);
          }

          if (ext) {
            ext = ext[1].toLowerCase();
          } else {
            self.on('loaderror', new Error('Could not extract format from passed URLs, please add format parameter.'));
            return;
          }
        }

        if (codecs[ext]) {
          url = self._urls[i];
          break;
        }
      }

      if (!url) {
        self.on('loaderror', new Error('No codec support for selected audio sources.'));
        return;
      }

      self._src = url;

      if (self._webAudio) {
        loadBuffer(self, url);
      } else {
        var newNode = new Audio();

        // listen for errors with HTML5 audio (http://dev.w3.org/html5/spec-author-view/spec.html#mediaerror)
        newNode.addEventListener('error', function () {
          if (newNode.error && newNode.error.code === 4) {
            HowlerGlobal.noAudio = true;
          }

          self.on('loaderror', {type: newNode.error ? newNode.error.code : 0});
        }, false);

        self._audioNode.push(newNode);

        // setup the new audio node
        newNode.src = url;
        newNode._pos = 0;
        newNode.preload = 'auto';
        newNode.volume = (Howler._muted) ? 0 : self._volume * Howler.volume();

        // setup the event listener to start playing the sound
        // as soon as it has buffered enough
        var listener = function() {
          // round up the duration when using HTML5 Audio to account for the lower precision
          self._duration = Math.ceil(newNode.duration * 10) / 10;

          // setup a sprite if none is defined
          if (Object.getOwnPropertyNames(self._sprite).length === 0) {
            self._sprite = {_default: [0, self._duration * 1000]};
          }

          if (!self._loaded) {
            self._loaded = true;
            self.on('load');
          }

          if (self._autoplay) {
            self.play();
          }

          // clear the event listener
          newNode.removeEventListener('canplaythrough', listener, false);
        };
        newNode.addEventListener('canplaythrough', listener, false);
        newNode.load();
      }

      return self;
    },

    /**
     * Get/set the URLs to be pulled from to play in this source.
     * @param  {Array} urls  Arry of URLs to load from
     * @return {Howl}        Returns self or the current URLs
     */
    urls: function(urls) {
      var self = this;

      if (urls) {
        self.stop();
        self._urls = (typeof urls === 'string') ? [urls] : urls;
        self._loaded = false;
        self.load();

        return self;
      } else {
        return self._urls;
      }
    },

    /**
     * Play a sound from the current time (0 by default).
     * @param  {String}   sprite   (optional) Plays from the specified position in the sound sprite definition.
     * @param  {Function} callback (optional) Returns the unique playback id for this sound instance.
     * @return {Howl}
     */
    play: function(sprite, callback) {
      var self = this;

      // if no sprite was passed but a callback was, update the variables
      if (typeof sprite === 'function') {
        callback = sprite;
      }

      // use the default sprite if none is passed
      if (!sprite || typeof sprite === 'function') {
        sprite = '_default';
      }

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('load', function() {
          self.play(sprite, callback);
        });

        return self;
      }

      // if the sprite doesn't exist, play nothing
      if (!self._sprite[sprite]) {
        if (typeof callback === 'function') callback();
        return self;
      }

      // get the node to playback
      self._inactiveNode(function(node) {
        // persist the sprite being played
        node._sprite = sprite;

        // determine where to start playing from
        var pos = (node._pos > 0) ? node._pos : self._sprite[sprite][0] / 1000;

        // determine how long to play for
        var duration = 0;
        if (self._webAudio) {
          duration = self._sprite[sprite][1] / 1000 - node._pos;
          if (node._pos > 0) {
            pos = self._sprite[sprite][0] / 1000 + pos;
          }
        } else {
          duration = self._sprite[sprite][1] / 1000 - (pos - self._sprite[sprite][0] / 1000);
        }

        // determine if this sound should be looped
        var loop = !!(self._loop || self._sprite[sprite][2]);

        // set timer to fire the 'onend' event
        var soundId = (typeof callback === 'string') ? callback : Math.round(Date.now() * Math.random()) + '',
          timerId;
        (function() {
          var data = {
            id: soundId,
            sprite: sprite,
            loop: loop
          };
          timerId = setTimeout(function() {
            // if looping, restart the track
            if (!self._webAudio && loop) {
              self.stop(data.id).play(sprite, data.id);
            }

            // set web audio node to paused at end
            if (self._webAudio && !loop) {
              self._nodeById(data.id).paused = true;
              self._nodeById(data.id)._pos = 0;

              // clear the end timer
              self._clearEndTimer(data.id);
            }

            // end the track if it is HTML audio and a sprite
            if (!self._webAudio && !loop) {
              self.stop(data.id);
            }

            // fire ended event
            self.on('end', soundId);
          }, (duration / self._rate) * 1000);

          // store the reference to the timer
          self._onendTimer.push({timer: timerId, id: data.id});
        })();

        if (self._webAudio) {
          var loopStart = self._sprite[sprite][0] / 1000,
            loopEnd = self._sprite[sprite][1] / 1000;

          // set the play id to this node and load into context
          node.id = soundId;
          node.paused = false;
          refreshBuffer(self, [loop, loopStart, loopEnd], soundId);
          self._playStart = ctx.currentTime;
          node.gain.value = self._volume;

          if (typeof node.bufferSource.start === 'undefined') {
            loop ? node.bufferSource.noteGrainOn(0, pos, 86400) : node.bufferSource.noteGrainOn(0, pos, duration);
          } else {
            loop ? node.bufferSource.start(0, pos, 86400) : node.bufferSource.start(0, pos, duration);
          }
        } else {
          if (node.readyState === 4 || !node.readyState && navigator.isCocoonJS) {
            node.readyState = 4;
            node.id = soundId;
            node.currentTime = pos;
            node.muted = Howler._muted || node.muted;
            node.volume = self._volume * Howler.volume();
            setTimeout(function() { node.play(); }, 0);
          } else {
            self._clearEndTimer(soundId);

            (function(){
              var sound = self,
                playSprite = sprite,
                fn = callback,
                newNode = node;
              var listener = function() {
                sound.play(playSprite, fn);

                // clear the event listener
                newNode.removeEventListener('canplaythrough', listener, false);
              };
              newNode.addEventListener('canplaythrough', listener, false);
            })();

            return self;
          }
        }

        // fire the play event and send the soundId back in the callback
        self.on('play');
        if (typeof callback === 'function') callback(soundId);

        return self;
      });

      return self;
    },

    /**
     * Pause playback and save the current position.
     * @param {String} id (optional) The play instance ID.
     * @return {Howl}
     */
    pause: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.pause(id);
        });

        return self;
      }

      // clear 'onend' timer
      self._clearEndTimer(id);

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        activeNode._pos = self.pos(null, id);

        if (self._webAudio) {
          // make sure the sound has been created
          if (!activeNode.bufferSource || activeNode.paused) {
            return self;
          }

          activeNode.paused = true;
          if (typeof activeNode.bufferSource.stop === 'undefined') {
            activeNode.bufferSource.noteOff(0);
          } else {
            activeNode.bufferSource.stop(0);
          }
        } else {
          activeNode.pause();
        }
      }

      self.on('pause');

      return self;
    },

    /**
     * Stop playback and reset to start.
     * @param  {String} id  (optional) The play instance ID.
     * @return {Howl}
     */
    stop: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.stop(id);
        });

        return self;
      }

      // clear 'onend' timer
      self._clearEndTimer(id);

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        activeNode._pos = 0;

        if (self._webAudio) {
          // make sure the sound has been created
          if (!activeNode.bufferSource || activeNode.paused) {
            return self;
          }

          activeNode.paused = true;

          if (typeof activeNode.bufferSource.stop === 'undefined') {
            activeNode.bufferSource.noteOff(0);
          } else {
            activeNode.bufferSource.stop(0);
          }
        } else if (!isNaN(activeNode.duration)) {
          activeNode.pause();
          activeNode.currentTime = 0;
        }
      }

      return self;
    },

    /**
     * Mute this sound.
     * @param  {String} id (optional) The play instance ID.
     * @return {Howl}
     */
    mute: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.mute(id);
        });

        return self;
      }

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        if (self._webAudio) {
          activeNode.gain.value = 0;
        } else {
          activeNode.muted = true;
        }
      }

      return self;
    },

    /**
     * Unmute this sound.
     * @param  {String} id (optional) The play instance ID.
     * @return {Howl}
     */
    unmute: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.unmute(id);
        });

        return self;
      }

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        if (self._webAudio) {
          activeNode.gain.value = self._volume;
        } else {
          activeNode.muted = false;
        }
      }

      return self;
    },

    /**
     * Get/set volume of this sound.
     * @param  {Float}  vol Volume from 0.0 to 1.0.
     * @param  {String} id  (optional) The play instance ID.
     * @return {Howl/Float}     Returns self or current volume.
     */
    volume: function(vol, id) {
      var self = this;

      // make sure volume is a number
      vol = parseFloat(vol);

      if (vol >= 0 && vol <= 1) {
        self._volume = vol;

        // if the sound hasn't been loaded, add it to the event queue
        if (!self._loaded) {
          self.on('play', function() {
            self.volume(vol, id);
          });

          return self;
        }

        var activeNode = (id) ? self._nodeById(id) : self._activeNode();
        if (activeNode) {
          if (self._webAudio) {
            activeNode.gain.value = vol;
          } else {
            activeNode.volume = vol * Howler.volume();
          }
        }

        return self;
      } else {
        return self._volume;
      }
    },

    /**
     * Get/set whether to loop the sound.
     * @param  {Boolean} loop To loop or not to loop, that is the question.
     * @return {Howl/Boolean}      Returns self or current looping value.
     */
    loop: function(loop) {
      var self = this;

      if (typeof loop === 'boolean') {
        self._loop = loop;

        return self;
      } else {
        return self._loop;
      }
    },

    /**
     * Get/set sound sprite definition.
     * @param  {Object} sprite Example: {spriteName: [offset, duration, loop]}
     *                @param {Integer} offset   Where to begin playback in milliseconds
     *                @param {Integer} duration How long to play in milliseconds
     *                @param {Boolean} loop     (optional) Set true to loop this sprite
     * @return {Howl}        Returns current sprite sheet or self.
     */
    sprite: function(sprite) {
      var self = this;

      if (typeof sprite === 'object') {
        self._sprite = sprite;

        return self;
      } else {
        return self._sprite;
      }
    },

    /**
     * Get/set the position of playback.
     * @param  {Float}  pos The position to move current playback to.
     * @param  {String} id  (optional) The play instance ID.
     * @return {Howl/Float}      Returns self or current playback position.
     */
    pos: function(pos, id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('load', function() {
          self.pos(pos);
        });

        return typeof pos === 'number' ? self : self._pos || 0;
      }

      // make sure we are dealing with a number for pos
      pos = parseFloat(pos);

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        if (pos >= 0) {
          self.pause(id);
          activeNode._pos = pos;
          self.play(activeNode._sprite, id);

          return self;
        } else {
          return self._webAudio ? activeNode._pos + (ctx.currentTime - self._playStart) : activeNode.currentTime;
        }
      } else if (pos >= 0) {
        return self;
      } else {
        // find the first inactive node to return the pos for
        for (var i=0; i<self._audioNode.length; i++) {
          if (self._audioNode[i].paused && self._audioNode[i].readyState === 4) {
            return (self._webAudio) ? self._audioNode[i]._pos : self._audioNode[i].currentTime;
          }
        }
      }
    },

    /**
     * Get/set the 3D position of the audio source.
     * The most common usage is to set the 'x' position
     * to affect the left/right ear panning. Setting any value higher than
     * 1.0 will begin to decrease the volume of the sound as it moves further away.
     * NOTE: This only works with Web Audio API, HTML5 Audio playback
     * will not be affected.
     * @param  {Float}  x  The x-position of the playback from -1000.0 to 1000.0
     * @param  {Float}  y  The y-position of the playback from -1000.0 to 1000.0
     * @param  {Float}  z  The z-position of the playback from -1000.0 to 1000.0
     * @param  {String} id (optional) The play instance ID.
     * @return {Howl/Array}   Returns self or the current 3D position: [x, y, z]
     */
    pos3d: function(x, y, z, id) {
      var self = this;

      // set a default for the optional 'y' & 'z'
      y = (typeof y === 'undefined' || !y) ? 0 : y;
      z = (typeof z === 'undefined' || !z) ? -0.5 : z;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.pos3d(x, y, z, id);
        });

        return self;
      }

      if (x >= 0 || x < 0) {
        if (self._webAudio) {
          var activeNode = (id) ? self._nodeById(id) : self._activeNode();
          if (activeNode) {
            self._pos3d = [x, y, z];
            activeNode.panner.setPosition(x, y, z);
            activeNode.panner.panningModel = self._model || 'HRTF';
          }
        }
      } else {
        return self._pos3d;
      }

      return self;
    },

    /**
     * Fade a currently playing sound between two volumes.
     * @param  {Number}   from     The volume to fade from (0.0 to 1.0).
     * @param  {Number}   to       The volume to fade to (0.0 to 1.0).
     * @param  {Number}   len      Time in milliseconds to fade.
     * @param  {Function} callback (optional) Fired when the fade is complete.
     * @param  {String}   id       (optional) The play instance ID.
     * @return {Howl}
     */
    fade: function(from, to, len, callback, id) {
      var self = this,
        diff = Math.abs(from - to),
        dir = from > to ? 'down' : 'up',
        steps = diff / 0.01,
        stepTime = len / steps;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('load', function() {
          self.fade(from, to, len, callback, id);
        });

        return self;
      }

      // set the volume to the start position
      self.volume(from, id);

      for (var i=1; i<=steps; i++) {
        (function() {
          var change = self._volume + (dir === 'up' ? 0.01 : -0.01) * i,
            vol = Math.round(1000 * change) / 1000,
            toVol = to;

          setTimeout(function() {
            self.volume(vol, id);

            if (vol === toVol) {
              if (callback) callback();
            }
          }, stepTime * i);
        })();
      }
    },

    /**
     * [DEPRECATED] Fade in the current sound.
     * @param  {Float}    to      Volume to fade to (0.0 to 1.0).
     * @param  {Number}   len     Time in milliseconds to fade.
     * @param  {Function} callback
     * @return {Howl}
     */
    fadeIn: function(to, len, callback) {
      return this.volume(0).play().fade(0, to, len, callback);
    },

    /**
     * [DEPRECATED] Fade out the current sound and pause when finished.
     * @param  {Float}    to       Volume to fade to (0.0 to 1.0).
     * @param  {Number}   len      Time in milliseconds to fade.
     * @param  {Function} callback
     * @param  {String}   id       (optional) The play instance ID.
     * @return {Howl}
     */
    fadeOut: function(to, len, callback, id) {
      var self = this;

      return self.fade(self._volume, to, len, function() {
        if (callback) callback();
        self.pause(id);

        // fire ended event
        self.on('end');
      }, id);
    },

    /**
     * Get an audio node by ID.
     * @return {Howl} Audio node.
     */
    _nodeById: function(id) {
      var self = this,
        node = self._audioNode[0];

      // find the node with this ID
      for (var i=0; i<self._audioNode.length; i++) {
        if (self._audioNode[i].id === id) {
          node = self._audioNode[i];
          break;
        }
      }

      return node;
    },

    /**
     * Get the first active audio node.
     * @return {Howl} Audio node.
     */
    _activeNode: function() {
      var self = this,
        node = null;

      // find the first playing node
      for (var i=0; i<self._audioNode.length; i++) {
        if (!self._audioNode[i].paused) {
          node = self._audioNode[i];
          break;
        }
      }

      // remove excess inactive nodes
      self._drainPool();

      return node;
    },

    /**
     * Get the first inactive audio node.
     * If there is none, create a new one and add it to the pool.
     * @param  {Function} callback Function to call when the audio node is ready.
     */
    _inactiveNode: function(callback) {
      var self = this,
        node = null;

      // find first inactive node to recycle
      for (var i=0; i<self._audioNode.length; i++) {
        if (self._audioNode[i].paused && self._audioNode[i].readyState === 4) {
          // send the node back for use by the new play instance
          callback(self._audioNode[i]);
          node = true;
          break;
        }
      }

      // remove excess inactive nodes
      self._drainPool();

      if (node) {
        return;
      }

      // create new node if there are no inactives
      var newNode;
      if (self._webAudio) {
        newNode = self._setupAudioNode();
        callback(newNode);
      } else {
        self.load();
        newNode = self._audioNode[self._audioNode.length - 1];

        // listen for the correct load event and fire the callback
        var listenerEvent = navigator.isCocoonJS ? 'canplaythrough' : 'loadedmetadata';
        var listener = function() {
          newNode.removeEventListener(listenerEvent, listener, false);
          callback(newNode);
        };
        newNode.addEventListener(listenerEvent, listener, false);
      }
    },

    /**
     * If there are more than 5 inactive audio nodes in the pool, clear out the rest.
     */
    _drainPool: function() {
      var self = this,
        inactive = 0,
        i;

      // count the number of inactive nodes
      for (i=0; i<self._audioNode.length; i++) {
        if (self._audioNode[i].paused) {
          inactive++;
        }
      }

      // remove excess inactive nodes
      for (i=self._audioNode.length-1; i>=0; i--) {
        if (inactive <= 5) {
          break;
        }

        if (self._audioNode[i].paused) {
          // disconnect the audio source if using Web Audio
          if (self._webAudio) {
            self._audioNode[i].disconnect(0);
          }

          inactive--;
          self._audioNode.splice(i, 1);
        }
      }
    },

    /**
     * Clear 'onend' timeout before it ends.
     * @param  {String} soundId  The play instance ID.
     */
    _clearEndTimer: function(soundId) {
      var self = this,
        index = -1;

      // loop through the timers to find the one associated with this sound
      for (var i=0; i<self._onendTimer.length; i++) {
        if (self._onendTimer[i].id === soundId) {
          index = i;
          break;
        }
      }

      var timer = self._onendTimer[index];
      if (timer) {
        clearTimeout(timer.timer);
        self._onendTimer.splice(index, 1);
      }
    },

    /**
     * Setup the gain node and panner for a Web Audio instance.
     * @return {Object} The new audio node.
     */
    _setupAudioNode: function() {
      var self = this,
        node = self._audioNode,
        index = self._audioNode.length;

      // create gain node
      node[index] = (typeof ctx.createGain === 'undefined') ? ctx.createGainNode() : ctx.createGain();
      node[index].gain.value = self._volume;
      node[index].paused = true;
      node[index]._pos = 0;
      node[index].readyState = 4;
      node[index].connect(masterGain);

      // create the panner
      node[index].panner = ctx.createPanner();
      node[index].panner.panningModel = self._model || 'equalpower';
      node[index].panner.setPosition(self._pos3d[0], self._pos3d[1], self._pos3d[2]);
      node[index].panner.connect(node[index]);

      return node[index];
    },

    /**
     * Call/set custom events.
     * @param  {String}   event Event type.
     * @param  {Function} fn    Function to call.
     * @return {Howl}
     */
    on: function(event, fn) {
      var self = this,
        events = self['_on' + event];

      if (typeof fn === 'function') {
        events.push(fn);
      } else {
        for (var i=0; i<events.length; i++) {
          if (fn) {
            events[i].call(self, fn);
          } else {
            events[i].call(self);
          }
        }
      }

      return self;
    },

    /**
     * Remove a custom event.
     * @param  {String}   event Event type.
     * @param  {Function} fn    Listener to remove.
     * @return {Howl}
     */
    off: function(event, fn) {
      var self = this,
        events = self['_on' + event];

      if (fn) {
        // loop through functions in the event for comparison
        for (var i=0; i<events.length; i++) {
          if (fn === events[i]) {
            events.splice(i, 1);
            break;
          }
        }
      } else {
        self['_on' + event] = [];
      }

      return self;
    },

    /**
     * Unload and destroy the current Howl object.
     * This will immediately stop all play instances attached to this sound.
     */
    unload: function() {
      var self = this;

      // stop playing any active nodes
      var nodes = self._audioNode;
      for (var i=0; i<self._audioNode.length; i++) {
        // stop the sound if it is currently playing
        if (!nodes[i].paused) {
          self.stop(nodes[i].id);
          self.on('end', nodes[i].id);
        }

        if (!self._webAudio) {
          // remove the source if using HTML5 Audio
          nodes[i].src = '';
        } else {
          // disconnect the output from the master gain
          nodes[i].disconnect(0);
        }
      }

      // make sure all timeouts are cleared
      for (i=0; i<self._onendTimer.length; i++) {
        clearTimeout(self._onendTimer[i].timer);
      }

      // remove the reference in the global Howler object
      var index = Howler._howls.indexOf(self);
      if (index !== null && index >= 0) {
        Howler._howls.splice(index, 1);
      }

      // delete this sound from the cache
      delete cache[self._src];
      self = null;
    }

  };

  // only define these functions when using WebAudio
  if (usingWebAudio) {

    /**
     * Buffer a sound from URL (or from cache) and decode to audio source (Web Audio API).
     * @param  {Object} obj The Howl object for the sound to load.
     * @param  {String} url The path to the sound file.
     */
    var loadBuffer = function(obj, url) {
      // check if the buffer has already been cached
      if (url in cache) {
        // set the duration from the cache
        obj._duration = cache[url].duration;

        // load the sound into this object
        loadSound(obj);
        return;
      }
      
      if (/^data:[^;]+;base64,/.test(url)) {
        // Decode base64 data-URIs because some browsers cannot load data-URIs with XMLHttpRequest.
        var data = atob(url.split(',')[1]);
        var dataView = new Uint8Array(data.length);
        for (var i=0; i<data.length; ++i) {
          dataView[i] = data.charCodeAt(i);
        }
        
        decodeAudioData(dataView.buffer, obj, url);
      } else {
        // load the buffer from the URL
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          decodeAudioData(xhr.response, obj, url);
        };
        xhr.onerror = function() {
          // if there is an error, switch the sound to HTML Audio
          if (obj._webAudio) {
            obj._buffer = true;
            obj._webAudio = false;
            obj._audioNode = [];
            delete obj._gainNode;
            delete cache[url];
            obj.load();
          }
        };
        try {
          xhr.send();
        } catch (e) {
          xhr.onerror();
        }
      }
    };

    /**
     * Decode audio data from an array buffer.
     * @param  {ArrayBuffer} arraybuffer The audio data.
     * @param  {Object} obj The Howl object for the sound to load.
     * @param  {String} url The path to the sound file.
     */
    var decodeAudioData = function(arraybuffer, obj, url) {
      // decode the buffer into an audio source
      ctx.decodeAudioData(
        arraybuffer,
        function(buffer) {
          if (buffer) {
            cache[url] = buffer;
            loadSound(obj, buffer);
          }
        },
        function(err) {
          obj.on('loaderror', err);
        }
      );
    };

    /**
     * Finishes loading the Web Audio API sound and fires the loaded event
     * @param  {Object}  obj    The Howl object for the sound to load.
     * @param  {Objecct} buffer The decoded buffer sound source.
     */
    var loadSound = function(obj, buffer) {
      // set the duration
      obj._duration = (buffer) ? buffer.duration : obj._duration;

      // setup a sprite if none is defined
      if (Object.getOwnPropertyNames(obj._sprite).length === 0) {
        obj._sprite = {_default: [0, obj._duration * 1000]};
      }

      // fire the loaded event
      if (!obj._loaded) {
        obj._loaded = true;
        obj.on('load');
      }

      if (obj._autoplay) {
        obj.play();
      }
    };

    /**
     * Load the sound back into the buffer source.
     * @param  {Object} obj   The sound to load.
     * @param  {Array}  loop  Loop boolean, pos, and duration.
     * @param  {String} id    (optional) The play instance ID.
     */
    var refreshBuffer = function(obj, loop, id) {
      // determine which node to connect to
      var node = obj._nodeById(id);

      // setup the buffer source for playback
      node.bufferSource = ctx.createBufferSource();
      node.bufferSource.buffer = cache[obj._src];
      node.bufferSource.connect(node.panner);
      node.bufferSource.loop = loop[0];
      if (loop[0]) {
        node.bufferSource.loopStart = loop[1];
        node.bufferSource.loopEnd = loop[1] + loop[2];
      }
      node.bufferSource.playbackRate.value = obj._rate;
    };

  }

  /**
   * Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
   */
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return {
        Howler: Howler,
        Howl: Howl
      };
    });
  }

  /**
   * Add support for CommonJS libraries such as browserify.
   */
  if (typeof exports !== 'undefined') {
    exports.Howler = Howler;
    exports.Howl = Howl;
  }

  // define globally in case AMD is not available or available but not used

  if (typeof window !== 'undefined') {
    window.Howler = Howler;
    window.Howl = Howl;
  }

})();
/*

  Javascript State Machine Library - https://github.com/jakesgordon/javascript-state-machine

  Copyright (c) 2012, 2013, 2014, 2015, Jake Gordon and contributors
  Released under the MIT license - https://github.com/jakesgordon/javascript-state-machine/blob/master/LICENSE

*/

(function () {

  var StateMachine = {

    //---------------------------------------------------------------------------

    VERSION: "2.3.5",

    //---------------------------------------------------------------------------

    Result: {
      SUCCEEDED:    1, // the event transitioned successfully from one state to another
      NOTRANSITION: 2, // the event was successfull but no state transition was necessary
      CANCELLED:    3, // the event was cancelled by the caller in a beforeEvent callback
      PENDING:      4  // the event is asynchronous and the caller is in control of when the transition occurs
    },

    Error: {
      INVALID_TRANSITION: 100, // caller tried to fire an event that was innapropriate in the current state
      PENDING_TRANSITION: 200, // caller tried to fire an event while an async transition was still pending
      INVALID_CALLBACK:   300 // caller provided callback function threw an exception
    },

    WILDCARD: '*',
    ASYNC: 'async',

    //---------------------------------------------------------------------------

    create: function(cfg, target) {

      var initial      = (typeof cfg.initial == 'string') ? { state: cfg.initial } : cfg.initial; // allow for a simple string, or an object with { state: 'foo', event: 'setup', defer: true|false }
      var terminal     = cfg.terminal || cfg['final'];
      var fsm          = target || cfg.target  || {};
      var events       = cfg.events || [];
      var callbacks    = cfg.callbacks || {};
      var map          = {}; // track state transitions allowed for an event { event: { from: [ to ] } }
      var transitions  = {}; // track events allowed from a state            { state: [ event ] }

      var add = function(e) {
        var from = (e.from instanceof Array) ? e.from : (e.from ? [e.from] : [StateMachine.WILDCARD]); // allow 'wildcard' transition if 'from' is not specified
        map[e.name] = map[e.name] || {};
        for (var n = 0 ; n < from.length ; n++) {
          transitions[from[n]] = transitions[from[n]] || [];
          transitions[from[n]].push(e.name);

          map[e.name][from[n]] = e.to || from[n]; // allow no-op transition if 'to' is not specified
        }
      };

      if (initial) {
        initial.event = initial.event || 'startup';
        add({ name: initial.event, from: 'none', to: initial.state });
      }

      for(var n = 0 ; n < events.length ; n++)
        add(events[n]);

      for(var name in map) {
        if (map.hasOwnProperty(name))
          fsm[name] = StateMachine.buildEvent(name, map[name]);
      }

      for(var name in callbacks) {
        if (callbacks.hasOwnProperty(name))
          fsm[name] = callbacks[name]
      }

      fsm.current     = 'none';
      fsm.is          = function(state) { return (state instanceof Array) ? (state.indexOf(this.current) >= 0) : (this.current === state); };
      fsm.can         = function(event) { return !this.transition && (map[event].hasOwnProperty(this.current) || map[event].hasOwnProperty(StateMachine.WILDCARD)); }
      fsm.cannot      = function(event) { return !this.can(event); };
      fsm.transitions = function()      { return transitions[this.current]; };
      fsm.isFinished  = function()      { return this.is(terminal); };
      fsm.error       = cfg.error || function(name, from, to, args, error, msg, e) { throw e || msg; }; // default behavior when something unexpected happens is to throw an exception, but caller can override this behavior if desired (see github issue #3 and #17)

      if (initial && !initial.defer)
        fsm[initial.event]();

      return fsm;

    },

    //===========================================================================

    doCallback: function(fsm, func, name, from, to, args) {
      if (func) {
        try {
          return func.apply(fsm, [name, from, to].concat(args));
        }
        catch(e) {
          return fsm.error(name, from, to, args, StateMachine.Error.INVALID_CALLBACK, "an exception occurred in a caller-provided callback function", e);
        }
      }
    },

    beforeAnyEvent:  function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onbeforeevent'],                       name, from, to, args); },
    afterAnyEvent:   function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onafterevent'] || fsm['onevent'],      name, from, to, args); },
    leaveAnyState:   function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onleavestate'],                        name, from, to, args); },
    enterAnyState:   function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onenterstate'] || fsm['onstate'],      name, from, to, args); },
    changeState:     function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onchangestate'],                       name, from, to, args); },

    beforeThisEvent: function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onbefore' + name],                     name, from, to, args); },
    afterThisEvent:  function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onafter'  + name] || fsm['on' + name], name, from, to, args); },
    leaveThisState:  function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onleave'  + from],                     name, from, to, args); },
    enterThisState:  function(fsm, name, from, to, args) { return StateMachine.doCallback(fsm, fsm['onenter'  + to]   || fsm['on' + to],   name, from, to, args); },

    beforeEvent: function(fsm, name, from, to, args) {
      if ((false === StateMachine.beforeThisEvent(fsm, name, from, to, args)) ||
          (false === StateMachine.beforeAnyEvent( fsm, name, from, to, args)))
        return false;
    },

    afterEvent: function(fsm, name, from, to, args) {
      StateMachine.afterThisEvent(fsm, name, from, to, args);
      StateMachine.afterAnyEvent( fsm, name, from, to, args);
    },

    leaveState: function(fsm, name, from, to, args) {
      var specific = StateMachine.leaveThisState(fsm, name, from, to, args),
          general  = StateMachine.leaveAnyState( fsm, name, from, to, args);
      if ((false === specific) || (false === general))
        return false;
      else if ((StateMachine.ASYNC === specific) || (StateMachine.ASYNC === general))
        return StateMachine.ASYNC;
    },

    enterState: function(fsm, name, from, to, args) {
      StateMachine.enterThisState(fsm, name, from, to, args);
      StateMachine.enterAnyState( fsm, name, from, to, args);
    },

    //===========================================================================

    buildEvent: function(name, map) {
      return function() {

        var from  = this.current;
        var to    = map[from] || map[StateMachine.WILDCARD] || from;
        var args  = Array.prototype.slice.call(arguments); // turn arguments into pure array

        if (this.transition)
          return this.error(name, from, to, args, StateMachine.Error.PENDING_TRANSITION, "event " + name + " inappropriate because previous transition did not complete");

        if (this.cannot(name))
          return this.error(name, from, to, args, StateMachine.Error.INVALID_TRANSITION, "event " + name + " inappropriate in current state " + this.current);

        if (false === StateMachine.beforeEvent(this, name, from, to, args))
          return StateMachine.Result.CANCELLED;

        if (from === to) {
          StateMachine.afterEvent(this, name, from, to, args);
          return StateMachine.Result.NOTRANSITION;
        }

        // prepare a transition method for use EITHER lower down, or by caller if they want an async transition (indicated by an ASYNC return value from leaveState)
        var fsm = this;
        this.transition = function() {
          fsm.transition = null; // this method should only ever be called once
          fsm.current = to;
          StateMachine.enterState( fsm, name, from, to, args);
          StateMachine.changeState(fsm, name, from, to, args);
          StateMachine.afterEvent( fsm, name, from, to, args);
          return StateMachine.Result.SUCCEEDED;
        };
        this.transition.cancel = function() { // provide a way for caller to cancel async transition if desired (issue #22)
          fsm.transition = null;
          StateMachine.afterEvent(fsm, name, from, to, args);
        }

        var leave = StateMachine.leaveState(this, name, from, to, args);
        if (false === leave) {
          this.transition = null;
          return StateMachine.Result.CANCELLED;
        }
        else if (StateMachine.ASYNC === leave) {
          return StateMachine.Result.PENDING;
        }
        else {
          if (this.transition) // need to check in case user manually called transition() but forgot to return StateMachine.ASYNC
            return this.transition();
        }

      };
    }

  }; // StateMachine

  //===========================================================================

  //======
  // NODE
  //======
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = StateMachine;
    }
    exports.StateMachine = StateMachine;
  }
  //============
  // AMD/REQUIRE
  //============
  else if (typeof define === 'function' && define.amd) {
    define(function(require) { return StateMachine; });
  }
  //========
  // BROWSER
  //========
  else if (typeof window !== 'undefined') {
    window.StateMachine = StateMachine;
  }
  //===========
  // WEB WORKER
  //===========
  else if (typeof self !== 'undefined') {
    self.StateMachine = StateMachine;
  }

}());
// AJAX + CSS + EVENTS, FROM : http://projects.jga.me/jquery-builder/
/*! jQuery v2.1.1 -deprecated,-dimensions,-event-alias,-offset,-css/hiddenVisibleSelectors,-effects/animatedSelector,-wrap | (c) 2005, 2014 jQuery Foundation, Inc. | jquery.org/license */
!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a, !0):function(a){if (!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this, function(a,b){var c=[],d=c.slice,e=c.concat,f=c.push,g=c.indexOf,h={},i=h.toString,j=h.hasOwnProperty,k={},l=a.document,m="2.1.1 -deprecated,-dimensions,-event-alias,-offset,-css/hiddenVisibleSelectors,-effects/animatedSelector,-wrap",n=function(a,b){return new n.fn.init(a,b)},o=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:"",length:0,toArray:function(){return d.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:d.call(this)},pushStack:function(a){var b=n.merge(this.constructor(), a);return b.prevObject=this,b.context=this.context,b},each:function(a,b){return n.each(this, a, b)},map:function(a){return this.pushStack(n.map(this, function(b,c){return a.call(b, c, b)}))},slice:function(){return this.pushStack(d.apply(this, arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:f,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for ("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||n.isFunction(g)||(g={}),h===i&&(g=this,h--); i>h; h++)if (null!=(a=arguments[h]))for (b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(n.isPlainObject(d)||(e=n.isArray(d)))?(e?(e=!1,f=c&&n.isArray(c)?c:[]):f=c&&n.isPlainObject(c)?c:{},g[b]=n.extend(j, f, d)):void 0!==d&&(g[b]=d));return g},n.extend({expando:"jQuery"+(m+Math.random()).replace(/\D/g, ""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return "function"===n.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){return !n.isArray(a)&&a-parseFloat(a)>=0},isPlainObject:function(a){return "object"!==n.type(a)||a.nodeType||n.isWindow(a)?!1:a.constructor&&!j.call(a.constructor.prototype, "isPrototypeOf")?!1:!0},isEmptyObject:function(a){var b;for (b in a)return !1;return !0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?h[i.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=n.trim(a),a&&(1===a.indexOf("use strict")?(b=l.createElement("script"),b.text=a,l.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p, "ms-").replace(q, r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b,c){var d,e=0,f=a.length,g=s(a);if (c){if (g){for (; f>e; e++)if (d=b.apply(a[e], c),d===!1)break}else for (e in a)if (d=b.apply(a[e], c),d===!1)break}else if (g){for (; f>e; e++)if (d=b.call(a[e], e, a[e]),d===!1)break}else for (e in a)if (d=b.call(a[e], e, a[e]),d===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(o, "")},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?n.merge(c, "string"==typeof a?[a]:a):f.call(c, a)),c},inArray:function(a,b,c){return null==b?-1:g.call(b, a, c)},merge:function(a,b){for (var c=+b.length,d=0,e=a.length; c>d; d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for (var d,e=[],f=0,g=a.length,h=!c; g>f; f++)d=!b(a[f], f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,f=0,g=a.length,h=s(a),i=[];if (h)for (; g>f; f++)d=b(a[f], f, c),null!=d&&i.push(d);else for (f in a)d=b(a[f], f, c),null!=d&&i.push(d);return e.apply([], i)},guid:1,proxy:function(a,b){var c,e,f;return "string"==typeof b&&(c=a[b],b=a,a=c),n.isFunction(a)?(e=d.call(arguments, 2),f=function(){return a.apply(b||this, e.concat(d.call(arguments)))},f.guid=a.guid=a.guid||n.guid++,f):void 0},now:Date.now,support:k}),n.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(a,b){h["[object "+b+"]"]=b.toLowerCase()});function s(a){var b=a.length,c=n.type(a);return "function"===c||n.isWindow(a)?!1:1===a.nodeType&&b?!0:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var t=a.document.documentElement,u,v=t.matches||t.webkitMatchesSelector||t.mozMatchesSelector||t.oMatchesSelector||t.msMatchesSelector,w=function(a,b){if (a===b)return u=!0,0;var c=b.compareDocumentPosition&&a.compareDocumentPosition&&a.compareDocumentPosition(b);return c?1&c?a===l||n.contains(l, a)?-1:b===l||n.contains(l, b)?1:0:4&c?-1:1:a.compareDocumentPosition?-1:1};n.extend({find:function(a,b,c,d){var e,f,g=0;if (c=c||[],b=b||l,!a||"string"!=typeof a)return c;if (1!==(f=b.nodeType)&&9!==f)return [];if (d)while (e=d[g++])n.find.matchesSelector(e, a)&&c.push(e);else n.merge(c, b.querySelectorAll(a));return c},unique:function(a){var b,c=[],d=0,e=0;if (u=!1,a.sort(w),u){while (b=a[d++])b===a[d]&&(e=c.push(d));while (e--)a.splice(c[e], 1)}return a},text:function(a){var b,c="",d=0,e=a.nodeType;if (e){if (1===e||9===e||11===e)return a.textContent;if (3===e||4===e)return a.nodeValue}else while (b=a[d++])c+=n.text(b);return c},contains:function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!c.contains(d))},isXMLDoc:function(a){return "HTML"!==(a.ownerDocument||a).documentElement.nodeName},expr:{attrHandle:{},match:{bool:/^(?:checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped)$/i,needsContext:/^[\x20\t\r\n\f]*[>+~]/}}}),n.extend(n.find, {matches:function(a,b){return n.find(a, null, null, b)},matchesSelector:function(a,b){return v.call(a, b)},attr:function(a,b){return a.getAttribute(b)}});var x=n.expr.match.needsContext,y=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,z=/^.[^:#\[\.,]*$/;function A(a,b,c){if (n.isFunction(b))return n.grep(a, function(a,d){return !!b.call(a, d, a)!==c});if (b.nodeType)return n.grep(a, function(a){return a===b!==c});if ("string"==typeof b){if (z.test(b))return n.filter(b, a, c);b=n.filter(b, a)}return n.grep(a, function(a){return g.call(b, a)>=0!==c})}n.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?n.find.matchesSelector(d, a)?[d]:[]:n.find.matches(a, n.grep(b, function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if ("string"!=typeof a)return this.pushStack(n(a).filter(function(){for (b=0; c>b; b++)if (n.contains(e[b], this))return !0}));for (b=0; c>b; b++)n.find(a, e[b], d);return d=this.pushStack(c>1?n.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(A(this, a||[], !1))},not:function(a){return this.pushStack(A(this, a||[], !0))},is:function(a){return !!A(this, "string"==typeof a&&x.test(a)?n(a):a||[], !1).length}});var B,C=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,D=n.fn.init=function(a,b){var c,d;if (!a)return this;if ("string"==typeof a){if (c="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:C.exec(a),!c||!c[1]&&b)return !b||b.jquery?(b||B).find(a):this.constructor(b).find(a);if (c[1]){if (b=b instanceof n?b[0]:b,n.merge(this, n.parseHTML(c[1], b&&b.nodeType?b.ownerDocument||b:l, !0)),y.test(c[1])&&n.isPlainObject(b))for (c in b)n.isFunction(this[c])?this[c](b[c]):this.attr(c, b[c]);return this}return d=l.getElementById(c[2]),d&&d.parentNode&&(this.length=1,this[0]=d),this.context=l,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?"undefined"!=typeof B.ready?B.ready(a):a(n):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),n.makeArray(a, this))};D.prototype=n.fn,B=n(l);var E=/^(?:parents|prev(?:Until|All))/,F={children:!0,contents:!0,next:!0,prev:!0};n.extend({dir:function(a,b,c){var d=[],e=void 0!==c;while ((a=a[b])&&9!==a.nodeType)if (1===a.nodeType){if (e&&n(a).is(c))break;d.push(a)}return d},sibling:function(a,b){for (var c=[]; a; a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c}}),n.fn.extend({has:function(a){var b=n(a, this),c=b.length;return this.filter(function(){for (var a=0; c>a; a++)if (n.contains(this, b[a]))return !0})},closest:function(a,b){for (var c,d=0,e=this.length,f=[],g=x.test(a)||"string"!=typeof a?n(a, b||this.context):0; e>d; d++)for (c=this[d]; c&&c!==b; c=c.parentNode)if (c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&n.find.matchesSelector(c, a))){f.push(c);break}return this.pushStack(f.length>1?n.unique(f):f)},index:function(a){return a?"string"==typeof a?g.call(n(a), this[0]):g.call(this, a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.unique(n.merge(this.get(), n(a, b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function G(a,b){while ((a=a[b])&&1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return n.dir(a, "parentNode")},parentsUntil:function(a,b,c){return n.dir(a, "parentNode", c)},next:function(a){return G(a, "nextSibling")},prev:function(a){return G(a, "previousSibling")},nextAll:function(a){return n.dir(a, "nextSibling")},prevAll:function(a){return n.dir(a, "previousSibling")},nextUntil:function(a,b,c){return n.dir(a, "nextSibling", c)},prevUntil:function(a,b,c){return n.dir(a, "previousSibling", c)},siblings:function(a){return n.sibling((a.parentNode||{}).firstChild, a)},children:function(a){return n.sibling(a.firstChild)},contents:function(a){return a.contentDocument||n.merge([], a.childNodes)}}, function(a,b){n.fn[a]=function(c,d){var e=n.map(this, b, c);return "Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=n.filter(d, e)),this.length>1&&(F[a]||n.unique(e),E.test(a)&&e.reverse()),this.pushStack(e)}});var H=/\S+/g,I={};function J(a){var b=I[a]={};return n.each(a.match(H)||[], function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a="string"==typeof a?I[a]||J(a):n.extend({}, a);var b,c,d,e,f,g,h=[],i=!a.once&&[],j=function(l){for (b=a.memory&&l,c=!0,g=e||0,e=0,f=h.length,d=!0; h&&f>g; g++)if (h[g].apply(l[0], l[1])===!1&&a.stopOnFalse){b=!1;break}d=!1,h&&(i?i.length&&j(i.shift()):b?h=[]:k.disable())},k={add:function(){if (h){var c=h.length;!function g(b){n.each(b, function(b,c){var d=n.type(c);"function"===d?a.unique&&k.has(c)||h.push(c):c&&c.length&&"string"!==d&&g(c)})}(arguments),d?f=h.length:b&&(e=c,j(b))}return this},remove:function(){return h&&n.each(arguments, function(a,b){var c;while ((c=n.inArray(b, h, c))>-1)h.splice(c, 1),d&&(f>=c&&f--,g>=c&&g--)}),this},has:function(a){return a?n.inArray(a, h)>-1:!(!h||!h.length)},empty:function(){return h=[],f=0,this},disable:function(){return h=i=b=void 0,this},disabled:function(){return !h},lock:function(){return i=void 0,b||k.disable(),this},locked:function(){return !i},fireWith:function(a,b){return !h||c&&!i||(b=b||[],b=[a,b.slice?b.slice():b],d?i.push(b):j(b)),this},fire:function(){return k.fireWith(this, arguments),this},fired:function(){return !!c}};return k},n.extend({Deferred:function(a){var b=[["resolve","done",n.Callbacks("once memory"),"resolved"],["reject","fail",n.Callbacks("once memory"),"rejected"],["notify","progress",n.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b, function(b,f){var g=n.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this, arguments);a&&n.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f[0]+"With"](this===d?c.promise():this, g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a, d):d}},e={};return d.pipe=d.then,n.each(b, function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h}, b[1^a][2].disable, b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this, arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e, e),e},when:function(a){var b=0,c=d.call(arguments),e=c.length,f=1!==e||a&&n.isFunction(a.promise)?e:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(e){b[a]=this,c[a]=arguments.length>1?d.call(arguments):e,c===i?g.notifyWith(b, c):--f||g.resolveWith(b, c)}},i,j,k;if (e>1)for (i=new Array(e),j=new Array(e),k=new Array(e); e>b; b++)c[b]&&n.isFunction(c[b].promise)?c[b].promise().done(h(b, k, c)).fail(g.reject).progress(h(b, j, i)):--f;return f||g.resolveWith(k, c),g.promise()}});var K;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&&--n.readyWait>0||(K.resolveWith(l, [n]),n.fn.triggerHandler&&(n(l).triggerHandler("ready"),n(l).off("ready"))))}});function L(){l.removeEventListener("DOMContentLoaded", L, !1),a.removeEventListener("load", L, !1),n.ready()}n.ready.promise=function(b){return K||(K=n.Deferred(),"complete"===l.readyState?setTimeout(n.ready):(l.addEventListener("DOMContentLoaded", L, !1),a.addEventListener("load", L, !1))),K.promise(b)},n.ready.promise();var M=n.access=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if ("object"===n.type(c)){e=!0;for (h in c)n.access(a, b, h, c[h], !0, f, g)}else if (void 0!==d&&(e=!0,n.isFunction(d)||(g=!0),j&&(g?(b.call(a, d),b=null):(j=b,b=function(a,b,c){return j.call(n(a), c)})),b))for (; i>h; h++)b(a[h], c, g?d:d.call(a[h], h, b(a[h], c)));return e?a:j?b.call(a):i?b(a[0], c):f};n.acceptData=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function N(){Object.defineProperty(this.cache={}, 0, {get:function(){return {}}}),this.expando=n.expando+Math.random()}N.uid=1,N.accepts=n.acceptData,N.prototype={key:function(a){if (!N.accepts(a))return 0;var b={},c=a[this.expando];if (!c){c=N.uid++;try {b[this.expando]={value:c},Object.defineProperties(a, b)}catch (d){b[this.expando]=c,n.extend(a, b)}}return this.cache[c]||(this.cache[c]={}),c},set:function(a,b,c){var d,e=this.key(a),f=this.cache[e];if ("string"==typeof b)f[b]=c;else if (n.isEmptyObject(f))n.extend(this.cache[e], b);else for (d in b)f[d]=b[d];return f},get:function(a,b){var c=this.cache[this.key(a)];return void 0===b?c:c[b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a, b),void 0!==d?d:this.get(a, n.camelCase(b))):(this.set(a, b, c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=this.key(a),g=this.cache[f];if (void 0===b)this.cache[f]={};else {n.isArray(b)?d=b.concat(b.map(n.camelCase)):(e=n.camelCase(b),b in g?d=[b,e]:(d=e,d=d in g?[d]:d.match(H)||[])),c=d.length;while (c--)delete g[d[c]]}},hasData:function(a){return !n.isEmptyObject(this.cache[a[this.expando]]||{})},discard:function(a){a[this.expando]&&delete this.cache[a[this.expando]]}};var O=new N,P=new N,Q=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,R=/([A-Z])/g;function S(a,b,c){var d;if (void 0===c&&1===a.nodeType)if (d="data-"+b.replace(R, "-$1").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try {c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:Q.test(c)?n.parseJSON(c):c}catch (e){}P.set(a, b, c)}else c=void 0;return c}n.extend({hasData:function(a){return P.hasData(a)||O.hasData(a)},data:function(a,b,c){return P.access(a, b, c)},removeData:function(a,b){P.remove(a, b)},_data:function(a,b,c){return O.access(a, b, c)},_removeData:function(a,b){O.remove(a, b)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if (void 0===a){if (this.length&&(e=P.get(f),1===f.nodeType&&!O.get(f, "hasDataAttrs"))){c=g.length;while (c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=n.camelCase(d.slice(5)),S(f, d, e[d])));O.set(f, "hasDataAttrs", !0)}return e}return "object"==typeof a?this.each(function(){P.set(this, a)}):M(this, function(b){var c,d=n.camelCase(a);if (f&&void 0===b){if (c=P.get(f, a),void 0!==c)return c;if (c=P.get(f, d),void 0!==c)return c;if (c=S(f, d, void 0),void 0!==c)return c}else this.each(function(){var c=P.get(this, d);P.set(this, d, b),-1!==a.indexOf("-")&&void 0!==c&&P.set(this, a, b)})}, null, b, arguments.length>1, null, !0)},removeData:function(a){return this.each(function(){P.remove(this, a)})}}),n.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=O.get(a, b),c&&(!d||n.isArray(c)?d=O.access(a, b, n.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=n.queue(a, b),d=c.length,e=c.shift(),f=n._queueHooks(a, b),g=function(){n.dequeue(a, b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a, g, f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return O.get(a, c)||O.access(a, c, {empty:n.Callbacks("once memory").add(function(){O.remove(a, [b+"queue",c])})})}}),n.fn.extend({queue:function(a,b){var c=2;return "string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?n.queue(this[0], a):void 0===b?this:this.each(function(){var c=n.queue(this, a, b);n._queueHooks(this, a),"fx"===a&&"inprogress"!==c[0]&&n.dequeue(this, a)})},dequeue:function(a){return this.each(function(){n.dequeue(this, a)})},clearQueue:function(a){return this.queue(a||"fx", [])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f, [f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while (g--)c=O.get(f[g], a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var T=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,U=["Top","Right","Bottom","Left"],V=function(a,b){return a=b||a,"none"===n.css(a, "display")||!n.contains(a.ownerDocument, a)},W=/^(?:checkbox|radio)$/i;!function(){var a=l.createDocumentFragment(),b=a.appendChild(l.createElement("div")),c=l.createElement("input");c.setAttribute("type", "radio"),c.setAttribute("checked", "checked"),c.setAttribute("name", "t"),b.appendChild(c),k.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",k.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var X="undefined";k.focusinBubbles="onfocusin"in a;var Y=/^key/,Z=/^(?:mouse|pointer|contextmenu)|click/,$=/^(?:focusinfocus|focusoutblur)$/,_=/^([^.]*)(?:\.(.+)|)$/;function ab(){return !0}function bb(){return !1}function cb(){try {return l.activeElement}catch (a){}}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=O.get(a);if (r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=n.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return typeof n!==X&&n.event.triggered!==b.type?n.event.dispatch.apply(a, arguments):void 0}),b=(b||"").match(H)||[""],j=b.length;while (j--)h=_.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o&&(l=n.event.special[o]||{},o=(e?l.delegateType:l.bindType)||o,l=n.event.special[o]||{},k=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&n.expr.match.needsContext.test(e),namespace:p.join(".")}, f),(m=i[o])||(m=i[o]=[],m.delegateCount=0,l.setup&&l.setup.call(a, d, p, g)!==!1||a.addEventListener&&a.addEventListener(o, g, !1)),l.add&&(l.add.call(a, k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++, 0, k):m.push(k),n.event.global[o]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=O.hasData(a)&&O.get(a);if (r&&(i=r.events)){b=(b||"").match(H)||[""],j=b.length;while (j--)if (h=_.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=i[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while (f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f, 1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a, k));g&&!m.length&&(l.teardown&&l.teardown.call(a, p, r.handle)!==!1||n.removeEvent(a, o, r.handle),delete i[o])}else for (o in i)n.event.remove(a, o+b[j], c, d, !0);n.isEmptyObject(i)&&(delete r.handle,O.remove(a, "events"))}},trigger:function(b,c,d,e){var f,g,h,i,k,m,o,p=[d||l],q=j.call(b, "type")?b.type:b,r=j.call(b, "namespace")?b.namespace.split("."):[];if (g=h=d=d||l,3!==d.nodeType&&8!==d.nodeType&&!$.test(q+n.event.triggered)&&(q.indexOf(".")>=0&&(r=q.split("."),q=r.shift(),r.sort()),k=q.indexOf(":")<0&&"on"+q,b=b[n.expando]?b:new n.Event(q,"object"==typeof b&&b),b.isTrigger=e?2:3,b.namespace=r.join("."),b.namespace_re=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=d),c=null==c?[b]:n.makeArray(c, [b]),o=n.event.special[q]||{},e||!o.trigger||o.trigger.apply(d, c)!==!1)){if (!e&&!o.noBubble&&!n.isWindow(d)){for (i=o.delegateType||q,$.test(i+q)||(g=g.parentNode); g; g=g.parentNode)p.push(g),h=g;h===(d.ownerDocument||l)&&p.push(h.defaultView||h.parentWindow||a)}f=0;while ((g=p[f++])&&!b.isPropagationStopped())b.type=f>1?i:o.bindType||q,m=(O.get(g, "events")||{})[b.type]&&O.get(g, "handle"),m&&m.apply(g, c),m=k&&g[k],m&&m.apply&&n.acceptData(g)&&(b.result=m.apply(g, c),b.result===!1&&b.preventDefault());return b.type=q,e||b.isDefaultPrevented()||o._default&&o._default.apply(p.pop(), c)!==!1||!n.acceptData(d)||k&&n.isFunction(d[q])&&!n.isWindow(d)&&(h=d[k],h&&(d[k]=null),n.event.triggered=q,d[q](),n.event.triggered=void 0,h&&(d[k]=h)),b.result}},dispatch:function(a){a=n.event.fix(a);var b,c,e,f,g,h=[],i=d.call(arguments),j=(O.get(this, "events")||{})[a.type]||[],k=n.event.special[a.type]||{};if (i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this, a)!==!1){h=n.event.handlers.call(this, a, j),b=0;while ((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while ((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())(!a.namespace_re||a.namespace_re.test(g.namespace))&&(a.handleObj=g,a.data=g.data,e=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem, i),void 0!==e&&(a.result=e)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this, a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if (h&&i.nodeType&&(!a.button||"click"!==a.type))for (; i!==this; i=i.parentNode||this)if (i.disabled!==!0||"click"!==a.type){for (d=[],c=0; h>c; c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?n(e, this).index(i)>=0:n.find(e, this, null, [i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,d,e,f=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||l,d=c.documentElement,e=c.body,a.pageX=b.clientX+(d&&d.scrollLeft||e&&e.scrollLeft||0)-(d&&d.clientLeft||e&&e.clientLeft||0),a.pageY=b.clientY+(d&&d.scrollTop||e&&e.scrollTop||0)-(d&&d.clientTop||e&&e.clientTop||0)),a.which||void 0===f||(a.which=1&f?1:2&f?3:4&f?2:0),a}},fix:function(a){if (a[n.expando])return a;var b,c,d,e=a.type,f=a,g=this.fixHooks[e];g||(this.fixHooks[e]=g=Z.test(e)?this.mouseHooks:Y.test(e)?this.keyHooks:{}),d=g.props?this.props.concat(g.props):this.props,a=new n.Event(f),b=d.length;while (b--)c=d[b],a[c]=f[c];return a.target||(a.target=l),3===a.target.nodeType&&(a.target=a.target.parentNode),g.filter?g.filter(a, f):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==cb()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===cb()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return "checkbox"===this.type&&this.click&&n.nodeName(this, "input")?(this.click(),!1):void 0},_default:function(a){return n.nodeName(a.target, "a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c,d){var e=n.extend(new n.Event, c, {type:a,isSimulated:!0,originalEvent:{}});d?n.event.trigger(e, null, b):n.event.dispatch.call(b, e),e.isDefaultPrevented()&&c.preventDefault()}},n.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b, c, !1)},n.Event=function(a,b){return this instanceof n.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?ab:bb):this.type=a,b&&n.extend(this, b),this.timeStamp=a&&a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={isDefaultPrevented:bb,isPropagationStopped:bb,isImmediatePropagationStopped:bb,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=ab,a&&a.preventDefault&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=ab,a&&a.stopPropagation&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=ab,a&&a.stopImmediatePropagation&&a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"}, function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return (!e||e!==d&&!n.contains(d, e))&&(a.type=f.origType,c=f.handler.apply(this, arguments),a.type=b),c}}}),k.focusinBubbles||n.each({focus:"focusin",blur:"focusout"}, function(a,b){var c=function(a){n.event.simulate(b, a.target, n.event.fix(a), !0)};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=O.access(d, b);e||d.addEventListener(a, c, !0),O.access(d, b, (e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=O.access(d, b)-1;e?O.access(d, b, e):(d.removeEventListener(a, c, !0),O.remove(d, b))}}}),n.fn.extend({on:function(a,b,c,d,e){var f,g;if ("object"==typeof a){"string"!=typeof b&&(c=c||b,b=void 0);for (g in a)this.on(g, b, c, a[g], e);return this}if (null==c&&null==d?(d=b,c=b=void 0):null==d&&("string"==typeof b?(d=c,c=void 0):(d=c,c=b,b=void 0)),d===!1)d=bb;else if (!d)return this;return 1===e&&(f=d,d=function(a){return n().off(a),f.apply(this, arguments)},d.guid=f.guid||(f.guid=n.guid++)),this.each(function(){n.event.add(this, a, d, c, b)})},one:function(a,b,c,d){return this.on(a, b, c, d, 1)},off:function(a,b,c){var d,e;if (a&&a.preventDefault&&a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType, d.selector, d.handler),this;if ("object"==typeof a){for (e in a)this.off(e, b, a[e]);return this}return (b===!1||"function"==typeof b)&&(c=b,b=void 0),c===!1&&(c=bb),this.each(function(){n.event.remove(this, a, c, b)})},trigger:function(a,b){return this.each(function(){n.event.trigger(a, b, this)})},triggerHandler:function(a,b){var c=this[0];return c?n.event.trigger(a, b, c, !0):void 0}});var db=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,eb=/<([\w:]+)/,fb=/<|&#?\w+;/,gb=/<(?:script|style|link)/i,hb=/checked\s*(?:[^=]|=\s*.checked.)/i,ib=/^$|\/(?:java|ecma)script/i,jb=/^true\/(.*)/,kb=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,lb={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};lb.optgroup=lb.option,lb.tbody=lb.tfoot=lb.colgroup=lb.caption=lb.thead,lb.th=lb.td;function mb(a,b){return n.nodeName(a, "table")&&n.nodeName(11!==b.nodeType?b:b.firstChild, "tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function nb(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function ob(a){var b=jb.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function pb(a,b){for (var c=0,d=a.length; d>c; c++)O.set(a[c], "globalEval", !b||O.get(b[c], "globalEval"))}function qb(a,b){var c,d,e,f,g,h,i,j;if (1===b.nodeType){if (O.hasData(a)&&(f=O.access(a),g=O.set(b, f),j=f.events)){delete g.handle,g.events={};for (e in j)for (c=0,d=j[e].length; d>c; c++)n.event.add(b, e, j[e][c])}P.hasData(a)&&(h=P.access(a),i=n.extend({}, h),P.set(b, i))}}function rb(a,b){var c=a.getElementsByTagName?a.getElementsByTagName(b||"*"):a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&n.nodeName(a, b)?n.merge([a], c):c}function sb(a,b){var c=b.nodeName.toLowerCase();"input"===c&&W.test(a.type)?b.checked=a.checked:("input"===c||"textarea"===c)&&(b.defaultValue=a.defaultValue)}n.extend({clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=n.contains(a.ownerDocument, a);if (!(k.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||n.isXMLDoc(a)))for (g=rb(h),f=rb(a),d=0,e=f.length; e>d; d++)sb(f[d], g[d]);if (b)if (c)for (f=f||rb(a),g=g||rb(h),d=0,e=f.length; e>d; d++)qb(f[d], g[d]);else qb(a, h);return g=rb(h, "script"),g.length>0&&pb(g, !i&&rb(a, "script")),h},buildFragment:function(a,b,c,d){for (var e,f,g,h,i,j,k=b.createDocumentFragment(),l=[],m=0,o=a.length; o>m; m++)if (e=a[m],e||0===e)if ("object"===n.type(e))n.merge(l, e.nodeType?[e]:e);else if (fb.test(e)){f=f||k.appendChild(b.createElement("div")),g=(eb.exec(e)||["",""])[1].toLowerCase(),h=lb[g]||lb._default,f.innerHTML=h[1]+e.replace(db, "<$1></$2>")+h[2],j=h[0];while (j--)f=f.lastChild;n.merge(l, f.childNodes),f=k.firstChild,f.textContent=""}else l.push(b.createTextNode(e));k.textContent="",m=0;while (e=l[m++])if ((!d||-1===n.inArray(e, d))&&(i=n.contains(e.ownerDocument, e),f=rb(k.appendChild(e), "script"),i&&pb(f),c)){j=0;while (e=f[j++])ib.test(e.type||"")&&c.push(e)}return k},cleanData:function(a){for (var b,c,d,e,f=n.event.special,g=0; void 0!==(c=a[g]); g++){if (n.acceptData(c)&&(e=c[O.expando],e&&(b=O.cache[e]))){if (b.events)for (d in b.events)f[d]?n.event.remove(c, d):n.removeEvent(c, d, b.handle);O.cache[e]&&delete O.cache[e]}delete P.cache[c[P.expando]]}}}),n.fn.extend({text:function(a){return M(this, function(a){return void 0===a?n.text(this):this.empty().each(function(){(1===this.nodeType||11===this.nodeType||9===this.nodeType)&&(this.textContent=a)})}, null, a, arguments.length)},append:function(){return this.domManip(arguments, function(a){if (1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=mb(this, a);b.appendChild(a)}})},prepend:function(){return this.domManip(arguments, function(a){if (1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=mb(this, a);b.insertBefore(a, b.firstChild)}})},before:function(){return this.domManip(arguments, function(a){this.parentNode&&this.parentNode.insertBefore(a, this)})},after:function(){return this.domManip(arguments, function(a){this.parentNode&&this.parentNode.insertBefore(a, this.nextSibling)})},remove:function(a,b){for (var c,d=a?n.filter(a, this):this,e=0; null!=(c=d[e]); e++)b||1!==c.nodeType||n.cleanData(rb(c)),c.parentNode&&(b&&n.contains(c.ownerDocument, c)&&pb(rb(c, "script")),c.parentNode.removeChild(c));return this},empty:function(){for (var a,b=0; null!=(a=this[b]); b++)1===a.nodeType&&(n.cleanData(rb(a, !1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return n.clone(this, a, b)})},html:function(a){return M(this, function(a){var b=this[0]||{},c=0,d=this.length;if (void 0===a&&1===b.nodeType)return b.innerHTML;if ("string"==typeof a&&!gb.test(a)&&!lb[(eb.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(db, "<$1></$2>");try {for (; d>c; c++)b=this[c]||{},1===b.nodeType&&(n.cleanData(rb(b, !1)),b.innerHTML=a);b=0}catch (e){}}b&&this.empty().append(a)}, null, a, arguments.length)},replaceWith:function(){var a=arguments[0];return this.domManip(arguments, function(b){a=this.parentNode,n.cleanData(rb(this)),a&&a.replaceChild(b, this)}),a&&(a.length||a.nodeType)?this:this.remove()},detach:function(a){return this.remove(a, !0)},domManip:function(a,b){a=e.apply([], a);var c,d,f,g,h,i,j=0,l=this.length,m=this,o=l-1,p=a[0],q=n.isFunction(p);if (q||l>1&&"string"==typeof p&&!k.checkClone&&hb.test(p))return this.each(function(c){var d=m.eq(c);q&&(a[0]=p.call(this, c, d.html())),d.domManip(a, b)});if (l&&(c=n.buildFragment(a, this[0].ownerDocument, !1, this),d=c.firstChild,1===c.childNodes.length&&(c=d),d)){for (f=n.map(rb(c, "script"), nb),g=f.length; l>j; j++)h=c,j!==o&&(h=n.clone(h, !0, !0),g&&n.merge(f, rb(h, "script"))),b.call(this[j], h, j);
if (g)for (i=f[f.length-1].ownerDocument,n.map(f, ob),j=0; g>j; j++)h=f[j],ib.test(h.type||"")&&!O.access(h, "globalEval")&&n.contains(i, h)&&(h.src?n._evalUrl&&n._evalUrl(h.src):n.globalEval(h.textContent.replace(kb, "")))}return this}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"}, function(a,b){n.fn[a]=function(a){for (var c,d=[],e=n(a),g=e.length-1,h=0; g>=h; h++)c=h===g?this:this.clone(!0),n(e[h])[b](c),f.apply(d, c.get());return this.pushStack(d)}});var tb,ub={};function vb(b,c){var d,e=n(c.createElement(b)).appendTo(c.body),f=a.getDefaultComputedStyle&&(d=a.getDefaultComputedStyle(e[0]))?d.display:n.css(e[0], "display");return e.detach(),f}function wb(a){var b=l,c=ub[a];return c||(c=vb(a, b),"none"!==c&&c||(tb=(tb||n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=tb[0].contentDocument,b.write(),b.close(),c=vb(a, b),tb.detach()),ub[a]=c),c}var xb=/^margin/,yb=new RegExp("^("+T+")(?!px)[a-z%]+$","i"),zb=function(a){return a.ownerDocument.defaultView.getComputedStyle(a, null)};function Ab(a,b,c){var d,e,f,g,h=a.style;return c=c||zb(a),c&&(g=c.getPropertyValue(b)||c[b]),c&&(""!==g||n.contains(a.ownerDocument, a)||(g=n.style(a, b)),yb.test(g)&&xb.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0!==g?g+"":g}function Bb(a,b){return {get:function(){return a()?void delete this.get:(this.get=b).apply(this, arguments)}}}!function(){var b,c,d=l.documentElement,e=l.createElement("div"),f=l.createElement("div");if (f.style){f.style.backgroundClip="content-box",f.cloneNode(!0).style.backgroundClip="",k.clearCloneStyle="content-box"===f.style.backgroundClip,e.style.cssText="border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute",e.appendChild(f);function g(){f.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute",f.innerHTML="",d.appendChild(e);var g=a.getComputedStyle(f, null);b="1%"!==g.top,c="4px"===g.width,d.removeChild(e)}a.getComputedStyle&&n.extend(k, {pixelPosition:function(){return g(),b},boxSizingReliable:function(){return null==c&&g(),c},reliableMarginRight:function(){var b,c=f.appendChild(l.createElement("div"));return c.style.cssText=f.style.cssText="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",c.style.marginRight=c.style.width="0",f.style.width="1px",d.appendChild(e),b=!parseFloat(a.getComputedStyle(c, null).marginRight),d.removeChild(e),b}})}}(),n.swap=function(a,b,c,d){var e,f,g={};for (f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a, d||[]);for (f in b)a.style[f]=g[f];return e};var Cb=/^(none|table(?!-c[ea]).+)/,Db=new RegExp("^("+T+")(.*)$","i"),Eb=new RegExp("^([+-])=("+T+")","i"),Fb={position:"absolute",visibility:"hidden",display:"block"},Gb={letterSpacing:"0",fontWeight:"400"},Hb=["Webkit","O","Moz","ms"];function Ib(a,b){if (b in a)return b;var c=b[0].toUpperCase()+b.slice(1),d=b,e=Hb.length;while (e--)if (b=Hb[e]+c,b in a)return b;return d}function Jb(a,b,c){var d=Db.exec(b);return d?Math.max(0, d[1]-(c||0))+(d[2]||"px"):b}function Kb(a,b,c,d,e){for (var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0; 4>f; f+=2)"margin"===c&&(g+=n.css(a, c+U[f], !0, e)),d?("content"===c&&(g-=n.css(a, "padding"+U[f], !0, e)),"margin"!==c&&(g-=n.css(a, "border"+U[f]+"Width", !0, e))):(g+=n.css(a, "padding"+U[f], !0, e),"padding"!==c&&(g+=n.css(a, "border"+U[f]+"Width", !0, e)));return g}function Lb(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=zb(a),g="border-box"===n.css(a, "boxSizing", !1, f);if (0>=e||null==e){if (e=Ab(a, b, f),(0>e||null==e)&&(e=a.style[b]),yb.test(e))return e;d=g&&(k.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Kb(a, b, c||(g?"border":"content"), d, f)+"px"}function Mb(a,b){for (var c,d,e,f=[],g=0,h=a.length; h>g; g++)d=a[g],d.style&&(f[g]=O.get(d, "olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&V(d)&&(f[g]=O.access(d, "olddisplay", wb(d.nodeName)))):(e=V(d),"none"===c&&e||O.set(d, "olddisplay", e?c:n.css(d, "display"))));for (g=0; h>g; g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}n.extend({cssHooks:{opacity:{get:function(a,b){if (b){var c=Ab(a, "opacity");return ""===c?"1":c}}}},cssNumber:{columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{float:"cssFloat"},style:function(a,b,c,d){if (a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=n.camelCase(b),i=a.style;return b=n.cssProps[h]||(n.cssProps[h]=Ib(i, h)),g=n.cssHooks[b]||n.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a, !1, d))?e:i[b]:(f=typeof c,"string"===f&&(e=Eb.exec(c))&&(c=(e[1]+1)*e[2]+parseFloat(n.css(a, b)),f="number"),null!=c&&c===c&&("number"!==f||n.cssNumber[h]||(c+="px"),k.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a, c, d))||(i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=n.camelCase(b);return b=n.cssProps[h]||(n.cssProps[h]=Ib(a.style, h)),g=n.cssHooks[b]||n.cssHooks[h],g&&"get"in g&&(e=g.get(a, !0, c)),void 0===e&&(e=Ab(a, b, d)),"normal"===e&&b in Gb&&(e=Gb[b]),""===c||c?(f=parseFloat(e),c===!0||n.isNumeric(f)?f||0:e):e}}),n.each(["height","width"], function(a,b){n.cssHooks[b]={get:function(a,c,d){return c?Cb.test(n.css(a, "display"))&&0===a.offsetWidth?n.swap(a, Fb, function(){return Lb(a, b, d)}):Lb(a, b, d):void 0},set:function(a,c,d){var e=d&&zb(a);return Jb(a, c, d?Kb(a, b, d, "border-box"===n.css(a, "boxSizing", !1, e), e):0)}}}),n.cssHooks.marginRight=Bb(k.reliableMarginRight, function(a,b){return b?n.swap(a, {display:"inline-block"}, Ab, [a,"marginRight"]):void 0}),n.each({margin:"",padding:"",border:"Width"}, function(a,b){n.cssHooks[a+b]={expand:function(c){for (var d=0,e={},f="string"==typeof c?c.split(" "):[c]; 4>d; d++)e[a+U[d]+b]=f[d]||f[d-2]||f[0];return e}},xb.test(a)||(n.cssHooks[a+b].set=Jb)}),n.fn.extend({css:function(a,b){return M(this, function(a,b,c){var d,e,f={},g=0;if (n.isArray(b)){for (d=zb(a),e=b.length; e>g; g++)f[b[g]]=n.css(a, b[g], !1, d);return f}return void 0!==c?n.style(a, b, c):n.css(a, b)}, a, b, arguments.length>1)},show:function(){return Mb(this, !0)},hide:function(){return Mb(this)},toggle:function(a){return "boolean"==typeof a?a?this.show():this.hide():this.each(function(){V(this)?n(this).show():n(this).hide()})}});function Nb(a,b,c,d,e){return new Nb.prototype.init(a,b,c,d,e)}n.Tween=Nb,Nb.prototype={constructor:Nb,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(n.cssNumber[c]?"":"px")},cur:function(){var a=Nb.propHooks[this.prop];return a&&a.get?a.get(this):Nb.propHooks._default.get(this)},run:function(a){var b,c=Nb.propHooks[this.prop];return this.pos=b=this.options.duration?n.easing[this.easing](a, this.options.duration*a, 0, 1, this.options.duration):a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem, this.now, this),c&&c.set?c.set(this):Nb.propHooks._default.set(this),this}},Nb.prototype.init.prototype=Nb.prototype,Nb.propHooks={_default:{get:function(a){var b;return null==a.elem[a.prop]||a.elem.style&&null!=a.elem.style[a.prop]?(b=n.css(a.elem, a.prop, ""),b&&"auto"!==b?b:0):a.elem[a.prop]},set:function(a){n.fx.step[a.prop]?n.fx.step[a.prop](a):a.elem.style&&(null!=a.elem.style[n.cssProps[a.prop]]||n.cssHooks[a.prop])?n.style(a.elem, a.prop, a.now+a.unit):a.elem[a.prop]=a.now}}},Nb.propHooks.scrollTop=Nb.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},n.easing={linear:function(a){return a},swing:function(a){return .5-Math.cos(a*Math.PI)/2}},n.fx=Nb.prototype.init,n.fx.step={};var Ob,Pb,Qb=/^(?:toggle|show|hide)$/,Rb=new RegExp("^(?:([+-])=|)("+T+")([a-z%]*)$","i"),Sb=/queueHooks$/,Tb=[Yb],Ub={"*":[function(a,b){var c=this.createTween(a, b),d=c.cur(),e=Rb.exec(b),f=e&&e[3]||(n.cssNumber[a]?"":"px"),g=(n.cssNumber[a]||"px"!==f&&+d)&&Rb.exec(n.css(c.elem, a)),h=1,i=20;if (g&&g[3]!==f){f=f||g[3],e=e||[],g=+d||1;do h=h||".5",g/=h,n.style(c.elem, a, g+f);while (h!==(h=c.cur()/d)&&1!==h&&--i)}return e&&(g=c.start=+g||+d||0,c.unit=f,c.end=e[1]?g+(e[1]+1)*e[2]:+e[2]),c}]};function Vb(){return setTimeout(function(){Ob=void 0}),Ob=n.now()}function Wb(a,b){var c,d=0,e={height:a};for (b=b?1:0; 4>d; d+=2-b)c=U[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Xb(a,b,c){for (var d,e=(Ub[b]||[]).concat(Ub["*"]),f=0,g=e.length; g>f; f++)if (d=e[f].call(c, b, a))return d}function Yb(a,b,c){var d,e,f,g,h,i,j,k,l=this,m={},o=a.style,p=a.nodeType&&V(a),q=O.get(a, "fxshow");c.queue||(h=n._queueHooks(a, "fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,l.always(function(){l.always(function(){h.unqueued--,n.queue(a, "fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=n.css(a, "display"),k="none"===j?O.get(a, "olddisplay")||wb(a.nodeName):j,"inline"===k&&"none"===n.css(a, "float")&&(o.display="inline-block")),c.overflow&&(o.overflow="hidden",l.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]}));for (d in b)if (e=b[d],Qb.exec(e)){if (delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if ("show"!==e||!q||void 0===q[d])continue;p=!0}m[d]=q&&q[d]||n.style(a, d)}else j=void 0;if (n.isEmptyObject(m))"inline"===("none"===j?wb(a.nodeName):j)&&(o.display=j);else {q?"hidden"in q&&(p=q.hidden):q=O.access(a, "fxshow", {}),f&&(q.hidden=!p),p?n(a).show():l.done(function(){n(a).hide()}),l.done(function(){var b;O.remove(a, "fxshow");for (b in m)n.style(a, b, m[b])});for (d in m)g=Xb(p?q[d]:0, d, l),d in q||(q[d]=g.start,p&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function Zb(a,b){var c,d,e,f,g;for (c in a)if (d=n.camelCase(c),e=b[d],f=a[c],n.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=n.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for (c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function $b(a,b,c){var d,e,f=0,g=Tb.length,h=n.Deferred().always(function(){delete i.elem}),i=function(){if (e)return !1;for (var b=Ob||Vb(),c=Math.max(0, j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length; i>g; g++)j.tweens[g].run(f);return h.notifyWith(a, [j,f,c]),1>f&&i?c:(h.resolveWith(a, [j]),!1)},j=h.promise({elem:a,props:n.extend({}, b),opts:n.extend(!0, {specialEasing:{}}, c),originalProperties:b,originalOptions:c,startTime:Ob||Vb(),duration:c.duration,tweens:[],createTween:function(b,c){var d=n.Tween(a, j.opts, b, c, j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if (e)return this;for (e=!0; d>c; c++)j.tweens[c].run(1);return b?h.resolveWith(a, [j,b]):h.rejectWith(a, [j,b]),this}}),k=j.props;for (Zb(k, j.opts.specialEasing); g>f; f++)if (d=Tb[f].call(j, a, k, j.opts))return d;return n.map(k, Xb, j),n.isFunction(j.opts.start)&&j.opts.start.call(a, j),n.fx.timer(n.extend(i, {elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done, j.opts.complete).fail(j.opts.fail).always(j.opts.always)}n.Animation=n.extend($b, {tweener:function(a,b){n.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");for (var c,d=0,e=a.length; e>d; d++)c=a[d],Ub[c]=Ub[c]||[],Ub[c].unshift(b)},prefilter:function(a,b){b?Tb.unshift(a):Tb.push(a)}}),n.speed=function(a,b,c){var d=a&&"object"==typeof a?n.extend({}, a):{complete:c||!c&&b||n.isFunction(a)&&a,duration:a,easing:c&&b||b&&!n.isFunction(b)&&b};return d.duration=n.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in n.fx.speeds?n.fx.speeds[d.duration]:n.fx.speeds._default,(null==d.queue||d.queue===!0)&&(d.queue="fx"),d.old=d.complete,d.complete=function(){n.isFunction(d.old)&&d.old.call(this),d.queue&&n.dequeue(this, d.queue)},d},n.fn.extend({fadeTo:function(a,b,c,d){return this.filter(V).css("opacity", 0).show().end().animate({opacity:b}, a, c, d)},animate:function(a,b,c,d){var e=n.isEmptyObject(a),f=n.speed(b, c, d),g=function(){var b=$b(this, n.extend({}, a), f);(e||O.get(this, "finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue, g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return "string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx", []),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=n.timers,g=O.get(this);if (e)g[e]&&g[e].stop&&d(g[e]);else for (e in g)g[e]&&g[e].stop&&Sb.test(e)&&d(g[e]);for (e=f.length; e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e, 1));(b||!c)&&n.dequeue(this, a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=O.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=n.timers,g=d?d.length:0;for (c.finish=!0,n.queue(this, a, []),e&&e.stop&&e.stop.call(this, !0),b=f.length; b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b, 1));for (b=0; g>b; b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),n.each(["toggle","show","hide"], function(a,b){var c=n.fn[b];n.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this, arguments):this.animate(Wb(b, !0), a, d, e)}}),n.each({slideDown:Wb("show"),slideUp:Wb("hide"),slideToggle:Wb("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}}, function(a,b){n.fn[a]=function(a,c,d){return this.animate(b, a, c, d)}}),n.timers=[],n.fx.tick=function(){var a,b=0,c=n.timers;for (Ob=n.now(); b<c.length; b++)a=c[b],a()||c[b]!==a||c.splice(b--, 1);c.length||n.fx.stop(),Ob=void 0},n.fx.timer=function(a){n.timers.push(a),a()?n.fx.start():n.timers.pop()},n.fx.interval=13,n.fx.start=function(){Pb||(Pb=setInterval(n.fx.tick, n.fx.interval))},n.fx.stop=function(){clearInterval(Pb),Pb=null},n.fx.speeds={slow:600,fast:200,_default:400},n.fn.delay=function(a,b){return a=n.fx?n.fx.speeds[a]||a:a,b=b||"fx",this.queue(b, function(b,c){var d=setTimeout(b, a);c.stop=function(){clearTimeout(d)}})},function(){var a=l.createElement("input"),b=l.createElement("select"),c=b.appendChild(l.createElement("option"));a.type="checkbox",k.checkOn=""!==a.value,k.optSelected=c.selected,b.disabled=!0,k.optDisabled=!c.disabled,a=l.createElement("input"),a.value="t",a.type="radio",k.radioValue="t"===a.value}();var _b,ac,bc=n.expr.attrHandle;n.fn.extend({attr:function(a,b){return M(this, n.attr, a, b, arguments.length>1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this, a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if (a&&3!==f&&8!==f&&2!==f)return typeof a.getAttribute===X?n.prop(a, b, c):(1===f&&n.isXMLDoc(a)||(b=b.toLowerCase(),d=n.attrHooks[b]||(n.expr.match.bool.test(b)?ac:_b)),void 0===c?d&&"get"in d&&null!==(e=d.get(a, b))?e:(e=n.find.attr(a, b),null==e?void 0:e):null!==c?d&&"set"in d&&void 0!==(e=d.set(a, c, b))?e:(a.setAttribute(b, c+""),c):void n.removeAttr(a, b))},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(H);if (f&&1===a.nodeType)while (c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)},attrHooks:{type:{set:function(a,b){if (!k.radioValue&&"radio"===b&&n.nodeName(a, "input")){var c=a.value;return a.setAttribute("type", b),c&&(a.value=c),b}}}}}),ac={set:function(a,b,c){return b===!1?n.removeAttr(a, c):a.setAttribute(c, c),c}},n.each(n.expr.match.bool.source.match(/\w+/g), function(a,b){var c=bc[b]||n.find.attr;bc[b]=function(a,b,d){var e,f;return d||(f=bc[b],bc[b]=e,e=null!=c(a, b, d)?b.toLowerCase():null,bc[b]=f),e}});var cc=/^(?:input|select|textarea|button)$/i;n.fn.extend({prop:function(a,b){return M(this, n.prop, a, b, arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[n.propFix[a]||a]})}}),n.extend({propFix:{for:"htmlFor",class:"className"},prop:function(a,b,c){var d,e,f,g=a.nodeType;if (a&&3!==g&&8!==g&&2!==g)return f=1!==g||!n.isXMLDoc(a),f&&(b=n.propFix[b]||b,e=n.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a, c, b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a, b))?d:a[b]},propHooks:{tabIndex:{get:function(a){return a.hasAttribute("tabindex")||cc.test(a.nodeName)||a.href?a.tabIndex:-1}}}}),k.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"], function(){n.propFix[this.toLowerCase()]=this});var dc=/[\t\r\n\f]/g;n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h="string"==typeof a&&a,i=0,j=this.length;if (n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this, b, this.className))});if (h)for (b=(a||"").match(H)||[]; j>i; i++)if (c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(dc, " "):" ")){f=0;while (e=b[f++])d.indexOf(" "+e+" ")<0&&(d+=e+" ");g=n.trim(d),c.className!==g&&(c.className=g)}return this},removeClass:function(a){var b,c,d,e,f,g,h=0===arguments.length||"string"==typeof a&&a,i=0,j=this.length;if (n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this, b, this.className))});if (h)for (b=(a||"").match(H)||[]; j>i; i++)if (c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(dc, " "):"")){f=0;while (e=b[f++])while (d.indexOf(" "+e+" ")>=0)d=d.replace(" "+e+" ", " ");g=a?n.trim(d):"",c.className!==g&&(c.className=g)}return this},toggleClass:function(a,b){var c=typeof a;return "boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):this.each(n.isFunction(a)?function(c){n(this).toggleClass(a.call(this, c, this.className, b), b)}:function(){if ("string"===c){var b,d=0,e=n(this),f=a.match(H)||[];while (b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else (c===X||"boolean"===c)&&(this.className&&O.set(this, "__className__", this.className),this.className=this.className||a===!1?"":O.get(this, "__className__")||"")})},hasClass:function(a){for (var b=" "+a+" ",c=0,d=this.length; d>c; c++)if (1===this[c].nodeType&&(" "+this[c].className+" ").replace(dc, " ").indexOf(b)>=0)return !0;return !1}});var ec=/\r/g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if (arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this, c, n(this).val()):a,null==e?e="":"number"==typeof e?e+="":n.isArray(e)&&(e=n.map(e, function(a){return null==a?"":a+""})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this, e, "value")||(this.value=e))});if (e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e, "value"))?c:(c=e.value,"string"==typeof c?c.replace(ec, ""):null==c?"":c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a, "value");return null!=b?b:n.trim(n.text(a))}},select:{get:function(a){for (var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0; h>i; i++)if (c=d[i],!(!c.selected&&i!==e||(k.optDisabled?c.disabled:null!==c.getAttribute("disabled"))||c.parentNode.disabled&&n.nodeName(c.parentNode, "optgroup"))){if (b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while (g--)d=e[g],(d.selected=n.inArray(d.value, f)>=0)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),n.each(["radio","checkbox"], function(){n.valHooks[this]={set:function(a,b){return n.isArray(b)?a.checked=n.inArray(n(a).val(), b)>=0:void 0}},k.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})}),n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(a,b){n.fn[b]=function(a,c){return arguments.length>0?this.on(b, null, a, c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)},bind:function(a,b,c){return this.on(a, null, b, c)},unbind:function(a,b){return this.off(a, null, b)},delegate:function(a,b,c,d){return this.on(b, a, c, d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a, "**"):this.off(b, a||"**", c)}});var fc=n.now(),gc=/\?/;n.parseJSON=function(a){return JSON.parse(a+"")},n.parseXML=function(a){var b,c;if (!a||"string"!=typeof a)return null;try {c=new DOMParser,b=c.parseFromString(a, "text/xml")}catch (d){b=void 0}return (!b||b.getElementsByTagName("parsererror").length)&&n.error("Invalid XML: "+a),b};var hc,ic,jc=/#.*$/,kc=/([?&])_=[^&]*/,lc=/^(.*?):[ \t]*([^\r\n]*)$/gm,mc=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,nc=/^(?:GET|HEAD)$/,oc=/^\/\//,pc=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,qc={},rc={},sc="*/".concat("*");try {ic=location.href}catch (tc){ic=l.createElement("a"),ic.href="",ic=ic.href}hc=pc.exec(ic.toLowerCase())||[];function uc(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(H)||[];if (n.isFunction(c))while (d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function vc(a,b,c,d){var e={},f=a===rc;function g(h){var i;return e[h]=!0,n.each(a[h]||[], function(a,h){var j=h(b, c, d);return "string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function wc(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for (c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&n.extend(!0, a, d),a}function xc(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while ("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if (d)for (e in h)if (h[e]&&h[e].test(d)){i.unshift(e);break}if (i[0]in c)f=i[0];else {for (e in c){if (!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function yc(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if (k[1])for (g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while (f)if (a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b, a.dataType)),i=f,f=k.shift())if ("*"===f)f=i;else if ("*"!==i&&i!==f){if (g=j[i+" "+f]||j["* "+f],!g)for (e in j)if (h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if (g!==!0)if (g&&a["throws"])b=g(b);else try {b=g(b)}catch (l){return {state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return {state:"success",data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:ic,type:"GET",isLocal:mc.test(hc[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":sc,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":n.parseJSON,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?wc(wc(a, n.ajaxSettings), b):wc(n.ajaxSettings, a)},ajaxPrefilter:uc(qc),ajaxTransport:uc(rc),ajax:function(a,b){"object"==typeof a&&(b=a,a=void 0),b=b||{};var c,d,e,f,g,h,i,j,k=n.ajaxSetup({}, b),l=k.context||k,m=k.context&&(l.nodeType||l.jquery)?n(l):n.event,o=n.Deferred(),p=n.Callbacks("once memory"),q=k.statusCode||{},r={},s={},t=0,u="canceled",v={readyState:0,getResponseHeader:function(a){var b;if (2===t){if (!f){f={};while (b=lc.exec(e))f[b[1].toLowerCase()]=b[2]}b=f[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===t?e:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return t||(a=s[c]=s[c]||a,r[a]=b),this},overrideMimeType:function(a){return t||(k.mimeType=a),this},statusCode:function(a){var b;if (a)if (2>t)for (b in a)q[b]=[q[b],a[b]];else v.always(a[v.status]);return this},abort:function(a){var b=a||u;return c&&c.abort(b),x(0, b),this}};if (o.promise(v).complete=p.add,v.success=v.done,v.error=v.fail,k.url=((a||k.url||ic)+"").replace(jc, "").replace(oc, hc[1]+"//"),k.type=b.method||b.type||k.method||k.type,k.dataTypes=n.trim(k.dataType||"*").toLowerCase().match(H)||[""],null==k.crossDomain&&(h=pc.exec(k.url.toLowerCase()),k.crossDomain=!(!h||h[1]===hc[1]&&h[2]===hc[2]&&(h[3]||("http:"===h[1]?"80":"443"))===(hc[3]||("http:"===hc[1]?"80":"443")))),k.data&&k.processData&&"string"!=typeof k.data&&(k.data=n.param(k.data, k.traditional)),vc(qc, k, b, v),2===t)return v;i=k.global,i&&0===n.active++&&n.event.trigger("ajaxStart"),k.type=k.type.toUpperCase(),k.hasContent=!nc.test(k.type),d=k.url,k.hasContent||(k.data&&(d=k.url+=(gc.test(d)?"&":"?")+k.data,delete k.data),k.cache===!1&&(k.url=kc.test(d)?d.replace(kc, "$1_="+fc++):d+(gc.test(d)?"&":"?")+"_="+fc++)),k.ifModified&&(n.lastModified[d]&&v.setRequestHeader("If-Modified-Since", n.lastModified[d]),n.etag[d]&&v.setRequestHeader("If-None-Match", n.etag[d])),(k.data&&k.hasContent&&k.contentType!==!1||b.contentType)&&v.setRequestHeader("Content-Type", k.contentType),v.setRequestHeader("Accept", k.dataTypes[0]&&k.accepts[k.dataTypes[0]]?k.accepts[k.dataTypes[0]]+("*"!==k.dataTypes[0]?", "+sc+"; q=0.01":""):k.accepts["*"]);for (j in k.headers)v.setRequestHeader(j, k.headers[j]);if (k.beforeSend&&(k.beforeSend.call(l, v, k)===!1||2===t))return v.abort();u="abort";for (j in{success:1,error:1,complete:1})v[j](k[j]);if (c=vc(rc, k, b, v)){v.readyState=1,i&&m.trigger("ajaxSend", [v,k]),k.async&&k.timeout>0&&(g=setTimeout(function(){v.abort("timeout")}, k.timeout));try {t=1,c.send(r, x)}catch (w){if (!(2>t))throw w;x(-1, w)}}else x(-1, "No Transport");function x(a,b,f,h){var j,r,s,u,w,x=b;2!==t&&(t=2,g&&clearTimeout(g),c=void 0,e=h||"",v.readyState=a>0?4:0,j=a>=200&&300>a||304===a,f&&(u=xc(k, v, f)),u=yc(k, u, v, j),j?(k.ifModified&&(w=v.getResponseHeader("Last-Modified"),w&&(n.lastModified[d]=w),w=v.getResponseHeader("etag"),w&&(n.etag[d]=w)),204===a||"HEAD"===k.type?x="nocontent":304===a?x="notmodified":(x=u.state,r=u.data,s=u.error,j=!s)):(s=x,(a||!x)&&(x="error",0>a&&(a=0))),v.status=a,v.statusText=(b||x)+"",j?o.resolveWith(l, [r,x,v]):o.rejectWith(l, [v,x,s]),v.statusCode(q),q=void 0,i&&m.trigger(j?"ajaxSuccess":"ajaxError", [v,k,j?r:s]),p.fireWith(l, [v,x]),i&&(m.trigger("ajaxComplete", [v,k]),--n.active||n.event.trigger("ajaxStop")))}return v},getJSON:function(a,b,c){return n.get(a, b, c, "json")},getScript:function(a,b){return n.get(a, void 0, b, "script")}}),n.each(["get","post"], function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&&(e=e||d,d=c,c=void 0),n.ajax({url:a,type:b,dataType:e,data:c,success:d})}}),n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"], function(a,b){n.fn[b]=function(a){return this.on(b, a)}}),n._evalUrl=function(a){return n.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,throws:!0})};var zc=/%20/g,Ac=/\[\]$/,Bc=/\r?\n/g,Cc=/^(?:submit|button|image|reset|file)$/i,Dc=/^(?:input|select|textarea|keygen)/i;function Ec(a,b,c,d){var e;if (n.isArray(b))n.each(b, function(b,e){c||Ac.test(a)?d(a, e):Ec(a+"["+("object"==typeof e?b:"")+"]", e, c, d)});else if (c||"object"!==n.type(b))d(a, b);else for (e in b)Ec(a+"["+e+"]", b[e], c, d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if (void 0===b&&(b=n.ajaxSettings&&n.ajaxSettings.traditional),n.isArray(a)||a.jquery&&!n.isPlainObject(a))n.each(a, function(){e(this.name, this.value)});else for (c in a)Ec(c, a[c], b, e);return d.join("&").replace(zc, "+")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this, "elements");return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!n(this).is(":disabled")&&Dc.test(this.nodeName)&&!Cc.test(a)&&(this.checked||!W.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c, function(a){return {name:b.name,value:a.replace(Bc, "\r\n")}}):{name:b.name,value:c.replace(Bc, "\r\n")}}).get()}}),n.ajaxSettings.xhr=function(){try {return new XMLHttpRequest}catch (a){}};var Fc=0,Gc={},Hc={0:200,1223:204},Ic=n.ajaxSettings.xhr();a.ActiveXObject&&n(a).on("unload", function(){for (var a in Gc)Gc[a]()}),k.cors=!!Ic&&"withCredentials"in Ic,k.ajax=Ic=!!Ic,n.ajaxTransport(function(a){var b;return k.cors||Ic&&!a.crossDomain?{send:function(c,d){var e,f=a.xhr(),g=++Fc;if (f.open(a.type, a.url, a.async, a.username, a.password),a.xhrFields)for (e in a.xhrFields)f[e]=a.xhrFields[e];a.mimeType&&f.overrideMimeType&&f.overrideMimeType(a.mimeType),a.crossDomain||c["X-Requested-With"]||(c["X-Requested-With"]="XMLHttpRequest");for (e in c)f.setRequestHeader(e, c[e]);b=function(a){return function(){b&&(delete Gc[g],b=f.onload=f.onerror=null,"abort"===a?f.abort():"error"===a?d(f.status, f.statusText):d(Hc[f.status]||f.status, f.statusText, "string"==typeof f.responseText?{text:f.responseText}:void 0, f.getAllResponseHeaders()))}},f.onload=b(),f.onerror=b("error"),b=Gc[g]=b("abort");try {f.send(a.hasContent&&a.data||null)}catch (h){if (b)throw h}},abort:function(){b&&b()}}:void 0}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter("script", function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),n.ajaxTransport("script", function(a){if (a.crossDomain){var b,c;return {send:function(d,e){b=n("<script>").prop({async:!0,charset:a.scriptCharset,src:a.url}).on("load error", c=function(a){b.remove(),c=null,a&&e("error"===a.type?404:200, a.type)}),l.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Jc=[],Kc=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Jc.pop()||n.expando+"_"+fc++;return this[a]=!0,a}}),n.ajaxPrefilter("json jsonp", function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Kc.test(b.url)?"url":"string"==typeof b.data&&!(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Kc.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Kc, "$1"+e):b.jsonp!==!1&&(b.url+=(gc.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||n.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Jc.push(e)),g&&n.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),n.parseHTML=function(a,b,c){if (!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||l;var d=y.exec(a),e=!c&&[];return d?[b.createElement(d[1])]:(d=n.buildFragment([a], b, e),e&&e.length&&n(e).remove(),n.merge([], d.childNodes))};var Lc=n.fn.load;n.fn.load=function(a,b,c){if ("string"!=typeof a&&Lc)return Lc.apply(this, arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>=0&&(d=n.trim(a.slice(h)),a=a.slice(0, h)),n.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&n.ajax({url:a,type:e,dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?n("<div>").append(n.parseHTML(a)).find(d):a)}).complete(c&&function(a,b){g.each(c, f||[a.responseText,b,a])}),this},"function"==typeof define&&define.amd&&define("jquery", [], function(){return n});var Mc=a.jQuery,Nc=a.$;return n.noConflict=function(b){return a.$===n&&(a.$=Nc),b&&a.jQuery===n&&(a.jQuery=Mc),n},typeof b===X&&(a.jQuery=a.$=n),n});
//# sourceMappingURL=jquery.min.map
/*! loglevel - v1.4.0 - https://github.com/pimterry/loglevel - (c) 2015 Tim Perry - licensed MIT */
(function (root, definition) {
    "use strict";
    if (typeof module === 'object' && module.exports && typeof require === 'function') {
        module.exports = definition();
    } else if (typeof define === 'function' && typeof define.amd === 'object') {
        define(definition);
    } else {
        root.log = definition();
    }
}(this, function () {
    "use strict";
    var noop = function() {};
    var undefinedType = "undefined";

    function realMethod(methodName) {
        if (typeof console === undefinedType) {
            return false; // We can't build a real method without a console to log to
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    // these private functions always need `this` to be set properly

    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods.call(this, level, loggerName);
                this[methodName].apply(this, arguments);
            }
        };
    }

    function replaceLoggingMethods(level, loggerName) {
        /*jshint validthis:true */
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this[methodName] = (i < level) ?
                noop :
                this.methodFactory(methodName, level, loggerName);
        }
    }

    function defaultMethodFactory(methodName, level, loggerName) {
        /*jshint validthis:true */
        return realMethod(methodName) ||
               enableLoggingWhenConsoleArrives.apply(this, arguments);
    }

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    function Logger(name, defaultLevel, factory) {
      var self = this;
      var currentLevel;
      var storageKey = "loglevel";
      if (name) {
        storageKey += ":" + name;
      }

      function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

          // Use localStorage if available
          try {
              window.localStorage[storageKey] = levelName;
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {}
      }

      function getPersistedLevel() {
          var storedLevel;

          try {
              storedLevel = window.localStorage[storageKey];
          } catch (ignore) {}

          if (typeof storedLevel === undefinedType) {
              try {
                  var cookie = window.document.cookie;
                  var location = cookie.indexOf(
                      encodeURIComponent(storageKey) + "=");
                  if (location) {
                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                  }
              } catch (ignore) {}
          }

          // If the stored level is not valid, treat it as if nothing was stored.
          if (self.levels[storedLevel] === undefined) {
              storedLevel = undefined;
          }

          return storedLevel;
      }

      /*
       *
       * Public API
       *
       */

      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
          "ERROR": 4, "SILENT": 5};

      self.methodFactory = factory || defaultMethodFactory;

      self.getLevel = function () {
          return currentLevel;
      };

      self.setLevel = function (level, persist) {
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
              level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
              currentLevel = level;
              if (persist !== false) {  // defaults to true
                  persistLevelIfPossible(level);
              }
              replaceLoggingMethods.call(self, level, name);
              if (typeof console === undefinedType && level < self.levels.SILENT) {
                  return "No console available for logging";
              }
          } else {
              throw "log.setLevel() called with invalid level: " + level;
          }
      };

      self.setDefaultLevel = function (level) {
          if (!getPersistedLevel()) {
              self.setLevel(level, false);
          }
      };

      self.enableAll = function(persist) {
          self.setLevel(self.levels.TRACE, persist);
      };

      self.disableAll = function(persist) {
          self.setLevel(self.levels.SILENT, persist);
      };

      // Initialize with the right level
      var initialLevel = getPersistedLevel();
      if (initialLevel == null) {
          initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
      }
      self.setLevel(initialLevel, false);
    }

    /*
     *
     * Package-level API
     *
     */

    var defaultLogger = new Logger();

    var _loggersByName = {};
    defaultLogger.getLogger = function getLogger(name) {
        if (typeof name !== "string" || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }

        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
        }
        return logger;
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    return defaultLogger;
}));
/*!
 * pixi.js - v4.0.0
 * Compiled Wed Aug 24 2016 13:19:01 GMT+0100 (BST)
 *
 * pixi.js is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.PIXI=t()}}(function(){var t;return function t(e,r,i){function n(o,a){if(!r[o]){if(!e[o]){var h="function"==typeof require&&require;if(!a&&h)return h(o,!0);if(s)return s(o,!0);var u=new Error("Cannot find module '"+o+"'");throw u.code="MODULE_NOT_FOUND",u}var l=r[o]={exports:{}};e[o][0].call(l.exports,function(t){var r=e[o][1][t];return n(r?r:t)},l,l.exports,t,e,r,i)}return r[o].exports}for(var s="function"==typeof require&&require,o=0;o<i.length;o++)n(i[o]);return n}({1:[function(t,e,r){var i=new ArrayBuffer(0),n=function(t,e,r,n){this.gl=t,this.buffer=t.createBuffer(),this.type=e||t.ARRAY_BUFFER,this.drawType=n||t.STATIC_DRAW,this.data=i,r&&this.upload(r)};n.prototype.upload=function(t,e,r){r||this.bind();var i=this.gl;t=t||this.data,e=e||0,this.data.byteLength>=t.byteLength?i.bufferSubData(this.type,e,t):i.bufferData(this.type,t,this.drawType),this.data=t},n.prototype.bind=function(){var t=this.gl;t.bindBuffer(this.type,this.buffer)},n.createVertexBuffer=function(t,e,r){return new n(t,t.ARRAY_BUFFER,e,r)},n.createIndexBuffer=function(t,e,r){return new n(t,t.ELEMENT_ARRAY_BUFFER,e,r)},n.create=function(t,e,r,i){return new n(t,e,r,i)},n.prototype.destroy=function(){this.gl.deleteBuffer(this.buffer)},e.exports=n},{}],2:[function(t,e,r){var i=t("./GLTexture"),n=function(t,e,r){this.gl=t,this.framebuffer=t.createFramebuffer(),this.stencil=null,this.texture=null,this.width=e||100,this.height=r||100};n.prototype.enableTexture=function(t){var e=this.gl;this.texture=t||new i(e),this.texture.bind(),this.bind(),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,this.texture.texture,0)},n.prototype.enableStencil=function(){if(!this.stencil){var t=this.gl;this.stencil=t.createRenderbuffer(),t.bindRenderbuffer(t.RENDERBUFFER,this.stencil),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.RENDERBUFFER,this.stencil),t.renderbufferStorage(t.RENDERBUFFER,t.DEPTH_STENCIL,this.width,this.height)}},n.prototype.clear=function(t,e,r,i){this.bind();var n=this.gl;n.clearColor(t,e,r,i),n.clear(n.COLOR_BUFFER_BIT)},n.prototype.bind=function(){var t=this.gl;this.texture&&this.texture.unbind(),t.bindFramebuffer(t.FRAMEBUFFER,this.framebuffer)},n.prototype.unbind=function(){var t=this.gl;t.bindFramebuffer(t.FRAMEBUFFER,null)},n.prototype.resize=function(t,e){var r=this.gl;this.width=t,this.height=e,this.texture&&this.texture.uploadData(null,t,e),this.stencil&&(r.bindRenderbuffer(r.RENDERBUFFER,this.stencil),r.renderbufferStorage(r.RENDERBUFFER,r.DEPTH_STENCIL,t,e))},n.prototype.destroy=function(){var t=this.gl;this.texture&&this.texture.destroy(),t.deleteFramebuffer(this.framebuffer),this.gl=null,this.stencil=null,this.texture=null},n.createRGBA=function(t,e,r,s){var o=i.fromData(t,null,e,r);o.enableNearestScaling(),o.enableWrapClamp();var a=new n(t,e,r);return a.enableTexture(o),a.unbind(),a},n.createFloat32=function(t,e,r,s){var o=new i.fromData(t,s,e,r);o.enableNearestScaling(),o.enableWrapClamp();var a=new n(t,e,r);return a.enableTexture(o),a.unbind(),a},e.exports=n},{"./GLTexture":4}],3:[function(t,e,r){var i=t("./shader/compileProgram"),n=t("./shader/extractAttributes"),s=t("./shader/extractUniforms"),o=t("./shader/generateUniformAccessObject"),a=function(t,e,r){this.gl=t,this.program=i(t,e,r),this.attributes=n(t,this.program);var a=s(t,this.program);this.uniforms=o(t,a)};a.prototype.bind=function(){this.gl.useProgram(this.program)},a.prototype.destroy=function(){},e.exports=a},{"./shader/compileProgram":9,"./shader/extractAttributes":11,"./shader/extractUniforms":12,"./shader/generateUniformAccessObject":13}],4:[function(t,e,r){var i=function(t,e,r,i,n){this.gl=t,this.texture=t.createTexture(),this.mipmap=!1,this.premultiplyAlpha=!1,this.width=e||-1,this.height=r||-1,this.format=i||t.RGBA,this.type=n||t.UNSIGNED_BYTE};i.prototype.upload=function(t){this.bind();var e=this.gl;e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,this.premultiplyAlpha);var r=t.videoWidth||t.width,i=t.videoHeight||t.height;i!==this.height||r!==this.width?e.texImage2D(e.TEXTURE_2D,0,this.format,this.format,this.type,t):e.texSubImage2D(e.TEXTURE_2D,0,0,0,this.format,this.type,t),this.width=r,this.height=i};var n=!1;i.prototype.uploadData=function(t,e,r){this.bind();var i=this.gl;if(t instanceof Float32Array){if(!n){var s=i.getExtension("OES_texture_float");if(!s)throw new Error("floating point textures not available");n=!0}this.type=i.FLOAT}else this.type=i.UNSIGNED_BYTE;i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,this.premultiplyAlpha),e!==this.width||r!==this.height?i.texImage2D(i.TEXTURE_2D,0,this.format,e,r,0,this.format,this.type,t||null):i.texSubImage2D(i.TEXTURE_2D,0,0,0,e,r,this.format,this.type,t||null),this.width=e,this.height=r},i.prototype.bind=function(t){var e=this.gl;void 0!==t&&e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,this.texture)},i.prototype.unbind=function(){var t=this.gl;t.bindTexture(t.TEXTURE_2D,null)},i.prototype.minFilter=function(t){var e=this.gl;this.bind(),this.mipmap?e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,t?e.LINEAR_MIPMAP_LINEAR:e.NEAREST_MIPMAP_NEAREST):e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,t?e.LINEAR:e.NEAREST)},i.prototype.magFilter=function(t){var e=this.gl;this.bind(),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,t?e.LINEAR:e.NEAREST)},i.prototype.enableMipmap=function(){var t=this.gl;this.bind(),this.mipmap=!0,t.generateMipmap(t.TEXTURE_2D)},i.prototype.enableLinearScaling=function(){this.minFilter(!0),this.magFilter(!0)},i.prototype.enableNearestScaling=function(){this.minFilter(!1),this.magFilter(!1)},i.prototype.enableWrapClamp=function(){var t=this.gl;this.bind(),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE)},i.prototype.enableWrapRepeat=function(){var t=this.gl;this.bind(),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.REPEAT),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.REPEAT)},i.prototype.enableWrapMirrorRepeat=function(){var t=this.gl;this.bind(),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.MIRRORED_REPEAT),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.MIRRORED_REPEAT)},i.prototype.destroy=function(){var t=this.gl;t.deleteTexture(this.texture)},i.fromSource=function(t,e,r){var n=new i(t);return n.premultiplyAlpha=r||!1,n.upload(e),n},i.fromData=function(t,e,r,n){var s=new i(t);return s.uploadData(e,r,n),s},e.exports=i},{}],5:[function(t,e,r){function i(t,e){if(this.nativeVaoExtension=null,i.FORCE_NATIVE||(this.nativeVaoExtension=t.getExtension("OES_vertex_array_object")||t.getExtension("MOZ_OES_vertex_array_object")||t.getExtension("WEBKIT_OES_vertex_array_object")),this.nativeState=e,this.nativeVaoExtension){this.nativeVao=this.nativeVaoExtension.createVertexArrayOES();var r=t.getParameter(t.MAX_VERTEX_ATTRIBS);this.nativeState={tempAttribState:new Array(r),attribState:new Array(r)}}this.gl=t,this.attributes=[],this.indexBuffer=null,this.dirty=!1}var n=t("./setVertexAttribArrays");i.prototype.constructor=i,e.exports=i,i.FORCE_NATIVE=!1,i.prototype.bind=function(){return this.nativeVao?(this.nativeVaoExtension.bindVertexArrayOES(this.nativeVao),this.dirty&&(this.dirty=!1,this.activate())):this.activate(),this},i.prototype.unbind=function(){return this.nativeVao&&this.nativeVaoExtension.bindVertexArrayOES(null),this},i.prototype.activate=function(){for(var t=this.gl,e=null,r=0;r<this.attributes.length;r++){var i=this.attributes[r];e!==i.buffer&&(i.buffer.bind(),e=i.buffer),t.vertexAttribPointer(i.attribute.location,i.attribute.size,i.type||t.FLOAT,i.normalized||!1,i.stride||0,i.start||0)}return n(t,this.attributes,this.nativeState),this.indexBuffer.bind(),this},i.prototype.addAttribute=function(t,e,r,i,n,s){return this.attributes.push({buffer:t,attribute:e,location:e.location,type:r||this.gl.FLOAT,normalized:i||!1,stride:n||0,start:s||0}),this.dirty=!0,this},i.prototype.addIndex=function(t){return this.indexBuffer=t,this.dirty=!0,this},i.prototype.clear=function(){return this.nativeVao&&this.nativeVaoExtension.bindVertexArrayOES(this.nativeVao),this.attributes.length=0,this.indexBuffer=null,this},i.prototype.draw=function(t,e,r){var i=this.gl;return i.drawElements(t,e,i.UNSIGNED_SHORT,r||0),this},i.prototype.destroy=function(){this.gl=null,this.indexBuffer=null,this.attributes=null,this.nativeState=null,this.nativeVao&&this.nativeVaoExtension.deleteVertexArrayOES(this.nativeVao),this.nativeVaoExtension=null,this.nativeVao=null}},{"./setVertexAttribArrays":8}],6:[function(t,e,r){var i=function(t,e){var r=t.getContext("webgl",e)||t.getContext("experimental-webgl",e);if(!r)throw new Error("This browser does not support webGL. Try using the canvas renderer");return r};e.exports=i},{}],7:[function(t,e,r){var i={createContext:t("./createContext"),setVertexAttribArrays:t("./setVertexAttribArrays"),GLBuffer:t("./GLBuffer"),GLFramebuffer:t("./GLFramebuffer"),GLShader:t("./GLShader"),GLTexture:t("./GLTexture"),VertexArrayObject:t("./VertexArrayObject"),shader:t("./shader")};"undefined"!=typeof e&&e.exports&&(e.exports=i),"undefined"!=typeof window&&(window.PIXI=window.PIXI||{},window.PIXI.glCore=i)},{"./GLBuffer":1,"./GLFramebuffer":2,"./GLShader":3,"./GLTexture":4,"./VertexArrayObject":5,"./createContext":6,"./setVertexAttribArrays":8,"./shader":14}],8:[function(t,e,r){var i=function(t,e,r){var i;if(r){var n=r.tempAttribState,s=r.attribState;for(i=0;i<n.length;i++)n[i]=!1;for(i=0;i<e.length;i++)n[e[i].attribute.location]=!0;for(i=0;i<s.length;i++)s[i]!==n[i]&&(s[i]=n[i],r.attribState[i]?t.enableVertexAttribArray(i):t.disableVertexAttribArray(i))}else for(i=0;i<e.length;i++){var o=e[i];t.enableVertexAttribArray(o.attribute.location)}};e.exports=i},{}],9:[function(t,e,r){var i=function(t,e,r){var i=n(t,t.VERTEX_SHADER,e),s=n(t,t.FRAGMENT_SHADER,r),o=t.createProgram();return t.attachShader(o,i),t.attachShader(o,s),t.linkProgram(o),t.getProgramParameter(o,t.LINK_STATUS)||(console.error("Pixi.js Error: Could not initialize shader."),console.error("gl.VALIDATE_STATUS",t.getProgramParameter(o,t.VALIDATE_STATUS)),console.error("gl.getError()",t.getError()),""!==t.getProgramInfoLog(o)&&console.warn("Pixi.js Warning: gl.getProgramInfoLog()",t.getProgramInfoLog(o)),t.deleteProgram(o),o=null),t.deleteShader(i),t.deleteShader(s),o},n=function(t,e,r){var i=t.createShader(e);return t.shaderSource(i,r),t.compileShader(i),t.getShaderParameter(i,t.COMPILE_STATUS)?i:(console.log(t.getShaderInfoLog(i)),null)};e.exports=i},{}],10:[function(t,e,r){var i=function(t,e){switch(t){case"float":return 0;case"vec2":return new Float32Array(2*e);case"vec3":return new Float32Array(3*e);case"vec4":return new Float32Array(4*e);case"int":case"sampler2D":return 0;case"ivec2":return new Int32Array(2*e);case"ivec3":return new Int32Array(3*e);case"ivec4":return new Int32Array(4*e);case"bool":return!1;case"bvec2":return n(2*e);case"bvec3":return n(3*e);case"bvec4":return n(4*e);case"mat2":return new Float32Array([1,0,0,1]);case"mat3":return new Float32Array([1,0,0,0,1,0,0,0,1]);case"mat4":return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}},n=function(t){for(var e=new Array(t),r=0;r<e.length;r++)e[r]=!1;return e};e.exports=i},{}],11:[function(t,e,r){var i=t("./mapType"),n=t("./mapSize"),s=function(t,e){for(var r={},s=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES),a=0;a<s;a++){var h=t.getActiveAttrib(e,a),u=i(t,h.type);r[h.name]={type:u,size:n(u),location:t.getAttribLocation(e,h.name),pointer:o}}return r},o=function(t,e,r,i){gl.vertexAttribPointer(this.location,this.size,t||gl.FLOAT,e||!1,r||0,i||0)};e.exports=s},{"./mapSize":15,"./mapType":16}],12:[function(t,e,r){var i=t("./mapType"),n=t("./defaultValue"),s=function(t,e){for(var r={},s=t.getProgramParameter(e,t.ACTIVE_UNIFORMS),o=0;o<s;o++){var a=t.getActiveUniform(e,o),h=a.name.replace(/\[.*?\]/,""),u=i(t,a.type);r[h]={type:u,size:a.size,location:t.getUniformLocation(e,h),value:n(u,a.size)}}return r};e.exports=s},{"./defaultValue":10,"./mapType":16}],13:[function(t,e,r){var i=function(t,e){var r={data:{}};r.gl=t;for(var i=Object.keys(e),a=0;a<i.length;a++){var h=i[a],u=h.split("."),l=u[u.length-1],c=o(u,r),d=e[h];c.data[l]=d,c.gl=t,Object.defineProperty(c,l,{get:n(l),set:s(l,d)})}return r},n=function(t){var e=a.replace("%%",t);return new Function(e)},s=function(t,e){var r,i=h.replace(/%%/g,t);return r=1===e.size?u[e.type]:l[e.type],r&&(i+="\nthis.gl."+r+";"),new Function("value",i)},o=function(t,e){for(var r=e,i=0;i<t.length-1;i++){var n=r[t[i]]||{data:{}};r[t[i]]=n,r=n}return r},a=["return this.data.%%.value;"].join("\n"),h=["this.data.%%.value = value;","var location = this.data.%%.location;"].join("\n"),u={float:"uniform1f(location, value)",vec2:"uniform2f(location, value[0], value[1])",vec3:"uniform3f(location, value[0], value[1], value[2])",vec4:"uniform4f(location, value[0], value[1], value[2], value[3])",int:"uniform1i(location, value)",ivec2:"uniform2i(location, value[0], value[1])",ivec3:"uniform3i(location, value[0], value[1], value[2])",ivec4:"uniform4i(location, value[0], value[1], value[2], value[3])",bool:"uniform1i(location, value)",bvec2:"uniform2i(location, value[0], value[1])",bvec3:"uniform3i(location, value[0], value[1], value[2])",bvec4:"uniform4i(location, value[0], value[1], value[2], value[3])",mat2:"uniformMatrix2fv(location, false, value)",mat3:"uniformMatrix3fv(location, false, value)",mat4:"uniformMatrix4fv(location, false, value)",sampler2D:"uniform1i(location, value)"},l={float:"uniform1fv(location, value)",vec2:"uniform2fv(location, value)",vec3:"uniform3fv(location, value)",vec4:"uniform4fv(location, value)",int:"uniform1iv(location, value)",ivec2:"uniform2iv(location, value)",ivec3:"uniform3iv(location, value)",ivec4:"uniform4iv(location, value)",bool:"uniform1iv(location, value)",bvec2:"uniform2iv(location, value)",bvec3:"uniform3iv(location, value)",bvec4:"uniform4iv(location, value)",sampler2D:"uniform1iv(location, value)"};e.exports=i},{}],14:[function(t,e,r){e.exports={compileProgram:t("./compileProgram"),defaultValue:t("./defaultValue"),extractAttributes:t("./extractAttributes"),extractUniforms:t("./extractUniforms"),generateUniformAccessObject:t("./generateUniformAccessObject"),mapSize:t("./mapSize"),mapType:t("./mapType")}},{"./compileProgram":9,"./defaultValue":10,"./extractAttributes":11,"./extractUniforms":12,"./generateUniformAccessObject":13,"./mapSize":15,"./mapType":16}],15:[function(t,e,r){var i=function(t){return n[t]},n={float:1,vec2:2,vec3:3,vec4:4,int:1,ivec2:2,ivec3:3,ivec4:4,bool:1,bvec2:2,bvec3:3,bvec4:4,mat2:4,mat3:9,mat4:16,sampler2D:1};e.exports=i},{}],16:[function(t,e,r){var i=function(t,e){if(!n){var r=Object.keys(s);n={};for(var i=0;i<r.length;++i){var o=r[i];n[t[o]]=s[o]}}return n[e]},n=null,s={FLOAT:"float",FLOAT_VEC2:"vec2",FLOAT_VEC3:"vec3",FLOAT_VEC4:"vec4",INT:"int",INT_VEC2:"ivec2",INT_VEC3:"ivec3",INT_VEC4:"ivec4",BOOL:"bool",BOOL_VEC2:"bvec2",BOOL_VEC3:"bvec3",BOOL_VEC4:"bvec4",FLOAT_MAT2:"mat2",FLOAT_MAT3:"mat3",FLOAT_MAT4:"mat4",SAMPLER_2D:"sampler2D"};e.exports=i},{}],17:[function(t,e,r){"use strict";function i(t){return t&&t.__esModule?t:{default:t}}function n(t,e,r,i){(0,o.default)(e)(t,(0,h.default)(r),i)}Object.defineProperty(r,"__esModule",{value:!0}),r.default=n;var s=t("./internal/eachOfLimit"),o=i(s),a=t("./internal/withoutIndex"),h=i(a);e.exports=r.default},{"./internal/eachOfLimit":21,"./internal/withoutIndex":28}],18:[function(t,e,r){"use strict";function i(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(r,"__esModule",{value:!0});var n=t("./eachLimit"),s=i(n),o=t("./internal/doLimit"),a=i(o);r.default=(0,a.default)(s.default,1),e.exports=r.default},{"./eachLimit":17,"./internal/doLimit":20}],19:[function(t,e,r){"use strict";function i(){this.head=this.tail=null,this.length=0}function n(t,e){t.length=1,t.head=t.tail=e}Object.defineProperty(r,"__esModule",{value:!0}),r.default=i,i.prototype.removeLink=function(t){return t.prev?t.prev.next=t.next:this.head=t.next,t.next?t.next.prev=t.prev:this.tail=t.prev,t.prev=t.next=null,this.length-=1,t},i.prototype.empty=i,i.prototype.insertAfter=function(t,e){e.prev=t,e.next=t.next,t.next?t.next.prev=e:this.tail=e,t.next=e,this.length+=1},i.prototype.insertBefore=function(t,e){e.prev=t.prev,e.next=t,t.prev?t.prev.next=e:this.head=e,t.prev=e,this.length+=1},i.prototype.unshift=function(t){this.head?this.insertBefore(this.head,t):n(this,t)},i.prototype.push=function(t){this.tail?this.insertAfter(this.tail,t):n(this,t)},i.prototype.shift=function(){return this.head&&this.removeLink(this.head)},i.prototype.pop=function(){return this.tail&&this.removeLink(this.tail)},e.exports=r.default},{}],20:[function(t,e,r){"use strict";function i(t,e){return function(r,i,n){return t(r,e,i,n)}}Object.defineProperty(r,"__esModule",{value:!0}),r.default=i,e.exports=r.default},{}],21:[function(t,e,r){"use strict";function i(t){return t&&t.__esModule?t:{default:t}}function n(t){return function(e,r,i){function n(t){if(c-=1,t)u=!0,i(t);else{if(u&&c<=0)return i(null);s()}}function s(){for(;c<t&&!u;){var e=a();if(null===e)return u=!0,void(c<=0&&i(null));c+=1,r(e.value,e.key,(0,d.default)(n))}}if(i=(0,h.default)(i||o.default),t<=0||!e)return i(null);var a=(0,l.default)(e),u=!1,c=0;s()}}Object.defineProperty(r,"__esModule",{value:!0}),r.default=n;var s=t("lodash/noop"),o=i(s),a=t("./once"),h=i(a),u=t("./iterator"),l=i(u),c=t("./onlyOnce"),d=i(c);e.exports=r.default},{"./iterator":23,"./once":24,"./onlyOnce":25,"lodash/noop":54}],22:[function(t,e,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.default=function(t){return i&&t[i]&&t[i]()};var i="function"==typeof Symbol&&Symbol.iterator;e.exports=r.default},{}],23:[function(t,e,r){"use strict";function i(t){return t&&t.__esModule?t:{default:t}}function n(t){var e=-1,r=t.length;return function(){return++e<r?{value:t[e],key:e}:null}}function s(t){var e=-1;return function(){var r=t.next();return r.done?null:(e++,{value:r.value,key:e})}}function o(t){var e=(0,p.default)(t),r=-1,i=e.length;return function(){var n=e[++r];return r<i?{value:t[n],key:n}:null}}function a(t){if((0,u.default)(t))return n(t);var e=(0,c.default)(t);return e?s(e):o(t)}Object.defineProperty(r,"__esModule",{value:!0}),r.default=a;var h=t("lodash/isArrayLike"),u=i(h),l=t("./getIterator"),c=i(l),d=t("lodash/keys"),p=i(d);e.exports=r.default},{"./getIterator":22,"lodash/isArrayLike":46,"lodash/keys":53}],24:[function(t,e,r){"use strict";function i(t){return function(){if(null!==t){var e=t;t=null,e.apply(this,arguments)}}}Object.defineProperty(r,"__esModule",{value:!0}),r.default=i,e.exports=r.default},{}],25:[function(t,e,r){"use strict";function i(t){return function(){if(null===t)throw new Error("Callback was already called.");var e=t;t=null,e.apply(this,arguments)}}Object.defineProperty(r,"__esModule",{value:!0}),r.default=i,e.exports=r.default},{}],26:[function(t,e,r){"use strict";function i(t){return t&&t.__esModule?t:{default:t}}function n(t,e,r){function i(t,e,r){if(null!=r&&"function"!=typeof r)throw new Error("task callback must be a function");return u.started=!0,(0,h.default)(t)||(t=[t]),0===t.length&&u.idle()?(0,g.default)(function(){u.drain()}):((0,o.default)(t,function(t){var i={data:t,callback:r||l.default};e?u._tasks.unshift(i):u._tasks.push(i)}),void(0,g.default)(u.process))}function n(t){return(0,d.default)(function(e){s-=1,(0,o.default)(t,function(t){(0,o.default)(a,function(e,r){if(e===t)return a.splice(r,1),!1}),t.callback.apply(t,e),null!=e[0]&&u.error(e[0],t.data)}),s<=u.concurrency-u.buffer&&u.unsaturated(),u.idle()&&u.drain(),u.process()})}if(null==e)e=1;else if(0===e)throw new Error("Concurrency must not be zero");var s=0,a=[],u={_tasks:new x.default,concurrency:e,payload:r,saturated:l.default,unsaturated:l.default,buffer:e/4,empty:l.default,drain:l.default,error:l.default,started:!1,paused:!1,push:function(t,e){i(t,!1,e)},kill:function(){u.drain=l.default,u._tasks.empty()},unshift:function(t,e){i(t,!0,e)},process:function(){for(;!u.paused&&s<u.concurrency&&u._tasks.length;){var e=[],r=[],i=u._tasks.length;u.payload&&(i=Math.min(i,u.payload));for(var o=0;o<i;o++){var h=u._tasks.shift();e.push(h),r.push(h.data)}0===u._tasks.length&&u.empty(),s+=1,a.push(e[0]),s===u.concurrency&&u.saturated();var l=(0,f.default)(n(e));t(r,l)}},length:function(){return u._tasks.length},running:function(){return s},workersList:function(){return a},idle:function(){return u._tasks.length+s===0},pause:function(){u.paused=!0},resume:function(){if(u.paused!==!1){u.paused=!1;for(var t=Math.min(u.concurrency,u._tasks.length),e=1;e<=t;e++)(0,g.default)(u.process)}}};return u}Object.defineProperty(r,"__esModule",{value:!0}),r.default=n;var s=t("lodash/_arrayEach"),o=i(s),a=t("lodash/isArray"),h=i(a),u=t("lodash/noop"),l=i(u),c=t("lodash/rest"),d=i(c),p=t("./onlyOnce"),f=i(p),v=t("./setImmediate"),g=i(v),y=t("./DoublyLinkedList"),x=i(y);e.exports=r.default},{"./DoublyLinkedList":19,"./onlyOnce":25,"./setImmediate":27,"lodash/_arrayEach":35,"lodash/isArray":45,"lodash/noop":54,"lodash/rest":55}],27:[function(t,e,r){(function(e){"use strict";function i(t){return t&&t.__esModule?t:{default:t}}function n(t){setTimeout(t,0)}function s(t){return(0,h.default)(function(e,r){t(function(){e.apply(null,r)})})}Object.defineProperty(r,"__esModule",{value:!0}),r.hasNextTick=r.hasSetImmediate=void 0,r.fallback=n,r.wrap=s;var o,a=t("lodash/rest"),h=i(a),u=r.hasSetImmediate="function"==typeof setImmediate&&setImmediate,l=r.hasNextTick="object"==typeof e&&"function"==typeof e.nextTick;o=u?setImmediate:l?e.nextTick:n,r.default=s(o)}).call(this,t("_process"))},{_process:61,"lodash/rest":55}],28:[function(t,e,r){"use strict";function i(t){return function(e,r,i){return t(e,i)}}Object.defineProperty(r,"__esModule",{value:!0}),r.default=i,e.exports=r.default},{}],29:[function(t,e,r){"use strict";function i(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(r,"__esModule",{value:!0}),r.default=function(t,e){return(0,s.default)(function(e,r){t(e[0],r)},e,1)};var n=t("./internal/queue"),s=i(n);e.exports=r.default},{"./internal/queue":26}],30:[function(t,e,r){"use strict";"use restrict";function i(t){var e=32;return t&=-t,t&&e--,65535&t&&(e-=16),16711935&t&&(e-=8),252645135&t&&(e-=4),858993459&t&&(e-=2),1431655765&t&&(e-=1),e}var n=32;r.INT_BITS=n,r.INT_MAX=2147483647,r.INT_MIN=-1<<n-1,r.sign=function(t){return(t>0)-(t<0)},r.abs=function(t){var e=t>>n-1;return(t^e)-e},r.min=function(t,e){return e^(t^e)&-(t<e)},r.max=function(t,e){return t^(t^e)&-(t<e)},r.isPow2=function(t){return!(t&t-1||!t)},r.log2=function(t){var e,r;return e=(t>65535)<<4,t>>>=e,r=(t>255)<<3,t>>>=r,e|=r,r=(t>15)<<2,t>>>=r,e|=r,r=(t>3)<<1,t>>>=r,e|=r,e|t>>1},r.log10=function(t){return t>=1e9?9:t>=1e8?8:t>=1e7?7:t>=1e6?6:t>=1e5?5:t>=1e4?4:t>=1e3?3:t>=100?2:t>=10?1:0},r.popCount=function(t){return t-=t>>>1&1431655765,t=(858993459&t)+(t>>>2&858993459),16843009*(t+(t>>>4)&252645135)>>>24},r.countTrailingZeros=i,r.nextPow2=function(t){return t+=0===t,--t,t|=t>>>1,t|=t>>>2,t|=t>>>4,t|=t>>>8,t|=t>>>16,t+1},r.prevPow2=function(t){return t|=t>>>1,t|=t>>>2,t|=t>>>4,t|=t>>>8,t|=t>>>16,t-(t>>>1)},r.parity=function(t){return t^=t>>>16,t^=t>>>8,t^=t>>>4,t&=15,27030>>>t&1};var s=new Array(256);!function(t){for(var e=0;e<256;++e){var r=e,i=e,n=7;for(r>>>=1;r;r>>>=1)i<<=1,i|=1&r,--n;t[e]=i<<n&255}}(s),r.reverse=function(t){return s[255&t]<<24|s[t>>>8&255]<<16|s[t>>>16&255]<<8|s[t>>>24&255]},r.interleave2=function(t,e){return t&=65535,t=16711935&(t|t<<8),t=252645135&(t|t<<4),t=858993459&(t|t<<2),t=1431655765&(t|t<<1),e&=65535,e=16711935&(e|e<<8),e=252645135&(e|e<<4),e=858993459&(e|e<<2),e=1431655765&(e|e<<1),t|e<<1},r.deinterleave2=function(t,e){return t=t>>>e&1431655765,t=858993459&(t|t>>>1),t=252645135&(t|t>>>2),t=16711935&(t|t>>>4),t=65535&(t|t>>>16),t<<16>>16},r.interleave3=function(t,e,r){return t&=1023,t=4278190335&(t|t<<16),t=251719695&(t|t<<8),t=3272356035&(t|t<<4),t=1227133513&(t|t<<2),e&=1023,e=4278190335&(e|e<<16),e=251719695&(e|e<<8),e=3272356035&(e|e<<4),e=1227133513&(e|e<<2),t|=e<<1,r&=1023,r=4278190335&(r|r<<16),r=251719695&(r|r<<8),r=3272356035&(r|r<<4),r=1227133513&(r|r<<2),t|r<<2},r.deinterleave3=function(t,e){return t=t>>>e&1227133513,t=3272356035&(t|t>>>2),t=251719695&(t|t>>>4),t=4278190335&(t|t>>>8),t=1023&(t|t>>>16),t<<22>>22},r.nextCombination=function(t){var e=t|t-1;return e+1|(~e&-~e)-1>>>i(t)+1}},{}],31:[function(t,e,r){"use strict";function i(t,e,r){r=r||2;var i=e&&e.length,s=i?e[0]*r:t.length,a=n(t,0,s,r,!0),h=[];if(!a)return h;var u,l,d,p,f,v,g;if(i&&(a=c(t,e,a,r)),t.length>80*r){u=d=t[0],l=p=t[1];for(var y=r;y<s;y+=r)f=t[y],v=t[y+1],f<u&&(u=f),v<l&&(l=v),f>d&&(d=f),v>p&&(p=v);g=Math.max(d-u,p-l)}return o(a,h,r,u,l,g),h}function n(t,e,r,i,n){var s,o;if(n===D(t,e,r,i)>0)for(s=e;s<r;s+=i)o=R(s,t[s],t[s+1],o);else for(s=r-i;s>=e;s-=i)o=R(s,t[s],t[s+1],o);return o&&T(o,o.next)&&(C(o),o=o.next),o}function s(t,e){if(!t)return t;e||(e=t);var r,i=t;do if(r=!1,i.steiner||!T(i,i.next)&&0!==b(i.prev,i,i.next))i=i.next;else{if(C(i),i=e=i.prev,i===i.next)return null;r=!0}while(r||i!==e);return e}function o(t,e,r,i,n,c,d){if(t){!d&&c&&v(t,i,n,c);for(var p,f,g=t;t.prev!==t.next;)if(p=t.prev,f=t.next,c?h(t,i,n,c):a(t))e.push(p.i/r),e.push(t.i/r),e.push(f.i/r),C(t),t=f.next,g=f.next;else if(t=f,t===g){d?1===d?(t=u(t,e,r),o(t,e,r,i,n,c,2)):2===d&&l(t,e,r,i,n,c):o(s(t),e,r,i,n,c,1);break}}}function a(t){var e=t.prev,r=t,i=t.next;if(b(e,r,i)>=0)return!1;for(var n=t.next.next;n!==t.prev;){if(m(e.x,e.y,r.x,r.y,i.x,i.y,n.x,n.y)&&b(n.prev,n,n.next)>=0)return!1;n=n.next}return!0}function h(t,e,r,i){var n=t.prev,s=t,o=t.next;if(b(n,s,o)>=0)return!1;for(var a=n.x<s.x?n.x<o.x?n.x:o.x:s.x<o.x?s.x:o.x,h=n.y<s.y?n.y<o.y?n.y:o.y:s.y<o.y?s.y:o.y,u=n.x>s.x?n.x>o.x?n.x:o.x:s.x>o.x?s.x:o.x,l=n.y>s.y?n.y>o.y?n.y:o.y:s.y>o.y?s.y:o.y,c=y(a,h,e,r,i),d=y(u,l,e,r,i),p=t.nextZ;p&&p.z<=d;){if(p!==t.prev&&p!==t.next&&m(n.x,n.y,s.x,s.y,o.x,o.y,p.x,p.y)&&b(p.prev,p,p.next)>=0)return!1;p=p.nextZ}for(p=t.prevZ;p&&p.z>=c;){if(p!==t.prev&&p!==t.next&&m(n.x,n.y,s.x,s.y,o.x,o.y,p.x,p.y)&&b(p.prev,p,p.next)>=0)return!1;p=p.prevZ}return!0}function u(t,e,r){var i=t;do{var n=i.prev,s=i.next.next;!T(n,s)&&E(n,i,i.next,s)&&S(n,s)&&S(s,n)&&(e.push(n.i/r),e.push(i.i/r),e.push(s.i/r),C(i),C(i.next),i=t=s),i=i.next}while(i!==t);return i}function l(t,e,r,i,n,a){var h=t;do{for(var u=h.next.next;u!==h.prev;){if(h.i!==u.i&&_(h,u)){var l=M(h,u);return h=s(h,h.next),l=s(l,l.next),o(h,e,r,i,n,a),void o(l,e,r,i,n,a)}u=u.next}h=h.next}while(h!==t)}function c(t,e,r,i){var o,a,h,u,l,c=[];for(o=0,a=e.length;o<a;o++)h=e[o]*i,u=o<a-1?e[o+1]*i:t.length,l=n(t,h,u,i,!1),l===l.next&&(l.steiner=!0),c.push(x(l));for(c.sort(d),o=0;o<c.length;o++)p(c[o],r),r=s(r,r.next);return r}function d(t,e){return t.x-e.x}function p(t,e){if(e=f(t,e)){var r=M(e,t);s(r,r.next)}}function f(t,e){var r,i=e,n=t.x,s=t.y,o=-(1/0);do{if(s<=i.y&&s>=i.next.y){var a=i.x+(s-i.y)*(i.next.x-i.x)/(i.next.y-i.y);if(a<=n&&a>o){if(o=a,a===n){if(s===i.y)return i;if(s===i.next.y)return i.next}r=i.x<i.next.x?i:i.next}}i=i.next}while(i!==e);if(!r)return null;if(n===o)return r.prev;var h,u=r,l=r.x,c=r.y,d=1/0;for(i=r.next;i!==u;)n>=i.x&&i.x>=l&&m(s<c?n:o,s,l,c,s<c?o:n,s,i.x,i.y)&&(h=Math.abs(s-i.y)/(n-i.x),(h<d||h===d&&i.x>r.x)&&S(i,t)&&(r=i,d=h)),i=i.next;return r}function v(t,e,r,i){var n=t;do null===n.z&&(n.z=y(n.x,n.y,e,r,i)),n.prevZ=n.prev,n.nextZ=n.next,n=n.next;while(n!==t);n.prevZ.nextZ=null,n.prevZ=null,g(n)}function g(t){var e,r,i,n,s,o,a,h,u=1;do{for(r=t,t=null,s=null,o=0;r;){for(o++,i=r,a=0,e=0;e<u&&(a++,i=i.nextZ,i);e++);for(h=u;a>0||h>0&&i;)0===a?(n=i,i=i.nextZ,h--):0!==h&&i?r.z<=i.z?(n=r,r=r.nextZ,a--):(n=i,i=i.nextZ,h--):(n=r,r=r.nextZ,a--),s?s.nextZ=n:t=n,n.prevZ=s,s=n;r=i}s.nextZ=null,u*=2}while(o>1);return t}function y(t,e,r,i,n){return t=32767*(t-r)/n,e=32767*(e-i)/n,t=16711935&(t|t<<8),t=252645135&(t|t<<4),t=858993459&(t|t<<2),t=1431655765&(t|t<<1),e=16711935&(e|e<<8),e=252645135&(e|e<<4),e=858993459&(e|e<<2),e=1431655765&(e|e<<1),t|e<<1}function x(t){var e=t,r=t;do e.x<r.x&&(r=e),e=e.next;while(e!==t);return r}function m(t,e,r,i,n,s,o,a){return(n-o)*(e-a)-(t-o)*(s-a)>=0&&(t-o)*(i-a)-(r-o)*(e-a)>=0&&(r-o)*(s-a)-(n-o)*(i-a)>=0}function _(t,e){return t.next.i!==e.i&&t.prev.i!==e.i&&!w(t,e)&&S(t,e)&&S(e,t)&&A(t,e)}function b(t,e,r){return(e.y-t.y)*(r.x-e.x)-(e.x-t.x)*(r.y-e.y)}function T(t,e){return t.x===e.x&&t.y===e.y}function E(t,e,r,i){return!!(T(t,e)&&T(r,i)||T(t,i)&&T(r,e))||b(t,e,r)>0!=b(t,e,i)>0&&b(r,i,t)>0!=b(r,i,e)>0}function w(t,e){var r=t;do{if(r.i!==t.i&&r.next.i!==t.i&&r.i!==e.i&&r.next.i!==e.i&&E(r,r.next,t,e))return!0;r=r.next}while(r!==t);return!1}function S(t,e){return b(t.prev,t,t.next)<0?b(t,e,t.next)>=0&&b(t,t.prev,e)>=0:b(t,e,t.prev)<0||b(t,t.next,e)<0}function A(t,e){var r=t,i=!1,n=(t.x+e.x)/2,s=(t.y+e.y)/2;do r.y>s!=r.next.y>s&&n<(r.next.x-r.x)*(s-r.y)/(r.next.y-r.y)+r.x&&(i=!i),r=r.next;while(r!==t);return i}function M(t,e){var r=new O(t.i,t.x,t.y),i=new O(e.i,e.x,e.y),n=t.next,s=e.prev;return t.next=e,e.prev=t,r.next=n,n.prev=r,i.next=r,r.prev=i,s.next=i,i.prev=s,i}function R(t,e,r,i){var n=new O(t,e,r);return i?(n.next=i.next,n.prev=i,i.next.prev=n,i.next=n):(n.prev=n,n.next=n),n}function C(t){t.next.prev=t.prev,t.prev.next=t.next,t.prevZ&&(t.prevZ.nextZ=t.nextZ),t.nextZ&&(t.nextZ.prevZ=t.prevZ)}function O(t,e,r){this.i=t,this.x=e,this.y=r,this.prev=null,this.next=null,this.z=null,this.prevZ=null,this.nextZ=null,this.steiner=!1}function D(t,e,r,i){for(var n=0,s=e,o=r-i;s<r;s+=i)n+=(t[o]-t[s])*(t[s+1]+t[o+1]),o=s;return n}e.exports=i,i.deviation=function(t,e,r,i){var n=e&&e.length,s=n?e[0]*r:t.length,o=Math.abs(D(t,0,s,r));if(n)for(var a=0,h=e.length;a<h;a++){var u=e[a]*r,l=a<h-1?e[a+1]*r:t.length;o-=Math.abs(D(t,u,l,r))}var c=0;for(a=0;a<i.length;a+=3){var d=i[a]*r,p=i[a+1]*r,f=i[a+2]*r;c+=Math.abs((t[d]-t[f])*(t[p+1]-t[d+1])-(t[d]-t[p])*(t[f+1]-t[d+1]))}return 0===o&&0===c?0:Math.abs((c-o)/o)},i.flatten=function(t){for(var e=t[0][0].length,r={vertices:[],holes:[],dimensions:e},i=0,n=0;n<t.length;n++){for(var s=0;s<t[n].length;s++)for(var o=0;o<e;o++)r.vertices.push(t[n][s][o]);n>0&&(i+=t[n-1].length,r.holes.push(i))}return r}},{}],32:[function(t,e,r){"use strict";function i(t,e,r){this.fn=t,this.context=e,this.once=r||!1}function n(){}var s=Object.prototype.hasOwnProperty,o="function"!=typeof Object.create&&"~";n.prototype._events=void 0,n.prototype.eventNames=function(){var t,e=this._events,r=[];if(!e)return r;for(t in e)s.call(e,t)&&r.push(o?t.slice(1):t);return Object.getOwnPropertySymbols?r.concat(Object.getOwnPropertySymbols(e)):r},n.prototype.listeners=function(t,e){var r=o?o+t:t,i=this._events&&this._events[r];if(e)return!!i;if(!i)return[];if(i.fn)return[i.fn];for(var n=0,s=i.length,a=new Array(s);n<s;n++)a[n]=i[n].fn;return a},n.prototype.emit=function(t,e,r,i,n,s){var a=o?o+t:t;if(!this._events||!this._events[a])return!1;var h,u,l=this._events[a],c=arguments.length;if("function"==typeof l.fn){switch(l.once&&this.removeListener(t,l.fn,void 0,!0),c){case 1:return l.fn.call(l.context),!0;case 2:return l.fn.call(l.context,e),!0;case 3:return l.fn.call(l.context,e,r),!0;case 4:return l.fn.call(l.context,e,r,i),!0;case 5:return l.fn.call(l.context,e,r,i,n),!0;case 6:return l.fn.call(l.context,e,r,i,n,s),!0}for(u=1,h=new Array(c-1);u<c;u++)h[u-1]=arguments[u];l.fn.apply(l.context,h)}else{var d,p=l.length;for(u=0;u<p;u++)switch(l[u].once&&this.removeListener(t,l[u].fn,void 0,!0),c){case 1:l[u].fn.call(l[u].context);break;case 2:l[u].fn.call(l[u].context,e);break;case 3:l[u].fn.call(l[u].context,e,r);break;default:if(!h)for(d=1,h=new Array(c-1);d<c;d++)h[d-1]=arguments[d];l[u].fn.apply(l[u].context,h)}}return!0},n.prototype.on=function(t,e,r){var n=new i(e,r||this),s=o?o+t:t;return this._events||(this._events=o?{}:Object.create(null)),
this._events[s]?this._events[s].fn?this._events[s]=[this._events[s],n]:this._events[s].push(n):this._events[s]=n,this},n.prototype.once=function(t,e,r){var n=new i(e,r||this,(!0)),s=o?o+t:t;return this._events||(this._events=o?{}:Object.create(null)),this._events[s]?this._events[s].fn?this._events[s]=[this._events[s],n]:this._events[s].push(n):this._events[s]=n,this},n.prototype.removeListener=function(t,e,r,i){var n=o?o+t:t;if(!this._events||!this._events[n])return this;var s=this._events[n],a=[];if(e)if(s.fn)(s.fn!==e||i&&!s.once||r&&s.context!==r)&&a.push(s);else for(var h=0,u=s.length;h<u;h++)(s[h].fn!==e||i&&!s[h].once||r&&s[h].context!==r)&&a.push(s[h]);return a.length?this._events[n]=1===a.length?a[0]:a:delete this._events[n],this},n.prototype.removeAllListeners=function(t){return this._events?(t?delete this._events[o?o+t:t]:this._events=o?{}:Object.create(null),this):this},n.prototype.off=n.prototype.removeListener,n.prototype.addListener=n.prototype.on,n.prototype.setMaxListeners=function(){return this},n.prefixed=o,"undefined"!=typeof e&&(e.exports=n)},{}],33:[function(e,r,i){!function(e){var i=/iPhone/i,n=/iPod/i,s=/iPad/i,o=/(?=.*\bAndroid\b)(?=.*\bMobile\b)/i,a=/Android/i,h=/(?=.*\bAndroid\b)(?=.*\bSD4930UR\b)/i,u=/(?=.*\bAndroid\b)(?=.*\b(?:KFOT|KFTT|KFJWI|KFJWA|KFSOWI|KFTHWI|KFTHWA|KFAPWI|KFAPWA|KFARWI|KFASWI|KFSAWI|KFSAWA)\b)/i,l=/IEMobile/i,c=/(?=.*\bWindows\b)(?=.*\bARM\b)/i,d=/BlackBerry/i,p=/BB10/i,f=/Opera Mini/i,v=/(CriOS|Chrome)(?=.*\bMobile\b)/i,g=/(?=.*\bFirefox\b)(?=.*\bMobile\b)/i,y=new RegExp("(?:Nexus 7|BNTV250|Kindle Fire|Silk|GT-P1000)","i"),x=function(t,e){return t.test(e)},m=function(t){var e=t||navigator.userAgent,r=e.split("[FBAN");if("undefined"!=typeof r[1]&&(e=r[0]),r=e.split("Twitter"),"undefined"!=typeof r[1]&&(e=r[0]),this.apple={phone:x(i,e),ipod:x(n,e),tablet:!x(i,e)&&x(s,e),device:x(i,e)||x(n,e)||x(s,e)},this.amazon={phone:x(h,e),tablet:!x(h,e)&&x(u,e),device:x(h,e)||x(u,e)},this.android={phone:x(h,e)||x(o,e),tablet:!x(h,e)&&!x(o,e)&&(x(u,e)||x(a,e)),device:x(h,e)||x(u,e)||x(o,e)||x(a,e)},this.windows={phone:x(l,e),tablet:x(c,e),device:x(l,e)||x(c,e)},this.other={blackberry:x(d,e),blackberry10:x(p,e),opera:x(f,e),firefox:x(g,e),chrome:x(v,e),device:x(d,e)||x(p,e)||x(f,e)||x(g,e)||x(v,e)},this.seven_inch=x(y,e),this.any=this.apple.device||this.android.device||this.windows.device||this.other.device||this.seven_inch,this.phone=this.apple.phone||this.android.phone||this.windows.phone,this.tablet=this.apple.tablet||this.android.tablet||this.windows.tablet,"undefined"==typeof window)return this},_=function(){var t=new m;return t.Class=m,t};"undefined"!=typeof r&&r.exports&&"undefined"==typeof window?r.exports=m:"undefined"!=typeof r&&r.exports&&"undefined"!=typeof window?r.exports=_():"function"==typeof t&&t.amd?t("isMobile",[],e.isMobile=_()):e.isMobile=_()}(this)},{}],34:[function(t,e,r){function i(t,e,r){switch(r.length){case 0:return t.call(e);case 1:return t.call(e,r[0]);case 2:return t.call(e,r[0],r[1]);case 3:return t.call(e,r[0],r[1],r[2])}return t.apply(e,r)}e.exports=i},{}],35:[function(t,e,r){function i(t,e){for(var r=-1,i=t?t.length:0;++r<i&&e(t[r],r,t)!==!1;);return t}e.exports=i},{}],36:[function(t,e,r){function i(t,e){var r=o(t)||s(t)?n(t.length,String):[],i=r.length,h=!!i;for(var l in t)!e&&!u.call(t,l)||h&&("length"==l||a(l,i))||r.push(l);return r}var n=t("./_baseTimes"),s=t("./isArguments"),o=t("./isArray"),a=t("./_isIndex"),h=Object.prototype,u=h.hasOwnProperty;e.exports=i},{"./_baseTimes":39,"./_isIndex":40,"./isArguments":44,"./isArray":45}],37:[function(t,e,r){function i(t){if(!n(t))return s(t);var e=[];for(var r in Object(t))a.call(t,r)&&"constructor"!=r&&e.push(r);return e}var n=t("./_isPrototype"),s=t("./_nativeKeys"),o=Object.prototype,a=o.hasOwnProperty;e.exports=i},{"./_isPrototype":41,"./_nativeKeys":42}],38:[function(t,e,r){function i(t,e){return e=s(void 0===e?t.length-1:e,0),function(){for(var r=arguments,i=-1,o=s(r.length-e,0),a=Array(o);++i<o;)a[i]=r[e+i];i=-1;for(var h=Array(e+1);++i<e;)h[i]=r[i];return h[e]=a,n(t,this,h)}}var n=t("./_apply"),s=Math.max;e.exports=i},{"./_apply":34}],39:[function(t,e,r){function i(t,e){for(var r=-1,i=Array(t);++r<t;)i[r]=e(r);return i}e.exports=i},{}],40:[function(t,e,r){function i(t,e){return e=null==e?n:e,!!e&&("number"==typeof t||s.test(t))&&t>-1&&t%1==0&&t<e}var n=9007199254740991,s=/^(?:0|[1-9]\d*)$/;e.exports=i},{}],41:[function(t,e,r){function i(t){var e=t&&t.constructor,r="function"==typeof e&&e.prototype||n;return t===r}var n=Object.prototype;e.exports=i},{}],42:[function(t,e,r){var i=t("./_overArg"),n=i(Object.keys,Object);e.exports=n},{"./_overArg":43}],43:[function(t,e,r){function i(t,e){return function(r){return t(e(r))}}e.exports=i},{}],44:[function(t,e,r){function i(t){return n(t)&&a.call(t,"callee")&&(!u.call(t,"callee")||h.call(t)==s)}var n=t("./isArrayLikeObject"),s="[object Arguments]",o=Object.prototype,a=o.hasOwnProperty,h=o.toString,u=o.propertyIsEnumerable;e.exports=i},{"./isArrayLikeObject":47}],45:[function(t,e,r){var i=Array.isArray;e.exports=i},{}],46:[function(t,e,r){function i(t){return null!=t&&s(t.length)&&!n(t)}var n=t("./isFunction"),s=t("./isLength");e.exports=i},{"./isFunction":48,"./isLength":49}],47:[function(t,e,r){function i(t){return s(t)&&n(t)}var n=t("./isArrayLike"),s=t("./isObjectLike");e.exports=i},{"./isArrayLike":46,"./isObjectLike":51}],48:[function(t,e,r){function i(t){var e=n(t)?h.call(t):"";return e==s||e==o}var n=t("./isObject"),s="[object Function]",o="[object GeneratorFunction]",a=Object.prototype,h=a.toString;e.exports=i},{"./isObject":50}],49:[function(t,e,r){function i(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=n}var n=9007199254740991;e.exports=i},{}],50:[function(t,e,r){function i(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}e.exports=i},{}],51:[function(t,e,r){function i(t){return!!t&&"object"==typeof t}e.exports=i},{}],52:[function(t,e,r){function i(t){return"symbol"==typeof t||n(t)&&a.call(t)==s}var n=t("./isObjectLike"),s="[object Symbol]",o=Object.prototype,a=o.toString;e.exports=i},{"./isObjectLike":51}],53:[function(t,e,r){function i(t){return o(t)?n(t):s(t)}var n=t("./_arrayLikeKeys"),s=t("./_baseKeys"),o=t("./isArrayLike");e.exports=i},{"./_arrayLikeKeys":36,"./_baseKeys":37,"./isArrayLike":46}],54:[function(t,e,r){function i(){}e.exports=i},{}],55:[function(t,e,r){function i(t,e){if("function"!=typeof t)throw new TypeError(o);return e=void 0===e?e:s(e),n(t,e)}var n=t("./_baseRest"),s=t("./toInteger"),o="Expected a function";e.exports=i},{"./_baseRest":38,"./toInteger":57}],56:[function(t,e,r){function i(t){if(!t)return 0===t?t:0;if(t=n(t),t===s||t===-s){var e=t<0?-1:1;return e*o}return t===t?t:0}var n=t("./toNumber"),s=1/0,o=1.7976931348623157e308;e.exports=i},{"./toNumber":58}],57:[function(t,e,r){function i(t){var e=n(t),r=e%1;return e===e?r?e-r:e:0}var n=t("./toFinite");e.exports=i},{"./toFinite":56}],58:[function(t,e,r){function i(t){if("number"==typeof t)return t;if(s(t))return o;if(n(t)){var e="function"==typeof t.valueOf?t.valueOf():t;t=n(e)?e+"":e}if("string"!=typeof t)return 0===t?t:+t;t=t.replace(a,"");var r=u.test(t);return r||l.test(t)?c(t.slice(2),r?2:8):h.test(t)?o:+t}var n=t("./isObject"),s=t("./isSymbol"),o=NaN,a=/^\s+|\s+$/g,h=/^[-+]0x[0-9a-f]+$/i,u=/^0b[01]+$/i,l=/^0o[0-7]+$/i,c=parseInt;e.exports=i},{"./isObject":50,"./isSymbol":52}],59:[function(t,e,r){"use strict";function i(t){if(null===t||void 0===t)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(t)}function n(){try{if(!Object.assign)return!1;var t=new String("abc");if(t[5]="de","5"===Object.getOwnPropertyNames(t)[0])return!1;for(var e={},r=0;r<10;r++)e["_"+String.fromCharCode(r)]=r;var i=Object.getOwnPropertyNames(e).map(function(t){return e[t]});if("0123456789"!==i.join(""))return!1;var n={};return"abcdefghijklmnopqrst".split("").forEach(function(t){n[t]=t}),"abcdefghijklmnopqrst"===Object.keys(Object.assign({},n)).join("")}catch(t){return!1}}var s=Object.prototype.hasOwnProperty,o=Object.prototype.propertyIsEnumerable;e.exports=n()?Object.assign:function(t,e){for(var r,n,a=i(t),h=1;h<arguments.length;h++){r=Object(arguments[h]);for(var u in r)s.call(r,u)&&(a[u]=r[u]);if(Object.getOwnPropertySymbols){n=Object.getOwnPropertySymbols(r);for(var l=0;l<n.length;l++)o.call(r,n[l])&&(a[n[l]]=r[n[l]])}}return a}},{}],60:[function(t,e,r){(function(t){function e(t,e){for(var r=0,i=t.length-1;i>=0;i--){var n=t[i];"."===n?t.splice(i,1):".."===n?(t.splice(i,1),r++):r&&(t.splice(i,1),r--)}if(e)for(;r--;r)t.unshift("..");return t}function i(t,e){if(t.filter)return t.filter(e);for(var r=[],i=0;i<t.length;i++)e(t[i],i,t)&&r.push(t[i]);return r}var n=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/,s=function(t){return n.exec(t).slice(1)};r.resolve=function(){for(var r="",n=!1,s=arguments.length-1;s>=-1&&!n;s--){var o=s>=0?arguments[s]:t.cwd();if("string"!=typeof o)throw new TypeError("Arguments to path.resolve must be strings");o&&(r=o+"/"+r,n="/"===o.charAt(0))}return r=e(i(r.split("/"),function(t){return!!t}),!n).join("/"),(n?"/":"")+r||"."},r.normalize=function(t){var n=r.isAbsolute(t),s="/"===o(t,-1);return t=e(i(t.split("/"),function(t){return!!t}),!n).join("/"),t||n||(t="."),t&&s&&(t+="/"),(n?"/":"")+t},r.isAbsolute=function(t){return"/"===t.charAt(0)},r.join=function(){var t=Array.prototype.slice.call(arguments,0);return r.normalize(i(t,function(t,e){if("string"!=typeof t)throw new TypeError("Arguments to path.join must be strings");return t}).join("/"))},r.relative=function(t,e){function i(t){for(var e=0;e<t.length&&""===t[e];e++);for(var r=t.length-1;r>=0&&""===t[r];r--);return e>r?[]:t.slice(e,r-e+1)}t=r.resolve(t).substr(1),e=r.resolve(e).substr(1);for(var n=i(t.split("/")),s=i(e.split("/")),o=Math.min(n.length,s.length),a=o,h=0;h<o;h++)if(n[h]!==s[h]){a=h;break}for(var u=[],h=a;h<n.length;h++)u.push("..");return u=u.concat(s.slice(a)),u.join("/")},r.sep="/",r.delimiter=":",r.dirname=function(t){var e=s(t),r=e[0],i=e[1];return r||i?(i&&(i=i.substr(0,i.length-1)),r+i):"."},r.basename=function(t,e){var r=s(t)[2];return e&&r.substr(-1*e.length)===e&&(r=r.substr(0,r.length-e.length)),r},r.extname=function(t){return s(t)[3]};var o="b"==="ab".substr(-1)?function(t,e,r){return t.substr(e,r)}:function(t,e,r){return e<0&&(e=t.length+e),t.substr(e,r)}}).call(this,t("_process"))},{_process:61}],61:[function(t,e,r){function i(t){if(u===setTimeout)return setTimeout(t,0);try{return u(t,0)}catch(e){try{return u.call(null,t,0)}catch(e){return u.call(this,t,0)}}}function n(t){if(l===clearTimeout)return clearTimeout(t);try{return l(t)}catch(e){try{return l.call(null,t)}catch(e){return l.call(this,t)}}}function s(){f&&d&&(f=!1,d.length?p=d.concat(p):v=-1,p.length&&o())}function o(){if(!f){var t=i(s);f=!0;for(var e=p.length;e;){for(d=p,p=[];++v<e;)d&&d[v].run();v=-1,e=p.length}d=null,f=!1,n(t)}}function a(t,e){this.fun=t,this.array=e}function h(){}var u,l,c=e.exports={};!function(){try{u=setTimeout}catch(t){u=function(){throw new Error("setTimeout is not defined")}}try{l=clearTimeout}catch(t){l=function(){throw new Error("clearTimeout is not defined")}}}();var d,p=[],f=!1,v=-1;c.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)e[r-1]=arguments[r];p.push(new a(t,e)),1!==p.length||f||i(o)},a.prototype.run=function(){this.fun.apply(null,this.array)},c.title="browser",c.browser=!0,c.env={},c.argv=[],c.version="",c.versions={},c.on=h,c.addListener=h,c.once=h,c.off=h,c.removeListener=h,c.removeAllListeners=h,c.emit=h,c.binding=function(t){throw new Error("process.binding is not supported")},c.cwd=function(){return"/"},c.chdir=function(t){throw new Error("process.chdir is not supported")},c.umask=function(){return 0}},{}],62:[function(e,r,i){(function(e){!function(n){function s(t){throw new RangeError(L[t])}function o(t,e){for(var r=t.length,i=[];r--;)i[r]=e(t[r]);return i}function a(t,e){var r=t.split("@"),i="";r.length>1&&(i=r[0]+"@",t=r[1]),t=t.replace(I,".");var n=t.split("."),s=o(n,e).join(".");return i+s}function h(t){for(var e,r,i=[],n=0,s=t.length;n<s;)e=t.charCodeAt(n++),e>=55296&&e<=56319&&n<s?(r=t.charCodeAt(n++),56320==(64512&r)?i.push(((1023&e)<<10)+(1023&r)+65536):(i.push(e),n--)):i.push(e);return i}function u(t){return o(t,function(t){var e="";return t>65535&&(t-=65536,e+=B(t>>>10&1023|55296),t=56320|1023&t),e+=B(t)}).join("")}function l(t){return t-48<10?t-22:t-65<26?t-65:t-97<26?t-97:E}function c(t,e){return t+22+75*(t<26)-((0!=e)<<5)}function d(t,e,r){var i=0;for(t=r?N(t/M):t>>1,t+=N(t/e);t>F*S>>1;i+=E)t=N(t/F);return N(i+(F+1)*t/(t+A))}function p(t){var e,r,i,n,o,a,h,c,p,f,v=[],g=t.length,y=0,x=C,m=R;for(r=t.lastIndexOf(O),r<0&&(r=0),i=0;i<r;++i)t.charCodeAt(i)>=128&&s("not-basic"),v.push(t.charCodeAt(i));for(n=r>0?r+1:0;n<g;){for(o=y,a=1,h=E;n>=g&&s("invalid-input"),c=l(t.charCodeAt(n++)),(c>=E||c>N((T-y)/a))&&s("overflow"),y+=c*a,p=h<=m?w:h>=m+S?S:h-m,!(c<p);h+=E)f=E-p,a>N(T/f)&&s("overflow"),a*=f;e=v.length+1,m=d(y-o,e,0==o),N(y/e)>T-x&&s("overflow"),x+=N(y/e),y%=e,v.splice(y++,0,x)}return u(v)}function f(t){var e,r,i,n,o,a,u,l,p,f,v,g,y,x,m,_=[];for(t=h(t),g=t.length,e=C,r=0,o=R,a=0;a<g;++a)v=t[a],v<128&&_.push(B(v));for(i=n=_.length,n&&_.push(O);i<g;){for(u=T,a=0;a<g;++a)v=t[a],v>=e&&v<u&&(u=v);for(y=i+1,u-e>N((T-r)/y)&&s("overflow"),r+=(u-e)*y,e=u,a=0;a<g;++a)if(v=t[a],v<e&&++r>T&&s("overflow"),v==e){for(l=r,p=E;f=p<=o?w:p>=o+S?S:p-o,!(l<f);p+=E)m=l-f,x=E-f,_.push(B(c(f+m%x,0))),l=N(m/x);_.push(B(c(l,0))),o=d(r,y,i==n),r=0,++i}++r,++e}return _.join("")}function v(t){return a(t,function(t){return D.test(t)?p(t.slice(4).toLowerCase()):t})}function g(t){return a(t,function(t){return P.test(t)?"xn--"+f(t):t})}var y="object"==typeof i&&i&&!i.nodeType&&i,x="object"==typeof r&&r&&!r.nodeType&&r,m="object"==typeof e&&e;m.global!==m&&m.window!==m&&m.self!==m||(n=m);var _,b,T=2147483647,E=36,w=1,S=26,A=38,M=700,R=72,C=128,O="-",D=/^xn--/,P=/[^\x20-\x7E]/,I=/[\x2E\u3002\uFF0E\uFF61]/g,L={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},F=E-w,N=Math.floor,B=String.fromCharCode;if(_={version:"1.4.1",ucs2:{decode:h,encode:u},decode:p,encode:f,toASCII:g,toUnicode:v},"function"==typeof t&&"object"==typeof t.amd&&t.amd)t("punycode",function(){return _});else if(y&&x)if(r.exports==y)x.exports=_;else for(b in _)_.hasOwnProperty(b)&&(y[b]=_[b]);else n.punycode=_}(this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],63:[function(t,e,r){"use strict";function i(t,e){return Object.prototype.hasOwnProperty.call(t,e)}e.exports=function(t,e,r,s){e=e||"&",r=r||"=";var o={};if("string"!=typeof t||0===t.length)return o;var a=/\+/g;t=t.split(e);var h=1e3;s&&"number"==typeof s.maxKeys&&(h=s.maxKeys);var u=t.length;h>0&&u>h&&(u=h);for(var l=0;l<u;++l){var c,d,p,f,v=t[l].replace(a,"%20"),g=v.indexOf(r);g>=0?(c=v.substr(0,g),d=v.substr(g+1)):(c=v,d=""),p=decodeURIComponent(c),f=decodeURIComponent(d),i(o,p)?n(o[p])?o[p].push(f):o[p]=[o[p],f]:o[p]=f}return o};var n=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)}},{}],64:[function(t,e,r){"use strict";function i(t,e){if(t.map)return t.map(e);for(var r=[],i=0;i<t.length;i++)r.push(e(t[i],i));return r}var n=function(t){switch(typeof t){case"string":return t;case"boolean":return t?"true":"false";case"number":return isFinite(t)?t:"";default:return""}};e.exports=function(t,e,r,a){return e=e||"&",r=r||"=",null===t&&(t=void 0),"object"==typeof t?i(o(t),function(o){var a=encodeURIComponent(n(o))+r;return s(t[o])?i(t[o],function(t){return a+encodeURIComponent(n(t))}).join(e):a+encodeURIComponent(n(t[o]))}).join(e):a?encodeURIComponent(n(a))+r+encodeURIComponent(n(t)):""};var s=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)},o=Object.keys||function(t){var e=[];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.push(r);return e}},{}],65:[function(t,e,r){"use strict";r.decode=r.parse=t("./decode"),r.encode=r.stringify=t("./encode")},{"./decode":63,"./encode":64}],66:[function(t,e,r){"use strict";function i(t,e){h.call(this),e=e||u,this.baseUrl=t||"",this.progress=0,this.loading=!1,this._progressChunk=0,this._beforeMiddleware=[],this._afterMiddleware=[],this._boundLoadResource=this._loadResource.bind(this),this._buffer=[],this._numToLoad=0,this._queue=n(this._boundLoadResource,e),this.resources={}}var n=t("async/queue"),s=t("async/eachSeries"),o=t("url"),a=t("./Resource"),h=t("eventemitter3"),u=10,l=100;i.prototype=Object.create(h.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.add=i.prototype.enqueue=function(t,e,r,i){if(Array.isArray(t)){for(var n=0;n<t.length;++n)this.add(t[n]);return this}if("object"==typeof t&&(i=e||t.callback||t.onComplete,r=t,e=t.url,t=t.name||t.key||t.url),"string"!=typeof e&&(i=r,r=e,e=t),"string"!=typeof e)throw new Error("No url passed to add resource to loader.");if("function"==typeof r&&(i=r,r=null),this.resources[t])throw new Error('Resource with name "'+t+'" already exists.');return e=this._prepareUrl(e),this.resources[t]=new a(t,e,r),"function"==typeof i&&this.resources[t].once("afterMiddleware",i),this._numToLoad++,this._queue.started?(this._queue.push(this.resources[t]),this._progressChunk=(l-this.progress)/(this._queue.length()+this._queue.running())):(this._buffer.push(this.resources[t]),this._progressChunk=l/this._buffer.length),this},i.prototype.before=i.prototype.pre=function(t){return this._beforeMiddleware.push(t),this},i.prototype.after=i.prototype.use=function(t){return this._afterMiddleware.push(t),this},i.prototype.reset=function(){this.progress=0,this.loading=!1,this._progressChunk=0,this._buffer.length=0,this._numToLoad=0,this._queue.kill(),this._queue.started=!1;for(var t in this.resources){var e=this.resources[t];e.off("complete",this._onLoad,this),e.isLoading&&e.abort()}return this.resources={},this},i.prototype.load=function(t){if("function"==typeof t&&this.once("complete",t),this._queue.started)return this;this.emit("start",this),this.loading=!0;for(var e=0;e<this._buffer.length;++e)this._queue.push(this._buffer[e]);return this._buffer.length=0,this},i.prototype._prepareUrl=function(t){var e=o.parse(t);return e.protocol||!e.pathname||0===e.pathname.indexOf("//")?t:this.baseUrl.length&&this.baseUrl.lastIndexOf("/")!==this.baseUrl.length-1&&"/"!==t.charAt(0)?this.baseUrl+"/"+t:this.baseUrl+t},i.prototype._loadResource=function(t,e){var r=this;t._dequeue=e,s(this._beforeMiddleware,function(e,i){e.call(r,t,function(){i(t.isComplete?{}:null)})},function(){t.isComplete?r._onLoad(t):(t.once("complete",r._onLoad,r),t.load())})},i.prototype._onComplete=function(){this.loading=!1,this.emit("complete",this,this.resources)},i.prototype._onLoad=function(t){var e=this;s(this._afterMiddleware,function(r,i){r.call(e,t,i)},function(){t.emit("afterMiddleware",t),e._numToLoad--,e.progress+=e._progressChunk,e.emit("progress",e,t),t.error?e.emit("error",t.error,e,t):e.emit("load",e,t),0===e._numToLoad&&(e.progress=100,e._onComplete())}),t._dequeue()},i.LOAD_TYPE=a.LOAD_TYPE,i.XHR_RESPONSE_TYPE=a.XHR_RESPONSE_TYPE},{"./Resource":67,"async/eachSeries":18,"async/queue":29,eventemitter3:32,url:72}],67:[function(t,e,r){"use strict";function i(t,e,r){if(o.call(this),r=r||{},"string"!=typeof t||"string"!=typeof e)throw new Error("Both name and url are required for constructing a resource.");this.name=t,this.url=e,this.isDataUrl=0===this.url.indexOf("data:"),this.data=null,this.crossOrigin=r.crossOrigin===!0?"anonymous":r.crossOrigin,this.loadType=r.loadType||this._determineLoadType(),this.xhrType=r.xhrType,this.metadata=r.metadata||{},this.error=null,this.xhr=null,this.isJson=!1,this.isXml=!1,this.isImage=!1,this.isAudio=!1,this.isVideo=!1,this.isComplete=!1,this.isLoading=!1,this._dequeue=null,this._boundComplete=this.complete.bind(this),this._boundOnError=this._onError.bind(this),this._boundOnProgress=this._onProgress.bind(this),this._boundXhrOnError=this._xhrOnError.bind(this),this._boundXhrOnAbort=this._xhrOnAbort.bind(this),this._boundXhrOnLoad=this._xhrOnLoad.bind(this),this._boundXdrOnTimeout=this._xdrOnTimeout.bind(this)}function n(t){return t.toString().replace("object ","")}function s(t,e,r){e&&0===e.indexOf(".")&&(e=e.substring(1)),e&&(t[e]=r)}var o=t("eventemitter3"),a=t("url"),h=!(!window.XDomainRequest||"withCredentials"in new XMLHttpRequest),u=null,l=0,c=200,d=204;i.prototype=Object.create(o.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.complete=function(){if(this.data&&this.data.removeEventListener&&(this.data.removeEventListener("error",this._boundOnError,!1),this.data.removeEventListener("load",this._boundComplete,!1),this.data.removeEventListener("progress",this._boundOnProgress,!1),this.data.removeEventListener("canplaythrough",this._boundComplete,!1)),this.xhr&&(this.xhr.removeEventListener?(this.xhr.removeEventListener("error",this._boundXhrOnError,!1),this.xhr.removeEventListener("abort",this._boundXhrOnAbort,!1),this.xhr.removeEventListener("progress",this._boundOnProgress,!1),this.xhr.removeEventListener("load",this._boundXhrOnLoad,!1)):(this.xhr.onerror=null,this.xhr.ontimeout=null,this.xhr.onprogress=null,this.xhr.onload=null)),this.isComplete)throw new Error("Complete called again for an already completed resource.");this.isComplete=!0,this.isLoading=!1,this.emit("complete",this)},i.prototype.abort=function(t){if(!this.error){if(this.error=new Error(t),this.xhr)this.xhr.abort();else if(this.xdr)this.xdr.abort();else if(this.data)if("undefined"!=typeof this.data.src)this.data.src="";else for(;this.data.firstChild;)this.data.removeChild(this.data.firstChild);this.complete()}},i.prototype.load=function(t){if(!this.isLoading)if(this.isComplete){if(t){var e=this;setTimeout(function(){t(e)},1)}}else switch(t&&this.once("complete",t),this.isLoading=!0,this.emit("start",this),this.crossOrigin!==!1&&"string"==typeof this.crossOrigin||(this.crossOrigin=this._determineCrossOrigin(this.url)),this.loadType){case i.LOAD_TYPE.IMAGE:this._loadElement("image");break;case i.LOAD_TYPE.AUDIO:this._loadSourceElement("audio");break;case i.LOAD_TYPE.VIDEO:this._loadSourceElement("video");break;case i.LOAD_TYPE.XHR:default:h&&this.crossOrigin?this._loadXdr():this._loadXhr()}},i.prototype._loadElement=function(t){this.metadata.loadElement?this.data=this.metadata.loadElement:"image"===t&&"undefined"!=typeof window.Image?this.data=new Image:this.data=document.createElement(t),this.crossOrigin&&(this.data.crossOrigin=this.crossOrigin),this.metadata.skipSource||(this.data.src=this.url);var e="is"+t[0].toUpperCase()+t.substring(1);this[e]===!1&&(this[e]=!0),this.data.addEventListener("error",this._boundOnError,!1),this.data.addEventListener("load",this._boundComplete,!1),this.data.addEventListener("progress",this._boundOnProgress,!1)},i.prototype._loadSourceElement=function(t){if(this.metadata.loadElement?this.data=this.metadata.loadElement:"audio"===t&&"undefined"!=typeof window.Audio?this.data=new Audio:this.data=document.createElement(t),null===this.data)return void this.abort("Unsupported element "+t);if(!this.metadata.skipSource)if(navigator.isCocoonJS)this.data.src=Array.isArray(this.url)?this.url[0]:this.url;else if(Array.isArray(this.url))for(var e=0;e<this.url.length;++e)this.data.appendChild(this._createSource(t,this.url[e]));else this.data.appendChild(this._createSource(t,this.url));this["is"+t[0].toUpperCase()+t.substring(1)]=!0,this.data.addEventListener("error",this._boundOnError,!1),this.data.addEventListener("load",this._boundComplete,!1),this.data.addEventListener("progress",this._boundOnProgress,!1),this.data.addEventListener("canplaythrough",this._boundComplete,!1),this.data.load()},i.prototype._loadXhr=function(){"string"!=typeof this.xhrType&&(this.xhrType=this._determineXhrType());var t=this.xhr=new XMLHttpRequest;t.open("GET",this.url,!0),this.xhrType===i.XHR_RESPONSE_TYPE.JSON||this.xhrType===i.XHR_RESPONSE_TYPE.DOCUMENT?t.responseType=i.XHR_RESPONSE_TYPE.TEXT:t.responseType=this.xhrType,t.addEventListener("error",this._boundXhrOnError,!1),t.addEventListener("abort",this._boundXhrOnAbort,!1),t.addEventListener("progress",this._boundOnProgress,!1),t.addEventListener("load",this._boundXhrOnLoad,!1),t.send()},i.prototype._loadXdr=function(){"string"!=typeof this.xhrType&&(this.xhrType=this._determineXhrType());var t=this.xhr=new XDomainRequest;t.timeout=5e3,t.onerror=this._boundXhrOnError,t.ontimeout=this._boundXdrOnTimeout,t.onprogress=this._boundOnProgress,t.onload=this._boundXhrOnLoad,t.open("GET",this.url,!0),setTimeout(function(){t.send()},0)},i.prototype._createSource=function(t,e,r){r||(r=t+"/"+e.substr(e.lastIndexOf(".")+1));var i=document.createElement("source");return i.src=e,i.type=r,i},i.prototype._onError=function(t){this.abort("Failed to load element using "+t.target.nodeName)},i.prototype._onProgress=function(t){t&&t.lengthComputable&&this.emit("progress",this,t.loaded/t.total)},i.prototype._xhrOnError=function(){var t=this.xhr;this.abort(n(t)+" Request failed. Status: "+t.status+', text: "'+t.statusText+'"')},i.prototype._xhrOnAbort=function(){this.abort(n(this.xhr)+" Request was aborted by the user.")},i.prototype._xdrOnTimeout=function(){this.abort(n(this.xhr)+" Request timed out.")},i.prototype._xhrOnLoad=function(){var t=this.xhr,e="undefined"==typeof t.status?t.status:c;if(!(e===c||e===d||e===l&&t.responseText.length>0))return void this.abort("["+t.status+"]"+t.statusText+":"+t.responseURL);if(this.xhrType===i.XHR_RESPONSE_TYPE.TEXT)this.data=t.responseText;else if(this.xhrType===i.XHR_RESPONSE_TYPE.JSON)try{this.data=JSON.parse(t.responseText),this.isJson=!0}catch(t){return void this.abort("Error trying to parse loaded json:",t)}else if(this.xhrType===i.XHR_RESPONSE_TYPE.DOCUMENT)try{if(window.DOMParser){var r=new DOMParser;this.data=r.parseFromString(t.responseText,"text/xml")}else{var n=document.createElement("div");n.innerHTML=t.responseText,this.data=n}this.isXml=!0}catch(t){return void this.abort("Error trying to parse loaded xml:",t)}else this.data=t.response||t.responseText;this.complete()},i.prototype._determineCrossOrigin=function(t,e){if(0===t.indexOf("data:"))return"";e=e||window.location,u||(u=document.createElement("a")),u.href=t,t=a.parse(u.href);var r=!t.port&&""===e.port||t.port===e.port;return t.hostname===e.hostname&&r&&t.protocol===e.protocol?"":"anonymous"},i.prototype._determineXhrType=function(){return i._xhrTypeMap[this._getExtension()]||i.XHR_RESPONSE_TYPE.TEXT},i.prototype._determineLoadType=function(){return i._loadTypeMap[this._getExtension()]||i.LOAD_TYPE.XHR},i.prototype._getExtension=function(){var t=this.url,e="";if(this.isDataUrl){var r=t.indexOf("/");e=t.substring(r+1,t.indexOf(";",r))}else{var i=t.indexOf("?");i!==-1&&(t=t.substring(0,i)),e=t.substring(t.lastIndexOf(".")+1)}return e.toLowerCase()},i.prototype._getMimeFromXhrType=function(t){switch(t){case i.XHR_RESPONSE_TYPE.BUFFER:return"application/octet-binary";case i.XHR_RESPONSE_TYPE.BLOB:return"application/blob";case i.XHR_RESPONSE_TYPE.DOCUMENT:return"application/xml";case i.XHR_RESPONSE_TYPE.JSON:return"application/json";case i.XHR_RESPONSE_TYPE.DEFAULT:case i.XHR_RESPONSE_TYPE.TEXT:default:return"text/plain"}},i.LOAD_TYPE={XHR:1,IMAGE:2,AUDIO:3,VIDEO:4},i.XHR_RESPONSE_TYPE={DEFAULT:"text",BUFFER:"arraybuffer",BLOB:"blob",DOCUMENT:"document",JSON:"json",TEXT:"text"},i._loadTypeMap={gif:i.LOAD_TYPE.IMAGE,png:i.LOAD_TYPE.IMAGE,bmp:i.LOAD_TYPE.IMAGE,jpg:i.LOAD_TYPE.IMAGE,jpeg:i.LOAD_TYPE.IMAGE,tif:i.LOAD_TYPE.IMAGE,tiff:i.LOAD_TYPE.IMAGE,webp:i.LOAD_TYPE.IMAGE,tga:i.LOAD_TYPE.IMAGE,"svg+xml":i.LOAD_TYPE.IMAGE},i._xhrTypeMap={xhtml:i.XHR_RESPONSE_TYPE.DOCUMENT,html:i.XHR_RESPONSE_TYPE.DOCUMENT,htm:i.XHR_RESPONSE_TYPE.DOCUMENT,xml:i.XHR_RESPONSE_TYPE.DOCUMENT,tmx:i.XHR_RESPONSE_TYPE.DOCUMENT,tsx:i.XHR_RESPONSE_TYPE.DOCUMENT,svg:i.XHR_RESPONSE_TYPE.DOCUMENT,gif:i.XHR_RESPONSE_TYPE.BLOB,png:i.XHR_RESPONSE_TYPE.BLOB,bmp:i.XHR_RESPONSE_TYPE.BLOB,jpg:i.XHR_RESPONSE_TYPE.BLOB,jpeg:i.XHR_RESPONSE_TYPE.BLOB,tif:i.XHR_RESPONSE_TYPE.BLOB,tiff:i.XHR_RESPONSE_TYPE.BLOB,webp:i.XHR_RESPONSE_TYPE.BLOB,tga:i.XHR_RESPONSE_TYPE.BLOB,json:i.XHR_RESPONSE_TYPE.JSON,text:i.XHR_RESPONSE_TYPE.TEXT,txt:i.XHR_RESPONSE_TYPE.TEXT},i.setExtensionLoadType=function(t,e){s(i._loadTypeMap,t,e)},i.setExtensionXhrType=function(t,e){s(i._xhrTypeMap,t,e)}},{eventemitter3:32,url:72}],68:[function(t,e,r){"use strict";e.exports={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encodeBinary:function(t){for(var e,r="",i=new Array(4),n=0,s=0,o=0;n<t.length;){for(e=new Array(3),s=0;s<e.length;s++)n<t.length?e[s]=255&t.charCodeAt(n++):e[s]=0;switch(i[0]=e[0]>>2,i[1]=(3&e[0])<<4|e[1]>>4,i[2]=(15&e[1])<<2|e[2]>>6,i[3]=63&e[2],o=n-(t.length-1)){case 2:i[3]=64,i[2]=64;break;case 1:i[3]=64}for(s=0;s<i.length;s++)r+=this._keyStr.charAt(i[s])}return r}}},{}],69:[function(t,e,r){"use strict";e.exports=t("./Loader"),e.exports.Resource=t("./Resource"),e.exports.middleware={caching:{memory:t("./middlewares/caching/memory")},parsing:{blob:t("./middlewares/parsing/blob")}}},{"./Loader":66,"./Resource":67,"./middlewares/caching/memory":70,"./middlewares/parsing/blob":71}],70:[function(t,e,r){"use strict";var i={};e.exports=function(){return function(t,e){i[t.url]?(t.data=i[t.url],t.complete()):t.once("complete",function(){i[this.url]=this.data}),e()}}},{}],71:[function(t,e,r){"use strict";var i=t("../../Resource"),n=t("../../b64"),s=window.URL||window.webkitURL;e.exports=function(){return function(t,e){if(!t.data)return void e();if(t.xhr&&t.xhrType===i.XHR_RESPONSE_TYPE.BLOB)if(window.Blob&&"string"!=typeof t.data){if(0===t.data.type.indexOf("image")){var r=s.createObjectURL(t.data);return t.blob=t.data,t.data=new Image,t.data.src=r,t.isImage=!0,void(t.data.onload=function(){s.revokeObjectURL(r),t.data.onload=null,e()})}}else{var o=t.xhr.getResponseHeader("content-type");if(o&&0===o.indexOf("image"))return t.data=new Image,t.data.src="data:"+o+";base64,"+n.encodeBinary(t.xhr.responseText),t.isImage=!0,void(t.data.onload=function(){t.data.onload=null,e()})}e()}}},{"../../Resource":67,"../../b64":68}],72:[function(t,e,r){"use strict";function i(){this.protocol=null,this.slashes=null,this.auth=null,this.host=null,this.port=null,this.hostname=null,this.hash=null,this.search=null,this.query=null,this.pathname=null,this.path=null,this.href=null}function n(t,e,r){if(t&&u.isObject(t)&&t instanceof i)return t;var n=new i;return n.parse(t,e,r),n}function s(t){return u.isString(t)&&(t=n(t)),t instanceof i?t.format():i.prototype.format.call(t)}function o(t,e){return n(t,!1,!0).resolve(e)}function a(t,e){return t?n(t,!1,!0).resolveObject(e):e}var h=t("punycode"),u=t("./util");r.parse=n,r.resolve=o,r.resolveObject=a,r.format=s,r.Url=i;var l=/^([a-z0-9.+-]+:)/i,c=/:[0-9]*$/,d=/^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,p=["<",">",'"',"`"," ","\r","\n","\t"],f=["{","}","|","\\","^","`"].concat(p),v=["'"].concat(f),g=["%","/","?",";","#"].concat(v),y=["/","?","#"],x=255,m=/^[+a-z0-9A-Z_-]{0,63}$/,_=/^([+a-z0-9A-Z_-]{0,63})(.*)$/,b={javascript:!0,"javascript:":!0},T={javascript:!0,"javascript:":!0},E={http:!0,https:!0,ftp:!0,gopher:!0,file:!0,"http:":!0,"https:":!0,"ftp:":!0,"gopher:":!0,"file:":!0},w=t("querystring");i.prototype.parse=function(t,e,r){if(!u.isString(t))throw new TypeError("Parameter 'url' must be a string, not "+typeof t);var i=t.indexOf("?"),n=i!==-1&&i<t.indexOf("#")?"?":"#",s=t.split(n),o=/\\/g;s[0]=s[0].replace(o,"/"),t=s.join(n);var a=t;if(a=a.trim(),!r&&1===t.split("#").length){var c=d.exec(a);if(c)return this.path=a,this.href=a,this.pathname=c[1],c[2]?(this.search=c[2],e?this.query=w.parse(this.search.substr(1)):this.query=this.search.substr(1)):e&&(this.search="",this.query={}),this}var p=l.exec(a);if(p){p=p[0];var f=p.toLowerCase();this.protocol=f,a=a.substr(p.length)}if(r||p||a.match(/^\/\/[^@\/]+@[^@\/]+/)){
var S="//"===a.substr(0,2);!S||p&&T[p]||(a=a.substr(2),this.slashes=!0)}if(!T[p]&&(S||p&&!E[p])){for(var A=-1,M=0;M<y.length;M++){var R=a.indexOf(y[M]);R!==-1&&(A===-1||R<A)&&(A=R)}var C,O;O=A===-1?a.lastIndexOf("@"):a.lastIndexOf("@",A),O!==-1&&(C=a.slice(0,O),a=a.slice(O+1),this.auth=decodeURIComponent(C)),A=-1;for(var M=0;M<g.length;M++){var R=a.indexOf(g[M]);R!==-1&&(A===-1||R<A)&&(A=R)}A===-1&&(A=a.length),this.host=a.slice(0,A),a=a.slice(A),this.parseHost(),this.hostname=this.hostname||"";var D="["===this.hostname[0]&&"]"===this.hostname[this.hostname.length-1];if(!D)for(var P=this.hostname.split(/\./),M=0,I=P.length;M<I;M++){var L=P[M];if(L&&!L.match(m)){for(var F="",N=0,B=L.length;N<B;N++)F+=L.charCodeAt(N)>127?"x":L[N];if(!F.match(m)){var k=P.slice(0,M),U=P.slice(M+1),j=L.match(_);j&&(k.push(j[1]),U.unshift(j[2])),U.length&&(a="/"+U.join(".")+a),this.hostname=k.join(".");break}}}this.hostname.length>x?this.hostname="":this.hostname=this.hostname.toLowerCase(),D||(this.hostname=h.toASCII(this.hostname));var W=this.port?":"+this.port:"",X=this.hostname||"";this.host=X+W,this.href+=this.host,D&&(this.hostname=this.hostname.substr(1,this.hostname.length-2),"/"!==a[0]&&(a="/"+a))}if(!b[f])for(var M=0,I=v.length;M<I;M++){var G=v[M];if(a.indexOf(G)!==-1){var H=encodeURIComponent(G);H===G&&(H=escape(G)),a=a.split(G).join(H)}}var z=a.indexOf("#");z!==-1&&(this.hash=a.substr(z),a=a.slice(0,z));var V=a.indexOf("?");if(V!==-1?(this.search=a.substr(V),this.query=a.substr(V+1),e&&(this.query=w.parse(this.query)),a=a.slice(0,V)):e&&(this.search="",this.query={}),a&&(this.pathname=a),E[f]&&this.hostname&&!this.pathname&&(this.pathname="/"),this.pathname||this.search){var W=this.pathname||"",Y=this.search||"";this.path=W+Y}return this.href=this.format(),this},i.prototype.format=function(){var t=this.auth||"";t&&(t=encodeURIComponent(t),t=t.replace(/%3A/i,":"),t+="@");var e=this.protocol||"",r=this.pathname||"",i=this.hash||"",n=!1,s="";this.host?n=t+this.host:this.hostname&&(n=t+(this.hostname.indexOf(":")===-1?this.hostname:"["+this.hostname+"]"),this.port&&(n+=":"+this.port)),this.query&&u.isObject(this.query)&&Object.keys(this.query).length&&(s=w.stringify(this.query));var o=this.search||s&&"?"+s||"";return e&&":"!==e.substr(-1)&&(e+=":"),this.slashes||(!e||E[e])&&n!==!1?(n="//"+(n||""),r&&"/"!==r.charAt(0)&&(r="/"+r)):n||(n=""),i&&"#"!==i.charAt(0)&&(i="#"+i),o&&"?"!==o.charAt(0)&&(o="?"+o),r=r.replace(/[?#]/g,function(t){return encodeURIComponent(t)}),o=o.replace("#","%23"),e+n+r+o+i},i.prototype.resolve=function(t){return this.resolveObject(n(t,!1,!0)).format()},i.prototype.resolveObject=function(t){if(u.isString(t)){var e=new i;e.parse(t,!1,!0),t=e}for(var r=new i,n=Object.keys(this),s=0;s<n.length;s++){var o=n[s];r[o]=this[o]}if(r.hash=t.hash,""===t.href)return r.href=r.format(),r;if(t.slashes&&!t.protocol){for(var a=Object.keys(t),h=0;h<a.length;h++){var l=a[h];"protocol"!==l&&(r[l]=t[l])}return E[r.protocol]&&r.hostname&&!r.pathname&&(r.path=r.pathname="/"),r.href=r.format(),r}if(t.protocol&&t.protocol!==r.protocol){if(!E[t.protocol]){for(var c=Object.keys(t),d=0;d<c.length;d++){var p=c[d];r[p]=t[p]}return r.href=r.format(),r}if(r.protocol=t.protocol,t.host||T[t.protocol])r.pathname=t.pathname;else{for(var f=(t.pathname||"").split("/");f.length&&!(t.host=f.shift()););t.host||(t.host=""),t.hostname||(t.hostname=""),""!==f[0]&&f.unshift(""),f.length<2&&f.unshift(""),r.pathname=f.join("/")}if(r.search=t.search,r.query=t.query,r.host=t.host||"",r.auth=t.auth,r.hostname=t.hostname||t.host,r.port=t.port,r.pathname||r.search){var v=r.pathname||"",g=r.search||"";r.path=v+g}return r.slashes=r.slashes||t.slashes,r.href=r.format(),r}var y=r.pathname&&"/"===r.pathname.charAt(0),x=t.host||t.pathname&&"/"===t.pathname.charAt(0),m=x||y||r.host&&t.pathname,_=m,b=r.pathname&&r.pathname.split("/")||[],f=t.pathname&&t.pathname.split("/")||[],w=r.protocol&&!E[r.protocol];if(w&&(r.hostname="",r.port=null,r.host&&(""===b[0]?b[0]=r.host:b.unshift(r.host)),r.host="",t.protocol&&(t.hostname=null,t.port=null,t.host&&(""===f[0]?f[0]=t.host:f.unshift(t.host)),t.host=null),m=m&&(""===f[0]||""===b[0])),x)r.host=t.host||""===t.host?t.host:r.host,r.hostname=t.hostname||""===t.hostname?t.hostname:r.hostname,r.search=t.search,r.query=t.query,b=f;else if(f.length)b||(b=[]),b.pop(),b=b.concat(f),r.search=t.search,r.query=t.query;else if(!u.isNullOrUndefined(t.search)){if(w){r.hostname=r.host=b.shift();var S=!!(r.host&&r.host.indexOf("@")>0)&&r.host.split("@");S&&(r.auth=S.shift(),r.host=r.hostname=S.shift())}return r.search=t.search,r.query=t.query,u.isNull(r.pathname)&&u.isNull(r.search)||(r.path=(r.pathname?r.pathname:"")+(r.search?r.search:"")),r.href=r.format(),r}if(!b.length)return r.pathname=null,r.search?r.path="/"+r.search:r.path=null,r.href=r.format(),r;for(var A=b.slice(-1)[0],M=(r.host||t.host||b.length>1)&&("."===A||".."===A)||""===A,R=0,C=b.length;C>=0;C--)A=b[C],"."===A?b.splice(C,1):".."===A?(b.splice(C,1),R++):R&&(b.splice(C,1),R--);if(!m&&!_)for(;R--;R)b.unshift("..");!m||""===b[0]||b[0]&&"/"===b[0].charAt(0)||b.unshift(""),M&&"/"!==b.join("/").substr(-1)&&b.push("");var O=""===b[0]||b[0]&&"/"===b[0].charAt(0);if(w){r.hostname=r.host=O?"":b.length?b.shift():"";var S=!!(r.host&&r.host.indexOf("@")>0)&&r.host.split("@");S&&(r.auth=S.shift(),r.host=r.hostname=S.shift())}return m=m||r.host&&b.length,m&&!O&&b.unshift(""),b.length?r.pathname=b.join("/"):(r.pathname=null,r.path=null),u.isNull(r.pathname)&&u.isNull(r.search)||(r.path=(r.pathname?r.pathname:"")+(r.search?r.search:"")),r.auth=t.auth||r.auth,r.slashes=r.slashes||t.slashes,r.href=r.format(),r},i.prototype.parseHost=function(){var t=this.host,e=c.exec(t);e&&(e=e[0],":"!==e&&(this.port=e.substr(1)),t=t.substr(0,t.length-e.length)),t&&(this.hostname=t)}},{"./util":73,punycode:62,querystring:65}],73:[function(t,e,r){"use strict";e.exports={isString:function(t){return"string"==typeof t},isObject:function(t){return"object"==typeof t&&null!==t},isNull:function(t){return null===t},isNullOrUndefined:function(t){return null==t}}},{}],74:[function(t,e,r){function i(t){(s.tablet||s.phone)&&this.createTouchHook();var e=document.createElement("div");e.style.width="100px",e.style.height="100px",e.style.position="absolute",e.style.top=0,e.style.left=0,e.style.zIndex=2,this.div=e,this.pool=[],this.renderId=0,this.debug=!1,this.renderer=t,this.children=[],this._onKeyDown=this._onKeyDown.bind(this),this._onMouseMove=this._onMouseMove.bind(this),this.isActive=!1,this.isMobileAccessabillity=!1,window.addEventListener("keydown",this._onKeyDown,!1)}var n=t("../core"),s=t("ismobilejs");Object.assign(n.DisplayObject.prototype,t("./accessibleTarget")),i.prototype.constructor=i,e.exports=i,i.prototype.createTouchHook=function(){var t=document.createElement("button");t.style.width="1px",t.style.height="1px",t.style.position="absolute",t.style.top="-1000px",t.style.left="-1000px",t.style.zIndex=2,t.style.backgroundColor="#FF0000",t.title="HOOK DIV",t.addEventListener("focus",function(){this.isMobileAccessabillity=!0,this.activate(),document.body.removeChild(t)}.bind(this)),document.body.appendChild(t)},i.prototype.activate=function(){this.isActive||(this.isActive=!0,window.document.addEventListener("mousemove",this._onMouseMove,!0),window.removeEventListener("keydown",this._onKeyDown,!1),this.renderer.on("postrender",this.update,this),this.renderer.view.parentNode&&this.renderer.view.parentNode.appendChild(this.div))},i.prototype.deactivate=function(){this.isActive&&!this.isMobileAccessabillity&&(this.isActive=!1,window.document.removeEventListener("mousemove",this._onMouseMove),window.addEventListener("keydown",this._onKeyDown,!1),this.renderer.off("postrender",this.update),this.div.parentNode&&this.div.parentNode.removeChild(this.div))},i.prototype.updateAccessibleObjects=function(t){if(t.visible){t.accessible&&t.interactive&&(t._accessibleActive||this.addChild(t),t.renderId=this.renderId);for(var e=t.children,r=e.length-1;r>=0;r--)this.updateAccessibleObjects(e[r])}},i.prototype.update=function(){if(this.renderer.renderingToScreen){this.updateAccessibleObjects(this.renderer._lastObjectRendered);var t=this.renderer.view.getBoundingClientRect(),e=t.width/this.renderer.width,r=t.height/this.renderer.height,i=this.div;i.style.left=t.left+"px",i.style.top=t.top+"px",i.style.width=this.renderer.width+"px",i.style.height=this.renderer.height+"px";for(var s=0;s<this.children.length;s++){var o=this.children[s];if(o.renderId!==this.renderId)o._accessibleActive=!1,n.utils.removeItems(this.children,s,1),this.div.removeChild(o._accessibleDiv),this.pool.push(o._accessibleDiv),o._accessibleDiv=null,s--,0===this.children.length&&this.deactivate();else{i=o._accessibleDiv;var a=o.hitArea,h=o.worldTransform;o.hitArea?(i.style.left=(h.tx+a.x*h.a)*e+"px",i.style.top=(h.ty+a.y*h.d)*r+"px",i.style.width=a.width*h.a*e+"px",i.style.height=a.height*h.d*r+"px"):(a=o.getBounds(),this.capHitArea(a),i.style.left=a.x*e+"px",i.style.top=a.y*r+"px",i.style.width=a.width*e+"px",i.style.height=a.height*r+"px")}}this.renderId++}},i.prototype.capHitArea=function(t){t.x<0&&(t.width+=t.x,t.x=0),t.y<0&&(t.height+=t.y,t.y=0),t.x+t.width>this.renderer.width&&(t.width=this.renderer.width-t.x),t.y+t.height>this.renderer.height&&(t.height=this.renderer.height-t.y)},i.prototype.addChild=function(t){var e=this.pool.pop();e||(e=document.createElement("button"),e.style.width="100px",e.style.height="100px",e.style.backgroundColor=this.debug?"rgba(255,0,0,0.5)":"transparent",e.style.position="absolute",e.style.zIndex=2,e.style.borderStyle="none",e.addEventListener("click",this._onClick.bind(this)),e.addEventListener("focus",this._onFocus.bind(this)),e.addEventListener("focusout",this._onFocusOut.bind(this))),t.accessibleTitle?e.title=t.accessibleTitle:t.accessibleTitle||t.accessibleHint||(e.title="displayObject "+this.tabIndex),t.accessibleHint&&e.setAttribute("aria-label",t.accessibleHint),t._accessibleActive=!0,t._accessibleDiv=e,e.displayObject=t,this.children.push(t),this.div.appendChild(t._accessibleDiv),t._accessibleDiv.tabIndex=t.tabIndex},i.prototype._onClick=function(t){var e=this.renderer.plugins.interaction;e.dispatchEvent(t.target.displayObject,"click",e.eventData)},i.prototype._onFocus=function(t){var e=this.renderer.plugins.interaction;e.dispatchEvent(t.target.displayObject,"mouseover",e.eventData)},i.prototype._onFocusOut=function(t){var e=this.renderer.plugins.interaction;e.dispatchEvent(t.target.displayObject,"mouseout",e.eventData)},i.prototype._onKeyDown=function(t){9===t.keyCode&&this.activate()},i.prototype._onMouseMove=function(){this.deactivate()},i.prototype.destroy=function(){this.div=null;for(var t=0;t<this.children.length;t++)this.children[t].div=null;window.document.removeEventListener("mousemove",this._onMouseMove),window.removeEventListener("keydown",this._onKeyDown),this.pool=null,this.children=null,this.renderer=null},n.WebGLRenderer.registerPlugin("accessibility",i),n.CanvasRenderer.registerPlugin("accessibility",i)},{"../core":97,"./accessibleTarget":75,ismobilejs:33}],75:[function(t,e,r){var i={accessible:!1,accessibleTitle:null,accessibleHint:null,tabIndex:0,_accessibleActive:!1,_accessibleDiv:!1};e.exports=i},{}],76:[function(t,e,r){e.exports={accessibleTarget:t("./accessibleTarget"),AccessibilityManager:t("./AccessibilityManager")}},{"./AccessibilityManager":74,"./accessibleTarget":75}],77:[function(t,e,r){function i(t){if(t instanceof Array){if("precision"!==t[0].substring(0,9)){var e=t.slice(0);return e.unshift("precision "+s.PRECISION.DEFAULT+" float;"),e}}else if("precision"!==t.substring(0,9))return"precision "+s.PRECISION.DEFAULT+" float;\n"+t;return t}var n=t("pixi-gl-core").GLShader,s=t("./const"),o=function(t,e,r){n.call(this,t,i(e),i(r))};o.prototype=Object.create(n.prototype),o.prototype.constructor=o,e.exports=o},{"./const":78,"pixi-gl-core":7}],78:[function(t,e,r){var i={VERSION:"4.0.0",PI_2:2*Math.PI,RAD_TO_DEG:180/Math.PI,DEG_TO_RAD:Math.PI/180,TARGET_FPMS:.06,RENDERER_TYPE:{UNKNOWN:0,WEBGL:1,CANVAS:2},BLEND_MODES:{NORMAL:0,ADD:1,MULTIPLY:2,SCREEN:3,OVERLAY:4,DARKEN:5,LIGHTEN:6,COLOR_DODGE:7,COLOR_BURN:8,HARD_LIGHT:9,SOFT_LIGHT:10,DIFFERENCE:11,EXCLUSION:12,HUE:13,SATURATION:14,COLOR:15,LUMINOSITY:16},DRAW_MODES:{POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},SCALE_MODES:{DEFAULT:0,LINEAR:0,NEAREST:1},WRAP_MODES:{DEFAULT:0,CLAMP:0,REPEAT:1,MIRRORED_REPEAT:2},GC_MODES:{DEFAULT:1,AUTO:0,MANUAL:1},MIPMAP_TEXTURES:!0,RETINA_PREFIX:/@(.+)x/,RESOLUTION:1,FILTER_RESOLUTION:1,DEFAULT_RENDER_OPTIONS:{view:null,resolution:1,antialias:!1,forceFXAA:!1,autoResize:!1,transparent:!1,backgroundColor:0,clearBeforeRender:!0,preserveDrawingBuffer:!1,roundPixels:!1},SHAPES:{POLY:0,RECT:1,CIRC:2,ELIP:3,RREC:4},PRECISION:{DEFAULT:"mediump",LOW:"lowp",MEDIUM:"mediump",HIGH:"highp"},TRANSFORM_MODE:{DEFAULT:0,STATIC:0,DYNAMIC:1},TEXT_GRADIENT:{LINEAR_VERTICAL:0,LINEAR_HORIZONTAL:1},SPRITE_BATCH_SIZE:4096,SPRITE_MAX_TEXTURES:t("./utils/maxRecommendedTextures")(32)};e.exports=i},{"./utils/maxRecommendedTextures":152}],79:[function(t,e,r){function i(){this.minX=1/0,this.minY=1/0,this.maxX=-(1/0),this.maxY=-(1/0),this.rect=null}var n=t("../math"),s=n.Rectangle;i.prototype.constructor=i,e.exports=i,i.prototype.isEmpty=function(){return this.minX>this.maxX||this.minY>this.maxY},i.prototype.clear=function(){this.updateID++,this.minX=1/0,this.minY=1/0,this.maxX=-(1/0),this.maxY=-(1/0)},i.prototype.getRectangle=function(t){return this.minX>this.maxX||this.minY>this.maxY?s.EMPTY:(t=t||new s(0,0,1,1),t.x=this.minX,t.y=this.minY,t.width=this.maxX-this.minX,t.height=this.maxY-this.minY,t)},i.prototype.addPoint=function(t){this.minX=Math.min(this.minX,t.x),this.maxX=Math.max(this.maxX,t.x),this.minY=Math.min(this.minY,t.y),this.maxY=Math.max(this.maxY,t.y)},i.prototype.addQuad=function(t){var e=this.minX,r=this.minY,i=this.maxX,n=this.maxY,s=t[0],o=t[1];e=s<e?s:e,r=o<r?o:r,i=s>i?s:i,n=o>n?o:n,s=t[2],o=t[3],e=s<e?s:e,r=o<r?o:r,i=s>i?s:i,n=o>n?o:n,s=t[4],o=t[5],e=s<e?s:e,r=o<r?o:r,i=s>i?s:i,n=o>n?o:n,s=t[6],o=t[7],e=s<e?s:e,r=o<r?o:r,i=s>i?s:i,n=o>n?o:n,this.minX=e,this.minY=r,this.maxX=i,this.maxY=n},i.prototype.addFrame=function(t,e,r,i,n){var s=t.worldTransform,o=s.a,a=s.b,h=s.c,u=s.d,l=s.tx,c=s.ty,d=this.minX,p=this.minY,f=this.maxX,v=this.maxY,g=o*e+h*r+l,y=a*e+u*r+c;d=g<d?g:d,p=y<p?y:p,f=g>f?g:f,v=y>v?y:v,g=o*i+h*r+l,y=a*i+u*r+c,d=g<d?g:d,p=y<p?y:p,f=g>f?g:f,v=y>v?y:v,g=o*e+h*n+l,y=a*e+u*n+c,d=g<d?g:d,p=y<p?y:p,f=g>f?g:f,v=y>v?y:v,g=o*i+h*n+l,y=a*i+u*n+c,d=g<d?g:d,p=y<p?y:p,f=g>f?g:f,v=y>v?y:v,this.minX=d,this.minY=p,this.maxX=f,this.maxY=v},i.prototype.addVertices=function(t,e,r,i){for(var n=t.worldTransform,s=n.a,o=n.b,a=n.c,h=n.d,u=n.tx,l=n.ty,c=this.minX,d=this.minY,p=this.maxX,f=this.maxY,v=r;v<i;v+=2){var g=e[v],y=e[v+1],x=s*g+a*y+u,m=h*y+o*g+l;c=x<c?x:c,d=m<d?m:d,p=x>p?x:p,f=m>f?m:f}this.minX=c,this.minY=d,this.maxX=p,this.maxY=f},i.prototype.addBounds=function(t){var e=this.minX,r=this.minY,i=this.maxX,n=this.maxY;this.minX=t.minX<e?t.minX:e,this.minY=t.minY<r?t.minY:r,this.maxX=t.maxX>i?t.maxX:i,this.maxY=t.maxY>n?t.maxY:n}},{"../math":102}],80:[function(t,e,r){function i(){s.call(this),this.children=[]}var n=t("../utils"),s=t("./DisplayObject");i.prototype=Object.create(s.prototype),i.prototype.constructor=i,e.exports=i,Object.defineProperties(i.prototype,{width:{get:function(){return this.scale.x*this.getLocalBounds().width},set:function(t){var e=this.getLocalBounds().width;0!==e?this.scale.x=t/e:this.scale.x=1,this._width=t}},height:{get:function(){return this.scale.y*this.getLocalBounds().height},set:function(t){var e=this.getLocalBounds().height;0!==e?this.scale.y=t/e:this.scale.y=1,this._height=t}}}),i.prototype.onChildrenChange=function(){},i.prototype.addChild=function(t){var e=arguments.length;if(e>1)for(var r=0;r<e;r++)this.addChild(arguments[r]);else t.parent&&t.parent.removeChild(t),t.parent=this,this.transform._parentID=-1,this.children.push(t),this.onChildrenChange(this.children.length-1),t.emit("added",this);return t},i.prototype.addChildAt=function(t,e){if(e>=0&&e<=this.children.length)return t.parent&&t.parent.removeChild(t),t.parent=this,this.children.splice(e,0,t),this.onChildrenChange(e),t.emit("added",this),t;throw new Error(t+"addChildAt: The index "+e+" supplied is out of bounds "+this.children.length)},i.prototype.swapChildren=function(t,e){if(t!==e){var r=this.getChildIndex(t),i=this.getChildIndex(e);if(r<0||i<0)throw new Error("swapChildren: Both the supplied DisplayObjects must be children of the caller.");this.children[r]=e,this.children[i]=t,this.onChildrenChange(r<i?r:i)}},i.prototype.getChildIndex=function(t){var e=this.children.indexOf(t);if(e===-1)throw new Error("The supplied DisplayObject must be a child of the caller");return e},i.prototype.setChildIndex=function(t,e){if(e<0||e>=this.children.length)throw new Error("The supplied index is out of bounds");var r=this.getChildIndex(t);n.removeItems(this.children,r,1),this.children.splice(e,0,t),this.onChildrenChange(e)},i.prototype.getChildAt=function(t){if(t<0||t>=this.children.length)throw new Error("getChildAt: Supplied index "+t+" does not exist in the child list, or the supplied DisplayObject is not a child of the caller");return this.children[t]},i.prototype.removeChild=function(t){var e=arguments.length;if(e>1)for(var r=0;r<e;r++)this.removeChild(arguments[r]);else{var i=this.children.indexOf(t);if(i===-1)return;t.parent=null,n.removeItems(this.children,i,1),this.onChildrenChange(i),t.emit("removed",this)}return t},i.prototype.removeChildAt=function(t){var e=this.getChildAt(t);return e.parent=null,n.removeItems(this.children,t,1),this.onChildrenChange(t),e.emit("removed",this),e},i.prototype.removeChildren=function(t,e){var r,i,n=t||0,s="number"==typeof e?e:this.children.length,o=s-n;if(o>0&&o<=s){for(r=this.children.splice(n,o),i=0;i<r.length;++i)r[i].parent=null;for(this.onChildrenChange(t),i=0;i<r.length;++i)r[i].emit("removed",this);return r}if(0===o&&0===this.children.length)return[];throw new RangeError("removeChildren: numeric values are outside the acceptable range.")},i.prototype.updateTransform=function(){if(this._boundsID++,this.visible){this.transform.updateTransform(this.parent.transform),this.worldAlpha=this.alpha*this.parent.worldAlpha;for(var t=0,e=this.children.length;t<e;++t)this.children[t].updateTransform()}},i.prototype.containerUpdateTransform=i.prototype.updateTransform,i.prototype.calculateBounds=function(){if(this._bounds.clear(),this.visible){this._calculateBounds();for(var t=0;t<this.children.length;t++){var e=this.children[t];e.calculateBounds(),this._bounds.addBounds(e._bounds)}this._boundsID=this._lastBoundsID}},i.prototype._calculateBounds=function(){},i.prototype.renderWebGL=function(t){if(this.visible&&!(this.worldAlpha<=0)&&this.renderable)if(this._mask||this._filters)this.renderAdvancedWebGL(t);else{this._renderWebGL(t);for(var e=0,r=this.children.length;e<r;++e)this.children[e].renderWebGL(t)}},i.prototype.renderAdvancedWebGL=function(t){t.currentRenderer.flush();var e,r,i=this._filters,n=this._mask;if(i){for(this._enabledFilters||(this._enabledFilters=[]),this._enabledFilters.length=0,e=0;e<i.length;e++)i[e].enabled&&this._enabledFilters.push(i[e]);this._enabledFilters.length&&t.filterManager.pushFilter(this,this._enabledFilters)}for(n&&t.maskManager.pushMask(this,this._mask),t.currentRenderer.start(),this._renderWebGL(t),e=0,r=this.children.length;e<r;e++)this.children[e].renderWebGL(t);t.currentRenderer.flush(),n&&t.maskManager.popMask(this,this._mask),i&&this._enabledFilters&&this._enabledFilters.length&&t.filterManager.popFilter(),t.currentRenderer.start()},i.prototype._renderWebGL=function(t){},i.prototype._renderCanvas=function(t){},i.prototype.renderCanvas=function(t){if(this.visible&&!(this.alpha<=0)&&this.renderable){this._mask&&t.maskManager.pushMask(this._mask),this._renderCanvas(t);for(var e=0,r=this.children.length;e<r;++e)this.children[e].renderCanvas(t);this._mask&&t.maskManager.popMask(t)}},i.prototype.destroy=function(t){s.prototype.destroy.call(this);var e="boolean"==typeof t?t:t&&t.children,r=this.children;if(this.children=null,e)for(var i=r.length-1;i>=0;i--){var n=r[i];n.parent=null,n.destroy(t)}}},{"../utils":151,"./DisplayObject":81}],81:[function(t,e,r){function i(){n.call(this);var t=s.TRANSFORM_MODE.DEFAULT===s.TRANSFORM_MODE.STATIC?o:a;this.transform=new t,this.alpha=1,this.visible=!0,this.renderable=!0,this.parent=null,this.worldAlpha=1,this.filterArea=null,this._filters=null,this._enabledFilters=null,this._bounds=new h,this._boundsID=0,this._lastBoundsID=-1,this._boundsRect=null,this._localBoundsRect=null,this._mask=null}var n=t("eventemitter3"),s=t("../const"),o=t("./TransformStatic"),a=t("./Transform"),h=t("./Bounds"),u=t("../math"),l=new i;i.prototype=Object.create(n.prototype),i.prototype.constructor=i,e.exports=i,Object.defineProperties(i.prototype,{x:{get:function(){return this.position.x},set:function(t){this.transform.position.x=t}},y:{get:function(){return this.position.y},set:function(t){this.transform.position.y=t}},worldTransform:{get:function(){return this.transform.worldTransform}},localTransform:{get:function(){return this.transform.localTransform}},position:{get:function(){return this.transform.position},set:function(t){this.transform.position.copy(t)}},scale:{get:function(){return this.transform.scale},set:function(t){this.transform.scale.copy(t)}},pivot:{get:function(){return this.transform.pivot},set:function(t){this.transform.pivot.copy(t)}},skew:{get:function(){return this.transform.skew},set:function(t){this.transform.skew.copy(t)}},rotation:{get:function(){return this.transform.rotation},set:function(t){this.transform.rotation=t}},worldVisible:{get:function(){var t=this;do{if(!t.visible)return!1;t=t.parent}while(t);return!0}},mask:{get:function(){return this._mask},set:function(t){this._mask&&(this._mask.renderable=!0),this._mask=t,this._mask&&(this._mask.renderable=!1)}},filters:{get:function(){return this._filters&&this._filters.slice()},set:function(t){this._filters=t&&t.slice()}}}),i.prototype.updateTransform=function(){this.transform.updateTransform(this.parent.transform),this.worldAlpha=this.alpha*this.parent.worldAlpha,this._bounds.updateID++},i.prototype.displayObjectUpdateTransform=i.prototype.updateTransform,i.prototype._recursivePostUpdateTransform=function(){this.parent?(this.parent._recursivePostUpdateTransform(),this.transform.updateTransform(this.parent.transform)):this.transform.updateTransform(l.transform)},i.prototype.getBounds=function(t,e){return t||(this.parent?(this._recursivePostUpdateTransform(),this.updateTransform()):(this.parent=l,this.parent.transform._worldID++,this.updateTransform(),this.parent=null)),this._boundsID!==this._lastBoundsID&&this.calculateBounds(),e||(this._boundsRect||(this._boundsRect=new u.Rectangle),e=this._boundsRect),this._bounds.getRectangle(e)},i.prototype.getLocalBounds=function(t){var e=this.transform,r=this.parent;this.parent=null,this.transform=l.transform,t||(this._localBoundsRect||(this._localBoundsRect=new u.Rectangle),t=this._localBoundsRect);var i=this.getBounds(!1,t);return this.parent=r,this.transform=e,i},i.prototype.toGlobal=function(t,e,r){return r||(this._recursivePostUpdateTransform(),this.parent?this.displayObjectUpdateTransform():(this.parent=l,this.displayObjectUpdateTransform(),this.parent=null)),this.worldTransform.apply(t,e)},i.prototype.toLocal=function(t,e,r,i){return e&&(t=e.toGlobal(t,r,i)),i||(this._recursivePostUpdateTransform(),this.parent?this.displayObjectUpdateTransform():(this.parent=l,this.displayObjectUpdateTransform(),this.parent=null)),this.worldTransform.applyInverse(t,r)},i.prototype.renderWebGL=function(t){},i.prototype.renderCanvas=function(t){},i.prototype.setParent=function(t){if(!t||!t.addChild)throw new Error("setParent: Argument must be a Container");return t.addChild(this),t},i.prototype.setTransform=function(t,e,r,i,n,s,o,a,h){return this.position.x=t||0,this.position.y=e||0,this.scale.x=r?r:1,this.scale.y=i?i:1,this.rotation=n||0,this.skew.x=s||0,this.skew.y=o||0,this.pivot.x=a||0,this.pivot.y=h||0,this},i.prototype.destroy=function(){this.removeAllListeners(),this.parent&&this.parent.removeChild(this),this.transform=null,this.parent=null,this._bounds=null,this._currentBounds=null,this._mask=null,this.filterArea=null}},{"../const":78,"../math":102,"./Bounds":79,"./Transform":82,"./TransformStatic":84,eventemitter3:32}],82:[function(t,e,r){function i(){s.call(this),this.position=new n.Point(0,0),this.scale=new n.Point(1,1),this.skew=new n.ObservablePoint(this.updateSkew,this,0,0),this.pivot=new n.Point(0,0),this._rotation=0,this._sr=Math.sin(0),this._cr=Math.cos(0),this._cy=Math.cos(0),this._sy=Math.sin(0),this._nsx=Math.sin(0),this._cx=Math.cos(0)}var n=t("../math"),s=t("./TransformBase");i.prototype=Object.create(s.prototype),i.prototype.constructor=i,i.prototype.updateSkew=function(){this._cy=Math.cos(this.skew.y),this._sy=Math.sin(this.skew.y),this._nsx=Math.sin(this.skew.x),this._cx=Math.cos(this.skew.x)},i.prototype.updateLocalTransform=function(){var t,e,r,i,n=this.localTransform;t=this._cr*this.scale.x,e=this._sr*this.scale.x,r=-this._sr*this.scale.y,i=this._cr*this.scale.y,n.a=this._cy*t+this._sy*r,n.b=this._cy*e+this._sy*i,n.c=this._nsx*t+this._cx*r,n.d=this._nsx*e+this._cx*i},i.prototype.updateTransform=function(t){var e,r,i,n,s=t.worldTransform,o=this.worldTransform,a=this.localTransform;e=this._cr*this.scale.x,r=this._sr*this.scale.x,i=-this._sr*this.scale.y,n=this._cr*this.scale.y,a.a=this._cy*e+this._sy*i,a.b=this._cy*r+this._sy*n,a.c=this._nsx*e+this._cx*i,a.d=this._nsx*r+this._cx*n,a.tx=this.position.x-(this.pivot.x*a.a+this.pivot.y*a.c),a.ty=this.position.y-(this.pivot.x*a.b+this.pivot.y*a.d),o.a=a.a*s.a+a.b*s.c,o.b=a.a*s.b+a.b*s.d,o.c=a.c*s.a+a.d*s.c,o.d=a.c*s.b+a.d*s.d,o.tx=a.tx*s.a+a.ty*s.c+s.tx,o.ty=a.tx*s.b+a.ty*s.d+s.ty,this._worldID++},i.prototype.setFromMatrix=function(t){t.decompose(this)},Object.defineProperties(i.prototype,{rotation:{get:function(){return this._rotation},set:function(t){this._rotation=t,this._sr=Math.sin(t),this._cr=Math.cos(t)}}}),e.exports=i},{"../math":102,"./TransformBase":83}],83:[function(t,e,r){function i(){this.worldTransform=new n.Matrix,this.localTransform=new n.Matrix,this._worldID=0}var n=t("../math");i.prototype.constructor=i,i.prototype.updateLocalTransform=function(){},i.prototype.updateTransform=function(t){var e=t.worldTransform,r=this.worldTransform,i=this.localTransform;r.a=i.a*e.a+i.b*e.c,r.b=i.a*e.b+i.b*e.d,r.c=i.c*e.a+i.d*e.c,r.d=i.c*e.b+i.d*e.d,r.tx=i.tx*e.a+i.ty*e.c+e.tx,r.ty=i.tx*e.b+i.ty*e.d+e.ty,this._worldID++},i.prototype.updateWorldTransform=i.prototype.updateTransform,i.IDENTITY=new i,e.exports=i},{"../math":102}],84:[function(t,e,r){function i(){s.call(this),this.position=new n.ObservablePoint(this.onChange,this,0,0),this.scale=new n.ObservablePoint(this.onChange,this,1,1),this.pivot=new n.ObservablePoint(this.onChange,this,0,0),this.skew=new n.ObservablePoint(this.updateSkew,this,0,0),this._rotation=0,this._sr=Math.sin(0),this._cr=Math.cos(0),this._cy=Math.cos(0),this._sy=Math.sin(0),this._nsx=Math.sin(0),this._cx=Math.cos(0),this._localID=0,this._currentLocalID=0}var n=t("../math"),s=t("./TransformBase");i.prototype=Object.create(s.prototype),i.prototype.constructor=i,i.prototype.onChange=function(){this._localID++},i.prototype.updateSkew=function(){this._cy=Math.cos(this.skew._y),this._sy=Math.sin(this.skew._y),this._nsx=Math.sin(this.skew._x),this._cx=Math.cos(this.skew._x),this._localID++},i.prototype.updateLocalTransform=function(){var t=this.localTransform;if(this._localID!==this._currentLocalID){var e,r,i,n;e=this._cr*this.scale._x,r=this._sr*this.scale._x,i=-this._sr*this.scale._y,n=this._cr*this.scale._y,t.a=this._cy*e+this._sy*i,t.b=this._cy*r+this._sy*n,t.c=this._nsx*e+this._cx*i,t.d=this._nsx*r+this._cx*n,t.tx=this.position._x-(this.pivot._x*t.a+this.pivot._y*t.c),t.ty=this.position._y-(this.pivot._x*t.b+this.pivot._y*t.d),this._currentLocalID=this._localID,this._parentID=-1}},i.prototype.updateTransform=function(t){var e=t.worldTransform,r=this.worldTransform,i=this.localTransform;if(this._localID!==this._currentLocalID){var n,s,o,a;n=this._cr*this.scale._x,s=this._sr*this.scale._x,o=-this._sr*this.scale._y,a=this._cr*this.scale._y,i.a=this._cy*n+this._sy*o,i.b=this._cy*s+this._sy*a,i.c=this._nsx*n+this._cx*o,i.d=this._nsx*s+this._cx*a,i.tx=this.position._x-(this.pivot._x*i.a+this.pivot._y*i.c),i.ty=this.position._y-(this.pivot._x*i.b+this.pivot._y*i.d),this._currentLocalID=this._localID,this._parentID=-1}this._parentID!==t._worldID&&(r.a=i.a*e.a+i.b*e.c,r.b=i.a*e.b+i.b*e.d,r.c=i.c*e.a+i.d*e.c,r.d=i.c*e.b+i.d*e.d,r.tx=i.tx*e.a+i.ty*e.c+e.tx,r.ty=i.tx*e.b+i.ty*e.d+e.ty,this._parentID=t._worldID,this._worldID++)},i.prototype.setFromMatrix=function(t){t.decompose(this),this._localID++},Object.defineProperties(i.prototype,{rotation:{get:function(){return this._rotation},set:function(t){this._rotation=t,this._sr=Math.sin(t),this._cr=Math.cos(t),this._localID++}}}),e.exports=i},{"../math":102,"./TransformBase":83}],85:[function(t,e,r){function i(){s.call(this),this.fillAlpha=1,this.lineWidth=0,this.lineColor=0,this.graphicsData=[],this.tint=16777215,this._prevTint=16777215,this.blendMode=c.BLEND_MODES.NORMAL,this.currentPath=null,this._webGL={},this.isMask=!1,this.boundsPadding=0,this._localBounds=new d,this.dirty=0,this.fastRectDirty=-1,this.clearDirty=0,this.boundsDirty=-1,this.cachedSpriteDirty=!1,this._spriteRect=null,this._fastRect=!1}var n,s=t("../display/Container"),o=t("../textures/RenderTexture"),a=t("../textures/Texture"),h=t("./GraphicsData"),u=t("../sprites/Sprite"),l=t("../math"),c=t("../const"),d=t("../display/Bounds"),p=t("./utils/bezierCurveTo"),f=t("../renderers/canvas/CanvasRenderer"),v=new l.Matrix,g=new l.Point;i._SPRITE_TEXTURE=null,i.prototype=Object.create(s.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.clone=function(){var t=new i;t.renderable=this.renderable,t.fillAlpha=this.fillAlpha,t.lineWidth=this.lineWidth,t.lineColor=this.lineColor,t.tint=this.tint,t.blendMode=this.blendMode,t.isMask=this.isMask,t.boundsPadding=this.boundsPadding,t.dirty=0,t.cachedSpriteDirty=this.cachedSpriteDirty;for(var e=0;e<this.graphicsData.length;++e)t.graphicsData.push(this.graphicsData[e].clone());return t.currentPath=t.graphicsData[t.graphicsData.length-1],t.updateLocalBounds(),t},i.prototype.lineStyle=function(t,e,r){if(this.lineWidth=t||0,this.lineColor=e||0,this.lineAlpha=void 0===r?1:r,this.currentPath)if(this.currentPath.shape.points.length){var i=new l.Polygon(this.currentPath.shape.points.slice(-2));i.closed=!1,this.drawShape(i)}else this.currentPath.lineWidth=this.lineWidth,this.currentPath.lineColor=this.lineColor,this.currentPath.lineAlpha=this.lineAlpha;return this},i.prototype.moveTo=function(t,e){var r=new l.Polygon([t,e]);return r.closed=!1,this.drawShape(r),this},i.prototype.lineTo=function(t,e){return this.currentPath.shape.points.push(t,e),this.dirty++,this},i.prototype.quadraticCurveTo=function(t,e,r,i){this.currentPath?0===this.currentPath.shape.points.length&&(this.currentPath.shape.points=[0,0]):this.moveTo(0,0);var n,s,o=20,a=this.currentPath.shape.points;0===a.length&&this.moveTo(0,0);for(var h=a[a.length-2],u=a[a.length-1],l=0,c=1;c<=o;++c)l=c/o,n=h+(t-h)*l,s=u+(e-u)*l,a.push(n+(t+(r-t)*l-n)*l,s+(e+(i-e)*l-s)*l);return this.dirty++,this},i.prototype.bezierCurveTo=function(t,e,r,i,n,s){this.currentPath?0===this.currentPath.shape.points.length&&(this.currentPath.shape.points=[0,0]):this.moveTo(0,0);var o=this.currentPath.shape.points,a=o[o.length-2],h=o[o.length-1];return o.length-=2,p(a,h,t,e,r,i,n,s,o),this.dirty++,this},i.prototype.arcTo=function(t,e,r,i,n){this.currentPath?0===this.currentPath.shape.points.length&&this.currentPath.shape.points.push(t,e):this.moveTo(t,e);var s=this.currentPath.shape.points,o=s[s.length-2],a=s[s.length-1],h=a-e,u=o-t,l=i-e,c=r-t,d=Math.abs(h*c-u*l);
if(d<1e-8||0===n)s[s.length-2]===t&&s[s.length-1]===e||s.push(t,e);else{var p=h*h+u*u,f=l*l+c*c,v=h*l+u*c,g=n*Math.sqrt(p)/d,y=n*Math.sqrt(f)/d,x=g*v/p,m=y*v/f,_=g*c+y*u,b=g*l+y*h,T=u*(y+x),E=h*(y+x),w=c*(g+m),S=l*(g+m),A=Math.atan2(E-b,T-_),M=Math.atan2(S-b,w-_);this.arc(_+t,b+e,n,A,M,u*l>c*h)}return this.dirty++,this},i.prototype.arc=function(t,e,r,i,n,s){if(s=s||!1,i===n)return this;!s&&n<=i?n+=2*Math.PI:s&&i<=n&&(i+=2*Math.PI);var o=s?(i-n)*-1:n-i,a=40*Math.ceil(Math.abs(o)/(2*Math.PI));if(0===o)return this;var h=t+Math.cos(i)*r,u=e+Math.sin(i)*r;this.currentPath?this.currentPath.shape.points.push(h,u):this.moveTo(h,u);for(var l=this.currentPath.shape.points,c=o/(2*a),d=2*c,p=Math.cos(c),f=Math.sin(c),v=a-1,g=v%1/v,y=0;y<=v;y++){var x=y+g*y,m=c+i+d*x,_=Math.cos(m),b=-Math.sin(m);l.push((p*_+f*b)*r+t,(p*-b+f*_)*r+e)}return this.dirty++,this},i.prototype.beginFill=function(t,e){return this.filling=!0,this.fillColor=t||0,this.fillAlpha=void 0===e?1:e,this.currentPath&&this.currentPath.shape.points.length<=2&&(this.currentPath.fill=this.filling,this.currentPath.fillColor=this.fillColor,this.currentPath.fillAlpha=this.fillAlpha),this},i.prototype.endFill=function(){return this.filling=!1,this.fillColor=null,this.fillAlpha=1,this},i.prototype.drawRect=function(t,e,r,i){return this.drawShape(new l.Rectangle(t,e,r,i)),this},i.prototype.drawRoundedRect=function(t,e,r,i,n){return this.drawShape(new l.RoundedRectangle(t,e,r,i,n)),this},i.prototype.drawCircle=function(t,e,r){return this.drawShape(new l.Circle(t,e,r)),this},i.prototype.drawEllipse=function(t,e,r,i){return this.drawShape(new l.Ellipse(t,e,r,i)),this},i.prototype.drawPolygon=function(t){var e=t,r=!0;if(e instanceof l.Polygon&&(r=e.closed,e=e.points),!Array.isArray(e)){e=new Array(arguments.length);for(var i=0;i<e.length;++i)e[i]=arguments[i]}var n=new l.Polygon(e);return n.closed=r,this.drawShape(n),this},i.prototype.clear=function(){return this.lineWidth=0,this.filling=!1,this.dirty++,this.clearDirty++,this.graphicsData=[],this},i.prototype.isFastRect=function(){return 1===this.graphicsData.length&&this.graphicsData[0].shape.type===c.SHAPES.RECT&&!this.graphicsData[0].lineWidth},i.prototype._renderWebGL=function(t){this.dirty!==this.fastRectDirty&&(this.fastRectDirty=this.dirty,this._fastRect=this.isFastRect()),this._fastRect?this._renderSpriteRect(t):(t.setObjectRenderer(t.plugins.graphics),t.plugins.graphics.render(this))},i.prototype._renderSpriteRect=function(t){var e=this.graphicsData[0].shape;if(!this._spriteRect){if(!i._SPRITE_TEXTURE){i._SPRITE_TEXTURE=o.create(10,10);var r=t._activeRenderTarget;t.bindRenderTexture(i._SPRITE_TEXTURE),t.clear([1,1,1,1]),t.bindRenderTarget(r)}this._spriteRect=new u(i._SPRITE_TEXTURE)}this._spriteRect.tint=this.graphicsData[0].fillColor,this._spriteRect.alpha=this.graphicsData[0].fillAlpha,this._spriteRect.worldAlpha=this.worldAlpha*this._spriteRect.alpha,i._SPRITE_TEXTURE._frame.width=e.width,i._SPRITE_TEXTURE._frame.height=e.height,this._spriteRect.transform.worldTransform=this.transform.worldTransform,this._spriteRect.anchor.set(-e.x/e.width,-e.y/e.height),this._spriteRect.onAnchorUpdate(),this._spriteRect._renderWebGL(t)},i.prototype._renderCanvas=function(t){this.isMask!==!0&&t.plugins.graphics.render(this)},i.prototype._calculateBounds=function(){if(this.renderable){this.boundsDirty!==this.dirty&&(this.boundsDirty=this.dirty,this.updateLocalBounds(),this.dirty++,this.cachedSpriteDirty=!0);var t=this._localBounds;this._bounds.addFrame(this.transform,t.minX,t.minY,t.maxX,t.maxY)}},i.prototype.containsPoint=function(t){this.worldTransform.applyInverse(t,g);for(var e=this.graphicsData,r=0;r<e.length;r++){var i=e[r];if(i.fill&&i.shape&&i.shape.contains(g.x,g.y))return!0}return!1},i.prototype.updateLocalBounds=function(){var t=1/0,e=-(1/0),r=1/0,i=-(1/0);if(this.graphicsData.length)for(var n,s,o,a,h,u,l=0;l<this.graphicsData.length;l++){var d=this.graphicsData[l],p=d.type,f=d.lineWidth;if(n=d.shape,p===c.SHAPES.RECT||p===c.SHAPES.RREC)o=n.x-f/2,a=n.y-f/2,h=n.width+f,u=n.height+f,t=o<t?o:t,e=o+h>e?o+h:e,r=a<r?a:r,i=a+u>i?a+u:i;else if(p===c.SHAPES.CIRC)o=n.x,a=n.y,h=n.radius+f/2,u=n.radius+f/2,t=o-h<t?o-h:t,e=o+h>e?o+h:e,r=a-u<r?a-u:r,i=a+u>i?a+u:i;else if(p===c.SHAPES.ELIP)o=n.x,a=n.y,h=n.width+f/2,u=n.height+f/2,t=o-h<t?o-h:t,e=o+h>e?o+h:e,r=a-u<r?a-u:r,i=a+u>i?a+u:i;else{s=n.points;for(var v=0;v<s.length;v+=2)o=s[v],a=s[v+1],t=o-f<t?o-f:t,e=o+f>e?o+f:e,r=a-f<r?a-f:r,i=a+f>i?a+f:i}}else t=0,e=0,r=0,i=0;var g=this.boundsPadding;this._localBounds.minX=t-g,this._localBounds.maxX=e+2*g,this._localBounds.minY=r-g,this._localBounds.maxY=i+2*g},i.prototype.drawShape=function(t){this.currentPath&&this.currentPath.shape.points.length<=2&&this.graphicsData.pop(),this.currentPath=null;var e=new h(this.lineWidth,this.lineColor,this.lineAlpha,this.fillColor,this.fillAlpha,this.filling,t);return this.graphicsData.push(e),e.type===c.SHAPES.POLY&&(e.shape.closed=e.shape.closed||this.filling,this.currentPath=e),this.dirty++,e},i.prototype.generateCanvasTexture=function(t,e){e=e||1;var r=this.getLocalBounds(),i=new o.create(r.width*e,r.height*e);n||(n=new f),v.tx=-r.x,v.ty=-r.y,n.render(this,i,!1,v);var s=a.fromCanvas(i.baseTexture._canvasRenderTarget.canvas,t);return s.baseTexture.resolution=e,s},i.prototype.closePath=function(){var t=this.currentPath;return t&&t.shape&&t.shape.close(),this},i.prototype.addHole=function(){var t=this.graphicsData.pop();return this.currentPath=this.graphicsData[this.graphicsData.length-1],this.currentPath.addHole(t.shape),this.currentPath=null,this},i.prototype.destroy=function(){s.prototype.destroy.apply(this,arguments);for(var t=0;t<this.graphicsData.length;++t)this.graphicsData[t].destroy();for(var e in this._webgl)for(var r=0;r<this._webgl[e].data.length;++r)this._webgl[e].data[r].destroy();this._spriteRect&&this._spriteRect.destroy(),this.graphicsData=null,this.currentPath=null,this._webgl=null,this._localBounds=null}},{"../const":78,"../display/Bounds":79,"../display/Container":80,"../math":102,"../renderers/canvas/CanvasRenderer":109,"../sprites/Sprite":133,"../textures/RenderTexture":143,"../textures/Texture":144,"./GraphicsData":86,"./utils/bezierCurveTo":88}],86:[function(t,e,r){function i(t,e,r,i,n,s,o){this.lineWidth=t,this.lineColor=e,this.lineAlpha=r,this._lineTint=e,this.fillColor=i,this.fillAlpha=n,this._fillTint=i,this.fill=s,this.holes=[],this.shape=o,this.type=o.type}i.prototype.constructor=i,e.exports=i,i.prototype.clone=function(){return new i(this.lineWidth,this.lineColor,this.lineAlpha,this.fillColor,this.fillAlpha,this.fill,this.shape)},i.prototype.addHole=function(t){this.holes.push(t)},i.prototype.destroy=function(){this.shape=null,this.holes=null}},{}],87:[function(t,e,r){function i(t){this.renderer=t}var n=t("../../renderers/canvas/CanvasRenderer"),s=t("../../const");i.prototype.constructor=i,e.exports=i,n.registerPlugin("graphics",i),i.prototype.render=function(t){var e=this.renderer,r=e.context,i=t.worldAlpha,n=t.transform.worldTransform,o=e.resolution;this._prevTint!==this.tint&&(this.dirty=!0),r.setTransform(n.a*o,n.b*o,n.c*o,n.d*o,n.tx*o,n.ty*o),t.dirty&&(this.updateGraphicsTint(t),t.dirty=!1),e.setBlendMode(t.blendMode);for(var a=0;a<t.graphicsData.length;a++){var h=t.graphicsData[a],u=h.shape,l=h._fillTint,c=h._lineTint;if(r.lineWidth=h.lineWidth,h.type===s.SHAPES.POLY){r.beginPath(),this.renderPolygon(u.points,u.closed,r);for(var d=0;d<h.holes.length;d++){var p=h.holes[d];this.renderPolygon(p.points,!0,r)}h.fill&&(r.globalAlpha=h.fillAlpha*i,r.fillStyle="#"+("00000"+(0|l).toString(16)).substr(-6),r.fill()),h.lineWidth&&(r.globalAlpha=h.lineAlpha*i,r.strokeStyle="#"+("00000"+(0|c).toString(16)).substr(-6),r.stroke())}else if(h.type===s.SHAPES.RECT)(h.fillColor||0===h.fillColor)&&(r.globalAlpha=h.fillAlpha*i,r.fillStyle="#"+("00000"+(0|l).toString(16)).substr(-6),r.fillRect(u.x,u.y,u.width,u.height)),h.lineWidth&&(r.globalAlpha=h.lineAlpha*i,r.strokeStyle="#"+("00000"+(0|c).toString(16)).substr(-6),r.strokeRect(u.x,u.y,u.width,u.height));else if(h.type===s.SHAPES.CIRC)r.beginPath(),r.arc(u.x,u.y,u.radius,0,2*Math.PI),r.closePath(),h.fill&&(r.globalAlpha=h.fillAlpha*i,r.fillStyle="#"+("00000"+(0|l).toString(16)).substr(-6),r.fill()),h.lineWidth&&(r.globalAlpha=h.lineAlpha*i,r.strokeStyle="#"+("00000"+(0|c).toString(16)).substr(-6),r.stroke());else if(h.type===s.SHAPES.ELIP){var f=2*u.width,v=2*u.height,g=u.x-f/2,y=u.y-v/2;r.beginPath();var x=.5522848,m=f/2*x,_=v/2*x,b=g+f,T=y+v,E=g+f/2,w=y+v/2;r.moveTo(g,w),r.bezierCurveTo(g,w-_,E-m,y,E,y),r.bezierCurveTo(E+m,y,b,w-_,b,w),r.bezierCurveTo(b,w+_,E+m,T,E,T),r.bezierCurveTo(E-m,T,g,w+_,g,w),r.closePath(),h.fill&&(r.globalAlpha=h.fillAlpha*i,r.fillStyle="#"+("00000"+(0|l).toString(16)).substr(-6),r.fill()),h.lineWidth&&(r.globalAlpha=h.lineAlpha*i,r.strokeStyle="#"+("00000"+(0|c).toString(16)).substr(-6),r.stroke())}else if(h.type===s.SHAPES.RREC){var S=u.x,A=u.y,M=u.width,R=u.height,C=u.radius,O=Math.min(M,R)/2|0;C=C>O?O:C,r.beginPath(),r.moveTo(S,A+C),r.lineTo(S,A+R-C),r.quadraticCurveTo(S,A+R,S+C,A+R),r.lineTo(S+M-C,A+R),r.quadraticCurveTo(S+M,A+R,S+M,A+R-C),r.lineTo(S+M,A+C),r.quadraticCurveTo(S+M,A,S+M-C,A),r.lineTo(S+C,A),r.quadraticCurveTo(S,A,S,A+C),r.closePath(),(h.fillColor||0===h.fillColor)&&(r.globalAlpha=h.fillAlpha*i,r.fillStyle="#"+("00000"+(0|l).toString(16)).substr(-6),r.fill()),h.lineWidth&&(r.globalAlpha=h.lineAlpha*i,r.strokeStyle="#"+("00000"+(0|c).toString(16)).substr(-6),r.stroke())}}},i.prototype.updateGraphicsTint=function(t){t._prevTint=t.tint;for(var e=(t.tint>>16&255)/255,r=(t.tint>>8&255)/255,i=(255&t.tint)/255,n=0;n<t.graphicsData.length;n++){var s=t.graphicsData[n],o=0|s.fillColor,a=0|s.lineColor;s._fillTint=((o>>16&255)/255*e*255<<16)+((o>>8&255)/255*r*255<<8)+(255&o)/255*i*255,s._lineTint=((a>>16&255)/255*e*255<<16)+((a>>8&255)/255*r*255<<8)+(255&a)/255*i*255}},i.prototype.renderPolygon=function(t,e,r){r.moveTo(t[0],t[1]);for(var i=1;i<t.length/2;i++)r.lineTo(t[2*i],t[2*i+1]);e&&r.closePath()},i.prototype.destroy=function(){this.renderer=null}},{"../../const":78,"../../renderers/canvas/CanvasRenderer":109}],88:[function(t,e,r){var i=function(t,e,r,i,n,s,o,a,h){h=h||[];var u,l,c,d,p,f=20;h.push(t,e);for(var v=0,g=1;g<=f;++g)v=g/f,u=1-v,l=u*u,c=l*u,d=v*v,p=d*v,h.push(c*t+3*l*v*r+3*u*d*n+p*o,c*e+3*l*v*i+3*u*d*s+p*a);return h};e.exports=i},{}],89:[function(t,e,r){function i(t){o.call(this,t),this.graphicsDataPool=[],this.primitiveShader=null,this.gl=t.gl,this.CONTEXT_UID=0}var n=t("../../utils"),s=t("../../const"),o=t("../../renderers/webgl/utils/ObjectRenderer"),a=t("../../renderers/webgl/WebGLRenderer"),h=t("./WebGLGraphicsData"),u=t("./shaders/PrimitiveShader"),l=t("./utils/buildPoly"),c=t("./utils/buildRectangle"),d=t("./utils/buildRoundedRectangle"),p=t("./utils/buildCircle");i.prototype=Object.create(o.prototype),i.prototype.constructor=i,e.exports=i,a.registerPlugin("graphics",i),i.prototype.onContextChange=function(){this.gl=this.renderer.gl,this.CONTEXT_UID=this.renderer.CONTEXT_UID,this.primitiveShader=new u(this.gl)},i.prototype.destroy=function(){o.prototype.destroy.call(this);for(var t=0;t<this.graphicsDataPool.length;++t)this.graphicsDataPool[t].destroy();this.graphicsDataPool=null},i.prototype.render=function(t){var e,r=this.renderer,i=r.gl,s=t._webGL[this.CONTEXT_UID];s&&t.dirty===s.dirty||(this.updateGraphics(t),s=t._webGL[this.CONTEXT_UID]);var o=this.primitiveShader;r.bindShader(o),r.state.setBlendMode(t.blendMode);for(var a=0,h=s.data.length;a<h;a++){e=s.data[a];var u=e.shader;r.bindShader(u),u.uniforms.translationMatrix=t.transform.worldTransform.toArray(!0),u.uniforms.tint=n.hex2rgb(t.tint),u.uniforms.alpha=t.worldAlpha,e.vao.bind().draw(i.TRIANGLE_STRIP,e.indices.length).unbind()}},i.prototype.updateGraphics=function(t){var e=this.renderer.gl,r=t._webGL[this.CONTEXT_UID];r||(r=t._webGL[this.CONTEXT_UID]={lastIndex:0,data:[],gl:e,clearDirty:-1,dirty:-1}),r.dirty=t.dirty;var i;if(t.clearDirty!==r.clearDirty){for(r.clearDirty=t.clearDirty,i=0;i<r.data.length;i++){var n=r.data[i];this.graphicsDataPool.push(n)}r.data=[],r.lastIndex=0}var o;for(i=r.lastIndex;i<t.graphicsData.length;i++){var a=t.graphicsData[i];o=this.getWebGLData(r,0),a.type===s.SHAPES.POLY&&l(a,o),a.type===s.SHAPES.RECT?c(a,o):a.type===s.SHAPES.CIRC||a.type===s.SHAPES.ELIP?p(a,o):a.type===s.SHAPES.RREC&&d(a,o),r.lastIndex++}for(i=0;i<r.data.length;i++)o=r.data[i],o.dirty&&o.upload()},i.prototype.getWebGLData=function(t,e){var r=t.data[t.data.length-1];return(!r||r.points.length>32e4)&&(r=this.graphicsDataPool.pop()||new h(this.renderer.gl,this.primitiveShader,this.renderer.state.attribsState),r.reset(e),t.data.push(r)),r.dirty=!0,r}},{"../../const":78,"../../renderers/webgl/WebGLRenderer":116,"../../renderers/webgl/utils/ObjectRenderer":126,"../../utils":151,"./WebGLGraphicsData":90,"./shaders/PrimitiveShader":91,"./utils/buildCircle":92,"./utils/buildPoly":94,"./utils/buildRectangle":95,"./utils/buildRoundedRectangle":96}],90:[function(t,e,r){function i(t,e,r){this.gl=t,this.color=[0,0,0],this.points=[],this.indices=[],this.buffer=n.GLBuffer.createVertexBuffer(t),this.indexBuffer=n.GLBuffer.createIndexBuffer(t),this.dirty=!0,this.glPoints=null,this.glIndices=null,this.shader=e,this.vao=new n.VertexArrayObject(t,r).addIndex(this.indexBuffer).addAttribute(this.buffer,e.attributes.aVertexPosition,t.FLOAT,!1,24,0).addAttribute(this.buffer,e.attributes.aColor,t.FLOAT,!1,24,8)}var n=t("pixi-gl-core");i.prototype.constructor=i,e.exports=i,i.prototype.reset=function(){this.points.length=0,this.indices.length=0},i.prototype.upload=function(){this.glPoints=new Float32Array(this.points),this.buffer.upload(this.glPoints),this.glIndices=new Uint16Array(this.indices),this.indexBuffer.upload(this.glIndices),this.dirty=!1},i.prototype.destroy=function(){this.color=null,this.points=null,this.indices=null,this.vao.destroy(),this.buffer.destroy(),this.indexBuffer.destroy(),this.gl=null,this.buffer=null,this.indexBuffer=null,this.glPoints=null,this.glIndices=null}},{"pixi-gl-core":7}],91:[function(t,e,r){function i(t){n.call(this,t,["attribute vec2 aVertexPosition;","attribute vec4 aColor;","uniform mat3 translationMatrix;","uniform mat3 projectionMatrix;","uniform float alpha;","uniform vec3 tint;","varying vec4 vColor;","void main(void){","   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);","   vColor = aColor * vec4(tint * alpha, alpha);","}"].join("\n"),["varying vec4 vColor;","void main(void){","   gl_FragColor = vColor;","}"].join("\n"))}var n=t("../../../Shader");i.prototype=Object.create(n.prototype),i.prototype.constructor=i,e.exports=i},{"../../../Shader":77}],92:[function(t,e,r){var i=t("./buildLine"),n=t("../../../const"),s=t("../../../utils"),o=function(t,e){var r,o,a=t.shape,h=a.x,u=a.y;t.type===n.SHAPES.CIRC?(r=a.radius,o=a.radius):(r=a.width,o=a.height);var l=Math.floor(30*Math.sqrt(a.radius))||Math.floor(15*Math.sqrt(a.width+a.height)),c=2*Math.PI/l,d=0;if(t.fill){var p=s.hex2rgb(t.fillColor),f=t.fillAlpha,v=p[0]*f,g=p[1]*f,y=p[2]*f,x=e.points,m=e.indices,_=x.length/6;for(m.push(_),d=0;d<l+1;d++)x.push(h,u,v,g,y,f),x.push(h+Math.sin(c*d)*r,u+Math.cos(c*d)*o,v,g,y,f),m.push(_++,_++);m.push(_-1)}if(t.lineWidth){var b=t.points;for(t.points=[],d=0;d<l+1;d++)t.points.push(h+Math.sin(c*d)*r,u+Math.cos(c*d)*o);i(t,e),t.points=b}};e.exports=o},{"../../../const":78,"../../../utils":151,"./buildLine":93}],93:[function(t,e,r){var i=t("../../../math"),n=t("../../../utils"),s=function(t,e){var r=0,s=t.points;if(0!==s.length){var o=new i.Point(s[0],s[1]),a=new i.Point(s[s.length-2],s[s.length-1]);if(o.x===a.x&&o.y===a.y){s=s.slice(),s.pop(),s.pop(),a=new i.Point(s[s.length-2],s[s.length-1]);var h=a.x+.5*(o.x-a.x),u=a.y+.5*(o.y-a.y);s.unshift(h,u),s.push(h,u)}var l,c,d,p,f,v,g,y,x,m,_,b,T,E,w,S,A,M,R,C,O,D,P,I=e.points,L=e.indices,F=s.length/2,N=s.length,B=I.length/6,k=t.lineWidth/2,U=n.hex2rgb(t.lineColor),j=t.lineAlpha,W=U[0]*j,X=U[1]*j,G=U[2]*j;for(d=s[0],p=s[1],f=s[2],v=s[3],x=-(p-v),m=d-f,P=Math.sqrt(x*x+m*m),x/=P,m/=P,x*=k,m*=k,I.push(d-x,p-m,W,X,G,j),I.push(d+x,p+m,W,X,G,j),r=1;r<F-1;r++)d=s[2*(r-1)],p=s[2*(r-1)+1],f=s[2*r],v=s[2*r+1],g=s[2*(r+1)],y=s[2*(r+1)+1],x=-(p-v),m=d-f,P=Math.sqrt(x*x+m*m),x/=P,m/=P,x*=k,m*=k,_=-(v-y),b=f-g,P=Math.sqrt(_*_+b*b),_/=P,b/=P,_*=k,b*=k,w=-m+p-(-m+v),S=-x+f-(-x+d),A=(-x+d)*(-m+v)-(-x+f)*(-m+p),M=-b+y-(-b+v),R=-_+f-(-_+g),C=(-_+g)*(-b+v)-(-_+f)*(-b+y),O=w*R-M*S,Math.abs(O)<.1?(O+=10.1,I.push(f-x,v-m,W,X,G,j),I.push(f+x,v+m,W,X,G,j)):(l=(S*C-R*A)/O,c=(M*A-w*C)/O,D=(l-f)*(l-f)+(c-v)*(c-v),D>19600?(T=x-_,E=m-b,P=Math.sqrt(T*T+E*E),T/=P,E/=P,T*=k,E*=k,I.push(f-T,v-E),I.push(W,X,G,j),I.push(f+T,v+E),I.push(W,X,G,j),I.push(f-T,v-E),I.push(W,X,G,j),N++):(I.push(l,c),I.push(W,X,G,j),I.push(f-(l-f),v-(c-v)),I.push(W,X,G,j)));for(d=s[2*(F-2)],p=s[2*(F-2)+1],f=s[2*(F-1)],v=s[2*(F-1)+1],x=-(p-v),m=d-f,P=Math.sqrt(x*x+m*m),x/=P,m/=P,x*=k,m*=k,I.push(f-x,v-m),I.push(W,X,G,j),I.push(f+x,v+m),I.push(W,X,G,j),L.push(B),r=0;r<N;r++)L.push(B++);L.push(B-1)}};e.exports=s},{"../../../math":102,"../../../utils":151}],94:[function(t,e,r){var i=t("./buildLine"),n=t("../../../utils"),s=t("earcut"),o=function(t,e){t.points=t.shape.points.slice();var r=t.points;if(t.fill&&r.length>6){for(var o=[],a=t.holes,h=0;h<a.length;h++){var u=a[h];o.push(r.length/2),r=r.concat(u.points)}var l=e.points,c=e.indices,d=r.length/2,p=n.hex2rgb(t.fillColor),f=t.fillAlpha,v=p[0]*f,g=p[1]*f,y=p[2]*f,x=s(r,o,2);if(!x)return;var m=l.length/6;for(h=0;h<x.length;h+=3)c.push(x[h]+m),c.push(x[h]+m),c.push(x[h+1]+m),c.push(x[h+2]+m),c.push(x[h+2]+m);for(h=0;h<d;h++)l.push(r[2*h],r[2*h+1],v,g,y,f)}t.lineWidth>0&&i(t,e)};e.exports=o},{"../../../utils":151,"./buildLine":93,earcut:31}],95:[function(t,e,r){var i=t("./buildLine"),n=t("../../../utils"),s=function(t,e){var r=t.shape,s=r.x,o=r.y,a=r.width,h=r.height;if(t.fill){var u=n.hex2rgb(t.fillColor),l=t.fillAlpha,c=u[0]*l,d=u[1]*l,p=u[2]*l,f=e.points,v=e.indices,g=f.length/6;f.push(s,o),f.push(c,d,p,l),f.push(s+a,o),f.push(c,d,p,l),f.push(s,o+h),f.push(c,d,p,l),f.push(s+a,o+h),f.push(c,d,p,l),v.push(g,g,g+1,g+2,g+3,g+3)}if(t.lineWidth){var y=t.points;t.points=[s,o,s+a,o,s+a,o+h,s,o+h,s,o],i(t,e),t.points=y}};e.exports=s},{"../../../utils":151,"./buildLine":93}],96:[function(t,e,r){var i=t("earcut"),n=t("./buildLine"),s=t("../../../utils"),o=function(t,e){var r=t.shape,o=r.x,h=r.y,u=r.width,l=r.height,c=r.radius,d=[];if(d.push(o,h+c),a(o,h+l-c,o,h+l,o+c,h+l,d),a(o+u-c,h+l,o+u,h+l,o+u,h+l-c,d),a(o+u,h+c,o+u,h,o+u-c,h,d),a(o+c,h,o,h,o,h+c+1e-10,d),t.fill){var p=s.hex2rgb(t.fillColor),f=t.fillAlpha,v=p[0]*f,g=p[1]*f,y=p[2]*f,x=e.points,m=e.indices,_=x.length/6,b=i(d,null,2),T=0;for(T=0;T<b.length;T+=3)m.push(b[T]+_),m.push(b[T]+_),m.push(b[T+1]+_),m.push(b[T+2]+_),m.push(b[T+2]+_);for(T=0;T<d.length;T++)x.push(d[T],d[++T],v,g,y,f)}if(t.lineWidth){var E=t.points;t.points=d,n(t,e),t.points=E}},a=function(t,e,r,i,n,s,o){function a(t,e,r){var i=e-t;return t+i*r}for(var h,u,l,c,d,p,f=20,v=o||[],g=0,y=0;y<=f;y++)g=y/f,h=a(t,r,g),u=a(e,i,g),l=a(r,n,g),c=a(i,s,g),d=a(h,l,g),p=a(u,c,g),v.push(d,p);return v};e.exports=o},{"../../../utils":151,"./buildLine":93,earcut:31}],97:[function(t,e,r){var i=e.exports=Object.assign(t("./const"),t("./math"),{utils:t("./utils"),ticker:t("./ticker"),DisplayObject:t("./display/DisplayObject"),Container:t("./display/Container"),Transform:t("./display/Transform"),TransformStatic:t("./display/TransformStatic"),TransformBase:t("./display/TransformBase"),Sprite:t("./sprites/Sprite"),CanvasSpriteRenderer:t("./sprites/canvas/CanvasSpriteRenderer"),CanvasTinter:t("./sprites/canvas/CanvasTinter"),SpriteRenderer:t("./sprites/webgl/SpriteRenderer"),Text:t("./text/Text"),TextStyle:t("./text/TextStyle"),Graphics:t("./graphics/Graphics"),GraphicsData:t("./graphics/GraphicsData"),GraphicsRenderer:t("./graphics/webgl/GraphicsRenderer"),CanvasGraphicsRenderer:t("./graphics/canvas/CanvasGraphicsRenderer"),Texture:t("./textures/Texture"),BaseTexture:t("./textures/BaseTexture"),RenderTexture:t("./textures/RenderTexture"),BaseRenderTexture:t("./textures/BaseRenderTexture"),VideoBaseTexture:t("./textures/VideoBaseTexture"),TextureUvs:t("./textures/TextureUvs"),CanvasRenderer:t("./renderers/canvas/CanvasRenderer"),CanvasRenderTarget:t("./renderers/canvas/utils/CanvasRenderTarget"),Shader:t("./Shader"),WebGLRenderer:t("./renderers/webgl/WebGLRenderer"),WebGLManager:t("./renderers/webgl/managers/WebGLManager"),ObjectRenderer:t("./renderers/webgl/utils/ObjectRenderer"),RenderTarget:t("./renderers/webgl/utils/RenderTarget"),Quad:t("./renderers/webgl/utils/Quad"),SpriteMaskFilter:t("./renderers/webgl/filters/spriteMask/SpriteMaskFilter"),Filter:t("./renderers/webgl/filters/Filter"),glCore:t("pixi-gl-core"),autoDetectRenderer:function(t,e,r,n){return t=t||800,e=e||600,!n&&i.utils.isWebGLSupported()?new i.WebGLRenderer(t,e,r):new i.CanvasRenderer(t,e,r)}})},{"./Shader":77,"./const":78,"./display/Container":80,"./display/DisplayObject":81,"./display/Transform":82,"./display/TransformBase":83,"./display/TransformStatic":84,"./graphics/Graphics":85,"./graphics/GraphicsData":86,"./graphics/canvas/CanvasGraphicsRenderer":87,"./graphics/webgl/GraphicsRenderer":89,"./math":102,"./renderers/canvas/CanvasRenderer":109,"./renderers/canvas/utils/CanvasRenderTarget":111,"./renderers/webgl/WebGLRenderer":116,"./renderers/webgl/filters/Filter":118,"./renderers/webgl/filters/spriteMask/SpriteMaskFilter":121,"./renderers/webgl/managers/WebGLManager":125,"./renderers/webgl/utils/ObjectRenderer":126,"./renderers/webgl/utils/Quad":127,"./renderers/webgl/utils/RenderTarget":128,"./sprites/Sprite":133,"./sprites/canvas/CanvasSpriteRenderer":134,"./sprites/canvas/CanvasTinter":135,"./sprites/webgl/SpriteRenderer":137,"./text/Text":139,"./text/TextStyle":140,"./textures/BaseRenderTexture":141,"./textures/BaseTexture":142,"./textures/RenderTexture":143,"./textures/Texture":144,"./textures/TextureUvs":145,"./textures/VideoBaseTexture":146,"./ticker":148,"./utils":151,"pixi-gl-core":7}],98:[function(t,e,r){function i(t){return t<0?-1:t>0?1:0}function n(){for(var t=0;t<16;t++){var e=[];c.push(e);for(var r=0;r<16;r++)for(var n=i(s[t]*s[r]+a[t]*o[r]),d=i(o[t]*s[r]+h[t]*o[r]),p=i(s[t]*a[r]+a[t]*h[r]),f=i(o[t]*a[r]+h[t]*h[r]),v=0;v<16;v++)if(s[v]===n&&o[v]===d&&a[v]===p&&h[v]===f){e.push(v);break}}for(t=0;t<16;t++){var g=new l;g.set(s[t],o[t],a[t],h[t],0,0),u.push(g)}}var s=[1,1,0,-1,-1,-1,0,1,1,1,0,-1,-1,-1,0,1],o=[0,1,1,1,0,-1,-1,-1,0,1,1,1,0,-1,-1,-1],a=[0,-1,-1,-1,0,1,1,1,0,1,1,1,0,-1,-1,-1],h=[1,1,0,-1,-1,-1,0,1,-1,-1,0,1,1,1,0,-1],u=[],l=t("./Matrix"),c=[];n();var d={E:0,SE:1,S:2,SW:3,W:4,NW:5,N:6,NE:7,MIRROR_VERTICAL:8,MIRROR_HORIZONTAL:12,uX:function(t){return s[t]},uY:function(t){return o[t]},vX:function(t){return a[t]},vY:function(t){return h[t]},inv:function(t){return 8&t?15&t:7&-t},add:function(t,e){return c[t][e]},sub:function(t,e){return c[t][d.inv(e)]},rotate180:function(t){return 4^t},isSwapWidthHeight:function(t){return 2===(3&t)},byDirection:function(t,e){return 2*Math.abs(t)<=Math.abs(e)?e>=0?d.S:d.N:2*Math.abs(e)<=Math.abs(t)?t>0?d.E:d.W:e>0?t>0?d.SE:d.SW:t>0?d.NE:d.NW},matrixAppendRotationInv:function(t,e,r,i){var n=u[d.inv(e)];r=r||0,i=i||0,n.tx=r,n.ty=i,t.append(n)}};e.exports=d},{"./Matrix":99}],99:[function(t,e,r){function i(){this.a=1,this.b=0,this.c=0,this.d=1,this.tx=0,this.ty=0,this.array=null}var n=t("./Point");i.prototype.constructor=i,e.exports=i,i.prototype.fromArray=function(t){this.a=t[0],this.b=t[1],this.c=t[3],this.d=t[4],this.tx=t[2],this.ty=t[5]},i.prototype.set=function(t,e,r,i,n,s){return this.a=t,this.b=e,this.c=r,this.d=i,this.tx=n,this.ty=s,this},i.prototype.toArray=function(t,e){this.array||(this.array=new Float32Array(9));var r=e||this.array;return t?(r[0]=this.a,r[1]=this.b,r[2]=0,r[3]=this.c,r[4]=this.d,r[5]=0,r[6]=this.tx,r[7]=this.ty,r[8]=1):(r[0]=this.a,r[1]=this.c,r[2]=this.tx,r[3]=this.b,r[4]=this.d,r[5]=this.ty,r[6]=0,r[7]=0,r[8]=1),r},i.prototype.apply=function(t,e){e=e||new n;var r=t.x,i=t.y;return e.x=this.a*r+this.c*i+this.tx,e.y=this.b*r+this.d*i+this.ty,e},i.prototype.applyInverse=function(t,e){e=e||new n;var r=1/(this.a*this.d+this.c*-this.b),i=t.x,s=t.y;return e.x=this.d*r*i+-this.c*r*s+(this.ty*this.c-this.tx*this.d)*r,e.y=this.a*r*s+-this.b*r*i+(-this.ty*this.a+this.tx*this.b)*r,e},i.prototype.translate=function(t,e){return this.tx+=t,this.ty+=e,this},i.prototype.scale=function(t,e){return this.a*=t,this.d*=e,this.c*=t,this.b*=e,this.tx*=t,this.ty*=e,this},i.prototype.rotate=function(t){var e=Math.cos(t),r=Math.sin(t),i=this.a,n=this.c,s=this.tx;return this.a=i*e-this.b*r,this.b=i*r+this.b*e,this.c=n*e-this.d*r,this.d=n*r+this.d*e,this.tx=s*e-this.ty*r,this.ty=s*r+this.ty*e,this},i.prototype.append=function(t){var e=this.a,r=this.b,i=this.c,n=this.d;return this.a=t.a*e+t.b*i,this.b=t.a*r+t.b*n,this.c=t.c*e+t.d*i,this.d=t.c*r+t.d*n,this.tx=t.tx*e+t.ty*i+this.tx,this.ty=t.tx*r+t.ty*n+this.ty,this},i.prototype.setTransform=function(t,e,r,i,n,s,o,a,h){var u,l,c,d,p,f,v,g,y,x;return p=Math.sin(o),f=Math.cos(o),v=Math.cos(h),g=Math.sin(h),y=-Math.sin(a),x=Math.cos(a),u=f*n,l=p*n,c=-p*s,d=f*s,this.a=v*u+g*c,this.b=v*l+g*d,this.c=y*u+x*c,this.d=y*l+x*d,this.tx=t+(r*u+i*c),this.ty=e+(r*l+i*d),this},i.prototype.prepend=function(t){var e=this.tx;if(1!==t.a||0!==t.b||0!==t.c||1!==t.d){var r=this.a,i=this.c;this.a=r*t.a+this.b*t.c,this.b=r*t.b+this.b*t.d,this.c=i*t.a+this.d*t.c,this.d=i*t.b+this.d*t.d}return this.tx=e*t.a+this.ty*t.c+t.tx,this.ty=e*t.b+this.ty*t.d+t.ty,this},i.prototype.decompose=function(t){var e=this.a,r=this.b,i=this.c,n=this.d,s=Math.atan2(-i,n),o=Math.atan2(r,e),a=Math.abs(1-s/o);return a<1e-5?(t.rotation=o,e<0&&n>=0&&(t.rotation+=t.rotation<=0?Math.PI:-Math.PI),t.skew.x=t.skew.y=0):(t.skew.x=s,t.skew.y=o),t.scale.x=Math.sqrt(e*e+r*r),t.scale.y=Math.sqrt(i*i+n*n),t.position.x=this.tx,t.position.y=this.ty,t},i.prototype.invert=function(){var t=this.a,e=this.b,r=this.c,i=this.d,n=this.tx,s=t*i-e*r;return this.a=i/s,this.b=-e/s,this.c=-r/s,this.d=t/s,this.tx=(r*this.ty-i*n)/s,this.ty=-(t*this.ty-e*n)/s,this},i.prototype.identity=function(){return this.a=1,this.b=0,this.c=0,this.d=1,this.tx=0,this.ty=0,this},i.prototype.clone=function(){var t=new i;return t.a=this.a,t.b=this.b,t.c=this.c,t.d=this.d,t.tx=this.tx,t.ty=this.ty,t},i.prototype.copy=function(t){return t.a=this.a,t.b=this.b,t.c=this.c,t.d=this.d,t.tx=this.tx,t.ty=this.ty,t},i.IDENTITY=new i,i.TEMP_MATRIX=new i},{"./Point":101}],100:[function(t,e,r){function i(t,e,r,i){this._x=r||0,this._y=i||0,this.cb=t,this.scope=e}i.prototype.constructor=i,e.exports=i,Object.defineProperties(i.prototype,{x:{get:function(){return this._x},set:function(t){this._x!==t&&(this._x=t,this.cb.call(this.scope))}},y:{get:function(){return this._y},set:function(t){this._y!==t&&(this._y=t,this.cb.call(this.scope))}}}),i.prototype.set=function(t,e){var r=t||0,i=e||(0!==e?r:0);this._x===r&&this._y===i||(this._x=r,this._y=i,this.cb.call(this.scope))},i.prototype.copy=function(t){this._x===t.x&&this._y===t.y||(this._x=t.x,this._y=t.y,this.cb.call(this.scope))}},{}],101:[function(t,e,r){function i(t,e){this.x=t||0,this.y=e||0}i.prototype.constructor=i,e.exports=i,i.prototype.clone=function(){return new i(this.x,this.y)},i.prototype.copy=function(t){this.set(t.x,t.y)},i.prototype.equals=function(t){return t.x===this.x&&t.y===this.y},i.prototype.set=function(t,e){this.x=t||0,this.y=e||(0!==e?this.x:0)}},{}],102:[function(t,e,r){e.exports={Point:t("./Point"),ObservablePoint:t("./ObservablePoint"),Matrix:t("./Matrix"),GroupD8:t("./GroupD8"),Circle:t("./shapes/Circle"),Ellipse:t("./shapes/Ellipse"),Polygon:t("./shapes/Polygon"),Rectangle:t("./shapes/Rectangle"),RoundedRectangle:t("./shapes/RoundedRectangle")}},{"./GroupD8":98,"./Matrix":99,"./ObservablePoint":100,"./Point":101,"./shapes/Circle":103,"./shapes/Ellipse":104,"./shapes/Polygon":105,"./shapes/Rectangle":106,"./shapes/RoundedRectangle":107}],103:[function(t,e,r){function i(t,e,r){this.x=t||0,this.y=e||0,this.radius=r||0,this.type=s.SHAPES.CIRC}var n=t("./Rectangle"),s=t("../../const");i.prototype.constructor=i,e.exports=i,i.prototype.clone=function(){return new i(this.x,this.y,this.radius)},i.prototype.contains=function(t,e){if(this.radius<=0)return!1;var r=this.x-t,i=this.y-e,n=this.radius*this.radius;return r*=r,i*=i,r+i<=n},i.prototype.getBounds=function(){return new n(this.x-this.radius,this.y-this.radius,2*this.radius,2*this.radius)}},{"../../const":78,"./Rectangle":106}],104:[function(t,e,r){function i(t,e,r,i){this.x=t||0,this.y=e||0,this.width=r||0,this.height=i||0,this.type=s.SHAPES.ELIP}var n=t("./Rectangle"),s=t("../../const");i.prototype.constructor=i,e.exports=i,i.prototype.clone=function(){return new i(this.x,this.y,this.width,this.height)},i.prototype.contains=function(t,e){if(this.width<=0||this.height<=0)return!1;var r=(t-this.x)/this.width,i=(e-this.y)/this.height;return r*=r,i*=i,r+i<=1},i.prototype.getBounds=function(){return new n(this.x-this.width,this.y-this.height,this.width,this.height)}},{"../../const":78,"./Rectangle":106}],105:[function(t,e,r){function i(t){var e=t;if(!Array.isArray(e)){e=new Array(arguments.length);for(var r=0;r<e.length;++r)e[r]=arguments[r]}if(e[0]instanceof n){for(var i=[],o=0,a=e.length;o<a;o++)i.push(e[o].x,e[o].y);e=i}this.closed=!0,this.points=e,this.type=s.SHAPES.POLY}var n=t("../Point"),s=t("../../const");i.prototype.constructor=i,e.exports=i,i.prototype.clone=function(){return new i(this.points.slice())},i.prototype.close=function(){var t=this.points;t[0]===t[t.length-2]&&t[1]===t[t.length-1]||t.push(t[0],t[1])},i.prototype.contains=function(t,e){for(var r=!1,i=this.points.length/2,n=0,s=i-1;n<i;s=n++){var o=this.points[2*n],a=this.points[2*n+1],h=this.points[2*s],u=this.points[2*s+1],l=a>e!=u>e&&t<(h-o)*(e-a)/(u-a)+o;l&&(r=!r)}return r}},{"../../const":78,"../Point":101}],106:[function(t,e,r){function i(t,e,r,i){this.x=t||0,this.y=e||0,this.width=r||0,this.height=i||0,this.type=n.SHAPES.RECT}var n=t("../../const");i.prototype.constructor=i,e.exports=i,i.EMPTY=new i(0,0,0,0),i.prototype.clone=function(){return new i(this.x,this.y,this.width,this.height)},i.prototype.copy=function(t){return this.x=t.x,this.y=t.y,this.width=t.width,this.height=t.height,this},i.prototype.contains=function(t,e){return!(this.width<=0||this.height<=0)&&(t>=this.x&&t<this.x+this.width&&e>=this.y&&e<this.y+this.height)},i.prototype.pad=function(t,e){t=t||0,e=e||(0!==e?t:0),this.x-=t,this.y-=e,this.width+=2*t,this.height+=2*e},i.prototype.fit=function(t){this.x<t.x&&(this.width+=this.x,this.width<0&&(this.width=0),this.x=t.x),this.y<t.y&&(this.height+=this.y,this.height<0&&(this.height=0),this.y=t.y),this.x+this.width>t.x+t.width&&(this.width=t.width-this.x,this.width<0&&(this.width=0)),this.y+this.height>t.y+t.height&&(this.height=t.height-this.y,this.height<0&&(this.height=0))},i.prototype.enlarge=function(t){if(t!==i.EMPTY){var e=Math.min(this.x,t.x),r=Math.max(this.x+this.width,t.x+t.width),n=Math.min(this.y,t.y),s=Math.max(this.y+this.height,t.y+t.height);this.x=e,this.width=r-e,this.y=n,this.height=s-n}}},{"../../const":78}],107:[function(t,e,r){function i(t,e,r,i,s){this.x=t||0,this.y=e||0,this.width=r||0,this.height=i||0,this.radius=s||20,this.type=n.SHAPES.RREC}var n=t("../../const");i.prototype.constructor=i,e.exports=i,i.prototype.clone=function(){return new i(this.x,this.y,this.width,this.height,this.radius)},i.prototype.contains=function(t,e){return!(this.width<=0||this.height<=0)&&(t>=this.x&&t<=this.x+this.width&&e>=this.y&&e<=this.y+this.height)}},{"../../const":78}],108:[function(t,e,r){function i(t,e,r,i){if(u.call(this),n.sayHello(t),i)for(var s in o.DEFAULT_RENDER_OPTIONS)"undefined"==typeof i[s]&&(i[s]=o.DEFAULT_RENDER_OPTIONS[s]);else i=o.DEFAULT_RENDER_OPTIONS;this.type=o.RENDERER_TYPE.UNKNOWN,this.width=e||800,this.height=r||600,this.view=i.view||document.createElement("canvas"),this.resolution=i.resolution,this.transparent=i.transparent,this.autoResize=i.autoResize||!1,
this.blendModes=null,this.preserveDrawingBuffer=i.preserveDrawingBuffer,this.clearBeforeRender=i.clearBeforeRender,this.roundPixels=i.roundPixels,this._backgroundColor=0,this._backgroundColorRgba=[0,0,0,0],this._backgroundColorString="#000000",this.backgroundColor=i.backgroundColor||this._backgroundColor,this._tempDisplayObjectParent=new a,this._lastObjectRendered=this._tempDisplayObjectParent}var n=t("../utils"),s=t("../math"),o=t("../const"),a=t("../display/Container"),h=t("../textures/RenderTexture"),u=t("eventemitter3"),l=new s.Matrix;i.prototype=Object.create(u.prototype),i.prototype.constructor=i,e.exports=i,Object.defineProperties(i.prototype,{backgroundColor:{get:function(){return this._backgroundColor},set:function(t){this._backgroundColor=t,this._backgroundColorString=n.hex2string(t),n.hex2rgb(t,this._backgroundColorRgba)}}}),i.prototype.resize=function(t,e){this.width=t*this.resolution,this.height=e*this.resolution,this.view.width=this.width,this.view.height=this.height,this.autoResize&&(this.view.style.width=this.width/this.resolution+"px",this.view.style.height=this.height/this.resolution+"px")},i.prototype.generateTexture=function(t,e,r){var i=t.getLocalBounds(),n=h.create(0|i.width,0|i.height,e,r);return l.tx=-i.x,l.ty=-i.y,this.render(t,n,!1,l,!0),n},i.prototype.destroy=function(t){t&&this.view.parentNode&&this.view.parentNode.removeChild(this.view),this.type=o.RENDERER_TYPE.UNKNOWN,this.width=0,this.height=0,this.view=null,this.resolution=0,this.transparent=!1,this.autoResize=!1,this.blendModes=null,this.preserveDrawingBuffer=!1,this.clearBeforeRender=!1,this.roundPixels=!1,this._backgroundColor=0,this._backgroundColorRgba=null,this._backgroundColorString=null,this.backgroundColor=0,this._tempDisplayObjectParent=null,this._lastObjectRendered=null}},{"../const":78,"../display/Container":80,"../math":102,"../textures/RenderTexture":143,"../utils":151,eventemitter3:32}],109:[function(t,e,r){function i(t,e,r){r=r||{},n.call(this,"Canvas",t,e,r),this.type=u.RENDERER_TYPE.CANVAS,this.rootContext=this.view.getContext("2d",{alpha:this.transparent}),this.rootResolution=this.resolution,this.refresh=!0,this.maskManager=new s(this),this.smoothProperty="imageSmoothingEnabled",this.rootContext.imageSmoothingEnabled||(this.rootContext.webkitImageSmoothingEnabled?this.smoothProperty="webkitImageSmoothingEnabled":this.rootContext.mozImageSmoothingEnabled?this.smoothProperty="mozImageSmoothingEnabled":this.rootContext.oImageSmoothingEnabled?this.smoothProperty="oImageSmoothingEnabled":this.rootContext.msImageSmoothingEnabled&&(this.smoothProperty="msImageSmoothingEnabled")),this.initPlugins(),this.blendModes=a(),this._activeBlendMode=null,this.context=null,this.renderingToScreen=!1,this.resize(t,e)}var n=t("../SystemRenderer"),s=t("./utils/CanvasMaskManager"),o=t("./utils/CanvasRenderTarget"),a=t("./utils/mapCanvasBlendModesToPixi"),h=t("../../utils"),u=t("../../const");i.prototype=Object.create(n.prototype),i.prototype.constructor=i,e.exports=i,h.pluginTarget.mixin(i),i.prototype.render=function(t,e,r,i,n){if(this.view){this.renderingToScreen=!e,this.emit("prerender"),e?(e=e.baseTexture||e,e._canvasRenderTarget||(e._canvasRenderTarget=new o(e.width,e.height,e.resolution),e.source=e._canvasRenderTarget.canvas,e.valid=!0),this.context=e._canvasRenderTarget.context,this.resolution=e._canvasRenderTarget.resolution):(this.context=this.rootContext,this.resolution=this.rootResolution);var s=this.context;if(e||(this._lastObjectRendered=t),!n){var a=t.parent,h=this._tempDisplayObjectParent.transform.worldTransform;i?i.copy(h):h.identity(),t.parent=this._tempDisplayObjectParent,t.updateTransform(),t.parent=a}s.setTransform(1,0,0,1,0,0),s.globalAlpha=1,s.globalCompositeOperation=this.blendModes[u.BLEND_MODES.NORMAL],navigator.isCocoonJS&&this.view.screencanvas&&(s.fillStyle="black",s.clear()),(void 0!==r?r:this.clearBeforeRender)&&this.renderingToScreen&&(this.transparent?s.clearRect(0,0,this.width,this.height):(s.fillStyle=this._backgroundColorString,s.fillRect(0,0,this.width,this.height)));var l=this.context;this.context=s,t.renderCanvas(this),this.context=l,this.emit("postrender")}},i.prototype.setBlendMode=function(t){this._activeBlendMode!==t&&(this.context.globalCompositeOperation=this.blendModes[t])},i.prototype.destroy=function(t){this.destroyPlugins(),n.prototype.destroy.call(this,t),this.context=null,this.refresh=!0,this.maskManager.destroy(),this.maskManager=null,this.smoothProperty=null},i.prototype.resize=function(t,e){n.prototype.resize.call(this,t,e),this.smoothProperty&&(this.rootContext[this.smoothProperty]=u.SCALE_MODES.DEFAULT===u.SCALE_MODES.LINEAR)}},{"../../const":78,"../../utils":151,"../SystemRenderer":108,"./utils/CanvasMaskManager":110,"./utils/CanvasRenderTarget":111,"./utils/mapCanvasBlendModesToPixi":113}],110:[function(t,e,r){function i(t){this.renderer=t}var n=t("../../../const");i.prototype.constructor=i,e.exports=i,i.prototype.pushMask=function(t){var e=this.renderer;e.context.save();var r=t.alpha,i=t.transform.worldTransform,n=e.resolution;e.context.setTransform(i.a*n,i.b*n,i.c*n,i.d*n,i.tx*n,i.ty*n),t._texture||(this.renderGraphicsShape(t),e.context.clip()),t.worldAlpha=r},i.prototype.renderGraphicsShape=function(t){var e=this.renderer.context,r=t.graphicsData.length;if(0!==r){e.beginPath();for(var i=0;i<r;i++){var s=t.graphicsData[i],o=s.shape;if(s.type===n.SHAPES.POLY){var a=o.points;e.moveTo(a[0],a[1]);for(var h=1;h<a.length/2;h++)e.lineTo(a[2*h],a[2*h+1]);a[0]===a[a.length-2]&&a[1]===a[a.length-1]&&e.closePath()}else if(s.type===n.SHAPES.RECT)e.rect(o.x,o.y,o.width,o.height),e.closePath();else if(s.type===n.SHAPES.CIRC)e.arc(o.x,o.y,o.radius,0,2*Math.PI),e.closePath();else if(s.type===n.SHAPES.ELIP){var u=2*o.width,l=2*o.height,c=o.x-u/2,d=o.y-l/2,p=.5522848,f=u/2*p,v=l/2*p,g=c+u,y=d+l,x=c+u/2,m=d+l/2;e.moveTo(c,m),e.bezierCurveTo(c,m-v,x-f,d,x,d),e.bezierCurveTo(x+f,d,g,m-v,g,m),e.bezierCurveTo(g,m+v,x+f,y,x,y),e.bezierCurveTo(x-f,y,c,m+v,c,m),e.closePath()}else if(s.type===n.SHAPES.RREC){var _=o.x,b=o.y,T=o.width,E=o.height,w=o.radius,S=Math.min(T,E)/2|0;w=w>S?S:w,e.moveTo(_,b+w),e.lineTo(_,b+E-w),e.quadraticCurveTo(_,b+E,_+w,b+E),e.lineTo(_+T-w,b+E),e.quadraticCurveTo(_+T,b+E,_+T,b+E-w),e.lineTo(_+T,b+w),e.quadraticCurveTo(_+T,b,_+T-w,b),e.lineTo(_+w,b),e.quadraticCurveTo(_,b,_,b+w),e.closePath()}}}},i.prototype.popMask=function(t){t.context.restore()},i.prototype.destroy=function(){}},{"../../../const":78}],111:[function(t,e,r){function i(t,e,r){this.canvas=document.createElement("canvas"),this.context=this.canvas.getContext("2d"),this.resolution=r||n.RESOLUTION,this.resize(t,e)}var n=t("../../../const");i.prototype.constructor=i,e.exports=i,Object.defineProperties(i.prototype,{width:{get:function(){return this.canvas.width},set:function(t){this.canvas.width=t}},height:{get:function(){return this.canvas.height},set:function(t){this.canvas.height=t}}}),i.prototype.clear=function(){this.context.setTransform(1,0,0,1,0,0),this.context.clearRect(0,0,this.canvas.width,this.canvas.height)},i.prototype.resize=function(t,e){this.canvas.width=t*this.resolution,this.canvas.height=e*this.resolution},i.prototype.destroy=function(){this.context=null,this.canvas=null}},{"../../../const":78}],112:[function(t,e,r){var i=function(){if("undefined"==typeof document)return!1;var t="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABAQMAAADD8p2OAAAAA1BMVEX/",e="AAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==",r=new Image;r.src=t+"AP804Oa6"+e;var i=new Image;i.src=t+"/wCKxvRF"+e;var n=document.createElement("canvas");n.width=6,n.height=1;var s=n.getContext("2d");s.globalCompositeOperation="multiply",s.drawImage(r,0,0),s.drawImage(i,2,0);var o=s.getImageData(2,0,1,1);if(!o)return!1;var a=o.data;return 255===a[0]&&0===a[1]&&0===a[2]};e.exports=i},{}],113:[function(t,e,r){function i(t){return t=t||[],s()?(t[n.BLEND_MODES.NORMAL]="source-over",t[n.BLEND_MODES.ADD]="lighter",t[n.BLEND_MODES.MULTIPLY]="multiply",t[n.BLEND_MODES.SCREEN]="screen",t[n.BLEND_MODES.OVERLAY]="overlay",t[n.BLEND_MODES.DARKEN]="darken",t[n.BLEND_MODES.LIGHTEN]="lighten",t[n.BLEND_MODES.COLOR_DODGE]="color-dodge",t[n.BLEND_MODES.COLOR_BURN]="color-burn",t[n.BLEND_MODES.HARD_LIGHT]="hard-light",t[n.BLEND_MODES.SOFT_LIGHT]="soft-light",t[n.BLEND_MODES.DIFFERENCE]="difference",t[n.BLEND_MODES.EXCLUSION]="exclusion",t[n.BLEND_MODES.HUE]="hue",t[n.BLEND_MODES.SATURATION]="saturate",t[n.BLEND_MODES.COLOR]="color",t[n.BLEND_MODES.LUMINOSITY]="luminosity"):(t[n.BLEND_MODES.NORMAL]="source-over",t[n.BLEND_MODES.ADD]="lighter",t[n.BLEND_MODES.MULTIPLY]="source-over",t[n.BLEND_MODES.SCREEN]="source-over",t[n.BLEND_MODES.OVERLAY]="source-over",t[n.BLEND_MODES.DARKEN]="source-over",t[n.BLEND_MODES.LIGHTEN]="source-over",t[n.BLEND_MODES.COLOR_DODGE]="source-over",t[n.BLEND_MODES.COLOR_BURN]="source-over",t[n.BLEND_MODES.HARD_LIGHT]="source-over",t[n.BLEND_MODES.SOFT_LIGHT]="source-over",t[n.BLEND_MODES.DIFFERENCE]="source-over",t[n.BLEND_MODES.EXCLUSION]="source-over",t[n.BLEND_MODES.HUE]="source-over",t[n.BLEND_MODES.SATURATION]="source-over",t[n.BLEND_MODES.COLOR]="source-over",t[n.BLEND_MODES.LUMINOSITY]="source-over"),t}var n=t("../../../const"),s=t("./canUseNewCanvasBlendModes");e.exports=i},{"../../../const":78,"./canUseNewCanvasBlendModes":112}],114:[function(t,e,r){function i(t){this.renderer=t,this.count=0,this.checkCount=0,this.maxIdle=3600,this.checkCountMax=600,this.mode=n.GC_MODES.DEFAULT}var n=t("../../const");i.prototype.constructor=i,e.exports=i,i.prototype.update=function(){this.count++,this.mode!==n.GC_MODES.MANUAL&&(this.checkCount++,this.checkCount>this.checkCountMax&&(this.checkCount=0,this.run()))},i.prototype.run=function(){var t,e,r=this.renderer.textureManager,i=r._managedTextures,n=!1;for(t=0;t<i.length;t++){var s=i[t];!s._glRenderTargets&&this.count-s.touched>this.maxIdle&&(r.destroyTexture(s,!0),i[t]=null,n=!0)}if(n){for(e=0,t=0;t<i.length;t++)null!==i[t]&&(i[e++]=i[t]);i.length=e}},i.prototype.unload=function(t){var e=this.renderer.textureManager;t._texture&&e.destroyTexture(t._texture,!0);for(var r=t.children.length-1;r>=0;r--)this.unload(t.children[r])}},{"../../const":78}],115:[function(t,e,r){var i=t("pixi-gl-core").GLTexture,n=t("../../const"),s=t("./utils/RenderTarget"),o=t("../../utils"),a=function(t){this.renderer=t,this.gl=t.gl,this._managedTextures=[]};a.prototype.bindTexture=function(){},a.prototype.getTexture=function(){},a.prototype.updateTexture=function(t){t=t.baseTexture||t;var e=!!t._glRenderTargets;if(t.hasLoaded){var r=t._glTextures[this.renderer.CONTEXT_UID];if(r)e?t._glRenderTargets[this.renderer.CONTEXT_UID].resize(t.width,t.height):r.upload(t.source);else{if(e){var o=new s(this.gl,t.width,t.height,t.scaleMode,t.resolution);o.resize(t.width,t.height),t._glRenderTargets[this.renderer.CONTEXT_UID]=o,r=o.texture}else r=new i(this.gl),r.premultiplyAlpha=!0,r.upload(t.source);t._glTextures[this.renderer.CONTEXT_UID]=r,t.on("update",this.updateTexture,this),t.on("dispose",this.destroyTexture,this),this._managedTextures.push(t),t.isPowerOfTwo?(t.mipmap&&r.enableMipmap(),t.wrapMode===n.WRAP_MODES.CLAMP?r.enableWrapClamp():t.wrapMode===n.WRAP_MODES.REPEAT?r.enableWrapRepeat():r.enableWrapMirrorRepeat()):r.enableWrapClamp(),t.scaleMode===n.SCALE_MODES.NEAREST?r.enableNearestScaling():r.enableLinearScaling()}return r}},a.prototype.destroyTexture=function(t,e){if(t=t.baseTexture||t,t.hasLoaded&&t._glTextures[this.renderer.CONTEXT_UID]&&(t._glTextures[this.renderer.CONTEXT_UID].destroy(),t.off("update",this.updateTexture,this),t.off("dispose",this.destroyTexture,this),delete t._glTextures[this.renderer.CONTEXT_UID],!e)){var r=this._managedTextures.indexOf(t);r!==-1&&o.removeItems(this._managedTextures,r,1)}},a.prototype.removeAll=function(){for(var t=0;t<this._managedTextures.length;++t){var e=this._managedTextures[t];e._glTextures[this.renderer.CONTEXT_UID]&&delete e._glTextures[this.renderer.CONTEXT_UID]}},a.prototype.destroy=function(){for(var t=0;t<this._managedTextures.length;++t){var e=this._managedTextures[t];this.destroyTexture(e,!0),e.off("update",this.updateTexture,this),e.off("dispose",this.destroyTexture,this)}this._managedTextures=null},e.exports=a},{"../../const":78,"../../utils":151,"./utils/RenderTarget":128,"pixi-gl-core":7}],116:[function(t,e,r){function i(t,e,r){r=r||{},n.call(this,"WebGL",t,e,r),this.type=x.RENDERER_TYPE.WEBGL,this.handleContextLost=this.handleContextLost.bind(this),this.handleContextRestored=this.handleContextRestored.bind(this),this.view.addEventListener("webglcontextlost",this.handleContextLost,!1),this.view.addEventListener("webglcontextrestored",this.handleContextRestored,!1),this._contextOptions={alpha:this.transparent,antialias:r.antialias,premultipliedAlpha:this.transparent&&"notMultiplied"!==this.transparent,stencil:!0,preserveDrawingBuffer:r.preserveDrawingBuffer},this._backgroundColorRgba[3]=this.transparent?0:1,this.maskManager=new s(this),this.stencilManager=new o(this),this.emptyRenderer=new u(this),this.currentRenderer=this.emptyRenderer,this.initPlugins(),r.context&&v(r.context),this.gl=r.context||p(this.view,this._contextOptions),this.CONTEXT_UID=m++,this.state=new d(this.gl),this.renderingToScreen=!0,this._initContext(),this.filterManager=new a(this),this.drawModes=f(this.gl),this._activeShader=null,this._activeRenderTarget=null,this._activeTextureLocation=999,this._activeTexture=null,this.setBlendMode(0)}var n=t("../SystemRenderer"),s=t("./managers/MaskManager"),o=t("./managers/StencilManager"),a=t("./managers/FilterManager"),h=t("./utils/RenderTarget"),u=t("./utils/ObjectRenderer"),l=t("./TextureManager"),c=t("./TextureGarbageCollector"),d=t("./WebGLState"),p=t("pixi-gl-core").createContext,f=t("./utils/mapWebGLDrawModesToPixi"),v=t("./utils/validateContext"),g=t("../../utils"),y=t("pixi-gl-core"),x=t("../../const"),m=0;i.prototype=Object.create(n.prototype),i.prototype.constructor=i,e.exports=i,g.pluginTarget.mixin(i),i.prototype._initContext=function(){var t=this.gl;this.textureManager=new l(this),this.textureGC=new c(this),this.state.resetToDefault(),this.rootRenderTarget=new h(t,this.width,this.height,null,this.resolution,(!0)),this.rootRenderTarget.clearColor=this._backgroundColorRgba,this.bindRenderTarget(this.rootRenderTarget),this.emit("context",t),this.resize(this.width,this.height)},i.prototype.render=function(t,e,r,i,n){if(this.renderingToScreen=!e,this.emit("prerender"),this.gl&&!this.gl.isContextLost()){if(e||(this._lastObjectRendered=t),!n){var s=t.parent;t.parent=this._tempDisplayObjectParent,t.updateTransform(),t.parent=s}this.bindRenderTexture(e,i),this.currentRenderer.start(),(void 0!==r?r:this.clearBeforeRender)&&this._activeRenderTarget.clear(),t.renderWebGL(this),this.currentRenderer.flush(),this.textureGC.update(),this.emit("postrender")}},i.prototype.setObjectRenderer=function(t){this.currentRenderer!==t&&(this.currentRenderer.stop(),this.currentRenderer=t,this.currentRenderer.start())},i.prototype.flush=function(){this.setObjectRenderer(this.emptyRenderer)},i.prototype.resize=function(t,e){n.prototype.resize.call(this,t,e),this.rootRenderTarget.resize(t,e),this._activeRenderTarget===this.rootRenderTarget&&(this.rootRenderTarget.activate(),this._activeShader&&(this._activeShader.uniforms.projectionMatrix=this.rootRenderTarget.projectionMatrix.toArray(!0)))},i.prototype.setBlendMode=function(t){this.state.setBlendMode(t)},i.prototype.clear=function(t){this._activeRenderTarget.clear(t)},i.prototype.setTransform=function(t){this._activeRenderTarget.transform=t},i.prototype.bindRenderTexture=function(t,e){var r;if(t){var i=t.baseTexture,n=this.gl;i._glRenderTargets[this.CONTEXT_UID]?(this._activeTextureLocation=i._id,n.activeTexture(n.TEXTURE0+i._id),n.bindTexture(n.TEXTURE_2D,null)):(this.textureManager.updateTexture(i),n.bindTexture(n.TEXTURE_2D,null)),r=i._glRenderTargets[this.CONTEXT_UID],r.setFrame(t.frame)}else r=this.rootRenderTarget;return r.transform=e,this.bindRenderTarget(r),this},i.prototype.bindRenderTarget=function(t){return t!==this._activeRenderTarget&&(this._activeRenderTarget=t,t.activate(),this._activeShader&&(this._activeShader.uniforms.projectionMatrix=t.projectionMatrix.toArray(!0)),this.stencilManager.setMaskStack(t.stencilMaskStack)),this},i.prototype.bindShader=function(t){return this._activeShader!==t&&(this._activeShader=t,t.bind(),t.uniforms.projectionMatrix=this._activeRenderTarget.projectionMatrix.toArray(!0)),this},i.prototype.bindTexture=function(t,e){t=t.baseTexture||t;var r=this.gl;return e=e||0,this._activeTextureLocation!==e&&(this._activeTextureLocation=e,r.activeTexture(r.TEXTURE0+e)),this._activeTexture=t,t._glTextures[this.CONTEXT_UID]?(t.touched=this.textureGC.count,t._glTextures[this.CONTEXT_UID].bind()):this.textureManager.updateTexture(t),this},i.prototype.createVao=function(){return new y.VertexArrayObject(this.gl,this.state.attribState)},i.prototype.reset=function(){return this.setObjectRenderer(this.emptyRenderer),this._activeShader=null,this._activeRenderTarget=this.rootRenderTarget,this._activeTextureLocation=999,this._activeTexture=null,this.rootRenderTarget.activate(),this.state.resetToDefault(),this},i.prototype.handleContextLost=function(t){t.preventDefault()},i.prototype.handleContextRestored=function(){this._initContext(),this.textureManager.removeAll()},i.prototype.destroy=function(t){this.destroyPlugins(),this.view.removeEventListener("webglcontextlost",this.handleContextLost),this.view.removeEventListener("webglcontextrestored",this.handleContextRestored),this.textureManager.destroy(),n.prototype.destroy.call(this,t),this.uid=0,this.maskManager.destroy(),this.stencilManager.destroy(),this.filterManager.destroy(),this.maskManager=null,this.filterManager=null,this.textureManager=null,this.currentRenderer=null,this.handleContextLost=null,this.handleContextRestored=null,this._contextOptions=null,this.gl.useProgram(null),this.gl.getExtension("WEBGL_lose_context")&&this.gl.getExtension("WEBGL_lose_context").loseContext(),this.gl=null}},{"../../const":78,"../../utils":151,"../SystemRenderer":108,"./TextureGarbageCollector":114,"./TextureManager":115,"./WebGLState":117,"./managers/FilterManager":122,"./managers/MaskManager":123,"./managers/StencilManager":124,"./utils/ObjectRenderer":126,"./utils/RenderTarget":128,"./utils/mapWebGLDrawModesToPixi":131,"./utils/validateContext":132,"pixi-gl-core":7}],117:[function(t,e,r){function i(t){this.activeState=new Uint8Array(16),this.defaultState=new Uint8Array(16),this.defaultState[0]=1,this.stackIndex=0,this.stack=[],this.gl=t,this.maxAttribs=t.getParameter(t.MAX_VERTEX_ATTRIBS),this.attribState={tempAttribState:new Array(this.maxAttribs),attribState:new Array(this.maxAttribs)},this.blendModes=n(t),this.nativeVaoExtension=t.getExtension("OES_vertex_array_object")||t.getExtension("MOZ_OES_vertex_array_object")||t.getExtension("WEBKIT_OES_vertex_array_object")}var n=t("./utils/mapWebGLBlendModesToPixi");i.prototype.push=function(){var t=this.stack[++this.stackIndex];t||(t=this.stack[this.stackIndex]=new Uint8Array(16));for(var e=0;e<this.activeState.length;e++)this.activeState[e]=t[e]};var s=0,o=1,a=2,h=3,u=4;i.prototype.pop=function(){var t=this.stack[--this.stackIndex];this.setState(t)},i.prototype.setState=function(t){this.setBlend(t[s]),this.setDepthTest(t[o]),this.setFrontFace(t[a]),this.setCullFace(t[h]),this.setBlendMode(t[u])},i.prototype.setBlend=function(t){if(!(this.activeState[s]===t|0)){this.activeState[s]=0|t;var e=this.gl;t?e.enable(e.BLEND):e.disable(e.BLEND)}},i.prototype.setBlendMode=function(t){t!==this.activeState[u]&&(this.activeState[u]=t,this.gl.blendFunc(this.blendModes[t][0],this.blendModes[t][1]))},i.prototype.setDepthTest=function(t){if(!(this.activeState[o]===t|0)){this.activeState[o]=0|t;var e=this.gl;t?e.enable(e.DEPTH_TEST):e.disable(e.DEPTH_TEST)}},i.prototype.setCullFace=function(t){if(!(this.activeState[h]===t|0)){this.activeState[h]=0|t;var e=this.gl;t?e.enable(e.CULL_FACE):e.disable(e.CULL_FACE)}},i.prototype.setFrontFace=function(t){if(!(this.activeState[a]===t|0)){this.activeState[a]=0|t;var e=this.gl;t?e.frontFace(e.CW):e.frontFace(e.CCW)}},i.prototype.resetAttributes=function(){var t;for(t=0;t<this.attribState.tempAttribState.length;t++)this.attribState.tempAttribState[t]=0;for(t=0;t<this.attribState.attribState.length;t++)this.attribState.attribState[t]=0;var e=this.gl;for(t=1;t<this.maxAttribs;t++)e.disableVertexAttribArray(t)},i.prototype.resetToDefault=function(){this.nativeVaoExtension&&this.nativeVaoExtension.bindVertexArrayOES(null),this.resetAttributes();for(var t=0;t<this.activeState.length;t++)this.activeState[t]=32;var e=this.gl;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),this.setState(this.defaultState)},e.exports=i},{"./utils/mapWebGLBlendModesToPixi":130}],118:[function(t,e,r){function i(t,e,r){this.vertexSrc=t||i.defaultVertexSrc,this.fragmentSrc=e||i.defaultFragmentSrc,this.blendMode=o.BLEND_MODES.NORMAL,this.uniformData=r||n(this.vertexSrc,this.fragmentSrc,"projectionMatrix|uSampler"),this.uniforms={};for(var h in this.uniformData)this.uniforms[h]=this.uniformData[h].value;this.glShaders=[],a[this.vertexSrc+this.fragmentSrc]||(a[this.vertexSrc+this.fragmentSrc]=s.uid()),this.glShaderKey=a[this.vertexSrc+this.fragmentSrc],this.padding=4,this.resolution=1,this.enabled=!0}var n=t("./extractUniformsFromSrc"),s=t("../../../utils"),o=t("../../../const"),a={};e.exports=i,i.prototype.apply=function(t,e,r,i){t.applyFilter(this,e,r,i)},i.defaultVertexSrc=["attribute vec2 aVertexPosition;","attribute vec2 aTextureCoord;","uniform mat3 projectionMatrix;","uniform mat3 filterMatrix;","varying vec2 vTextureCoord;","varying vec2 vFilterCoord;","void main(void){","   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);","   vFilterCoord = ( filterMatrix * vec3( aTextureCoord, 1.0)  ).xy;","   vTextureCoord = aTextureCoord ;","}"].join("\n"),i.defaultFragmentSrc=["varying vec2 vTextureCoord;","varying vec2 vFilterCoord;","uniform sampler2D uSampler;","uniform sampler2D filterSampler;","void main(void){","   vec4 masky = texture2D(filterSampler, vFilterCoord);","   vec4 sample = texture2D(uSampler, vTextureCoord);","   vec4 color;","   if(mod(vFilterCoord.x, 1.0) > 0.5)","   {","     color = vec4(1.0, 0.0, 0.0, 1.0);","   }","   else","   {","     color = vec4(0.0, 1.0, 0.0, 1.0);","   }","   gl_FragColor = mix(sample, masky, 0.5);","   gl_FragColor *= sample.a;","}"].join("\n")},{"../../../const":78,"../../../utils":151,"./extractUniformsFromSrc":119}],119:[function(t,e,r){function i(t,e,r){var i=n(t,r),s=n(e,r);return Object.assign(i,s)}function n(t){for(var e,r=new RegExp("^(projectionMatrix|uSampler|filterArea)$"),i={},n=t.replace(/\s+/g," ").split(/\s*;\s*/),o=0;o<n.length;o++){var a=n[o].trim();if(a.indexOf("uniform")>-1){var h=a.split(" "),u=h[1],l=h[2],c=1;l.indexOf("[")>-1&&(e=l.split(/\[|\]/),l=e[0],c*=Number(e[1])),l.match(r)||(i[l]={value:s(u,c),name:l,type:u})}}return i}var s=t("pixi-gl-core").shader.defaultValue;e.exports=i},{"pixi-gl-core":7}],120:[function(t,e,r){var i=t("../../../math"),n=function(t,e,r){var i=t.identity();return i.translate(e.x/r.width,e.y/r.height),i.scale(r.width,r.height),i},s=function(t,e,r){var i=t.identity();i.translate(e.x/r.width,e.y/r.height);var n=r.width/e.width,s=r.height/e.height;return i.scale(n,s),i},o=function(t,e,r,n){var s=n.worldTransform.copy(i.Matrix.TEMP_MATRIX),o=n._texture.baseTexture,a=t.identity(),h=r.height/r.width;a.translate(e.x/r.width,e.y/r.height),a.scale(1,h);var u=r.width/o.width,l=r.height/o.height;return s.tx/=o.width*u,s.ty/=o.width*u,s.invert(),a.prepend(s),a.scale(1,1/h),a.scale(u,l),a.translate(n.anchor.x,n.anchor.y),a};e.exports={calculateScreenSpaceMatrix:n,calculateNormalizedScreenSpaceMatrix:s,calculateSpriteMatrix:o}},{"../../../math":102}],121:[function(t,e,r){function i(t){var e=new s.Matrix;n.call(this,"#define GLSLIFY 1\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 otherMatrix;\n\nvarying vec2 vMaskCoord;\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n    vMaskCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;\n}\n","#define GLSLIFY 1\nvarying vec2 vMaskCoord;\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float alpha;\nuniform sampler2D mask;\n\nvoid main(void)\n{\n    // check clip! this will stop the mask bleeding out from the edges\n    vec2 text = abs( vMaskCoord - 0.5 );\n    text = step(0.5, text);\n    float clip = 1.0 - max(text.y, text.x);\n    vec4 original = texture2D(uSampler, vTextureCoord);\n    vec4 masky = texture2D(mask, vMaskCoord);\n    original *= (masky.r * masky.a * alpha * clip);\n    gl_FragColor = original;\n}\n"),t.renderable=!1,this.maskSprite=t,this.maskMatrix=e}var n=t("../Filter"),s=t("../../../../math");i.prototype=Object.create(n.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.apply=function(t,e,r){var i=this.maskSprite;this.uniforms.mask=i._texture,this.uniforms.otherMatrix=t.calculateSpriteMatrix(this.maskMatrix,i),this.uniforms.alpha=i.worldAlpha,t.applyFilter(this,e,r)}},{"../../../../math":102,"../Filter":118}],122:[function(t,e,r){function i(t){n.call(this,t),this.gl=this.renderer.gl,this.quad=new o(this.gl,t.state.attribState),this.shaderCache={},this.pool={},this.filterData=null}var n=t("./WebGLManager"),s=t("../utils/RenderTarget"),o=t("../utils/Quad"),a=t("../../../math"),h=t("../../../Shader"),u=t("../filters/filterTransforms"),l=t("bit-twiddle"),c=function(){this.renderTarget=null,this.sourceFrame=new a.Rectangle,this.destinationFrame=new a.Rectangle,this.filters=[],this.target=null,this.resolution=1};i.prototype=Object.create(n.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.pushFilter=function(t,e){var r=this.renderer,i=this.filterData;if(!i){i=this.renderer._activeRenderTarget.filterStack;var n=new c;n.sourceFrame=n.destinationFrame=this.renderer._activeRenderTarget.size,n.renderTarget=r._activeRenderTarget,this.renderer._activeRenderTarget.filterData=i={index:0,stack:[n]},this.filterData=i}var s=i.stack[++i.index];s||(s=i.stack[i.index]=new c);var o=e[0].resolution,a=e[0].padding,h=t.filterArea||t.getBounds(!0),u=s.sourceFrame,l=s.destinationFrame;u.x=(h.x*o|0)/o,u.y=(h.y*o|0)/o,u.width=(h.width*o|0)/o,u.height=(h.height*o|0)/o,i.stack[0].renderTarget.transform||u.fit(i.stack[0].destinationFrame),u.pad(a),l.width=u.width,l.height=u.height;var d=this.getPotRenderTarget(r.gl,u.width,u.height,o);s.target=t,s.filters=e,s.resolution=o,s.renderTarget=d,d.setFrame(l,u),r.bindRenderTarget(d),r.clear()},i.prototype.popFilter=function(){var t=this.filterData,e=t.stack[t.index-1],r=t.stack[t.index];this.quad.map(r.renderTarget.size,r.sourceFrame).upload();var i=r.filters;if(1===i.length)i[0].apply(this,r.renderTarget,e.renderTarget,!1),this.freePotRenderTarget(r.renderTarget);else{var n=r.renderTarget,s=this.getPotRenderTarget(this.renderer.gl,r.sourceFrame.width,r.sourceFrame.height,1);s.setFrame(r.destinationFrame,r.sourceFrame);for(var o=0;o<i.length-1;o++){i[o].apply(this,n,s,!0);var a=n;n=s,s=a}i[o].apply(this,n,e.renderTarget,!1),this.freePotRenderTarget(n),this.freePotRenderTarget(s)}t.index--,0===t.index&&(this.filterData=null)},i.prototype.applyFilter=function(t,e,r,i){var n=this.renderer,s=t.glShaders[n.CONTEXT_UID];if(s||(t.glShaderKey?(s=this.shaderCache[t.glShaderKey],s||(s=t.glShaders[n.CONTEXT_UID]=this.shaderCache[t.glShaderKey]=new h(this.gl,t.vertexSrc,t.fragmentSrc))):s=t.glShaders[n.CONTEXT_UID]=new h(this.gl,t.vertexSrc,t.fragmentSrc),this.quad.initVao(s)),n.bindRenderTarget(r),i){var o=n.gl;o.disable(o.SCISSOR_TEST),n.clear(),o.enable(o.SCISSOR_TEST)}r===n.maskManager.scissorRenderTarget&&n.maskManager.pushScissorMask(null,n.maskManager.scissorData),n.bindShader(s),this.syncUniforms(s,t),e.texture.bind(0),n._activeTextureLocation=0,n.state.setBlendMode(t.blendMode),this.quad.draw()},i.prototype.syncUniforms=function(t,e){var r,i=e.uniformData,n=e.uniforms,s=1;if(t.uniforms.data.filterArea){r=this.filterData.stack[this.filterData.index];var o=t.uniforms.filterArea;o[0]=r.renderTarget.size.width,o[1]=r.renderTarget.size.height,o[2]=r.sourceFrame.x,o[3]=r.sourceFrame.y,t.uniforms.filterArea=o}if(t.uniforms.data.filterClamp){r=this.filterData.stack[this.filterData.index];var a=t.uniforms.filterClamp;a[0]=.5/r.renderTarget.size.width,a[1]=.5/r.renderTarget.size.height,a[2]=(r.sourceFrame.width-.5)/r.renderTarget.size.width,a[3]=(r.sourceFrame.height-.5)/r.renderTarget.size.height,t.uniforms.filterClamp=a}var h;for(var u in i)if("sampler2D"===i[u].type){if(t.uniforms[u]=s,n[u].baseTexture)this.renderer.bindTexture(n[u].baseTexture,s);else{var l=this.renderer.gl;this.renderer._activeTextureLocation=l.TEXTURE0+s,l.activeTexture(l.TEXTURE0+s),n[u].texture.bind()}s++}else"mat3"===i[u].type?void 0!==n[u].a?t.uniforms[u]=n[u].toArray(!0):t.uniforms[u]=n[u]:"vec2"===i[u].type?void 0!==n[u].x?(h=t.uniforms[u]||new Float32Array(2),h[0]=n[u].x,h[1]=n[u].y,t.uniforms[u]=h):t.uniforms[u]=n[u]:"float"===i[u].type?t.uniforms.data[u].value!==i[u]&&(t.uniforms[u]=n[u]):t.uniforms[u]=n[u]},i.prototype.getRenderTarget=function(t,e){var r=this.filterData.stack[this.filterData.index],i=this.getPotRenderTarget(this.renderer.gl,r.sourceFrame.width,r.sourceFrame.height,e||r.resolution);return i.setFrame(r.destinationFrame,r.sourceFrame),i},i.prototype.returnRenderTarget=function(t){return this.freePotRenderTarget(t)},i.prototype.calculateScreenSpaceMatrix=function(t){var e=this.filterData.stack[this.filterData.index];return u.calculateScreenSpaceMatrix(t,e.sourceFrame,e.renderTarget.size)},i.prototype.calculateNormalizedScreenSpaceMatrix=function(t){var e=this.filterData.stack[this.filterData.index];return u.calculateNormalizedScreenSpaceMatrix(t,e.sourceFrame,e.renderTarget.size,e.destinationFrame)},i.prototype.calculateSpriteMatrix=function(t,e){var r=this.filterData.stack[this.filterData.index];return u.calculateSpriteMatrix(t,r.sourceFrame,r.renderTarget.size,e)},i.prototype.destroy=function(){this.shaderCache=[],this.emptyPool()},i.prototype.getPotRenderTarget=function(t,e,r,i){e=l.nextPow2(e*i),r=l.nextPow2(r*i);var n=(65535&e)<<16|65535&r;this.pool[n]||(this.pool[n]=[]);var o=this.pool[n].pop()||new s(t,e,r,null,1);return o.resolution=i,o.defaultFrame.width=o.size.width=e/i,o.defaultFrame.height=o.size.height=r/i,o},i.prototype.emptyPool=function(){for(var t in this.pool){var e=this.pool[t];if(e)for(var r=0;r<e.length;r++)e[r].destroy(!0)}this.pool={}},i.prototype.freePotRenderTarget=function(t){var e=t.size.width*t.resolution,r=t.size.height*t.resolution,i=(65535&e)<<16|65535&r;this.pool[i].push(t)}},{"../../../Shader":77,"../../../math":102,"../filters/filterTransforms":120,"../utils/Quad":127,"../utils/RenderTarget":128,"./WebGLManager":125,"bit-twiddle":30}],123:[function(t,e,r){function i(t){n.call(this,t),this.scissor=!1,this.scissorData=null,this.scissorRenderTarget=null,this.enableScissor=!0,this.alphaMaskPool=[],this.alphaMaskIndex=0}var n=t("./WebGLManager"),s=t("../filters/spriteMask/SpriteMaskFilter");i.prototype=Object.create(n.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.pushMask=function(t,e){if(e.texture)this.pushSpriteMask(t,e);else if(this.enableScissor&&!this.scissor&&!this.renderer.stencilManager.stencilMaskStack.length&&e.isFastRect()){var r=e.worldTransform,i=Math.atan2(r.b,r.a);i=Math.round(i*(180/Math.PI)),i%90?this.pushStencilMask(e):this.pushScissorMask(t,e)}else this.pushStencilMask(e)},i.prototype.popMask=function(t,e){e.texture?this.popSpriteMask(t,e):this.enableScissor&&!this.renderer.stencilManager.stencilMaskStack.length?this.popScissorMask(t,e):this.popStencilMask(t,e)},i.prototype.pushSpriteMask=function(t,e){var r=this.alphaMaskPool[this.alphaMaskIndex];r||(r=this.alphaMaskPool[this.alphaMaskIndex]=[new s(e)]),r[0].resolution=this.renderer.resolution,
r[0].maskSprite=e,t.filterArea=e.getBounds(!0),this.renderer.filterManager.pushFilter(t,r),this.alphaMaskIndex++},i.prototype.popSpriteMask=function(){this.renderer.filterManager.popFilter(),this.alphaMaskIndex--},i.prototype.pushStencilMask=function(t){this.renderer.currentRenderer.stop(),this.renderer.stencilManager.pushStencil(t)},i.prototype.popStencilMask=function(){this.renderer.currentRenderer.stop(),this.renderer.stencilManager.popStencil()},i.prototype.pushScissorMask=function(t,e){e.renderable=!0;var r=this.renderer._activeRenderTarget,i=e.getBounds();i.fit(r.size),e.renderable=!1,this.renderer.gl.enable(this.renderer.gl.SCISSOR_TEST);var n=this.renderer.resolution;this.renderer.gl.scissor(i.x*n,(r.root?r.size.height-i.y-i.height:i.y)*n,i.width*n,i.height*n),this.scissorRenderTarget=r,this.scissorData=e,this.scissor=!0},i.prototype.popScissorMask=function(){this.scissorRenderTarget=null,this.scissorData=null,this.scissor=!1;var t=this.renderer.gl;t.disable(t.SCISSOR_TEST)}},{"../filters/spriteMask/SpriteMaskFilter":121,"./WebGLManager":125}],124:[function(t,e,r){function i(t){n.call(this,t),this.stencilMaskStack=null}var n=t("./WebGLManager");i.prototype=Object.create(n.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.setMaskStack=function(t){this.stencilMaskStack=t;var e=this.renderer.gl;0===t.length?e.disable(e.STENCIL_TEST):e.enable(e.STENCIL_TEST)},i.prototype.pushStencil=function(t){this.renderer.setObjectRenderer(this.renderer.plugins.graphics),this.renderer._activeRenderTarget.attachStencilBuffer();var e=this.renderer.gl,r=this.stencilMaskStack;0===r.length&&(e.enable(e.STENCIL_TEST),e.clear(e.STENCIL_BUFFER_BIT),e.stencilFunc(e.ALWAYS,1,1)),r.push(t),e.colorMask(!1,!1,!1,!1),e.stencilOp(e.KEEP,e.KEEP,e.INCR),this.renderer.plugins.graphics.render(t),e.colorMask(!0,!0,!0,!0),e.stencilFunc(e.NOTEQUAL,0,r.length),e.stencilOp(e.KEEP,e.KEEP,e.KEEP)},i.prototype.popStencil=function(){this.renderer.setObjectRenderer(this.renderer.plugins.graphics);var t=this.renderer.gl,e=this.stencilMaskStack,r=e.pop();0===e.length?t.disable(t.STENCIL_TEST):(t.colorMask(!1,!1,!1,!1),t.stencilOp(t.KEEP,t.KEEP,t.DECR),this.renderer.plugins.graphics.render(r),t.colorMask(!0,!0,!0,!0),t.stencilFunc(t.NOTEQUAL,0,e.length),t.stencilOp(t.KEEP,t.KEEP,t.KEEP))},i.prototype.destroy=function(){n.prototype.destroy.call(this),this.stencilMaskStack.stencilStack=null}},{"./WebGLManager":125}],125:[function(t,e,r){function i(t){this.renderer=t,this.renderer.on("context",this.onContextChange,this)}i.prototype.constructor=i,e.exports=i,i.prototype.onContextChange=function(){},i.prototype.destroy=function(){this.renderer.off("context",this.onContextChange,this),this.renderer=null}},{}],126:[function(t,e,r){function i(t){n.call(this,t)}var n=t("../managers/WebGLManager");i.prototype=Object.create(n.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.start=function(){},i.prototype.stop=function(){this.flush()},i.prototype.flush=function(){},i.prototype.render=function(t){}},{"../managers/WebGLManager":125}],127:[function(t,e,r){function i(t,e){this.gl=t,this.vertices=new Float32Array([-1,-1,1,-1,1,1,-1,1]),this.uvs=new Float32Array([0,0,1,0,1,1,0,1]),this.interleaved=new Float32Array(16);for(var r=0;r<4;r++)this.interleaved[4*r]=this.vertices[2*r],this.interleaved[4*r+1]=this.vertices[2*r+1],this.interleaved[4*r+2]=this.uvs[2*r],this.interleaved[4*r+3]=this.uvs[2*r+1];this.indices=s(1),this.vertexBuffer=n.GLBuffer.createVertexBuffer(t,this.interleaved,t.STATIC_DRAW),this.indexBuffer=n.GLBuffer.createIndexBuffer(t,this.indices,t.STATIC_DRAW),this.vao=new n.VertexArrayObject(t,e)}var n=t("pixi-gl-core"),s=t("../../../utils/createIndicesForQuads");i.prototype.constructor=i,i.prototype.initVao=function(t){this.vao.clear().addIndex(this.indexBuffer).addAttribute(this.vertexBuffer,t.attributes.aVertexPosition,this.gl.FLOAT,!1,16,0).addAttribute(this.vertexBuffer,t.attributes.aTextureCoord,this.gl.FLOAT,!1,16,8)},i.prototype.map=function(t,e){var r=0,i=0;return this.uvs[0]=r,this.uvs[1]=i,this.uvs[2]=r+e.width/t.width,this.uvs[3]=i,this.uvs[4]=r+e.width/t.width,this.uvs[5]=i+e.height/t.height,this.uvs[6]=r,this.uvs[7]=i+e.height/t.height,r=e.x,i=e.y,this.vertices[0]=r,this.vertices[1]=i,this.vertices[2]=r+e.width,this.vertices[3]=i,this.vertices[4]=r+e.width,this.vertices[5]=i+e.height,this.vertices[6]=r,this.vertices[7]=i+e.height,this},i.prototype.draw=function(){return this.vao.bind().draw(this.gl.TRIANGLES,6,0).unbind(),this},i.prototype.upload=function(){for(var t=0;t<4;t++)this.interleaved[4*t]=this.vertices[2*t],this.interleaved[4*t+1]=this.vertices[2*t+1],this.interleaved[4*t+2]=this.uvs[2*t],this.interleaved[4*t+3]=this.uvs[2*t+1];return this.vertexBuffer.upload(this.interleaved),this},i.prototype.destroy=function(){var t=this.gl;t.deleteBuffer(this.vertexBuffer),t.deleteBuffer(this.indexBuffer)},e.exports=i},{"../../../utils/createIndicesForQuads":149,"pixi-gl-core":7}],128:[function(t,e,r){var i=t("../../../math"),n=t("../../../const"),s=t("pixi-gl-core").GLFramebuffer,o=function(t,e,r,o,a,h){this.gl=t,this.frameBuffer=null,this.texture=null,this.clearColor=[0,0,0,0],this.size=new i.Rectangle(0,0,1,1),this.resolution=a||n.RESOLUTION,this.projectionMatrix=new i.Matrix,this.transform=null,this.frame=null,this.defaultFrame=new i.Rectangle,this.destinationFrame=null,this.sourceFrame=null,this.stencilBuffer=null,this.stencilMaskStack=[],this.filterData=null,this.scaleMode=o||n.SCALE_MODES.DEFAULT,this.root=h,this.root?(this.frameBuffer=new s(t,100,100),this.frameBuffer.framebuffer=null):(this.frameBuffer=s.createRGBA(t,100,100),this.scaleMode===n.SCALE_MODES.NEAREST?this.frameBuffer.texture.enableNearestScaling():this.frameBuffer.texture.enableLinearScaling(),this.texture=this.frameBuffer.texture),this.setFrame(),this.resize(e,r)};o.prototype.constructor=o,e.exports=o,o.prototype.clear=function(t){var e=t||this.clearColor;this.frameBuffer.clear(e[0],e[1],e[2],e[3])},o.prototype.attachStencilBuffer=function(){this.root||this.frameBuffer.enableStencil()},o.prototype.setFrame=function(t,e){this.destinationFrame=t||this.destinationFrame||this.defaultFrame,this.sourceFrame=e||this.sourceFrame||t},o.prototype.activate=function(){var t=this.gl;this.frameBuffer.bind(),this.calculateProjection(this.destinationFrame,this.sourceFrame),this.transform&&this.projectionMatrix.append(this.transform),this.destinationFrame!==this.sourceFrame?(t.enable(t.SCISSOR_TEST),t.scissor(0|this.destinationFrame.x,0|this.destinationFrame.y,this.destinationFrame.width*this.resolution|0,this.destinationFrame.height*this.resolution|0)):t.disable(t.SCISSOR_TEST),t.viewport(0|this.destinationFrame.x,0|this.destinationFrame.y,this.destinationFrame.width*this.resolution|0,this.destinationFrame.height*this.resolution|0)},o.prototype.calculateProjection=function(t,e){var r=this.projectionMatrix;e=e||t,r.identity(),this.root?(r.a=1/t.width*2,r.d=-1/t.height*2,r.tx=-1-e.x*r.a,r.ty=1-e.y*r.d):(r.a=1/t.width*2,r.d=1/t.height*2,r.tx=-1-e.x*r.a,r.ty=-1-e.y*r.d)},o.prototype.resize=function(t,e){if(t=0|t,e=0|e,this.size.width!==t||this.size.height!==e){this.size.width=t,this.size.height=e,this.defaultFrame.width=t,this.defaultFrame.height=e,this.frameBuffer.resize(t*this.resolution,e*this.resolution);var r=this.frame||this.size;this.calculateProjection(r)}},o.prototype.destroy=function(){this.frameBuffer.destroy(),this.frameBuffer=null,this.texture=null}},{"../../../const":78,"../../../math":102,"pixi-gl-core":7}],129:[function(t,e,r){function i(t){for(var e="",r=0;r<t;r++)r>0&&(e+="\nelse "),r<t-1&&(e+="if(test == "+r+".0){}");return e}var n=t("pixi-gl-core"),s=["precision mediump float;","void main(void){","float test = 0.1;","%forloop%","gl_FragColor = vec4(0.0);","}"].join("\n"),o=function(t,e){var r=!e;if(r){var o=document.createElement("canvas");o.width=1,o.height=1,e=n.createContext(o)}for(var a=e.createShader(e.FRAGMENT_SHADER);;){var h=s.replace(/%forloop%/gi,i(t));if(e.shaderSource(a,h),e.compileShader(a),e.getShaderParameter(a,e.COMPILE_STATUS))break;t=t/2|0}return r&&e.getExtension("WEBGL_lose_context")&&e.getExtension("WEBGL_lose_context").loseContext(),t};e.exports=o},{"pixi-gl-core":7}],130:[function(t,e,r){function i(t,e){return e=e||[],e[n.BLEND_MODES.NORMAL]=[t.ONE,t.ONE_MINUS_SRC_ALPHA],e[n.BLEND_MODES.ADD]=[t.ONE,t.DST_ALPHA],e[n.BLEND_MODES.MULTIPLY]=[t.DST_COLOR,t.ONE_MINUS_SRC_ALPHA],e[n.BLEND_MODES.SCREEN]=[t.ONE,t.ONE_MINUS_SRC_COLOR],e[n.BLEND_MODES.OVERLAY]=[t.ONE,t.ONE_MINUS_SRC_ALPHA],e[n.BLEND_MODES.DARKEN]=[t.ONE,t.ONE_MINUS_SRC_ALPHA],e[n.BLEND_MODES.LIGHTEN]=[t.ONE,t.ONE_MINUS_SRC_ALPHA],e[n.BLEND_MODES.COLOR_DODGE]=[t.ONE,t.ONE_MINUS_SRC_ALPHA],e[n.BLEND_MODES.COLOR_BURN]=[t.ONE,t.ONE_MINUS_SRC_ALPHA],e[n.BLEND_MODES.HARD_LIGHT]=[t.ONE,t.ONE_MINUS_SRC_ALPHA],e[n.BLEND_MODES.SOFT_LIGHT]=[t.ONE,t.ONE_MINUS_SRC_ALPHA],e[n.BLEND_MODES.DIFFERENCE]=[t.ONE,t.ONE_MINUS_SRC_ALPHA],e[n.BLEND_MODES.EXCLUSION]=[t.ONE,t.ONE_MINUS_SRC_ALPHA],e[n.BLEND_MODES.HUE]=[t.ONE,t.ONE_MINUS_SRC_ALPHA],e[n.BLEND_MODES.SATURATION]=[t.ONE,t.ONE_MINUS_SRC_ALPHA],e[n.BLEND_MODES.COLOR]=[t.ONE,t.ONE_MINUS_SRC_ALPHA],e[n.BLEND_MODES.LUMINOSITY]=[t.ONE,t.ONE_MINUS_SRC_ALPHA],e}var n=t("../../../const");e.exports=i},{"../../../const":78}],131:[function(t,e,r){function i(t,e){e=e||{},e[n.DRAW_MODES.POINTS]=t.POINTS,e[n.DRAW_MODES.LINES]=t.LINES,e[n.DRAW_MODES.LINE_LOOP]=t.LINE_LOOP,e[n.DRAW_MODES.LINE_STRIP]=t.LINE_STRIP,e[n.DRAW_MODES.TRIANGLES]=t.TRIANGLES,e[n.DRAW_MODES.TRIANGLE_STRIP]=t.TRIANGLE_STRIP,e[n.DRAW_MODES.TRIANGLE_FAN]=t.TRIANGLE_FAN}var n=t("../../../const");e.exports=i},{"../../../const":78}],132:[function(t,e,r){function i(t){var e=t.getContextAttributes();e.stencil||console.warn("Provided WebGL context does not have a stencil buffer, masks may not render correctly")}e.exports=i},{}],133:[function(t,e,r){function i(t){o.call(this),this.anchor=new n.ObservablePoint(this.onAnchorUpdate,this),this._texture=null,this._width=0,this._height=0,this._tint=null,this._tintRGB=null,this.tint=16777215,this.blendMode=h.BLEND_MODES.NORMAL,this.shader=null,this.cachedTint=16777215,this.texture=t||s.EMPTY,this.vertexData=new Float32Array(8),this.vertexTrimmedData=null,this._transformID=-1,this._textureID=-1}var n=t("../math"),s=t("../textures/Texture"),o=t("../display/Container"),a=t("../utils"),h=t("../const"),u=new n.Point;i.prototype=Object.create(o.prototype),i.prototype.constructor=i,e.exports=i,Object.defineProperties(i.prototype,{width:{get:function(){return Math.abs(this.scale.x)*this.texture.orig.width},set:function(t){var e=a.sign(this.scale.x)||1;this.scale.x=e*t/this.texture.orig.width,this._width=t}},height:{get:function(){return Math.abs(this.scale.y)*this.texture.orig.height},set:function(t){var e=a.sign(this.scale.y)||1;this.scale.y=e*t/this.texture.orig.height,this._height=t}},tint:{get:function(){return this._tint},set:function(t){this._tint=t,this._tintRGB=(t>>16)+(65280&t)+((255&t)<<16)}},texture:{get:function(){return this._texture},set:function(t){this._texture!==t&&(this._texture=t,this.cachedTint=16777215,this._textureID=-1,t&&(t.baseTexture.hasLoaded?this._onTextureUpdate():t.once("update",this._onTextureUpdate,this)))}}}),i.prototype._onTextureUpdate=function(){this._textureID=-1,this._width&&(this.scale.x=a.sign(this.scale.x)*this._width/this.texture.orig.width),this._height&&(this.scale.y=a.sign(this.scale.y)*this._height/this.texture.orig.height)},i.prototype.onAnchorUpdate=function(){this._transformID=-1},i.prototype.calculateVertices=function(){if(this._transformID!==this.transform._worldID||this._textureID!==this._texture._updateID){this._transformID=this.transform._worldID,this._textureID=this._texture._updateID;var t,e,r,i,n=this._texture,s=this.transform.worldTransform,o=s.a,a=s.b,h=s.c,u=s.d,l=s.tx,c=s.ty,d=this.vertexData,p=n.trim,f=n.orig;p?(e=p.x-this.anchor._x*f.width,t=e+p.width,i=p.y-this.anchor._y*f.height,r=i+p.height):(t=f.width*(1-this.anchor._x),e=f.width*-this.anchor._x,r=f.height*(1-this.anchor._y),i=f.height*-this.anchor._y),d[0]=o*e+h*i+l,d[1]=u*i+a*e+c,d[2]=o*t+h*i+l,d[3]=u*i+a*t+c,d[4]=o*t+h*r+l,d[5]=u*r+a*t+c,d[6]=o*e+h*r+l,d[7]=u*r+a*e+c}},i.prototype.calculateTrimmedVertices=function(){this.vertexTrimmedData||(this.vertexTrimmedData=new Float32Array(8));var t,e,r,i,n=this._texture,s=this.vertexTrimmedData,o=n.orig,a=this.transform.worldTransform,h=a.a,u=a.b,l=a.c,c=a.d,d=a.tx,p=a.ty;t=o.width*(1-this.anchor._x),e=o.width*-this.anchor._x,r=o.height*(1-this.anchor._y),i=o.height*-this.anchor._y,s[0]=h*e+l*i+d,s[1]=c*i+u*e+p,s[2]=h*t+l*i+d,s[3]=c*i+u*t+p,s[4]=h*t+l*r+d,s[5]=c*r+u*t+p,s[6]=h*e+l*r+d,s[7]=c*r+u*e+p},i.prototype._renderWebGL=function(t){this.calculateVertices(),t.setObjectRenderer(t.plugins.sprite),t.plugins.sprite.render(this)},i.prototype._renderCanvas=function(t){t.plugins.sprite.render(this)},i.prototype._calculateBounds=function(){var t=this._texture.trim,e=this._texture.orig;!t||t.width===e.width&&t.height===e.height?(this.calculateVertices(),this._bounds.addQuad(this.vertexData)):(this.calculateTrimmedVertices(),this._bounds.addQuad(this.vertexTrimmedData))},i.prototype.getLocalBounds=function(t){return 0===this.children.length?(this._bounds.minX=-this._texture.orig.width*this.anchor._x,this._bounds.minY=-this._texture.orig.height*this.anchor._y,this._bounds.maxX=this._texture.orig.width,this._bounds.maxY=this._texture.orig.height,t||(this._localBoundsRect||(this._localBoundsRect=new n.Rectangle),t=this._localBoundsRect),this._bounds.getRectangle(t)):o.prototype.getLocalBounds.call(this,t)},i.prototype.containsPoint=function(t){this.worldTransform.applyInverse(t,u);var e,r=this._texture.orig.width,i=this._texture.orig.height,n=-r*this.anchor.x;return u.x>n&&u.x<n+r&&(e=-i*this.anchor.y,u.y>e&&u.y<e+i)},i.prototype.destroy=function(t){o.prototype.destroy.call(this,t),this.anchor=null;var e="boolean"==typeof t?t:t&&t.texture;if(e){var r="boolean"==typeof t?t:t&&t.baseTexture;this._texture.destroy(!!r)}this._texture=null,this.shader=null},i.from=function(t){return new i(s.from(t))},i.fromFrame=function(t){var e=a.TextureCache[t];if(!e)throw new Error('The frameId "'+t+'" does not exist in the texture cache');return new i(e)},i.fromImage=function(t,e,r){return new i(s.fromImage(t,e,r))}},{"../const":78,"../display/Container":80,"../math":102,"../textures/Texture":144,"../utils":151}],134:[function(t,e,r){function i(t){this.renderer=t}var n=t("../../renderers/canvas/CanvasRenderer"),s=t("../../const"),o=t("../../math"),a=new o.Matrix,h=t("./CanvasTinter");i.prototype.constructor=i,e.exports=i,n.registerPlugin("sprite",i),i.prototype.render=function(t){var e,r,i=t._texture,n=this.renderer,u=t.transform.worldTransform,l=i._frame.width,c=i._frame.height;if(!(i.orig.width<=0||i.orig.height<=0)&&i.baseTexture.source&&(n.setBlendMode(t.blendMode),i.valid)){n.context.globalAlpha=t.worldAlpha;var d=i.baseTexture.scaleMode===s.SCALE_MODES.LINEAR;n.smoothProperty&&n.context[n.smoothProperty]!==d&&(n.context[n.smoothProperty]=d),i.trim?(e=i.trim.width/2+i.trim.x-t.anchor.x*i.orig.width,r=i.trim.height/2+i.trim.y-t.anchor.y*i.orig.height):(e=(.5-t.anchor.x)*i.orig.width,r=(.5-t.anchor.y)*i.orig.height),i.rotate&&(u.copy(a),u=a,o.GroupD8.matrixAppendRotationInv(u,i.rotate,e,r),e=0,r=0),e-=l/2,r-=c/2,n.roundPixels?(n.context.setTransform(u.a,u.b,u.c,u.d,u.tx*n.resolution|0,u.ty*n.resolution|0),e=0|e,r=0|r):n.context.setTransform(u.a,u.b,u.c,u.d,u.tx*n.resolution,u.ty*n.resolution);var p=i.baseTexture.resolution;16777215!==t.tint?(t.cachedTint!==t.tint&&(t.cachedTint=t.tint,t.tintedTexture=h.getTintedTexture(t,t.tint)),n.context.drawImage(t.tintedTexture,0,0,l*p,c*p,e*n.resolution,r*n.resolution,l*n.resolution,c*n.resolution)):n.context.drawImage(i.baseTexture.source,i._frame.x*p,i._frame.y*p,l*p,c*p,e*n.resolution,r*n.resolution,l*n.resolution,c*n.resolution)}},i.prototype.destroy=function(){this.renderer=null}},{"../../const":78,"../../math":102,"../../renderers/canvas/CanvasRenderer":109,"./CanvasTinter":135}],135:[function(t,e,r){var i=t("../../utils"),n=t("../../renderers/canvas/utils/canUseNewCanvasBlendModes"),s=e.exports={getTintedTexture:function(t,e){var r=t.texture;e=s.roundColor(e);var i="#"+("00000"+(0|e).toString(16)).substr(-6);if(r.tintCache=r.tintCache||{},r.tintCache[i])return r.tintCache[i];var n=s.canvas||document.createElement("canvas");if(s.tintMethod(r,e,n),s.convertTintToImage){var o=new Image;o.src=n.toDataURL(),r.tintCache[i]=o}else r.tintCache[i]=n,s.canvas=null;return n},tintWithMultiply:function(t,e,r){var i=r.getContext("2d"),n=t._frame.clone(),s=t.baseTexture.resolution;n.x*=s,n.y*=s,n.width*=s,n.height*=s,r.width=n.width,r.height=n.height,i.fillStyle="#"+("00000"+(0|e).toString(16)).substr(-6),i.fillRect(0,0,n.width,n.height),i.globalCompositeOperation="multiply",i.drawImage(t.baseTexture.source,n.x,n.y,n.width,n.height,0,0,n.width,n.height),i.globalCompositeOperation="destination-atop",i.drawImage(t.baseTexture.source,n.x,n.y,n.width,n.height,0,0,n.width,n.height)},tintWithOverlay:function(t,e,r){var i=r.getContext("2d"),n=t._frame.clone(),s=t.baseTexture.resolution;n.x*=s,n.y*=s,n.width*=s,n.height*=s,r.width=n.width,r.height=n.height,i.globalCompositeOperation="copy",i.fillStyle="#"+("00000"+(0|e).toString(16)).substr(-6),i.fillRect(0,0,n.width,n.height),i.globalCompositeOperation="destination-atop",i.drawImage(t.baseTexture.source,n.x,n.y,n.width,n.height,0,0,n.width,n.height)},tintWithPerPixel:function(t,e,r){var n=r.getContext("2d"),s=t._frame.clone(),o=t.baseTexture.resolution;s.x*=o,s.y*=o,s.width*=o,s.height*=o,r.width=s.width,r.height=s.height,n.globalCompositeOperation="copy",n.drawImage(t.baseTexture.source,s.x,s.y,s.width,s.height,0,0,s.width,s.height);for(var a=i.hex2rgb(e),h=a[0],u=a[1],l=a[2],c=n.getImageData(0,0,s.width,s.height),d=c.data,p=0;p<d.length;p+=4)d[p+0]*=h,d[p+1]*=u,d[p+2]*=l;n.putImageData(c,0,0)},roundColor:function(t){var e=s.cacheStepsPerColorChannel,r=i.hex2rgb(t);return r[0]=Math.min(255,r[0]/e*e),r[1]=Math.min(255,r[1]/e*e),r[2]=Math.min(255,r[2]/e*e),i.rgb2hex(r)},cacheStepsPerColorChannel:8,convertTintToImage:!1,canUseMultiply:n(),tintMethod:0};s.tintMethod=s.canUseMultiply?s.tintWithMultiply:s.tintWithPerPixel},{"../../renderers/canvas/utils/canUseNewCanvasBlendModes":112,"../../utils":151}],136:[function(t,e,r){var i=function(t){this.vertices=new ArrayBuffer(t),this.float32View=new Float32Array(this.vertices),this.uint32View=new Uint32Array(this.vertices)};e.exports=i,i.prototype.destroy=function(){this.vertices=null,this.positions=null,this.uvs=null,this.colors=null}},{}],137:[function(t,e,r){function i(t){n.call(this,t),this.vertSize=5,this.vertByteSize=4*this.vertSize,this.size=l.SPRITE_BATCH_SIZE,this.buffers=[];for(var e=1;e<=d.nextPow2(this.size);e*=2){var r=4*e*this.vertByteSize;this.buffers.push(new u(r))}this.indices=o(this.size),this.shaders=null,this.currentIndex=0,p=0,this.groups=[];for(var i=0;i<this.size;i++)this.groups[i]={textures:[],textureCount:0,ids:[],size:0,start:0,blend:0};this.sprites=[],this.vertexBuffers=[],this.vaos=[],this.vaoMax=2,this.vertexCount=0,this.renderer.on("prerender",this.onPrerender,this)}var n=t("../../renderers/webgl/utils/ObjectRenderer"),s=t("../../renderers/webgl/WebGLRenderer"),o=t("../../utils/createIndicesForQuads"),a=t("./generateMultiTextureShader"),h=t("../../renderers/webgl/utils/checkMaxIfStatmentsInShader"),u=t("./BatchBuffer"),l=t("../../const"),c=t("pixi-gl-core"),d=t("bit-twiddle"),p=0;i.prototype=Object.create(n.prototype),i.prototype.constructor=i,e.exports=i,s.registerPlugin("sprite",i),i.prototype.onContextChange=function(){var t=this.renderer.gl;this.MAX_TEXTURES=Math.min(t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS),l.SPRITE_MAX_TEXTURES),this.MAX_TEXTURES=h(this.MAX_TEXTURES,t),this.shaders=new Array(this.MAX_TEXTURES),this.shaders[0]=a(t,1),this.shaders[1]=a(t,2),this.indexBuffer=c.GLBuffer.createIndexBuffer(t,this.indices,t.STATIC_DRAW);for(var e=this.shaders[1],r=0;r<this.vaoMax;r++)this.vertexBuffers[r]=c.GLBuffer.createVertexBuffer(t,null,t.STREAM_DRAW),this.vaos[r]=this.renderer.createVao().addIndex(this.indexBuffer).addAttribute(this.vertexBuffers[r],e.attributes.aVertexPosition,t.FLOAT,!1,this.vertByteSize,0).addAttribute(this.vertexBuffers[r],e.attributes.aTextureCoord,t.UNSIGNED_SHORT,!0,this.vertByteSize,8).addAttribute(this.vertexBuffers[r],e.attributes.aColor,t.UNSIGNED_BYTE,!0,this.vertByteSize,12).addAttribute(this.vertexBuffers[r],e.attributes.aTextureId,t.FLOAT,!1,this.vertByteSize,16);this.vao=this.vaos[0],this.currentBlendMode=99999},i.prototype.onPrerender=function(){this.vertexCount=0},i.prototype.render=function(t){this.currentIndex>=this.size&&this.flush(),t.texture._uvs&&(this.sprites[this.currentIndex++]=t)},i.prototype.flush=function(){if(0!==this.currentIndex){var t,e,r,i,n,s,o,h=this.renderer.gl,u=d.nextPow2(this.currentIndex),l=d.log2(u),f=this.buffers[l],v=this.sprites,g=this.groups,y=f.float32View,x=f.uint32View,m=0,_=1,b=0,T=g[0],E=v[0].blendMode;T.textureCount=0,T.start=0,T.blend=E,p++;for(var w=0;w<this.currentIndex;w++){var S=v[w];if(t=S._texture.baseTexture,E!==S.blendMode&&(E=S.blendMode,e=null,b=this.MAX_TEXTURES,p++),e!==t&&(e=t,t._enabled!==p&&(b===this.MAX_TEXTURES&&(p++,b=0,T.size=w-T.start,T=g[_++],T.textureCount=0,T.blend=E,T.start=w),t._enabled=p,t._id=b,T.textures[T.textureCount++]=t,b++)),r=S.vertexData,i=S._tintRGB+(255*S.worldAlpha<<24),n=S._texture._uvs.uvsUint32,s=t._id,this.renderer.roundPixels){var A=this.renderer.resolution;y[m]=(r[0]*A|0)/A,y[m+1]=(r[1]*A|0)/A,y[m+5]=(r[2]*A|0)/A,y[m+6]=(r[3]*A|0)/A,y[m+10]=(r[4]*A|0)/A,y[m+11]=(r[5]*A|0)/A,y[m+15]=(r[6]*A|0)/A,y[m+16]=(r[7]*A|0)/A}else y[m]=r[0],y[m+1]=r[1],y[m+5]=r[2],y[m+6]=r[3],y[m+10]=r[4],y[m+11]=r[5],y[m+15]=r[6],y[m+16]=r[7];x[m+2]=n[0],x[m+7]=n[1],x[m+12]=n[2],x[m+17]=n[3],x[m+3]=x[m+8]=x[m+13]=x[m+18]=i,y[m+4]=y[m+9]=y[m+14]=y[m+19]=s,m+=20}for(T.size=w-T.start,this.vertexCount++,this.vaoMax<=this.vertexCount&&(this.vaoMax++,o=this.shaders[1],this.vertexBuffers[this.vertexCount]=c.GLBuffer.createVertexBuffer(h,null,h.STREAM_DRAW),this.vaos[this.vertexCount]=this.renderer.createVao().addIndex(this.indexBuffer).addAttribute(this.vertexBuffers[this.vertexCount],o.attributes.aVertexPosition,h.FLOAT,!1,this.vertByteSize,0).addAttribute(this.vertexBuffers[this.vertexCount],o.attributes.aTextureCoord,h.UNSIGNED_SHORT,!0,this.vertByteSize,8).addAttribute(this.vertexBuffers[this.vertexCount],o.attributes.aColor,h.UNSIGNED_BYTE,!0,this.vertByteSize,12).addAttribute(this.vertexBuffers[this.vertexCount],o.attributes.aTextureId,h.FLOAT,!1,this.vertByteSize,16)),this.vertexBuffers[this.vertexCount].upload(f.vertices,0),this.vao=this.vaos[this.vertexCount].bind(),w=0;w<_;w++){var M=g[w],R=M.textureCount;o=this.shaders[R-1],o||(o=this.shaders[R-1]=a(h,R)),this.renderer.bindShader(o);for(var C=0;C<R;C++)this.renderer.bindTexture(M.textures[C],C);this.renderer.state.setBlendMode(M.blend),h.drawElements(h.TRIANGLES,6*M.size,h.UNSIGNED_SHORT,6*M.start*2)}this.currentIndex=0}},i.prototype.start=function(){},i.prototype.stop=function(){this.flush(),this.vao.unbind()},i.prototype.destroy=function(){for(var t=0;t<this.vaoMax;t++)this.vertexBuffers[t].destroy(),this.vaos[t].destroy();for(this.indexBuffer.destroy(),this.renderer.off("prerender",this.onPrerender,this),n.prototype.destroy.call(this),t=0;t<this.shaders.length;t++)this.shaders[t]&&this.shaders[t].destroy();for(this.vertexBuffers=null,this.vaos=null,this.indexBuffer=null,this.indices=null,this.sprites=null,t=0;t<this.buffers.length;t++)this.buffers[t].destroy()}},{"../../const":78,"../../renderers/webgl/WebGLRenderer":116,"../../renderers/webgl/utils/ObjectRenderer":126,"../../renderers/webgl/utils/checkMaxIfStatmentsInShader":129,"../../utils/createIndicesForQuads":149,"./BatchBuffer":136,"./generateMultiTextureShader":138,"bit-twiddle":30,"pixi-gl-core":7}],138:[function(t,e,r){function i(t,e){var r="#define GLSLIFY 1\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\nattribute float aTextureId;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying float vTextureId;\n\nvoid main(void){\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vTextureCoord = aTextureCoord;\n   vTextureId = aTextureId;\n   vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n",i=o;i=i.replace(/%count%/gi,e),i=i.replace(/%forloop%/gi,n(e));for(var a=new s(t,r,i),h=[],u=0;u<e;u++)h[u]=u;return a.bind(),a.uniforms.uSamplers=h,a}function n(t){var e="";e+="\n",e+="\n";for(var r=0;r<t;r++)r>0&&(e+="\nelse "),r<t-1&&(e+="if(textureId == "+r+".0)"),e+="\n{",e+="\n\tcolor = texture2D(uSamplers["+r+"], vTextureCoord);",e+="\n}";return e+="\n",e+="\n"}var s=t("../../Shader"),o=["varying vec2 vTextureCoord;","varying vec4 vColor;","varying float vTextureId;","uniform sampler2D uSamplers[%count%];","void main(void){","vec4 color;","float textureId = floor(vTextureId+0.5);","%forloop%","gl_FragColor = color * vColor;","}"].join("\n");e.exports=i},{"../../Shader":77}],139:[function(t,e,r){function i(t,e){this.canvas=document.createElement("canvas"),this.context=this.canvas.getContext("2d"),this.resolution=h.RESOLUTION,this._text=null,this._style=null,this._styleListener=null,this._font="";var r=s.fromCanvas(this.canvas);r.orig=new o.Rectangle,r.trim=new o.Rectangle,n.call(this,r),this.text=t,this.style=e,this.localStyleID=-1}var n=t("../sprites/Sprite"),s=t("../textures/Texture"),o=t("../math"),a=t("../utils"),h=t("../const"),u=t("./TextStyle"),l={texture:!0,children:!1,baseTexture:!0};i.prototype=Object.create(n.prototype),i.prototype.constructor=i,e.exports=i,i.fontPropertiesCache={},i.fontPropertiesCanvas=document.createElement("canvas"),i.fontPropertiesContext=i.fontPropertiesCanvas.getContext("2d"),Object.defineProperties(i.prototype,{width:{get:function(){return this.updateText(!0),Math.abs(this.scale.x)*this.texture.orig.width},set:function(t){this.updateText(!0);var e=a.sign(this.scale.x)||1;this.scale.x=e*t/this.texture.orig.width,this._width=t}},height:{get:function(){return this.updateText(!0),Math.abs(this.scale.y)*this._texture.orig.height},set:function(t){this.updateText(!0);var e=a.sign(this.scale.x)||1;this.scale.x=e*t/this.texture.orig.width,this._width=t}},style:{get:function(){return this._style},set:function(t){t=t||{},t instanceof u?this._style=t:this._style=new u(t),this.localStyleID=-1,this.dirty=!0}},text:{get:function(){return this._text},set:function(t){t=t||" ",t=t.toString(),this._text!==t&&(this._text=t,this.dirty=!0)}}}),i.prototype.updateText=function(t){var e=this._style;if(this.localStyleID!==e.styleID&&(this.dirty=!0,this.localStyleID=e.styleID),this.dirty||!t){var r="number"==typeof e.fontSize?e.fontSize+"px":e.fontSize;this._font=e.fontStyle+" "+e.fontVariant+" "+e.fontWeight+" "+r+" "+e.fontFamily,this.context.font=this._font;var i,n=e.wordWrap?this.wordWrap(this._text):this._text,s=n.split(/(?:\r\n|\r|\n)/),o=new Array(s.length),a=0,h=this.determineFontProperties(this._font);for(i=0;i<s.length;i++){var u=this.context.measureText(s[i]).width+(s[i].length-1)*e.letterSpacing;o[i]=u,a=Math.max(a,u)}var l=a+e.strokeThickness;e.dropShadow&&(l+=e.dropShadowDistance),l+=2*e.padding,this.canvas.width=Math.ceil((l+this.context.lineWidth)*this.resolution);var c=this.style.lineHeight||h.fontSize+e.strokeThickness,d=Math.max(c,h.fontSize+e.strokeThickness)+(s.length-1)*c;e.dropShadow&&(d+=e.dropShadowDistance),this.canvas.height=Math.ceil((d+2*this._style.padding)*this.resolution),this.context.scale(this.resolution,this.resolution),navigator.isCocoonJS&&this.context.clearRect(0,0,this.canvas.width,this.canvas.height),this.context.font=this._font,this.context.strokeStyle=e.stroke,this.context.lineWidth=e.strokeThickness,this.context.textBaseline=e.textBaseline,this.context.lineJoin=e.lineJoin,this.context.miterLimit=e.miterLimit;var p,f;if(e.dropShadow){e.dropShadowBlur>0?(this.context.shadowColor=e.dropShadowColor,this.context.shadowBlur=e.dropShadowBlur):this.context.fillStyle=e.dropShadowColor;var v=Math.cos(e.dropShadowAngle)*e.dropShadowDistance,g=Math.sin(e.dropShadowAngle)*e.dropShadowDistance;for(i=0;i<s.length;i++)p=e.strokeThickness/2,f=e.strokeThickness/2+i*c+h.ascent,"right"===e.align?p+=a-o[i]:"center"===e.align&&(p+=(a-o[i])/2),e.fill&&(this.drawLetterSpacing(s[i],p+v+e.padding,f+g+e.padding),e.stroke&&e.strokeThickness&&(this.context.strokeStyle=e.dropShadowColor,this.drawLetterSpacing(s[i],p+v+e.padding,f+g+e.padding,!0),this.context.strokeStyle=e.stroke))}for(this.context.fillStyle=this._generateFillStyle(e,s),i=0;i<s.length;i++)p=e.strokeThickness/2,f=e.strokeThickness/2+i*c+h.ascent,"right"===e.align?p+=a-o[i]:"center"===e.align&&(p+=(a-o[i])/2),e.stroke&&e.strokeThickness&&this.drawLetterSpacing(s[i],p+e.padding,f+e.padding,!0),e.fill&&this.drawLetterSpacing(s[i],p+e.padding,f+e.padding);this.updateTexture()}},i.prototype.drawLetterSpacing=function(t,e,r,i){var n=this._style,s=n.letterSpacing;if(0===s)return void(i?this.context.strokeText(t,e,r):this.context.fillText(t,e,r));for(var o,a=String.prototype.split.call(t,""),h=0,u=e;h<t.length;)o=a[h++],i?this.context.strokeText(o,u,r):this.context.fillText(o,u,r),u+=this.context.measureText(o).width+s},i.prototype.updateTexture=function(){var t=this._texture,e=this._style;t.baseTexture.hasLoaded=!0,t.baseTexture.resolution=this.resolution,t.baseTexture.realWidth=this.canvas.width,t.baseTexture.realHeight=this.canvas.height,t.baseTexture.width=this.canvas.width/this.resolution,t.baseTexture.height=this.canvas.height/this.resolution,t.trim.width=t._frame.width=this.canvas.width/this.resolution,t.trim.height=t._frame.height=this.canvas.height/this.resolution,t.trim.x=-e.padding,t.trim.y=-e.padding,t.orig.width=t._frame.width,t.orig.height=t._frame.height-2*e.padding,this._onTextureUpdate(),t.baseTexture.emit("update",t.baseTexture),this.dirty=!1},i.prototype.renderWebGL=function(t){this.resolution!==t.resolution&&(this.resolution=t.resolution,this.dirty=!0),this.updateText(!0),n.prototype.renderWebGL.call(this,t)},i.prototype._renderCanvas=function(t){this.resolution!==t.resolution&&(this.resolution=t.resolution,this.dirty=!0),this.updateText(!0),n.prototype._renderCanvas.call(this,t)},i.prototype.determineFontProperties=function(t){var e=i.fontPropertiesCache[t];if(!e){e={};var r=i.fontPropertiesCanvas,n=i.fontPropertiesContext;n.font=t;var s=Math.ceil(n.measureText("|MÉq").width),o=Math.ceil(n.measureText("M").width),a=2*o;o=1.4*o|0,r.width=s,r.height=a,n.fillStyle="#f00",n.fillRect(0,0,s,a),n.font=t,n.textBaseline="alphabetic",n.fillStyle="#000",n.fillText("|MÉq",0,o);var h,u,l=n.getImageData(0,0,s,a).data,c=l.length,d=4*s,p=0,f=!1;for(h=0;h<o;h++){for(u=0;u<d;u+=4)if(255!==l[p+u]){f=!0;break}if(f)break;p+=d}for(e.ascent=o-h,p=c-d,f=!1,h=a;h>o;h--){for(u=0;u<d;u+=4)if(255!==l[p+u]){f=!0;break}if(f)break;p-=d}e.descent=h-o,e.fontSize=e.ascent+e.descent,i.fontPropertiesCache[t]=e}return e},i.prototype.wordWrap=function(t){for(var e="",r=t.split("\n"),i=this._style.wordWrapWidth,n=0;n<r.length;n++){for(var s=i,o=r[n].split(" "),a=0;a<o.length;a++){var h=this.context.measureText(o[a]).width;if(this._style.breakWords&&h>i)for(var u=o[a].split(""),l=0;l<u.length;l++){var c=this.context.measureText(u[l]).width;c>s?(e+="\n"+u[l],s=i-c):(0===l&&(e+=" "),e+=u[l],s-=c)}else{var d=h+this.context.measureText(" ").width;0===a||d>s?(a>0&&(e+="\n"),e+=o[a],s=i-h):(s-=d,e+=" "+o[a])}}n<r.length-1&&(e+="\n")}return e},i.prototype._calculateBounds=function(){this.updateText(!0),this.calculateVertices(),this._bounds.addQuad(this.vertexData)},i.prototype._onStyleChange=function(){this.dirty=!0},i.prototype._generateFillStyle=function(t,e){if(Array.isArray(t.fill)){var r,i,n,s,o,a=this.canvas.width/this.resolution,u=this.canvas.height/this.resolution;if(t.fillGradientType===h.TEXT_GRADIENT.LINEAR_VERTICAL)for(i=this.context.createLinearGradient(a/2,0,a/2,u),
n=(t.fill.length+1)*e.length,s=0,r=0;r<e.length;r++){s+=1;for(var l=0;l<t.fill.length;l++)o=s/n,i.addColorStop(o,t.fill[l]),s++}else for(i=this.context.createLinearGradient(0,u/2,a,u/2),n=t.fill.length+1,s=1,r=0;r<t.fill.length;r++)o=s/n,i.addColorStop(o,t.fill[r]),s++;return i}return t.fill},i.prototype.destroy=function(t){"boolean"==typeof t&&(t={children:t}),t=Object.assign({},l,t),n.prototype.destroy.call(this,t),this.context=null,this.canvas=null,this._style=null}},{"../const":78,"../math":102,"../sprites/Sprite":133,"../textures/Texture":144,"../utils":151,"./TextStyle":140}],140:[function(t,e,r){function i(t){this.styleID=0,Object.assign(this,this._defaults,t)}function n(t){if("number"==typeof t)return o.hex2string(t);if(Array.isArray(t))for(var e=0;e<t.length;++e)"number"==typeof t[e]&&(t[e]=o.hex2string(t[e]));return t}var s=t("../const"),o=t("../utils");i.prototype.constructor=i,e.exports=i,i.prototype._defaults={align:"left",breakWords:!1,dropShadow:!1,dropShadowAngle:Math.PI/6,dropShadowBlur:0,dropShadowColor:"#000000",dropShadowDistance:5,fill:"black",fillGradientType:s.TEXT_GRADIENT.LINEAR_VERTICAL,fontFamily:"Arial",fontSize:26,fontStyle:"normal",fontVariant:"normal",fontWeight:"normal",letterSpacing:0,lineHeight:0,lineJoin:"miter",miterLimit:10,padding:0,stroke:"black",strokeThickness:0,textBaseline:"alphabetic",wordWrap:!1,wordWrapWidth:100},i.prototype.clone=function(){var t={};for(var e in this._defaults)t[e]=this[e];return new i(t)},i.prototype.reset=function(){Object.assign(this,this._defaults)},Object.defineProperties(i.prototype,{align:{get:function(){return this._align},set:function(t){this._align!==t&&(this._align=t,this.styleID++)}},breakWords:{get:function(){return this._breakWords},set:function(t){this._breakWords!==t&&(this._breakWords=t,this.styleID++)}},dropShadow:{get:function(){return this._dropShadow},set:function(t){this._dropShadow!==t&&(this._dropShadow=t,this.styleID++)}},dropShadowAngle:{get:function(){return this._dropShadowAngle},set:function(t){this._dropShadowAngle!==t&&(this._dropShadowAngle=t,this.styleID++)}},dropShadowBlur:{get:function(){return this._dropShadowBlur},set:function(t){this._dropShadowBlur!==t&&(this._dropShadowBlur=t,this.styleID++)}},dropShadowColor:{get:function(){return this._dropShadowColor},set:function(t){var e=n(t);this._dropShadowColor!==e&&(this._dropShadowColor=e,this.styleID++)}},dropShadowDistance:{get:function(){return this._dropShadowDistance},set:function(t){this._dropShadowDistance!==t&&(this._dropShadowDistance=t,this.styleID++)}},fill:{get:function(){return this._fill},set:function(t){var e=n(t);this._fill!==e&&(this._fill=e,this.styleID++)}},fillGradientType:{get:function(){return this._fillGradientType},set:function(t){this._fillGradientType!==t&&(this._fillGradientType=t,this.styleID++)}},fontFamily:{get:function(){return this._fontFamily},set:function(t){this.fontFamily!==t&&(this._fontFamily=t,this.styleID++)}},fontSize:{get:function(){return this._fontSize},set:function(t){this._fontSize!==t&&(this._fontSize=t,this.styleID++)}},fontStyle:{get:function(){return this._fontStyle},set:function(t){this._fontStyle!==t&&(this._fontStyle=t,this.styleID++)}},fontVariant:{get:function(){return this._fontVariant},set:function(t){this._fontVariant!==t&&(this._fontVariant=t,this.styleID++)}},fontWeight:{get:function(){return this._fontWeight},set:function(t){this._fontWeight!==t&&(this._fontWeight=t,this.styleID++)}},letterSpacing:{get:function(){return this._letterSpacing},set:function(t){this._letterSpacing!==t&&(this._letterSpacing=t,this.styleID++)}},lineHeight:{get:function(){return this._lineHeight},set:function(t){this._lineHeight!==t&&(this._lineHeight=t,this.styleID++)}},lineJoin:{get:function(){return this._lineJoin},set:function(t){this._lineJoin!==t&&(this._lineJoin=t,this.styleID++)}},miterLimit:{get:function(){return this._miterLimit},set:function(t){this._miterLimit!==t&&(this._miterLimit=t,this.styleID++)}},padding:{get:function(){return this._padding},set:function(t){this._padding!==t&&(this._padding=t,this.styleID++)}},stroke:{get:function(){return this._stroke},set:function(t){var e=n(t);this._stroke!==e&&(this._stroke=e,this.styleID++)}},strokeThickness:{get:function(){return this._strokeThickness},set:function(t){this._strokeThickness!==t&&(this._strokeThickness=t,this.styleID++)}},textBaseline:{get:function(){return this._textBaseline},set:function(t){this._textBaseline!==t&&(this._textBaseline=t,this.styleID++)}},wordWrap:{get:function(){return this._wordWrap},set:function(t){this._wordWrap!==t&&(this._wordWrap=t,this.styleID++)}},wordWrapWidth:{get:function(){return this._wordWrapWidth},set:function(t){this._wordWrapWidth!==t&&(this._wordWrapWidth=t,this.styleID++)}}})},{"../const":78,"../utils":151}],141:[function(t,e,r){function i(t,e,r,i){n.call(this,null,r),this.resolution=i||s.RESOLUTION,this.width=t||100,this.height=e||100,this.realWidth=this.width*this.resolution,this.realHeight=this.height*this.resolution,this.scaleMode=r||s.SCALE_MODES.DEFAULT,this.hasLoaded=!0,this._glRenderTargets=[],this._canvasRenderTarget=null,this.valid=!1}var n=t("./BaseTexture"),s=t("../const");i.prototype=Object.create(n.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.resize=function(t,e){t===this.width&&e===this.height||(this.valid=t>0&&e>0,this.width=t,this.height=e,this.realWidth=this.width*this.resolution,this.realHeight=this.height*this.resolution,this.valid&&this.emit("update",this))},i.prototype.destroy=function(){n.prototype.destroy.call(this,!0),this.renderer=null}},{"../const":78,"./BaseTexture":142}],142:[function(t,e,r){function i(t,e,r){o.call(this),this.uid=n.uid(),this.touched=0,this.resolution=r||s.RESOLUTION,this.width=100,this.height=100,this.realWidth=100,this.realHeight=100,this.scaleMode=e||s.SCALE_MODES.DEFAULT,this.hasLoaded=!1,this.isLoading=!1,this.source=null,this.premultipliedAlpha=!0,this.imageUrl=null,this.isPowerOfTwo=!1,this.mipmap=s.MIPMAP_TEXTURES,this.wrapMode=s.WRAP_MODES.DEFAULT,this._glTextures=[],this._enabled=0,this._id=0,t&&this.loadSource(t)}var n=t("../utils"),s=t("../const"),o=t("eventemitter3"),a=t("../utils/determineCrossOrigin"),h=t("bit-twiddle");i.prototype=Object.create(o.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.update=function(){this.realWidth=this.source.naturalWidth||this.source.videoWidth||this.source.width,this.realHeight=this.source.naturalHeight||this.source.videoHeight||this.source.height,this.width=this.realWidth/this.resolution,this.height=this.realHeight/this.resolution,this.isPowerOfTwo=h.isPow2(this.realWidth)&&h.isPow2(this.realHeight),this.emit("update",this)},i.prototype.loadSource=function(t){var e=this.isLoading;if(this.hasLoaded=!1,this.isLoading=!1,e&&this.source&&(this.source.onload=null,this.source.onerror=null),this.source=t,(this.source.complete||this.source.getContext)&&this.source.width&&this.source.height)this._sourceLoaded();else if(!t.getContext){this.isLoading=!0;var r=this;t.onload=function(){t.onload=null,t.onerror=null,r.isLoading&&(r.isLoading=!1,r._sourceLoaded(),r.emit("loaded",r))},t.onerror=function(){t.onload=null,t.onerror=null,r.isLoading&&(r.isLoading=!1,r.emit("error",r))},t.complete&&t.src&&(this.isLoading=!1,t.onload=null,t.onerror=null,t.width&&t.height?(this._sourceLoaded(),e&&this.emit("loaded",this)):e&&this.emit("error",this))}},i.prototype._sourceLoaded=function(){this.hasLoaded=!0,this.update()},i.prototype.destroy=function(){this.imageUrl?(delete n.BaseTextureCache[this.imageUrl],delete n.TextureCache[this.imageUrl],this.imageUrl=null,navigator.isCocoonJS||(this.source.src="")):this.source&&this.source._pixiId&&delete n.BaseTextureCache[this.source._pixiId],this.source=null,this.dispose()},i.prototype.dispose=function(){this.emit("dispose",this)},i.prototype.updateSourceImage=function(t){this.source.src=t,this.loadSource(this.source)},i.fromImage=function(t,e,r){var s=n.BaseTextureCache[t];if(!s){var o=new Image;void 0===e&&0!==t.indexOf("data:")&&(o.crossOrigin=a(t)),s=new i(o,r),s.imageUrl=t,o.src=t,n.BaseTextureCache[t]=s,s.resolution=n.getResolutionOfUrl(t)}return s},i.fromCanvas=function(t,e){t._pixiId||(t._pixiId="canvas_"+n.uid());var r=n.BaseTextureCache[t._pixiId];return r||(r=new i(t,e),n.BaseTextureCache[t._pixiId]=r),r}},{"../const":78,"../utils":151,"../utils/determineCrossOrigin":150,"bit-twiddle":30,eventemitter3:32}],143:[function(t,e,r){function i(t,e){if(this.legacyRenderer=null,!(t instanceof n)){var r=arguments[1],i=arguments[2],o=arguments[3]||0,a=arguments[4]||1;console.warn("v4 RenderTexture now expects a new BaseRenderTexture. Please use RenderTexture.create("+r+", "+i+")"),this.legacyRenderer=arguments[0],e=null,t=new n(r,i,o,a)}s.call(this,t,e),this.valid=!0,this._updateUvs()}var n=t("./BaseRenderTexture"),s=t("./Texture");i.prototype=Object.create(s.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.resize=function(t,e,r){this.valid=t>0&&e>0,this._frame.width=this.orig.width=t,this._frame.height=this.orig.height=e,r||this.baseTexture.resize(t,e),this._updateUvs()},i.create=function(t,e,r,s){return new i(new n(t,e,r,s))}},{"./BaseRenderTexture":141,"./Texture":144}],144:[function(t,e,r){function i(t,e,r,n,s){if(a.call(this),this.noFrame=!1,e||(this.noFrame=!0,e=new h.Rectangle(0,0,1,1)),t instanceof i&&(t=t.baseTexture),this.baseTexture=t,this._frame=e,this.trim=n,this.valid=!1,this.requiresUpdate=!1,this._uvs=null,this.orig=r||e,this._rotate=+(s||0),s===!0)this._rotate=2;else if(this._rotate%2!==0)throw"attempt to use diamond-shaped UVs. If you are sure, set rotation manually";t.hasLoaded?(this.noFrame&&(e=new h.Rectangle(0,0,t.width,t.height),t.on("update",this.onBaseTextureUpdated,this)),this.frame=e):t.once("loaded",this.onBaseTextureLoaded,this),this._updateID=0}var n=t("./BaseTexture"),s=t("./VideoBaseTexture"),o=t("./TextureUvs"),a=t("eventemitter3"),h=t("../math"),u=t("../utils");i.prototype=Object.create(a.prototype),i.prototype.constructor=i,e.exports=i,Object.defineProperties(i.prototype,{frame:{get:function(){return this._frame},set:function(t){if(this._frame=t,this.noFrame=!1,t.x+t.width>this.baseTexture.width||t.y+t.height>this.baseTexture.height)throw new Error("Texture Error: frame does not fit inside the base Texture dimensions "+this);this.valid=t&&t.width&&t.height&&this.baseTexture.hasLoaded,this.trim||this.rotate||(this.orig=t),this.valid&&this._updateUvs()}},rotate:{get:function(){return this._rotate},set:function(t){this._rotate=t,this.valid&&this._updateUvs()}},width:{get:function(){return this.orig?this.orig.width:0}},height:{get:function(){return this.orig?this.orig.height:0}}}),i.prototype.update=function(){this.baseTexture.update()},i.prototype.onBaseTextureLoaded=function(t){this._updateID++,this.noFrame?this.frame=new h.Rectangle(0,0,t.width,t.height):this.frame=this._frame,this.baseTexture.on("update",this.onBaseTextureUpdated,this),this.emit("update",this)},i.prototype.onBaseTextureUpdated=function(t){this._updateID++,this._frame.width=t.width,this._frame.height=t.height,this.emit("update",this)},i.prototype.destroy=function(t){this.baseTexture&&(t&&(u.TextureCache[this.baseTexture.imageUrl]&&delete u.TextureCache[this.baseTexture.imageUrl],this.baseTexture.destroy()),this.baseTexture.off("update",this.onBaseTextureUpdated,this),this.baseTexture.off("loaded",this.onBaseTextureLoaded,this),this.baseTexture=null),this._frame=null,this._uvs=null,this.trim=null,this.orig=null,this.valid=!1,this.off("dispose",this.dispose,this),this.off("update",this.update,this)},i.prototype.clone=function(){return new i(this.baseTexture,this.frame,this.orig,this.trim,this.rotate)},i.prototype._updateUvs=function(){this._uvs||(this._uvs=new o),this._uvs.set(this._frame,this.baseTexture,this.rotate),this._updateID++},i.fromImage=function(t,e,r){var s=u.TextureCache[t];return s||(s=new i(n.fromImage(t,e,r)),u.TextureCache[t]=s),s},i.fromFrame=function(t){var e=u.TextureCache[t];if(!e)throw new Error('The frameId "'+t+'" does not exist in the texture cache');return e},i.fromCanvas=function(t,e){return new i(n.fromCanvas(t,e))},i.fromVideo=function(t,e){return"string"==typeof t?i.fromVideoUrl(t,e):new i(s.fromVideo(t,e))},i.fromVideoUrl=function(t,e){return new i(s.fromUrl(t,e))},i.from=function(t){if("string"==typeof t){var e=u.TextureCache[t];if(!e){var r=null!==t.match(/\.(mp4|webm|ogg|h264|avi|mov)$/);return r?i.fromVideoUrl(t):i.fromImage(t)}return e}return t instanceof HTMLCanvasElement?i.fromCanvas(t):t instanceof HTMLVideoElement?i.fromVideo(t):t instanceof n?new i(n):void 0},i.addTextureToCache=function(t,e){u.TextureCache[e]=t},i.removeTextureFromCache=function(t){var e=u.TextureCache[t];return delete u.TextureCache[t],delete u.BaseTextureCache[t],e},i.EMPTY=new i(new n),i.EMPTY.destroy=function(){},i.EMPTY.on=function(){},i.EMPTY.once=function(){},i.EMPTY.emit=function(){}},{"../math":102,"../utils":151,"./BaseTexture":142,"./TextureUvs":145,"./VideoBaseTexture":146,eventemitter3:32}],145:[function(t,e,r){function i(){this.x0=0,this.y0=0,this.x1=1,this.y1=0,this.x2=1,this.y2=1,this.x3=0,this.y3=1,this.uvsUint32=new Uint32Array(4)}e.exports=i;var n=t("../math/GroupD8");i.prototype.set=function(t,e,r){var i=e.width,s=e.height;if(r){var o=t.width/2/i,a=t.height/2/s,h=t.x/i+o,u=t.y/s+a;r=n.add(r,n.NW),this.x0=h+o*n.uX(r),this.y0=u+a*n.uY(r),r=n.add(r,2),this.x1=h+o*n.uX(r),this.y1=u+a*n.uY(r),r=n.add(r,2),this.x2=h+o*n.uX(r),this.y2=u+a*n.uY(r),r=n.add(r,2),this.x3=h+o*n.uX(r),this.y3=u+a*n.uY(r)}else this.x0=t.x/i,this.y0=t.y/s,this.x1=(t.x+t.width)/i,this.y1=t.y/s,this.x2=(t.x+t.width)/i,this.y2=(t.y+t.height)/s,this.x3=t.x/i,this.y3=(t.y+t.height)/s;this.uvsUint32[0]=(65535*this.y0&65535)<<16|65535*this.x0&65535,this.uvsUint32[1]=(65535*this.y1&65535)<<16|65535*this.x1&65535,this.uvsUint32[2]=(65535*this.y2&65535)<<16|65535*this.x2&65535,this.uvsUint32[3]=(65535*this.y3&65535)<<16|65535*this.x3&65535}},{"../math/GroupD8":98}],146:[function(t,e,r){function i(t,e){if(!t)throw new Error("No video source element specified.");(t.readyState===t.HAVE_ENOUGH_DATA||t.readyState===t.HAVE_FUTURE_DATA)&&t.width&&t.height&&(t.complete=!0),s.call(this,t,e),this.autoUpdate=!1,this._onUpdate=this._onUpdate.bind(this),this._onCanPlay=this._onCanPlay.bind(this),t.complete||(t.addEventListener("canplay",this._onCanPlay),t.addEventListener("canplaythrough",this._onCanPlay),t.addEventListener("play",this._onPlayStart.bind(this)),t.addEventListener("pause",this._onPlayStop.bind(this))),this.__loaded=!1}function n(t,e){e||(e="video/"+t.substr(t.lastIndexOf(".")+1));var r=document.createElement("source");return r.src=t,r.type=e,r}var s=t("./BaseTexture"),o=t("../utils");i.prototype=Object.create(s.prototype),i.prototype.constructor=i,e.exports=i,i.prototype._onUpdate=function(){this.autoUpdate&&(window.requestAnimationFrame(this._onUpdate),this.update())},i.prototype._onPlayStart=function(){this.autoUpdate||(window.requestAnimationFrame(this._onUpdate),this.autoUpdate=!0)},i.prototype._onPlayStop=function(){this.autoUpdate=!1},i.prototype._onCanPlay=function(){this.hasLoaded=!0,this.source&&(this.source.removeEventListener("canplay",this._onCanPlay),this.source.removeEventListener("canplaythrough",this._onCanPlay),this.width=this.source.videoWidth,this.height=this.source.videoHeight,this.source.play(),this.__loaded||(this.__loaded=!0,this.emit("loaded",this)))},i.prototype.destroy=function(){this.source&&this.source._pixiId&&(delete o.BaseTextureCache[this.source._pixiId],delete this.source._pixiId),s.prototype.destroy.call(this)},i.fromVideo=function(t,e){t._pixiId||(t._pixiId="video_"+o.uid());var r=o.BaseTextureCache[t._pixiId];return r||(r=new i(t,e),o.BaseTextureCache[t._pixiId]=r),r},i.fromUrl=function(t,e){var r=document.createElement("video");if(Array.isArray(t))for(var s=0;s<t.length;++s)r.appendChild(n(t[s].src||t[s],t[s].mime));else r.appendChild(n(t.src||t,t.mime));return r.load(),r.play(),i.fromVideo(r,e)},i.fromUrls=i.fromUrl},{"../utils":151,"./BaseTexture":142}],147:[function(t,e,r){function i(){var t=this;this._tick=function(e){t._requestId=null,t.started&&(t.update(e),t.started&&null===t._requestId&&t._emitter.listeners(o,!0)&&(t._requestId=requestAnimationFrame(t._tick)))},this._emitter=new s,this._requestId=null,this._maxElapsedMS=100,this.autoStart=!1,this.deltaTime=1,this.elapsedMS=1/n.TARGET_FPMS,this.lastTime=0,this.speed=1,this.started=!1}var n=t("../const"),s=t("eventemitter3"),o="tick";Object.defineProperties(i.prototype,{FPS:{get:function(){return 1e3/this.elapsedMS}},minFPS:{get:function(){return 1e3/this._maxElapsedMS},set:function(t){var e=Math.min(Math.max(0,t)/1e3,n.TARGET_FPMS);this._maxElapsedMS=1/e}}}),i.prototype._requestIfNeeded=function(){null===this._requestId&&this._emitter.listeners(o,!0)&&(this.lastTime=performance.now(),this._requestId=requestAnimationFrame(this._tick))},i.prototype._cancelIfNeeded=function(){null!==this._requestId&&(cancelAnimationFrame(this._requestId),this._requestId=null)},i.prototype._startIfPossible=function(){this.started?this._requestIfNeeded():this.autoStart&&this.start()},i.prototype.add=function(t,e){return this._emitter.on(o,t,e),this._startIfPossible(),this},i.prototype.addOnce=function(t,e){return this._emitter.once(o,t,e),this._startIfPossible(),this},i.prototype.remove=function(t,e){return this._emitter.off(o,t,e),this._emitter.listeners(o,!0)||this._cancelIfNeeded(),this},i.prototype.start=function(){this.started||(this.started=!0,this._requestIfNeeded())},i.prototype.stop=function(){this.started&&(this.started=!1,this._cancelIfNeeded())},i.prototype.update=function(t){var e;t=t||performance.now(),t>this.lastTime?(e=this.elapsedMS=t-this.lastTime,e>this._maxElapsedMS&&(e=this._maxElapsedMS),this.deltaTime=e*n.TARGET_FPMS*this.speed,this._emitter.emit(o,this.deltaTime)):this.deltaTime=this.elapsedMS=0,this.lastTime=t},e.exports=i},{"../const":78,eventemitter3:32}],148:[function(t,e,r){var i=t("./Ticker"),n=new i;n.autoStart=!0,e.exports={shared:n,Ticker:i}},{"./Ticker":147}],149:[function(t,e,r){var i=function(t){for(var e=6*t,r=new Uint16Array(e),i=0,n=0;i<e;i+=6,n+=4)r[i+0]=n+0,r[i+1]=n+1,r[i+2]=n+2,r[i+3]=n+0,r[i+4]=n+2,r[i+5]=n+3;return r};e.exports=i},{}],150:[function(t,e,r){var i,n=t("url"),s=function(t,e){if(0===t.indexOf("data:"))return"";e=e||window.location,i||(i=document.createElement("a")),i.href=t,t=n.parse(i.href);var r=!t.port&&""===e.port||t.port===e.port;return t.hostname===e.hostname&&r&&t.protocol===e.protocol?"":"anonymous"};e.exports=s},{url:72}],151:[function(t,e,r){var i=t("../const"),n=e.exports={_uid:0,_saidHello:!1,EventEmitter:t("eventemitter3"),pluginTarget:t("./pluginTarget"),uid:function(){return++n._uid},hex2rgb:function(t,e){return e=e||[],e[0]=(t>>16&255)/255,e[1]=(t>>8&255)/255,e[2]=(255&t)/255,e},hex2string:function(t){return t=t.toString(16),t="000000".substr(0,6-t.length)+t,"#"+t},rgb2hex:function(t){return(255*t[0]<<16)+(255*t[1]<<8)+255*t[2]},getResolutionOfUrl:function(t){var e=i.RETINA_PREFIX.exec(t);return e?parseFloat(e[1]):1},sayHello:function(t){if(!n._saidHello){if(navigator.userAgent.toLowerCase().indexOf("chrome")>-1){var e=["\n %c %c %c Pixi.js "+i.VERSION+" - ✰ "+t+" ✰  %c  %c  http://www.pixijs.com/  %c %c ♥%c♥%c♥ \n\n","background: #ff66a5; padding:5px 0;","background: #ff66a5; padding:5px 0;","color: #ff66a5; background: #030307; padding:5px 0;","background: #ff66a5; padding:5px 0;","background: #ffc3dc; padding:5px 0;","background: #ff66a5; padding:5px 0;","color: #ff2424; background: #fff; padding:5px 0;","color: #ff2424; background: #fff; padding:5px 0;","color: #ff2424; background: #fff; padding:5px 0;"];window.console.log.apply(console,e)}else window.console&&window.console.log("Pixi.js "+i.VERSION+" - "+t+" - http://www.pixijs.com/");n._saidHello=!0}},isWebGLSupported:function(){var t={stencil:!0,failIfMajorPerformanceCaveat:!0};try{if(!window.WebGLRenderingContext)return!1;var e=document.createElement("canvas"),r=e.getContext("webgl",t)||e.getContext("experimental-webgl",t),i=!(!r||!r.getContextAttributes().stencil);if(r){var n=r.getExtension("WEBGL_lose_context");n&&n.loseContext()}return r=null,i}catch(t){return!1}},sign:function(t){return t?t<0?-1:1:0},removeItems:function(t,e,r){var i=t.length;if(!(e>=i||0===r)){r=e+r>i?i-e:r;for(var n=e,s=i-r;n<s;++n)t[n]=t[n+r];t.length=s}},TextureCache:{},BaseTextureCache:{}}},{"../const":78,"./pluginTarget":153,eventemitter3:32}],152:[function(t,e,r){var i=t("ismobilejs"),n=function(t){return i.tablet||i.phone?2:t};e.exports=n},{ismobilejs:33}],153:[function(t,e,r){function i(t){t.__plugins={},t.registerPlugin=function(e,r){t.__plugins[e]=r},t.prototype.initPlugins=function(){this.plugins=this.plugins||{};for(var e in t.__plugins)this.plugins[e]=new t.__plugins[e](this)},t.prototype.destroyPlugins=function(){for(var t in this.plugins)this.plugins[t].destroy(),this.plugins[t]=null;this.plugins=null}}e.exports={mixin:function(t){i(t)}}},{}],154:[function(t,e,r){},{"./core":97,"./extras":164,"./filters":175,"./mesh":191,"./particles":194}],155:[function(t,e,r){function i(t){this.renderer=t,t.extract=this}var n=t("../../core"),s=new n.Rectangle;i.prototype.constructor=i,e.exports=i,i.prototype.image=function(t){var e=new Image;return e.src=this.base64(t),e},i.prototype.base64=function(t){return this.canvas(t).toDataURL()},i.prototype.canvas=function(t){var e,r,i,o,a=this.renderer;t&&(o=t instanceof n.RenderTexture?t:a.generateTexture(t)),o?(e=o.baseTexture._canvasRenderTarget.context,r=o.baseTexture._canvasRenderTarget.resolution,i=o.frame):(e=a.rootContext,r=a.rootResolution,i=s,i.width=this.renderer.width,i.height=this.renderer.height);var h=i.width*r,u=i.height*r,l=new n.CanvasRenderTarget(h,u),c=e.getImageData(i.x*r,i.y*r,h,u);return l.context.putImageData(c,0,0),l.canvas},i.prototype.pixels=function(t){var e,r,i,o,a=this.renderer;return t&&(o=t instanceof n.RenderTexture?t:a.generateTexture(t)),o?(e=o.baseTexture._canvasRenderTarget.context,r=o.baseTexture._canvasRenderTarget.resolution,i=o.frame):(e=a.rootContext,r=a.rootResolution,i=s,i.width=a.width,i.height=a.height),e.getImageData(0,0,i.width*r,i.height*r).data},i.prototype.destroy=function(){this.renderer.extract=null,this.renderer=null},n.CanvasRenderer.registerPlugin("extract",i)},{"../../core":97}],156:[function(t,e,r){e.exports={webGL:t("./webgl/WebGLExtract"),canvas:t("./canvas/CanvasExtract")}},{"./canvas/CanvasExtract":155,"./webgl/WebGLExtract":157}],157:[function(t,e,r){function i(t){this.renderer=t,t.extract=this}var n=t("../../core"),s=new n.Rectangle;i.prototype.constructor=i,e.exports=i,i.prototype.image=function(t){var e=new Image;return e.src=this.base64(t),e},i.prototype.base64=function(t){return this.canvas(t).toDataURL()},i.prototype.canvas=function(t){var e,r,i,o,a=this.renderer,h=!1;t&&(o=t instanceof n.RenderTexture?t:this.renderer.generateTexture(t)),o?(e=o.baseTexture._glRenderTargets[this.renderer.CONTEXT_UID],r=e.resolution,i=o.frame,h=!1):(e=this.renderer.rootRenderTarget,r=e.resolution,h=!0,i=s,i.width=e.size.width,i.height=e.size.height);var u=i.width*r,l=i.height*r,c=new n.CanvasRenderTarget(u,l);if(e){a.bindRenderTarget(e);var d=new Uint8Array(4*u*l),p=a.gl;p.readPixels(i.x*r,i.y*r,u,l,p.RGBA,p.UNSIGNED_BYTE,d);var f=c.context.getImageData(0,0,u,l);f.data.set(d),c.context.putImageData(f,0,0),h&&(c.context.scale(1,-1),c.context.drawImage(c.canvas,0,-l))}return c.canvas},i.prototype.pixels=function(t){var e,r,i,o,a=this.renderer;t&&(o=t instanceof n.RenderTexture?t:this.renderer.generateTexture(t)),o?(e=o.baseTexture._glRenderTargets[this.renderer.CONTEXT_UID],r=e.resolution,i=o.frame):(e=this.renderer.rootRenderTarget,r=e.resolution,i=s,i.width=e.size.width,i.height=e.size.height);var h=i.width*r,u=i.height*r,l=new Uint8Array(4*h*u);if(e){a.bindRenderTarget(e);var c=a.gl;c.readPixels(i.x*r,i.y*r,h,u,c.RGBA,c.UNSIGNED_BYTE,l)}return l},i.prototype.destroy=function(){this.renderer.extract=null,this.renderer=null},n.WebGLRenderer.registerPlugin("extract",i)},{"../../core":97}],158:[function(t,e,r){function i(t,e){n.Container.call(this),e=e||{},this.textWidth=0,this.textHeight=0,this._glyphs=[],this._font={tint:void 0!==e.tint?e.tint:16777215,align:e.align||"left",name:null,size:0},this.font=e.font,this._text=t,this.maxWidth=0,this.maxLineHeight=0,this._anchor=new s(this.makeDirty,this,0,0),this.dirty=!1,this.updateText()}var n=t("../core"),s=t("../core/math/ObservablePoint");i.prototype=Object.create(n.Container.prototype),i.prototype.constructor=i,e.exports=i,Object.defineProperties(i.prototype,{tint:{get:function(){return this._font.tint},set:function(t){this._font.tint="number"==typeof t&&t>=0?t:16777215,this.dirty=!0}},align:{get:function(){return this._font.align},set:function(t){this._font.align=t||"left",this.dirty=!0}},anchor:{get:function(){return this._anchor},set:function(t){"number"==typeof t?this._anchor.set(t):this._anchor.copy(t)}},font:{get:function(){return this._font},set:function(t){t&&("string"==typeof t?(t=t.split(" "),this._font.name=1===t.length?t[0]:t.slice(1).join(" "),this._font.size=t.length>=2?parseInt(t[0],10):i.fonts[this._font.name].size):(this._font.name=t.name,this._font.size="number"==typeof t.size?t.size:parseInt(t.size,10)),this.dirty=!0)}},text:{get:function(){return this._text},set:function(t){t=t.toString()||" ",this._text!==t&&(this._text=t,this.dirty=!0)}}}),i.prototype.updateText=function(){for(var t=i.fonts[this._font.name],e=new n.Point,r=null,s=[],o=0,a=0,h=[],u=0,l=this._font.size/t.size,c=-1,d=0,p=0,f=0;f<this.text.length;f++){var v=this.text.charCodeAt(f);if(/(\s)/.test(this.text.charAt(f))&&(c=f,d=o),/(?:\r\n|\r|\n)/.test(this.text.charAt(f)))h.push(o),a=Math.max(a,o),u++,e.x=0,e.y+=t.lineHeight,r=null;else if(c!==-1&&this.maxWidth>0&&e.x*l>this.maxWidth)n.utils.removeItems(s,c,f-c),f=c,c=-1,h.push(d),a=Math.max(a,d),u++,e.x=0,e.y+=t.lineHeight,r=null;else{var g=t.chars[v];g&&(r&&g.kerning[r]&&(e.x+=g.kerning[r]),s.push({texture:g.texture,line:u,charCode:v,position:new n.Point(e.x+g.xOffset,e.y+g.yOffset)}),o=e.x+(g.texture.width+g.xOffset),e.x+=g.xAdvance,p=Math.max(p,g.yOffset+g.texture.height),r=v)}}h.push(o),a=Math.max(a,o);var y=[];for(f=0;f<=u;f++){var x=0;"right"===this._font.align?x=a-h[f]:"center"===this._font.align&&(x=(a-h[f])/2),y.push(x)}var m=s.length,_=this.tint;for(f=0;f<m;f++){var b=this._glyphs[f];b?b.texture=s[f].texture:(b=new n.Sprite(s[f].texture),this._glyphs.push(b)),b.position.x=(s[f].position.x+y[s[f].line])*l,b.position.y=s[f].position.y*l,b.scale.x=b.scale.y=l,b.tint=_,b.parent||this.addChild(b)}for(f=m;f<this._glyphs.length;++f)this.removeChild(this._glyphs[f]);if(this.textWidth=a*l,this.textHeight=(e.y+t.lineHeight)*l,0!==this.anchor.x||0!==this.anchor.y)for(f=0;f<m;f++)this._glyphs[f].x-=this.textWidth*this.anchor.x,this._glyphs[f].y-=this.textHeight*this.anchor.y;this.maxLineHeight=p*l},i.prototype.updateTransform=function(){this.validate(),this.containerUpdateTransform()},i.prototype.getLocalBounds=function(){return this.validate(),n.Container.prototype.getLocalBounds.call(this)},i.prototype.validate=function(){this.dirty&&(this.updateText(),this.dirty=!1)},i.prototype.makeDirty=function(){this.dirty=!0},i.fonts={}},{"../core":97,"../core/math/ObservablePoint":100}],159:[function(t,e,r){function i(t){n.Sprite.call(this,t[0]instanceof n.Texture?t[0]:t[0].texture),this._textures=null,this._durations=null,this.textures=t,this.animationSpeed=1,this.loop=!0,this.onComplete=null,this._currentTime=0,this.playing=!1}var n=t("../core");i.prototype=Object.create(n.Sprite.prototype),i.prototype.constructor=i,e.exports=i,Object.defineProperties(i.prototype,{totalFrames:{get:function(){return this._textures.length}},textures:{get:function(){return this._textures},set:function(t){if(t[0]instanceof n.Texture)this._textures=t,this._durations=null;else{this._textures=[],this._durations=[];for(var e=0;e<t.length;e++)this._textures.push(t[e].texture),this._durations.push(t[e].time)}}},currentFrame:{get:function(){var t=Math.floor(this._currentTime)%this._textures.length;return t<0&&(t+=this._textures.length),t}}}),i.prototype.stop=function(){this.playing&&(this.playing=!1,n.ticker.shared.remove(this.update,this))},i.prototype.play=function(){this.playing||(this.playing=!0,n.ticker.shared.add(this.update,this))},i.prototype.gotoAndStop=function(t){this.stop(),this._currentTime=t,this._texture=this._textures[this.currentFrame],this._textureID=-1},i.prototype.gotoAndPlay=function(t){this._currentTime=t,this.play()},i.prototype.update=function(t){var e=this.animationSpeed*t;if(null!==this._durations){var r=this._currentTime%1*this._durations[this.currentFrame];for(r+=e/60*1e3;r<0;)this._currentTime--,r+=this._durations[this.currentFrame];var i=Math.sign(this.animationSpeed*t);for(this._currentTime=Math.floor(this._currentTime);r>=this._durations[this.currentFrame];)r-=this._durations[this.currentFrame]*i,this._currentTime+=i;this._currentTime+=r/this._durations[this.currentFrame]}else this._currentTime+=e;this._currentTime<0&&!this.loop?(this.gotoAndStop(0),this.onComplete&&this.onComplete()):this._currentTime>=this._textures.length&&!this.loop?(this.gotoAndStop(this._textures.length-1),this.onComplete&&this.onComplete()):(this._texture=this._textures[this.currentFrame],this._textureID=-1)},i.prototype.destroy=function(){this.stop(),n.Sprite.prototype.destroy.call(this)},i.fromFrames=function(t){for(var e=[],r=0;r<t.length;++r)e.push(n.Texture.fromFrame(t[r]));return new i(e)},i.fromImages=function(t){for(var e=[],r=0;r<t.length;++r)e.push(n.Texture.fromImage(t[r]));return new i(e)}},{"../core":97}],160:[function(t,e,r){function i(t,e,r){n.Sprite.call(this,t),this.tileScale=new n.Point(1,1),this.tilePosition=new n.Point(0,0),this._width=e||100,this._height=r||100,this._uvs=new n.TextureUvs,this._canvasPattern=null,this._glDatas=[]}var n=t("../core"),s=new n.Point,o=t("../core/textures/Texture"),a=t("../core/sprites/canvas/CanvasTinter"),h=t("./webgl/TilingShader"),u=new Float32Array(4);i.prototype=Object.create(n.Sprite.prototype),i.prototype.constructor=i,e.exports=i,Object.defineProperties(i.prototype,{width:{get:function(){return this._width},set:function(t){this._width=t}},height:{get:function(){return this._height},set:function(t){this._height=t}}}),i.prototype._onTextureUpdate=function(){},i.prototype._renderWebGL=function(t){var e=this._texture;if(e&&e._uvs){t.flush();var r=t.gl,i=this._glDatas[t.CONTEXT_UID];i||(i={shader:new h(r),quad:new n.Quad(r)},this._glDatas[t.CONTEXT_UID]=i,i.quad.initVao(i.shader));var s=i.quad.vertices;s[0]=s[6]=this._width*-this.anchor.x,s[1]=s[3]=this._height*-this.anchor.y,s[2]=s[4]=this._width*(1-this.anchor.x),s[5]=s[7]=this._height*(1-this.anchor.y),i.quad.upload(),t.bindShader(i.shader);var o=e._uvs,a=e._frame.width,l=e._frame.height,c=e.baseTexture.width,d=e.baseTexture.height,p=i.shader.uniforms.uPixelSize;p[0]=1/c,p[1]=1/d,i.shader.uniforms.uPixelSize=p;var f=i.shader.uniforms.uFrame;f[0]=o.x0,f[1]=o.y0,f[2]=o.x1-o.x0,f[3]=o.y2-o.y0,i.shader.uniforms.uFrame=f;var v=i.shader.uniforms.uTransform;v[0]=this.tilePosition.x%(a*this.tileScale.x)/this._width,v[1]=this.tilePosition.y%(l*this.tileScale.y)/this._height,v[2]=c/this._width*this.tileScale.x,v[3]=d/this._height*this.tileScale.y,i.shader.uniforms.uTransform=v,i.shader.uniforms.translationMatrix=this.worldTransform.toArray(!0);var g=u;n.utils.hex2rgb(this.tint,g),g[3]=this.worldAlpha,i.shader.uniforms.uColor=g,t.bindTexture(this._texture,0),t.state.setBlendMode(this.blendMode),i.quad.draw()}},i.prototype._renderCanvas=function(t){var e=this._texture;if(e.baseTexture.hasLoaded){var r=t.context,i=this.worldTransform,s=t.resolution,o=e.baseTexture,h=this.tilePosition.x/this.tileScale.x%e._frame.width,u=this.tilePosition.y/this.tileScale.y%e._frame.height;if(!this._canvasPattern){var l=new n.CanvasRenderTarget(e._frame.width,e._frame.height);16777215!==this.tint?(this.cachedTint!==this.tint&&(this.cachedTint=this.tint,this.tintedTexture=a.getTintedTexture(this,this.tint)),
l.context.drawImage(this.tintedTexture,0,0)):l.context.drawImage(o.source,-e._frame.x,-e._frame.y),this._canvasPattern=l.context.createPattern(l.canvas,"repeat")}r.globalAlpha=this.worldAlpha,r.setTransform(i.a*s,i.b*s,i.c*s,i.d*s,i.tx*s,i.ty*s),r.scale(this.tileScale.x,this.tileScale.y),r.translate(h+this.anchor.x*-this._width,u+this.anchor.y*-this._height);var c=t.blendModes[this.blendMode];c!==t.context.globalCompositeOperation&&(r.globalCompositeOperation=c),r.fillStyle=this._canvasPattern,r.fillRect(-h,-u,this._width/this.tileScale.x,this._height/this.tileScale.y)}},i.prototype.getBounds=function(){var t,e,r,i,n=this._width,s=this._height,o=n*(1-this.anchor.x),a=n*-this.anchor.x,h=s*(1-this.anchor.y),u=s*-this.anchor.y,l=this.worldTransform,c=l.a,d=l.b,p=l.c,f=l.d,v=l.tx,g=l.ty,y=c*a+p*u+v,x=f*u+d*a+g,m=c*o+p*u+v,_=f*u+d*o+g,b=c*o+p*h+v,T=f*h+d*o+g,E=c*a+p*h+v,w=f*h+d*a+g;t=y,t=m<t?m:t,t=b<t?b:t,t=E<t?E:t,r=x,r=_<r?_:r,r=T<r?T:r,r=w<r?w:r,e=y,e=m>e?m:e,e=b>e?b:e,e=E>e?E:e,i=x,i=_>i?_:i,i=T>i?T:i,i=w>i?w:i;var S=this._bounds;return S.x=t,S.width=e-t,S.y=r,S.height=i-r,this._currentBounds=S,S},i.prototype.containsPoint=function(t){this.worldTransform.applyInverse(t,s);var e,r=this._width,i=this._height,n=-r*this.anchor.x;return s.x>n&&s.x<n+r&&(e=-i*this.anchor.y,s.y>e&&s.y<e+i)},i.prototype.destroy=function(){n.Sprite.prototype.destroy.call(this),this.tileScale=null,this._tileScaleOffset=null,this.tilePosition=null,this._uvs=null},i.from=function(t,e,r){return new i(o.from(t),e,r)},i.fromFrame=function(t,e,r){var s=n.utils.TextureCache[t];if(!s)throw new Error('The frameId "'+t+'" does not exist in the texture cache '+this);return new i(s,e,r)},i.fromImage=function(t,e,r,s,o){return new i(n.Texture.fromImage(t,s,o),e,r)}},{"../core":97,"../core/sprites/canvas/CanvasTinter":135,"../core/textures/Texture":144,"./webgl/TilingShader":165}],161:[function(t,e,r){var i=t("../core"),n=i.DisplayObject,s=new i.Matrix;n.prototype._cacheAsBitmap=!1,n.prototype._cacheData=!1;var o=function(){this.originalRenderWebGL=null,this.originalRenderCanvas=null,this.originalUpdateTransform=null,this.originalHitTest=null,this.originalDestroy=null,this.originalMask=null,this.originalFilterArea=null,this.sprite=null};Object.defineProperties(n.prototype,{cacheAsBitmap:{get:function(){return this._cacheAsBitmap},set:function(t){if(this._cacheAsBitmap!==t){this._cacheAsBitmap=t;var e;t?(this._cacheData||(this._cacheData=new o),e=this._cacheData,e.originalRenderWebGL=this.renderWebGL,e.originalRenderCanvas=this.renderCanvas,e.originalUpdateTransform=this.updateTransform,e.originalGetBounds=this.getBounds,e.originalDestroy=this.destroy,e.originalContainsPoint=this.containsPoint,e.originalMask=this._mask,e.originalFilterArea=this.filterArea,this.renderWebGL=this._renderCachedWebGL,this.renderCanvas=this._renderCachedCanvas,this.destroy=this._cacheAsBitmapDestroy):(e=this._cacheData,e.sprite&&this._destroyCachedDisplayObject(),this.renderWebGL=e.originalRenderWebGL,this.renderCanvas=e.originalRenderCanvas,this.getBounds=e.originalGetBounds,this.destroy=e.originalDestroy,this.updateTransform=e.originalUpdateTransform,this.containsPoint=e.originalContainsPoint,this._mask=e.originalMask,this.filterArea=e.originalFilterArea)}}}}),n.prototype._renderCachedWebGL=function(t){!this.visible||this.worldAlpha<=0||!this.renderable||(this._initCachedDisplayObject(t),this._cacheData.sprite._transformID=-1,this._cacheData.sprite.worldAlpha=this.worldAlpha,this._cacheData.sprite._renderWebGL(t))},n.prototype._initCachedDisplayObject=function(t){if(!this._cacheData||!this._cacheData.sprite){t.currentRenderer.flush();var e=this.getLocalBounds().clone();if(this._filters){var r=this._filters[0].padding;e.x-=r,e.y-=r,e.width+=2*r,e.height+=2*r}var n=t._activeRenderTarget,o=t.filterManager.filterStack,a=i.RenderTexture.create(0|e.width,0|e.height),h=s;h.tx=-e.x,h.ty=-e.y,this.transform.worldTransform.identity(),this.renderWebGL=this._cacheData.originalRenderWebGL,t.render(this,a,!0,h,!0),t.bindRenderTarget(n),t.filterManager.filterStack=o,this.renderWebGL=this._renderCachedWebGL,this.updateTransform=this.displayObjectUpdateTransform,this.getBounds=this._getCachedBounds,this._mask=null,this.filterArea=null;var u=new i.Sprite(a);u.transform.worldTransform=this.transform.worldTransform,u.anchor.x=-(e.x/e.width),u.anchor.y=-(e.y/e.height),this._cacheData.sprite=u,this.transform._parentID=-1,this.updateTransform(),this.containsPoint=u.containsPoint.bind(u)}},n.prototype._renderCachedCanvas=function(t){!this.visible||this.worldAlpha<=0||!this.renderable||(this._initCachedDisplayObjectCanvas(t),this._cacheData.sprite.worldAlpha=this.worldAlpha,this._cacheData.sprite.renderCanvas(t))},n.prototype._initCachedDisplayObjectCanvas=function(t){if(!this._cacheData||!this._cacheData.sprite){var e=this.getLocalBounds(),r=t.context,n=new i.RenderTexture.create(0|e.width,0|e.height),o=s;this.transform.worldTransform.copy(o),o.invert(),o.tx-=e.x,o.ty-=e.y,this.renderCanvas=this._cacheData.originalRenderCanvas,t.render(this,n,!0,o,!1),t.context=r,this.renderCanvas=this._renderCachedCanvas,this.updateTransform=this.displayObjectUpdateTransform,this.getBounds=this._getCachedBounds,this._mask=null,this.filterArea=null;var a=new i.Sprite(n);a.transform.worldTransform=this.transform.worldTransform,a.anchor.x=-(e.x/e.width),a.anchor.y=-(e.y/e.height),this.updateTransform(),this._cacheData.sprite=a,this.containsPoint=a.containsPoint.bind(a)}},n.prototype._getCachedBounds=function(){return this._cacheData.sprite._currentBounds=null,this._cacheData.sprite.getBounds()},n.prototype._destroyCachedDisplayObject=function(){this._cacheData.sprite._texture.destroy(!0),this._cacheData.sprite=null},n.prototype._cacheAsBitmapDestroy=function(){this.cacheAsBitmap=!1,this.destroy()}},{"../core":97}],162:[function(t,e,r){var i=t("../core");i.DisplayObject.prototype.name=null,i.Container.prototype.getChildByName=function(t){for(var e=0;e<this.children.length;e++)if(this.children[e].name===t)return this.children[e];return null}},{"../core":97}],163:[function(t,e,r){var i=t("../core");i.DisplayObject.prototype.getGlobalPosition=function(t){return t=t||new i.Point,this.parent?(this.displayObjectUpdateTransform(),t.x=this.worldTransform.tx,t.y=this.worldTransform.ty):(t.x=this.position.x,t.y=this.position.y),t}},{"../core":97}],164:[function(t,e,r){t("./cacheAsBitmap"),t("./getChildByName"),t("./getGlobalPosition"),e.exports={MovieClip:t("./MovieClip"),TilingSprite:t("./TilingSprite"),BitmapText:t("./BitmapText")}},{"./BitmapText":158,"./MovieClip":159,"./TilingSprite":160,"./cacheAsBitmap":161,"./getChildByName":162,"./getGlobalPosition":163}],165:[function(t,e,r){function i(t){n.call(this,t,"#define GLSLIFY 1\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\n\nuniform vec4 uFrame;\nuniform vec4 uTransform;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vec2 coord = aTextureCoord;\n    coord -= uTransform.xy;\n    coord /= uTransform.zw;\n    vTextureCoord = coord;\n}\n","#define GLSLIFY 1\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 uColor;\nuniform vec4 uFrame;\nuniform vec2 uPixelSize;\n\nvoid main(void)\n{\n\n   \tvec2 coord = mod(vTextureCoord, uFrame.zw);\n   \tcoord = clamp(coord, uPixelSize, uFrame.zw - uPixelSize);\n   \tcoord += uFrame.xy;\n\n   \tvec4 sample = texture2D(uSampler, coord);\n  \tvec4 color = vec4(uColor.rgb * uColor.a, uColor.a);\n\n   \tgl_FragColor = sample * color ;\n}\n")}var n=t("../../core/Shader");i.prototype=Object.create(n.prototype),i.prototype.constructor=i,e.exports=i},{"../../core/Shader":77}],166:[function(t,e,r){function i(t,e,r){n.Filter.call(this),this.blurXFilter=new s,this.blurYFilter=new o,this.resolution=1,this.padding=0,this.resolution=r||1,this.quality=e||4,this.blur=t||8}var n=t("../../core"),s=t("./BlurXFilter"),o=t("./BlurYFilter");i.prototype=Object.create(n.Filter.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.apply=function(t,e,r){var i=t.getRenderTarget(!0);this.blurXFilter.apply(t,e,i,!0),this.blurYFilter.apply(t,i,r,!1),t.returnRenderTarget(i)},Object.defineProperties(i.prototype,{blur:{get:function(){return this.blurXFilter.blur},set:function(t){this.blurXFilter.blur=this.blurYFilter.blur=t,this.padding=2*Math.max(Math.abs(this.blurYFilter.strength),Math.abs(this.blurYFilter.strength))}},quality:{get:function(){return this.blurXFilter.quality},set:function(t){this.blurXFilter.quality=this.blurYFilter.quality=t}},blurX:{get:function(){return this.blurXFilter.blur},set:function(t){this.blurXFilter.blur=t,this.padding=2*Math.max(Math.abs(this.blurYFilter.strength),Math.abs(this.blurYFilter.strength))}},blurY:{get:function(){return this.blurYFilter.blur},set:function(t){this.blurYFilter.blur=t,this.padding=2*Math.max(Math.abs(this.blurYFilter.strength),Math.abs(this.blurYFilter.strength))}}})},{"../../core":97,"./BlurXFilter":167,"./BlurYFilter":168}],167:[function(t,e,r){function i(t,e,r){var i=s(5,!0),a=o(5);n.Filter.call(this,i,a),this.resolution=r||1,this._quality=0,this.quality=e||4,this.strength=t||8,this.firstRun=!0}var n=t("../../core"),s=t("./generateBlurVertSource"),o=t("./generateBlurFragSource"),a=t("./getMaxBlurKernelSize");i.prototype=Object.create(n.Filter.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.apply=function(t,e,r,i){if(this.firstRun){var n=t.renderer.gl,h=a(n);this.vertexSrc=s(h,!0),this.fragmentSrc=o(h),this.firstRun=!1}if(this.uniforms.strength=1/r.size.width*(r.size.width/e.size.width),this.uniforms.strength*=this.strength,this.uniforms.strength/=this.passes,1===this.passes)t.applyFilter(this,e,r,i);else{for(var u=t.getRenderTarget(!0),l=e,c=u,d=0;d<this.passes-1;d++){t.applyFilter(this,l,c,!0);var p=c;c=l,l=p}t.applyFilter(this,l,r,i),t.returnRenderTarget(u)}},Object.defineProperties(i.prototype,{blur:{get:function(){return this.strength},set:function(t){this.padding=2*Math.abs(t),this.strength=t}},quality:{get:function(){return this._quality},set:function(t){this._quality=t,this.passes=t}}})},{"../../core":97,"./generateBlurFragSource":169,"./generateBlurVertSource":170,"./getMaxBlurKernelSize":171}],168:[function(t,e,r){function i(t,e,r){var i=s(5,!1),a=o(5);n.Filter.call(this,i,a),this.resolution=r||1,this._quality=0,this.quality=e||4,this.strength=t||8,this.firstRun=!0}var n=t("../../core"),s=t("./generateBlurVertSource"),o=t("./generateBlurFragSource"),a=t("./getMaxBlurKernelSize");i.prototype=Object.create(n.Filter.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.apply=function(t,e,r,i){if(this.firstRun){var n=t.renderer.gl,h=a(n);this.vertexSrc=s(h,!1),this.fragmentSrc=o(h),this.firstRun=!1}if(this.uniforms.strength=1/r.size.height*(r.size.height/e.size.height),this.uniforms.strength*=this.strength,this.uniforms.strength/=this.passes,1===this.passes)t.applyFilter(this,e,r,i);else{for(var u=t.getRenderTarget(!0),l=e,c=u,d=0;d<this.passes-1;d++){t.applyFilter(this,l,c,!0);var p=c;c=l,l=p}t.applyFilter(this,l,r,i),t.returnRenderTarget(u)}},Object.defineProperties(i.prototype,{blur:{get:function(){return this.strength},set:function(t){this.padding=2*Math.abs(t),this.strength=t}},quality:{get:function(){return this._quality},set:function(t){this._quality=t,this.passes=t}}})},{"../../core":97,"./generateBlurFragSource":169,"./generateBlurVertSource":170,"./getMaxBlurKernelSize":171}],169:[function(t,e,r){var i={5:[.153388,.221461,.250301],7:[.071303,.131514,.189879,.214607],9:[.028532,.067234,.124009,.179044,.20236],11:[.0093,.028002,.065984,.121703,.175713,.198596],13:[.002406,.009255,.027867,.065666,.121117,.174868,.197641],15:[489e-6,.002403,.009246,.02784,.065602,.120999,.174697,.197448]},n=["varying vec2 vBlurTexCoords[%size%];","uniform sampler2D uSampler;","void main(void)","{","\tgl_FragColor = vec4(0.0);","\t%blur%","}"].join("\n"),s=function(t){for(var e,r=i[t],s=r.length,o=n,a="",h="gl_FragColor += texture2D(uSampler, vBlurTexCoords[%index%]) * %value%;",u=0;u<t;u++){var l=h.replace("%index%",u);e=u,u>=s&&(e=t-u-1),l=l.replace("%value%",r[e]),a+=l,a+="\n"}return o=o.replace("%blur%",a),o=o.replace("%size%",t)};e.exports=s},{}],170:[function(t,e,r){var i=["attribute vec2 aVertexPosition;","attribute vec2 aTextureCoord;","uniform float strength;","uniform mat3 projectionMatrix;","varying vec2 vBlurTexCoords[%size%];","void main(void)","{","gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);","%blur%","}"].join("\n"),n=function(t,e){var r,n,s=Math.ceil(t/2),o=i,a="";r=e?"vBlurTexCoords[%index%] = aTextureCoord + vec2(%sampleIndex% * strength, 0.0);":"vBlurTexCoords[%index%] = aTextureCoord + vec2(0.0, %sampleIndex% * strength);";for(var h=0;h<t;h++){var u=r.replace("%index%",h);n=h,h>=s&&(n=t-h-1),u=u.replace("%sampleIndex%",h-(s-1)+".0"),a+=u,a+="\n"}return o=o.replace("%blur%",a),o=o.replace("%size%",t)};e.exports=n},{}],171:[function(t,e,r){var i=function(t){for(var e=t.getParameter(t.MAX_VARYING_VECTORS),r=15;r>e;)r-=2;return r};e.exports=i},{}],172:[function(t,e,r){function i(){n.Filter.call(this,"#define GLSLIFY 1\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}","#define GLSLIFY 1\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform float m[20];\n\nvoid main(void)\n{\n\n    vec4 c = texture2D(uSampler, vTextureCoord);\n\n    gl_FragColor.r = (m[0] * c.r);\n        gl_FragColor.r += (m[1] * c.g);\n        gl_FragColor.r += (m[2] * c.b);\n        gl_FragColor.r += (m[3] * c.a);\n        gl_FragColor.r += m[4] * c.a;\n\n    gl_FragColor.g = (m[5] * c.r);\n        gl_FragColor.g += (m[6] * c.g);\n        gl_FragColor.g += (m[7] * c.b);\n        gl_FragColor.g += (m[8] * c.a);\n        gl_FragColor.g += m[9] * c.a;\n\n     gl_FragColor.b = (m[10] * c.r);\n        gl_FragColor.b += (m[11] * c.g);\n        gl_FragColor.b += (m[12] * c.b);\n        gl_FragColor.b += (m[13] * c.a);\n        gl_FragColor.b += m[14] * c.a;\n\n     gl_FragColor.a = (m[15] * c.r);\n        gl_FragColor.a += (m[16] * c.g);\n        gl_FragColor.a += (m[17] * c.b);\n        gl_FragColor.a += (m[18] * c.a);\n        gl_FragColor.a += m[19] * c.a;\n\n//    gl_FragColor = vec4(m[0]);\n}\n"),this.uniforms.m=[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0]}var n=t("../../core");i.prototype=Object.create(n.Filter.prototype),i.prototype.constructor=i,e.exports=i,i.prototype._loadMatrix=function(t,e){e=!!e;var r=t;e&&(this._multiply(r,this.uniforms.m,t),r=this._colorMatrix(r)),this.uniforms.m=r},i.prototype._multiply=function(t,e,r){return t[0]=e[0]*r[0]+e[1]*r[5]+e[2]*r[10]+e[3]*r[15],t[1]=e[0]*r[1]+e[1]*r[6]+e[2]*r[11]+e[3]*r[16],t[2]=e[0]*r[2]+e[1]*r[7]+e[2]*r[12]+e[3]*r[17],t[3]=e[0]*r[3]+e[1]*r[8]+e[2]*r[13]+e[3]*r[18],t[4]=e[0]*r[4]+e[1]*r[9]+e[2]*r[14]+e[3]*r[19],t[5]=e[5]*r[0]+e[6]*r[5]+e[7]*r[10]+e[8]*r[15],t[6]=e[5]*r[1]+e[6]*r[6]+e[7]*r[11]+e[8]*r[16],t[7]=e[5]*r[2]+e[6]*r[7]+e[7]*r[12]+e[8]*r[17],t[8]=e[5]*r[3]+e[6]*r[8]+e[7]*r[13]+e[8]*r[18],t[9]=e[5]*r[4]+e[6]*r[9]+e[7]*r[14]+e[8]*r[19],t[10]=e[10]*r[0]+e[11]*r[5]+e[12]*r[10]+e[13]*r[15],t[11]=e[10]*r[1]+e[11]*r[6]+e[12]*r[11]+e[13]*r[16],t[12]=e[10]*r[2]+e[11]*r[7]+e[12]*r[12]+e[13]*r[17],t[13]=e[10]*r[3]+e[11]*r[8]+e[12]*r[13]+e[13]*r[18],t[14]=e[10]*r[4]+e[11]*r[9]+e[12]*r[14]+e[13]*r[19],t[15]=e[15]*r[0]+e[16]*r[5]+e[17]*r[10]+e[18]*r[15],t[16]=e[15]*r[1]+e[16]*r[6]+e[17]*r[11]+e[18]*r[16],t[17]=e[15]*r[2]+e[16]*r[7]+e[17]*r[12]+e[18]*r[17],t[18]=e[15]*r[3]+e[16]*r[8]+e[17]*r[13]+e[18]*r[18],t[19]=e[15]*r[4]+e[16]*r[9]+e[17]*r[14]+e[18]*r[19],t},i.prototype._colorMatrix=function(t){var e=new Float32Array(t);return e[4]/=255,e[9]/=255,e[14]/=255,e[19]/=255,e},i.prototype.brightness=function(t,e){var r=[t,0,0,0,0,0,t,0,0,0,0,0,t,0,0,0,0,0,1,0];this._loadMatrix(r,e)},i.prototype.greyscale=function(t,e){var r=[t,t,t,0,0,t,t,t,0,0,t,t,t,0,0,0,0,0,1,0];this._loadMatrix(r,e)},i.prototype.grayscale=i.prototype.greyscale,i.prototype.blackAndWhite=function(t){var e=[.3,.6,.1,0,0,.3,.6,.1,0,0,.3,.6,.1,0,0,0,0,0,1,0];this._loadMatrix(e,t)},i.prototype.hue=function(t,e){t=(t||0)/180*Math.PI;var r=Math.cos(t),i=Math.sin(t),n=Math.sqrt,s=1/3,o=n(s),a=r+(1-r)*s,h=s*(1-r)-o*i,u=s*(1-r)+o*i,l=s*(1-r)+o*i,c=r+s*(1-r),d=s*(1-r)-o*i,p=s*(1-r)-o*i,f=s*(1-r)+o*i,v=r+s*(1-r),g=[a,h,u,0,0,l,c,d,0,0,p,f,v,0,0,0,0,0,1,0];this._loadMatrix(g,e)},i.prototype.contrast=function(t,e){var r=(t||0)+1,i=-128*(r-1),n=[r,0,0,0,i,0,r,0,0,i,0,0,r,0,i,0,0,0,1,0];this._loadMatrix(n,e)},i.prototype.saturate=function(t,e){var r=2*(t||0)/3+1,i=(r-1)*-.5,n=[r,i,i,0,0,i,r,i,0,0,i,i,r,0,0,0,0,0,1,0];this._loadMatrix(n,e)},i.prototype.desaturate=function(){this.saturate(-1)},i.prototype.negative=function(t){var e=[0,1,1,0,0,1,0,1,0,0,1,1,0,0,0,0,0,0,1,0];this._loadMatrix(e,t)},i.prototype.sepia=function(t){var e=[.393,.7689999,.18899999,0,0,.349,.6859999,.16799999,0,0,.272,.5339999,.13099999,0,0,0,0,0,1,0];this._loadMatrix(e,t)},i.prototype.technicolor=function(t){var e=[1.9125277891456083,-.8545344976951645,-.09155508482755585,0,11.793603434377337,-.3087833385928097,1.7658908555458428,-.10601743074722245,0,-70.35205161461398,-.231103377548616,-.7501899197440212,1.847597816108189,0,30.950940869491138,0,0,0,1,0];this._loadMatrix(e,t)},i.prototype.polaroid=function(t){var e=[1.438,-.062,-.062,0,0,-.122,1.378,-.122,0,0,-.016,-.016,1.483,0,0,0,0,0,1,0];this._loadMatrix(e,t)},i.prototype.toBGR=function(t){var e=[0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0];this._loadMatrix(e,t)},i.prototype.kodachrome=function(t){var e=[1.1285582396593525,-.3967382283601348,-.03992559172921793,0,63.72958762196502,-.16404339962244616,1.0835251566291304,-.05498805115633132,0,24.732407896706203,-.16786010706155763,-.5603416277695248,1.6014850761964943,0,35.62982807460946,0,0,0,1,0];this._loadMatrix(e,t)},i.prototype.browni=function(t){var e=[.5997023498159715,.34553243048391263,-.2708298674538042,0,47.43192855600873,-.037703249837783157,.8609577587992641,.15059552388459913,0,-36.96841498319127,.24113635128153335,-.07441037908422492,.44972182064877153,0,-7.562075277591283,0,0,0,1,0];this._loadMatrix(e,t)},i.prototype.vintage=function(t){var e=[.6279345635605994,.3202183420819367,-.03965408211312453,0,9.651285835294123,.02578397704808868,.6441188644374771,.03259127616149294,0,7.462829176470591,.0466055556782719,-.0851232987247891,.5241648018700465,0,5.159190588235296,0,0,0,1,0];this._loadMatrix(e,t)},i.prototype.colorTone=function(t,e,r,i,n){t=t||.2,e=e||.15,r=r||16770432,i=i||3375104;var s=(r>>16&255)/255,o=(r>>8&255)/255,a=(255&r)/255,h=(i>>16&255)/255,u=(i>>8&255)/255,l=(255&i)/255,c=[.3,.59,.11,0,0,s,o,a,t,0,h,u,l,e,0,s-h,o-u,a-l,0,0];this._loadMatrix(c,n)},i.prototype.night=function(t,e){t=t||.1;var r=[t*-2,-t,0,0,0,-t,0,t,0,0,0,t,2*t,0,0,0,0,0,1,0];this._loadMatrix(r,e)},i.prototype.predator=function(t,e){var r=[11.224130630493164*t,-4.794486999511719*t,-2.8746118545532227*t,0*t,.40342438220977783*t,-3.6330697536468506*t,9.193157196044922*t,-2.951810836791992*t,0*t,-1.316135048866272*t,-3.2184197902679443*t,-4.2375030517578125*t,7.476448059082031*t,0*t,.8044459223747253*t,0,0,0,1,0];this._loadMatrix(r,e)},i.prototype.lsd=function(t){var e=[2,-.4,.5,0,0,-.5,2,-.4,0,0,-.4,-.5,3,0,0,0,0,0,1,0];this._loadMatrix(e,t)},i.prototype.reset=function(){var t=[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0];this._loadMatrix(t,!1)},Object.defineProperties(i.prototype,{matrix:{get:function(){return this.uniforms.m},set:function(t){this.uniforms.m=t}}})},{"../../core":97}],173:[function(t,e,r){function i(t,e){var r=new n.Matrix;t.renderable=!1,n.Filter.call(this,"#define GLSLIFY 1\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 filterMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vFilterCoord;\n\nvoid main(void)\n{\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vFilterCoord = ( filterMatrix * vec3( aTextureCoord, 1.0)  ).xy;\n   vTextureCoord = aTextureCoord;\n}","#define GLSLIFY 1\nvarying vec2 vFilterCoord;\nvarying vec2 vTextureCoord;\n\nuniform vec2 scale;\n\nuniform sampler2D uSampler;\nuniform sampler2D mapSampler;\n\nuniform vec4 filterClamp;\n\nvoid main(void)\n{\n   vec4 map =  texture2D(mapSampler, vFilterCoord);\n\n   map -= 0.5;\n   map.xy *= scale;\n\n   gl_FragColor = texture2D(uSampler, clamp(vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y), filterClamp.xy, filterClamp.zw));\n}\n"),this.maskSprite=t,this.maskMatrix=r,this.uniforms.mapSampler=t.texture,this.uniforms.filterMatrix=r.toArray(!0),this.uniforms.scale={x:1,y:1},null!==e&&void 0!==e||(e=20),this.scale=new n.Point(e,e)}var n=t("../../core");i.prototype=Object.create(n.Filter.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.apply=function(t,e,r){var i=1/r.destinationFrame.width*(r.size.width/e.size.width);this.uniforms.filterMatrix=t.calculateSpriteMatrix(this.maskMatrix,this.maskSprite),this.uniforms.scale.x=this.scale.x*i,this.uniforms.scale.y=this.scale.y*i,t.applyFilter(this,e,r)},Object.defineProperties(i.prototype,{map:{get:function(){return this.uniforms.mapSampler},set:function(t){this.uniforms.mapSampler=t}}})},{"../../core":97}],174:[function(t,e,r){function i(){n.Filter.call(this,"#define GLSLIFY 1\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 v_rgbNW;\nvarying vec2 v_rgbNE;\nvarying vec2 v_rgbSW;\nvarying vec2 v_rgbSE;\nvarying vec2 v_rgbM;\n\nuniform vec4 filterArea;\n\nvarying vec2 vTextureCoord;\n\nvec2 mapCoord( vec2 coord )\n{\n    coord *= filterArea.xy;\n    coord += filterArea.zw;\n\n    return coord;\n}\n\nvec2 unmapCoord( vec2 coord )\n{\n    coord -= filterArea.zw;\n    coord /= filterArea.xy;\n\n    return coord;\n}\n\nvoid texcoords(vec2 fragCoord, vec2 resolution,\n               out vec2 v_rgbNW, out vec2 v_rgbNE,\n               out vec2 v_rgbSW, out vec2 v_rgbSE,\n               out vec2 v_rgbM) {\n    vec2 inverseVP = 1.0 / resolution.xy;\n    v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;\n    v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;\n    v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;\n    v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;\n    v_rgbM = vec2(fragCoord * inverseVP);\n}\n\nvoid main(void) {\n\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n   vTextureCoord = aTextureCoord;\n\n   vec2 fragCoord = vTextureCoord * filterArea.xy;\n\n   texcoords(fragCoord, filterArea.xy, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);\n}",'#define GLSLIFY 1\nvarying vec2 v_rgbNW;\nvarying vec2 v_rgbNE;\nvarying vec2 v_rgbSW;\nvarying vec2 v_rgbSE;\nvarying vec2 v_rgbM;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\n\n/**\n Basic FXAA implementation based on the code on geeks3d.com with the\n modification that the texture2DLod stuff was removed since it\'s\n unsupported by WebGL.\n \n --\n \n From:\n https://github.com/mitsuhiko/webgl-meincraft\n \n Copyright (c) 2011 by Armin Ronacher.\n \n Some rights reserved.\n \n Redistribution and use in source and binary forms, with or without\n modification, are permitted provided that the following conditions are\n met:\n \n * Redistributions of source code must retain the above copyright\n notice, this list of conditions and the following disclaimer.\n \n * Redistributions in binary form must reproduce the above\n copyright notice, this list of conditions and the following\n disclaimer in the documentation and/or other materials provided\n with the distribution.\n \n * The names of the contributors may not be used to endorse or\n promote products derived from this software without specific\n prior written permission.\n \n THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT\n LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\n A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT\n OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,\n SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT\n LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,\n DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY\n THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\n OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n */\n\n#ifndef FXAA_REDUCE_MIN\n#define FXAA_REDUCE_MIN   (1.0/ 128.0)\n#endif\n#ifndef FXAA_REDUCE_MUL\n#define FXAA_REDUCE_MUL   (1.0 / 8.0)\n#endif\n#ifndef FXAA_SPAN_MAX\n#define FXAA_SPAN_MAX     8.0\n#endif\n\n//optimized version for mobile, where dependent\n//texture reads can be a bottleneck\nvec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 resolution,\n          vec2 v_rgbNW, vec2 v_rgbNE,\n          vec2 v_rgbSW, vec2 v_rgbSE,\n          vec2 v_rgbM) {\n    vec4 color;\n    mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);\n    vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;\n    vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;\n    vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;\n    vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;\n    vec4 texColor = texture2D(tex, v_rgbM);\n    vec3 rgbM  = texColor.xyz;\n    vec3 luma = vec3(0.299, 0.587, 0.114);\n    float lumaNW = dot(rgbNW, luma);\n    float lumaNE = dot(rgbNE, luma);\n    float lumaSW = dot(rgbSW, luma);\n    float lumaSE = dot(rgbSE, luma);\n    float lumaM  = dot(rgbM,  luma);\n    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\n    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\n    \n    mediump vec2 dir;\n    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\n    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\n    \n    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *\n                          (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\n    \n    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\n    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),\n              max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),\n                  dir * rcpDirMin)) * inverseVP;\n    \n    vec3 rgbA = 0.5 * (\n                       texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +\n                       texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);\n    vec3 rgbB = rgbA * 0.5 + 0.25 * (\n                                     texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +\n                                     texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);\n    \n    float lumaB = dot(rgbB, luma);\n    if ((lumaB < lumaMin) || (lumaB > lumaMax))\n        color = vec4(rgbA, texColor.a);\n    else\n        color = vec4(rgbB, texColor.a);\n    return color;\n}\n\nvoid main() {\n\n  \tvec2 fragCoord = vTextureCoord * filterArea.xy;\n\n  \tvec4 color;\n\n    color = fxaa(uSampler, fragCoord, filterArea.xy, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);\n\n  \tgl_FragColor = color;\n}\n')}var n=t("../../core");i.prototype=Object.create(n.Filter.prototype),i.prototype.constructor=i,e.exports=i},{"../../core":97}],175:[function(t,e,r){e.exports={FXAAFilter:t("./fxaa/FXAAFilter"),NoiseFilter:t("./noise/NoiseFilter"),DisplacementFilter:t("./displacement/DisplacementFilter"),BlurFilter:t("./blur/BlurFilter"),BlurXFilter:t("./blur/BlurXFilter"),BlurYFilter:t("./blur/BlurYFilter"),ColorMatrixFilter:t("./colormatrix/ColorMatrixFilter"),VoidFilter:t("./void/VoidFilter")}},{"./blur/BlurFilter":166,"./blur/BlurXFilter":167,"./blur/BlurYFilter":168,"./colormatrix/ColorMatrixFilter":172,"./displacement/DisplacementFilter":173,"./fxaa/FXAAFilter":174,"./noise/NoiseFilter":176,"./void/VoidFilter":177}],176:[function(t,e,r){function i(){n.Filter.call(this,"#define GLSLIFY 1\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}","precision highp float;\n#define GLSLIFY 1\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform float noise;\nuniform sampler2D uSampler;\n\nfloat rand(vec2 co)\n{\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvoid main()\n{\n    vec4 color = texture2D(uSampler, vTextureCoord);\n\n    float diff = (rand(gl_FragCoord.xy) - 0.5) * noise;\n\n    color.r += diff;\n    color.g += diff;\n    color.b += diff;\n\n    gl_FragColor = color;\n}\n"),this.noise=.5}var n=t("../../core");i.prototype=Object.create(n.Filter.prototype),i.prototype.constructor=i,e.exports=i,Object.defineProperties(i.prototype,{noise:{get:function(){return this.uniforms.noise},set:function(t){this.uniforms.noise=t}}})},{"../../core":97}],177:[function(t,e,r){function i(){n.Filter.call(this,"#define GLSLIFY 1\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}","#define GLSLIFY 1\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n   gl_FragColor = texture2D(uSampler, vTextureCoord);\n}\n"),this.glShaderKey="void"}var n=t("../../core");i.prototype=Object.create(n.Filter.prototype),i.prototype.constructor=i,e.exports=i},{"../../core":97}],178:[function(t,e,r){function i(){this.global=new n.Point,this.target=null,this.originalEvent=null}var n=t("../core");i.prototype.constructor=i,e.exports=i,i.prototype.getLocalPosition=function(t,e,r){return t.worldTransform.applyInverse(r||this.global,e)}},{"../core":97}],179:[function(t,e,r){function i(t,e){o.call(this),e=e||{},this.renderer=t,this.autoPreventDefault=void 0===e.autoPreventDefault||e.autoPreventDefault,this.interactionFrequency=e.interactionFrequency||10,this.mouse=new s,this.mouse.global.set(-999999),this.eventData={stopped:!1,target:null,type:null,data:this.mouse,stopPropagation:function(){this.stopped=!0}},this.interactiveDataPool=[],this.interactionDOMElement=null,this.moveWhenInside=!1,this.eventsAdded=!1,this.onMouseUp=this.onMouseUp.bind(this),this.processMouseUp=this.processMouseUp.bind(this),this.onMouseDown=this.onMouseDown.bind(this),this.processMouseDown=this.processMouseDown.bind(this),this.onMouseMove=this.onMouseMove.bind(this),this.processMouseMove=this.processMouseMove.bind(this),this.onMouseOut=this.onMouseOut.bind(this),this.processMouseOverOut=this.processMouseOverOut.bind(this),this.onMouseOver=this.onMouseOver.bind(this),this.onTouchStart=this.onTouchStart.bind(this),this.processTouchStart=this.processTouchStart.bind(this),this.onTouchEnd=this.onTouchEnd.bind(this),this.processTouchEnd=this.processTouchEnd.bind(this),this.onTouchMove=this.onTouchMove.bind(this),this.processTouchMove=this.processTouchMove.bind(this),this.defaultCursorStyle="inherit",this.currentCursorStyle="inherit",this._tempPoint=new n.Point,this.resolution=1,this.setTargetElement(this.renderer.view,this.renderer.resolution)}var n=t("../core"),s=t("./InteractionData"),o=t("eventemitter3");Object.assign(n.DisplayObject.prototype,t("./interactiveTarget")),i.prototype=Object.create(o.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.setTargetElement=function(t,e){this.removeEvents(),this.interactionDOMElement=t,this.resolution=e||1,this.addEvents()},i.prototype.addEvents=function(){this.interactionDOMElement&&(n.ticker.shared.add(this.update,this),
window.navigator.msPointerEnabled&&(this.interactionDOMElement.style["-ms-content-zooming"]="none",this.interactionDOMElement.style["-ms-touch-action"]="none"),window.document.addEventListener("mousemove",this.onMouseMove,!0),this.interactionDOMElement.addEventListener("mousedown",this.onMouseDown,!0),this.interactionDOMElement.addEventListener("mouseout",this.onMouseOut,!0),this.interactionDOMElement.addEventListener("mouseover",this.onMouseOver,!0),this.interactionDOMElement.addEventListener("touchstart",this.onTouchStart,!0),this.interactionDOMElement.addEventListener("touchend",this.onTouchEnd,!0),this.interactionDOMElement.addEventListener("touchmove",this.onTouchMove,!0),window.addEventListener("mouseup",this.onMouseUp,!0),this.eventsAdded=!0)},i.prototype.removeEvents=function(){this.interactionDOMElement&&(n.ticker.shared.remove(this.update),window.navigator.msPointerEnabled&&(this.interactionDOMElement.style["-ms-content-zooming"]="",this.interactionDOMElement.style["-ms-touch-action"]=""),window.document.removeEventListener("mousemove",this.onMouseMove,!0),this.interactionDOMElement.removeEventListener("mousedown",this.onMouseDown,!0),this.interactionDOMElement.removeEventListener("mouseout",this.onMouseOut,!0),this.interactionDOMElement.removeEventListener("mouseover",this.onMouseOver,!0),this.interactionDOMElement.removeEventListener("touchstart",this.onTouchStart,!0),this.interactionDOMElement.removeEventListener("touchend",this.onTouchEnd,!0),this.interactionDOMElement.removeEventListener("touchmove",this.onTouchMove,!0),this.interactionDOMElement=null,window.removeEventListener("mouseup",this.onMouseUp,!0),this.eventsAdded=!1)},i.prototype.update=function(t){if(this._deltaTime+=t,!(this._deltaTime<this.interactionFrequency)&&(this._deltaTime=0,this.interactionDOMElement)){if(this.didMove)return void(this.didMove=!1);this.cursor=this.defaultCursorStyle,this.processInteractive(this.mouse.global,this.renderer._lastObjectRendered,this.processMouseOverOut,!0),this.currentCursorStyle!==this.cursor&&(this.currentCursorStyle=this.cursor,this.interactionDOMElement.style.cursor=this.cursor)}},i.prototype.dispatchEvent=function(t,e,r){r.stopped||(r.target=t,r.type=e,t.emit(e,r),t[e]&&t[e](r))},i.prototype.mapPositionToPoint=function(t,e,r){var i;i=this.interactionDOMElement.parentElement?this.interactionDOMElement.getBoundingClientRect():{x:0,y:0,width:0,height:0},t.x=(e-i.left)*(this.interactionDOMElement.width/i.width)/this.resolution,t.y=(r-i.top)*(this.interactionDOMElement.height/i.height)/this.resolution},i.prototype.processInteractive=function(t,e,r,i,n){if(!e||!e.visible)return!1;var s=!1,o=n=e.interactive||n;if(e.hitArea&&(o=!1),i&&e._mask&&(e._mask.containsPoint(t)||(i=!1)),i&&e.filterArea&&(e.filterArea.contains(t.x,t.y)||(i=!1)),e.interactiveChildren)for(var a=e.children,h=a.length-1;h>=0;h--){var u=a[h];if(this.processInteractive(t,u,r,i,o)){if(!u.parent)continue;s=!0,o=!1,i=!1}}return n&&(i&&!s&&(e.hitArea?(e.worldTransform.applyInverse(t,this._tempPoint),s=e.hitArea.contains(this._tempPoint.x,this._tempPoint.y)):e.containsPoint&&(s=e.containsPoint(t))),e.interactive&&r(e,s)),s},i.prototype.onMouseDown=function(t){this.mouse.originalEvent=t,this.eventData.data=this.mouse,this.eventData.stopped=!1,this.mapPositionToPoint(this.mouse.global,t.clientX,t.clientY),this.autoPreventDefault&&this.mouse.originalEvent.preventDefault(),this.processInteractive(this.mouse.global,this.renderer._lastObjectRendered,this.processMouseDown,!0);var e=2===t.button||3===t.which;this.emit(e?"rightdown":"mousedown",this.eventData)},i.prototype.processMouseDown=function(t,e){var r=this.mouse.originalEvent,i=2===r.button||3===r.which;e&&(t[i?"_isRightDown":"_isLeftDown"]=!0,this.dispatchEvent(t,i?"rightdown":"mousedown",this.eventData))},i.prototype.onMouseUp=function(t){this.mouse.originalEvent=t,this.eventData.data=this.mouse,this.eventData.stopped=!1,this.mapPositionToPoint(this.mouse.global,t.clientX,t.clientY),this.processInteractive(this.mouse.global,this.renderer._lastObjectRendered,this.processMouseUp,!0);var e=2===t.button||3===t.which;this.emit(e?"rightup":"mouseup",this.eventData)},i.prototype.processMouseUp=function(t,e){var r=this.mouse.originalEvent,i=2===r.button||3===r.which,n=i?"_isRightDown":"_isLeftDown";e?(this.dispatchEvent(t,i?"rightup":"mouseup",this.eventData),t[n]&&(t[n]=!1,this.dispatchEvent(t,i?"rightclick":"click",this.eventData))):t[n]&&(t[n]=!1,this.dispatchEvent(t,i?"rightupoutside":"mouseupoutside",this.eventData))},i.prototype.onMouseMove=function(t){this.mouse.originalEvent=t,this.eventData.data=this.mouse,this.eventData.stopped=!1,this.mapPositionToPoint(this.mouse.global,t.clientX,t.clientY),this.didMove=!0,this.cursor=this.defaultCursorStyle,this.processInteractive(this.mouse.global,this.renderer._lastObjectRendered,this.processMouseMove,!0),this.emit("mousemove",this.eventData),this.currentCursorStyle!==this.cursor&&(this.currentCursorStyle=this.cursor,this.interactionDOMElement.style.cursor=this.cursor)},i.prototype.processMouseMove=function(t,e){this.processMouseOverOut(t,e),this.moveWhenInside&&!e||this.dispatchEvent(t,"mousemove",this.eventData)},i.prototype.onMouseOut=function(t){this.mouse.originalEvent=t,this.eventData.data=this.mouse,this.eventData.stopped=!1,this.mapPositionToPoint(this.mouse.global,t.clientX,t.clientY),this.interactionDOMElement.style.cursor=this.defaultCursorStyle,this.mapPositionToPoint(this.mouse.global,t.clientX,t.clientY),this.processInteractive(this.mouse.global,this.renderer._lastObjectRendered,this.processMouseOverOut,!1),this.emit("mouseout",this.eventData)},i.prototype.processMouseOverOut=function(t,e){e?(t._over||(t._over=!0,this.dispatchEvent(t,"mouseover",this.eventData)),t.buttonMode&&(this.cursor=t.defaultCursor)):t._over&&(t._over=!1,this.dispatchEvent(t,"mouseout",this.eventData))},i.prototype.onMouseOver=function(t){this.mouse.originalEvent=t,this.eventData.data=this.mouse,this.eventData.stopped=!1,this.emit("mouseover",this.eventData)},i.prototype.onTouchStart=function(t){this.autoPreventDefault&&t.preventDefault();for(var e=t.changedTouches,r=e.length,i=0;i<r;i++){var n=e[i],s=this.getTouchData(n);s.originalEvent=t,this.eventData.data=s,this.eventData.stopped=!1,this.processInteractive(s.global,this.renderer._lastObjectRendered,this.processTouchStart,!0),this.emit("touchstart",this.eventData),this.returnTouchData(s)}},i.prototype.processTouchStart=function(t,e){e&&(t._touchDown=!0,this.dispatchEvent(t,"touchstart",this.eventData))},i.prototype.onTouchEnd=function(t){this.autoPreventDefault&&t.preventDefault();for(var e=t.changedTouches,r=e.length,i=0;i<r;i++){var n=e[i],s=this.getTouchData(n);s.originalEvent=t,this.eventData.data=s,this.eventData.stopped=!1,this.processInteractive(s.global,this.renderer._lastObjectRendered,this.processTouchEnd,!0),this.emit("touchend",this.eventData),this.returnTouchData(s)}},i.prototype.processTouchEnd=function(t,e){e?(this.dispatchEvent(t,"touchend",this.eventData),t._touchDown&&(t._touchDown=!1,this.dispatchEvent(t,"tap",this.eventData))):t._touchDown&&(t._touchDown=!1,this.dispatchEvent(t,"touchendoutside",this.eventData))},i.prototype.onTouchMove=function(t){this.autoPreventDefault&&t.preventDefault();for(var e=t.changedTouches,r=e.length,i=0;i<r;i++){var n=e[i],s=this.getTouchData(n);s.originalEvent=t,this.eventData.data=s,this.eventData.stopped=!1,this.processInteractive(s.global,this.renderer._lastObjectRendered,this.processTouchMove,this.moveWhenInside),this.emit("touchmove",this.eventData),this.returnTouchData(s)}},i.prototype.processTouchMove=function(t,e){this.moveWhenInside&&!e||this.dispatchEvent(t,"touchmove",this.eventData)},i.prototype.getTouchData=function(t){var e=this.interactiveDataPool.pop();return e||(e=new s),e.identifier=t.identifier,this.mapPositionToPoint(e.global,t.clientX,t.clientY),navigator.isCocoonJS&&(e.global.x=e.global.x/this.resolution,e.global.y=e.global.y/this.resolution),t.globalX=e.global.x,t.globalY=e.global.y,e},i.prototype.returnTouchData=function(t){this.interactiveDataPool.push(t)},i.prototype.destroy=function(){this.removeEvents(),this.removeAllListeners(),this.renderer=null,this.mouse=null,this.eventData=null,this.interactiveDataPool=null,this.interactionDOMElement=null,this.onMouseUp=null,this.processMouseUp=null,this.onMouseDown=null,this.processMouseDown=null,this.onMouseMove=null,this.processMouseMove=null,this.onMouseOut=null,this.processMouseOverOut=null,this.onMouseOver=null,this.onTouchStart=null,this.processTouchStart=null,this.onTouchEnd=null,this.processTouchEnd=null,this.onTouchMove=null,this.processTouchMove=null,this._tempPoint=null},n.WebGLRenderer.registerPlugin("interaction",i),n.CanvasRenderer.registerPlugin("interaction",i)},{"../core":97,"./InteractionData":178,"./interactiveTarget":181,eventemitter3:32}],180:[function(t,e,r){e.exports={InteractionData:t("./InteractionData"),InteractionManager:t("./InteractionManager"),interactiveTarget:t("./interactiveTarget")}},{"./InteractionData":178,"./InteractionManager":179,"./interactiveTarget":181}],181:[function(t,e,r){var i={interactive:!1,interactiveChildren:!0,hitArea:null,buttonMode:!1,defaultCursor:"pointer",_over:!1,_isLeftDown:!1,_isRightDown:!1,_touchDown:!1};e.exports=i},{}],182:[function(t,e,r){function i(t,e){var r={},i=t.data.getElementsByTagName("info")[0],n=t.data.getElementsByTagName("common")[0];r.font=i.getAttribute("face"),r.size=parseInt(i.getAttribute("size"),10),r.lineHeight=parseInt(n.getAttribute("lineHeight"),10),r.chars={};for(var a=t.data.getElementsByTagName("char"),h=0;h<a.length;h++){var u=parseInt(a[h].getAttribute("id"),10),l=new s.Rectangle(parseInt(a[h].getAttribute("x"),10)+e.frame.x,parseInt(a[h].getAttribute("y"),10)+e.frame.y,parseInt(a[h].getAttribute("width"),10),parseInt(a[h].getAttribute("height"),10));r.chars[u]={xOffset:parseInt(a[h].getAttribute("xoffset"),10),yOffset:parseInt(a[h].getAttribute("yoffset"),10),xAdvance:parseInt(a[h].getAttribute("xadvance"),10),kerning:{},texture:new s.Texture(e.baseTexture,l)}}var c=t.data.getElementsByTagName("kerning");for(h=0;h<c.length;h++){var d=parseInt(c[h].getAttribute("first"),10),p=parseInt(c[h].getAttribute("second"),10),f=parseInt(c[h].getAttribute("amount"),10);r.chars[p]&&(r.chars[p].kerning[d]=f)}t.bitmapFont=r,o.BitmapText.fonts[r.font]=r}var n=t("resource-loader").Resource,s=t("../core"),o=t("../extras"),a=t("path");e.exports=function(){return function(t,e){if(!t.data||!t.isXml)return e();if(0===t.data.getElementsByTagName("page").length||0===t.data.getElementsByTagName("info").length||null===t.data.getElementsByTagName("info")[0].getAttribute("face"))return e();var r=t.isDataUrl?"":a.dirname(t.url);t.isDataUrl&&("."===r&&(r=""),this.baseUrl&&r&&("/"===this.baseUrl.charAt(this.baseUrl.length-1)&&(r+="/"),r=r.replace(this.baseUrl,""))),r&&"/"!==r.charAt(r.length-1)&&(r+="/");var o=r+t.data.getElementsByTagName("page")[0].getAttribute("file");if(s.utils.TextureCache[o])i(t,s.utils.TextureCache[o]),e();else{var h={crossOrigin:t.crossOrigin,loadType:n.LOAD_TYPE.IMAGE,metadata:t.metadata.imageMetadata};this.add(t.name+"_image",o,h,function(r){i(t,r.texture),e()})}}}},{"../core":97,"../extras":164,path:60,"resource-loader":69}],183:[function(t,e,r){e.exports={Loader:t("./loader"),bitmapFontParser:t("./bitmapFontParser"),spritesheetParser:t("./spritesheetParser"),textureParser:t("./textureParser"),Resource:t("resource-loader").Resource}},{"./bitmapFontParser":182,"./loader":184,"./spritesheetParser":185,"./textureParser":186,"resource-loader":69}],184:[function(t,e,r){function i(t,e){n.call(this,t,e);for(var r=0;r<i._pixiMiddleware.length;++r)this.use(i._pixiMiddleware[r]())}var n=t("resource-loader"),s=t("./textureParser"),o=t("./spritesheetParser"),a=t("./bitmapFontParser");i.prototype=Object.create(n.prototype),i.prototype.constructor=i,e.exports=i,i._pixiMiddleware=[n.middleware.parsing.blob,s,o,a],i.addPixiMiddleware=function(t){i._pixiMiddleware.push(t)};var h=n.Resource;h.setExtensionXhrType("fnt",h.XHR_RESPONSE_TYPE.DOCUMENT)},{"./bitmapFontParser":182,"./spritesheetParser":185,"./textureParser":186,"resource-loader":69}],185:[function(t,e,r){var i=t("resource-loader").Resource,n=t("path"),s=t("../core"),o=1e3;e.exports=function(){return function(t,e){var r,a=t.name+"_image";if(!t.data||!t.isJson||!t.data.frames||this.resources[a])return e();var h={crossOrigin:t.crossOrigin,loadType:i.LOAD_TYPE.IMAGE,metadata:t.metadata.imageMetadata};r=t.isDataUrl?t.data.meta.image:n.dirname(t.url.replace(this.baseUrl,""))+"/"+t.data.meta.image,this.add(a,r,h,function(r){function i(e,i){for(var n=e;n-e<i&&n<l.length;){var o=l[n],a=u[o].frame;if(a){var h=null,d=null,p=new s.Rectangle(0,0,u[o].sourceSize.w/c,u[o].sourceSize.h/c);h=u[o].rotated?new s.Rectangle(a.x/c,a.y/c,a.h/c,a.w/c):new s.Rectangle(a.x/c,a.y/c,a.w/c,a.h/c),u[o].trimmed&&(d=new s.Rectangle(u[o].spriteSourceSize.x/c,u[o].spriteSourceSize.y/c,u[o].spriteSourceSize.w/c,u[o].spriteSourceSize.h/c)),t.textures[o]=new s.Texture(r.texture.baseTexture,h,p,d,u[o].rotated?2:0),s.utils.TextureCache[o]=t.textures[o]}n++}}function n(){return d*o<l.length}function a(t){i(d*o,o),d++,setTimeout(t,0)}function h(){a(function(){n()?h():e()})}t.textures={};var u=t.data.frames,l=Object.keys(u),c=s.utils.getResolutionOfUrl(t.url),d=0;l.length<=o?(i(0,o),e()):h()})}}},{"../core":97,path:60,"resource-loader":69}],186:[function(t,e,r){var i=t("../core");e.exports=function(){return function(t,e){if(t.data&&t.isImage){var r=new i.BaseTexture(t.data,null,i.utils.getResolutionOfUrl(t.url));r.imageUrl=t.url,t.texture=new i.Texture(r),i.utils.BaseTextureCache[t.url]=r,i.utils.TextureCache[t.url]=t.texture}e()}}},{"../core":97}],187:[function(t,e,r){function i(t,e,r,s,o){n.Container.call(this),this._texture=null,this.uvs=r||new Float32Array([0,0,1,0,1,1,0,1]),this.vertices=e||new Float32Array([0,0,100,0,100,100,0,100]),this.indices=s||new Uint16Array([0,1,3,2]),this.dirty=0,this.indexDirty=0,this.blendMode=n.BLEND_MODES.NORMAL,this.canvasPadding=0,this.drawMode=o||i.DRAW_MODES.TRIANGLE_MESH,this.texture=t,this.shader=null,this.tintRgb=new Float32Array([1,1,1]),this._glDatas=[]}var n=t("../core"),s=t("pixi-gl-core"),o=t("./webgl/MeshShader"),a=new n.Point,h=new n.Polygon;i.prototype=Object.create(n.Container.prototype),i.prototype.constructor=i,e.exports=i,Object.defineProperties(i.prototype,{texture:{get:function(){return this._texture},set:function(t){this._texture!==t&&(this._texture=t,t&&(t.baseTexture.hasLoaded?this._onTextureUpdate():t.once("update",this._onTextureUpdate,this)))}},tint:{get:function(){return n.utils.rgb2hex(this.tintRgb)},set:function(t){this.tintRgb=n.utils.hex2rgb(t,this.tintRgb)}}}),i.prototype._renderWebGL=function(t){t.flush();var e=t.gl,r=this._glDatas[t.CONTEXT_UID];r||(r={shader:new o(e),vertexBuffer:s.GLBuffer.createVertexBuffer(e,this.vertices,e.STREAM_DRAW),uvBuffer:s.GLBuffer.createVertexBuffer(e,this.uvs,e.STREAM_DRAW),indexBuffer:s.GLBuffer.createIndexBuffer(e,this.indices,e.STATIC_DRAW),vao:new s.VertexArrayObject(e),dirty:this.dirty,indexDirty:this.indexDirty},r.vao=new s.VertexArrayObject(e).addIndex(r.indexBuffer).addAttribute(r.vertexBuffer,r.shader.attributes.aVertexPosition,e.FLOAT,!1,8,0).addAttribute(r.uvBuffer,r.shader.attributes.aTextureCoord,e.FLOAT,!1,8,0),this._glDatas[t.CONTEXT_UID]=r),this.dirty!==r.dirty&&(r.dirty=this.dirty,r.uvBuffer.upload()),this.indexDirty!==r.indexDirty&&(r.indexDirty=this.indexDirty,r.indexBuffer.upload()),r.vertexBuffer.upload(),t.bindShader(r.shader),t.bindTexture(this._texture,0),t.state.setBlendMode(this.blendMode),r.shader.uniforms.translationMatrix=this.worldTransform.toArray(!0),r.shader.uniforms.alpha=this.worldAlpha,r.shader.uniforms.tint=this.tintRgb;var n=this.drawMode===i.DRAW_MODES.TRIANGLE_MESH?e.TRIANGLE_STRIP:e.TRIANGLES;r.vao.bind().draw(n,this.indices.length).unbind()},i.prototype._renderCanvas=function(t){var e=t.context,r=this.worldTransform,n=t.resolution;t.roundPixels?e.setTransform(r.a*n,r.b*n,r.c*n,r.d*n,r.tx*n|0,r.ty*n|0):e.setTransform(r.a*n,r.b*n,r.c*n,r.d*n,r.tx*n,r.ty*n),this.drawMode===i.DRAW_MODES.TRIANGLE_MESH?this._renderCanvasTriangleMesh(e):this._renderCanvasTriangles(e)},i.prototype._renderCanvasTriangleMesh=function(t){for(var e=this.vertices,r=this.uvs,i=e.length/2,n=0;n<i-2;n++){var s=2*n;this._renderCanvasDrawTriangle(t,e,r,s,s+2,s+4)}},i.prototype._renderCanvasTriangles=function(t){for(var e=this.vertices,r=this.uvs,i=this.indices,n=i.length,s=0;s<n;s+=3){var o=2*i[s],a=2*i[s+1],h=2*i[s+2];this._renderCanvasDrawTriangle(t,e,r,o,a,h)}},i.prototype._renderCanvasDrawTriangle=function(t,e,r,i,n,s){var o=this._texture.baseTexture,a=o.source,h=o.width,u=o.height,l=e[i],c=e[n],d=e[s],p=e[i+1],f=e[n+1],v=e[s+1],g=r[i]*o.width,y=r[n]*o.width,x=r[s]*o.width,m=r[i+1]*o.height,_=r[n+1]*o.height,b=r[s+1]*o.height;if(this.canvasPadding>0){var T=this.canvasPadding/this.worldTransform.a,E=this.canvasPadding/this.worldTransform.d,w=(l+c+d)/3,S=(p+f+v)/3,A=l-w,M=p-S,R=Math.sqrt(A*A+M*M);l=w+A/R*(R+T),p=S+M/R*(R+E),A=c-w,M=f-S,R=Math.sqrt(A*A+M*M),c=w+A/R*(R+T),f=S+M/R*(R+E),A=d-w,M=v-S,R=Math.sqrt(A*A+M*M),d=w+A/R*(R+T),v=S+M/R*(R+E)}t.save(),t.beginPath(),t.moveTo(l,p),t.lineTo(c,f),t.lineTo(d,v),t.closePath(),t.clip();var C=g*_+m*x+y*b-_*x-m*y-g*b,O=l*_+m*d+c*b-_*d-m*c-l*b,D=g*c+l*x+y*d-c*x-l*y-g*d,P=g*_*d+m*c*x+l*y*b-l*_*x-m*y*d-g*c*b,I=p*_+m*v+f*b-_*v-m*f-p*b,L=g*f+p*x+y*v-f*x-p*y-g*v,F=g*_*v+m*f*x+p*y*b-p*_*x-m*y*v-g*f*b;t.transform(O/C,I/C,D/C,L/C,P/C,F/C),t.drawImage(a,0,0,h*o.resolution,u*o.resolution,0,0,h,u),t.restore()},i.prototype.renderMeshFlat=function(t){var e=this.context,r=t.vertices,i=r.length/2;e.beginPath();for(var n=1;n<i-2;n++){var s=2*n,o=r[s],a=r[s+2],h=r[s+4],u=r[s+1],l=r[s+3],c=r[s+5];e.moveTo(o,u),e.lineTo(a,l),e.lineTo(h,c)}e.fillStyle="#FF0000",e.fill(),e.closePath()},i.prototype._onTextureUpdate=function(){},i.prototype._calculateBounds=function(){this._bounds.addVertices(this.transform,this.vertices,0,this.vertices.length)},i.prototype.containsPoint=function(t){if(!this.getBounds().contains(t.x,t.y))return!1;this.worldTransform.applyInverse(t,a);for(var e=this.vertices,r=h.points,n=this.indices,s=this.indices.length,o=this.drawMode===i.DRAW_MODES.TRIANGLES?3:1,u=0;u+2<s;u+=o){var l=2*n[u],c=2*n[u+1],d=2*n[u+2];if(r[0]=e[l],r[1]=e[l+1],r[2]=e[c],r[3]=e[c+1],r[4]=e[d],r[5]=e[d+1],h.contains(a.x,a.y))return!0}return!1},i.DRAW_MODES={TRIANGLE_MESH:0,TRIANGLES:1}},{"../core":97,"./webgl/MeshShader":192,"pixi-gl-core":7}],188:[function(t,e,r){function i(t,e,r,i,o){s.call(this,t,4,4);var a=this.uvs;a[6]=a[14]=a[22]=a[30]=1,a[25]=a[27]=a[29]=a[31]=1,this._origWidth=t.width,this._origHeight=t.height,this._uvw=1/this._origWidth,this._uvh=1/this._origHeight,this.width=t.width,this.height=t.height,a[2]=a[10]=a[18]=a[26]=this._uvw*e,a[4]=a[12]=a[20]=a[28]=1-this._uvw*i,a[9]=a[11]=a[13]=a[15]=this._uvh*r,a[17]=a[19]=a[21]=a[23]=1-this._uvh*o,this.leftWidth="undefined"!=typeof e?e:n,this.rightWidth="undefined"!=typeof i?i:n,this.topHeight="undefined"!=typeof r?r:n,this.bottomHeight="undefined"!=typeof o?o:n}var n=10,s=t("./Plane");i.prototype=Object.create(s.prototype),i.prototype.constructor=i,e.exports=i,Object.defineProperties(i.prototype,{width:{get:function(){return this._width},set:function(t){this._width=t,this.updateVerticalVertices()}},height:{get:function(){return this._height},set:function(t){this._height=t,this.updateHorizontalVertices()}},leftWidth:{get:function(){return this._leftWidth},set:function(t){this._leftWidth=t;var e=this.uvs,r=this.vertices;e[2]=e[10]=e[18]=e[26]=this._uvw*t,r[2]=r[10]=r[18]=r[26]=t,this.dirty=!0}},rightWidth:{get:function(){return this._rightWidth},set:function(t){this._rightWidth=t;var e=this.uvs,r=this.vertices;e[4]=e[12]=e[20]=e[28]=1-this._uvw*t,r[4]=r[12]=r[20]=r[28]=this._width-t,this.dirty=!0}},topHeight:{get:function(){return this._topHeight},set:function(t){this._topHeight=t;var e=this.uvs,r=this.vertices;e[9]=e[11]=e[13]=e[15]=this._uvh*t,r[9]=r[11]=r[13]=r[15]=t,this.dirty=!0}},bottomHeight:{get:function(){return this._bottomHeight},set:function(t){this._bottomHeight=t;var e=this.uvs,r=this.vertices;e[17]=e[19]=e[21]=e[23]=1-this._uvh*t,r[17]=r[19]=r[21]=r[23]=this._height-t,this.dirty=!0}}}),i.prototype.updateHorizontalVertices=function(){var t=this.vertices;t[9]=t[11]=t[13]=t[15]=this._topHeight,t[17]=t[19]=t[21]=t[23]=this._height-this._bottomHeight,t[25]=t[27]=t[29]=t[31]=this._height},i.prototype.updateVerticalVertices=function(){var t=this.vertices;t[2]=t[10]=t[18]=t[26]=this._leftWidth,t[4]=t[12]=t[20]=t[28]=this._width-this._rightWidth,t[6]=t[14]=t[22]=t[30]=this._width},i.prototype._renderCanvas=function(t){var e=t.context;e.globalAlpha=this.worldAlpha;var r=this.worldTransform,i=t.resolution;t.roundPixels?e.setTransform(r.a*i,r.b*i,r.c*i,r.d*i,r.tx*i|0,r.ty*i|0):e.setTransform(r.a*i,r.b*i,r.c*i,r.d*i,r.tx*i,r.ty*i);var n=this._texture.baseTexture,s=n.source,o=n.width,a=n.height;this.drawSegment(e,s,o,a,0,1,10,11),this.drawSegment(e,s,o,a,2,3,12,13),this.drawSegment(e,s,o,a,4,5,14,15),this.drawSegment(e,s,o,a,8,9,18,19),this.drawSegment(e,s,o,a,10,11,20,21),this.drawSegment(e,s,o,a,12,13,22,23),this.drawSegment(e,s,o,a,16,17,26,27),this.drawSegment(e,s,o,a,18,19,28,29),this.drawSegment(e,s,o,a,20,21,30,31)},i.prototype.drawSegment=function(t,e,r,i,n,s,o,a){var h=this.uvs,u=this.vertices,l=(h[o]-h[n])*r,c=(h[a]-h[s])*i,d=u[o]-u[n],p=u[a]-u[s];l<1&&(l=1),c<1&&(c=1),d<1&&(d=1),p<1&&(p=1),t.drawImage(e,h[n]*r,h[s]*i,l,c,u[n],u[s],d,p)}},{"./Plane":189}],189:[function(t,e,r){function i(t,e,r){n.call(this,t),this._ready=!0,this.verticesX=e||10,this.verticesY=r||10,this.drawMode=n.DRAW_MODES.TRIANGLES,this.refresh()}var n=t("./Mesh");i.prototype=Object.create(n.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.refresh=function(){var t=this.verticesX*this.verticesY,e=[],r=[],i=[],n=[],s=this.texture,o=this.verticesX-1,a=this.verticesY-1,h=0,u=s.width/o,l=s.height/a;for(h=0;h<t;h++){var c=h%this.verticesX,d=h/this.verticesX|0;e.push(c*u,d*l),i.push(s._uvs.x0+(s._uvs.x1-s._uvs.x0)*(c/(this.verticesX-1)),s._uvs.y0+(s._uvs.y3-s._uvs.y0)*(d/(this.verticesY-1)))}var p=o*a;for(h=0;h<p;h++){var f=h%o,v=h/o|0,g=v*this.verticesX+f,y=v*this.verticesX+f+1,x=(v+1)*this.verticesX+f,m=(v+1)*this.verticesX+f+1;n.push(g,y,x),n.push(y,m,x)}this.vertices=new Float32Array(e),this.uvs=new Float32Array(i),this.colors=new Float32Array(r),this.indices=new Uint16Array(n),this.indexDirty=!0},i.prototype._onTextureUpdate=function(){n.prototype._onTextureUpdate.call(this),this._ready&&this.refresh()}},{"./Mesh":187}],190:[function(t,e,r){function i(t,e){n.call(this,t),this.points=e,this.vertices=new Float32Array(4*e.length),this.uvs=new Float32Array(4*e.length),this.colors=new Float32Array(2*e.length),this.indices=new Uint16Array(2*e.length),this._ready=!0,this.refresh()}var n=t("./Mesh"),s=t("../core");i.prototype=Object.create(n.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.refresh=function(){var t=this.points;if(!(t.length<1)&&this._texture._uvs){var e=this.uvs,r=this.indices,i=this.colors,n=this._texture._uvs,o=new s.Point(n.x0,n.y0),a=new s.Point(n.x2-n.x0,n.y2-n.y0);e[0]=0+o.x,e[1]=0+o.y,e[2]=0+o.x,e[3]=1*a.y+o.y,i[0]=1,i[1]=1,r[0]=0,r[1]=1;for(var h,u,l,c=t.length,d=1;d<c;d++)h=t[d],u=4*d,l=d/(c-1),e[u]=l*a.x+o.x,e[u+1]=0+o.y,e[u+2]=l*a.x+o.x,e[u+3]=1*a.y+o.y,u=2*d,i[u]=1,i[u+1]=1,u=2*d,r[u]=u,r[u+1]=u+1;this.dirty=!0,this.indexDirty=!0}},i.prototype._onTextureUpdate=function(){n.prototype._onTextureUpdate.call(this),this._ready&&this.refresh()},i.prototype.updateTransform=function(){var t=this.points;if(!(t.length<1)){for(var e,r,i,n,s,o,a=t[0],h=0,u=0,l=this.vertices,c=t.length,d=0;d<c;d++)r=t[d],i=4*d,e=d<t.length-1?t[d+1]:r,u=-(e.x-a.x),h=e.y-a.y,n=10*(1-d/(c-1)),n>1&&(n=1),s=Math.sqrt(h*h+u*u),o=this._texture.height/2,h/=s,u/=s,h*=o,u*=o,l[i]=r.x+h,l[i+1]=r.y+u,l[i+2]=r.x-h,l[i+3]=r.y-u,a=r;this.containerUpdateTransform()}}},{"../core":97,"./Mesh":187}],191:[function(t,e,r){e.exports={Mesh:t("./Mesh"),Plane:t("./Plane"),NineSlicePlane:t("./NineSlicePlane"),Rope:t("./Rope"),MeshShader:t("./webgl/MeshShader")}},{"./Mesh":187,"./NineSlicePlane":188,"./Plane":189,"./Rope":190,"./webgl/MeshShader":192}],192:[function(t,e,r){function i(t){n.call(this,t,["attribute vec2 aVertexPosition;","attribute vec2 aTextureCoord;","uniform mat3 translationMatrix;","uniform mat3 projectionMatrix;","varying vec2 vTextureCoord;","void main(void){","   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);","   vTextureCoord = aTextureCoord;","}"].join("\n"),["varying vec2 vTextureCoord;","uniform float alpha;","uniform vec3 tint;","uniform sampler2D uSampler;","void main(void){","   gl_FragColor = texture2D(uSampler, vTextureCoord) * vec4(tint * alpha, alpha);","}"].join("\n"))}var n=t("../../core/Shader");i.prototype=Object.create(n.prototype),i.prototype.constructor=i,e.exports=i},{"../../core/Shader":77}],193:[function(t,e,r){function i(t,e,r){n.Container.call(this),r=r||15e3,t=t||15e3;var i=16384;r>i&&(r=i),r>t&&(r=t),this._properties=[!1,!0,!1,!1,!1],this._maxSize=t,this._batchSize=r,this._glBuffers=[],this._bufferToUpdate=0,this.interactiveChildren=!1,this.blendMode=n.BLEND_MODES.NORMAL,this.roundPixels=!0,this.baseTexture=null,this.setProperties(e)}var n=t("../core");i.prototype=Object.create(n.Container.prototype),i.prototype.constructor=i,e.exports=i,i.prototype.setProperties=function(t){t&&(this._properties[0]="scale"in t?!!t.scale:this._properties[0],this._properties[1]="position"in t?!!t.position:this._properties[1],this._properties[2]="rotation"in t?!!t.rotation:this._properties[2],this._properties[3]="uvs"in t?!!t.uvs:this._properties[3],this._properties[4]="alpha"in t?!!t.alpha:this._properties[4])},i.prototype.updateTransform=function(){this.displayObjectUpdateTransform()},i.prototype.renderWebGL=function(t){this.visible&&!(this.worldAlpha<=0)&&this.children.length&&this.renderable&&(this.baseTexture||(this.baseTexture=this.children[0]._texture.baseTexture,this.baseTexture.hasLoaded||this.baseTexture.once("update",function(){this.onChildrenChange(0)},this)),t.setObjectRenderer(t.plugins.particle),t.plugins.particle.render(this))},i.prototype.onChildrenChange=function(t){var e=Math.floor(t/this._batchSize);e<this._bufferToUpdate&&(this._bufferToUpdate=e)},i.prototype.renderCanvas=function(t){if(this.visible&&!(this.worldAlpha<=0)&&this.children.length&&this.renderable){var e=t.context,r=this.worldTransform,i=!0,n=0,s=0,o=0,a=0,h=t.blendModes[this.blendMode];h!==e.globalCompositeOperation&&(e.globalCompositeOperation=h),e.globalAlpha=this.worldAlpha,this.displayObjectUpdateTransform();for(var u=0;u<this.children.length;++u){var l=this.children[u];if(l.visible){var c=l.texture.frame;if(e.globalAlpha=this.worldAlpha*l.alpha,l.rotation%(2*Math.PI)===0)i&&(e.setTransform(r.a,r.b,r.c,r.d,r.tx*t.resolution,r.ty*t.resolution),i=!1),n=l.anchor.x*(-c.width*l.scale.x)+l.position.x+.5,s=l.anchor.y*(-c.height*l.scale.y)+l.position.y+.5,o=c.width*l.scale.x,a=c.height*l.scale.y;else{i||(i=!0),l.displayObjectUpdateTransform();var d=l.worldTransform;t.roundPixels?e.setTransform(d.a,d.b,d.c,d.d,d.tx*t.resolution|0,d.ty*t.resolution|0):e.setTransform(d.a,d.b,d.c,d.d,d.tx*t.resolution,d.ty*t.resolution),n=l.anchor.x*-c.width+.5,s=l.anchor.y*-c.height+.5,o=c.width,a=c.height}var p=l.texture.baseTexture.resolution;e.drawImage(l.texture.baseTexture.source,c.x*p,c.y*p,c.width*p,c.height*p,n*p,s*p,o*p,a*p)}}}},i.prototype.destroy=function(){if(n.Container.prototype.destroy.apply(this,arguments),this._buffers)for(var t=0;t<this._buffers.length;++t)this._buffers[t].destroy();this._properties=null,this._buffers=null}},{"../core":97}],194:[function(t,e,r){e.exports={ParticleContainer:t("./ParticleContainer"),ParticleRenderer:t("./webgl/ParticleRenderer")}},{"./ParticleContainer":193,"./webgl/ParticleRenderer":196}],195:[function(t,e,r){function i(t,e,r,i){this.gl=t,this.vertSize=2,this.vertByteSize=4*this.vertSize,this.size=i,this.dynamicProperties=[],this.staticProperties=[];for(var n=0;n<e.length;n++){var s=e[n];s={attribute:s.attribute,size:s.size,uploadFunction:s.uploadFunction,offset:s.offset},r[n]?this.dynamicProperties.push(s):this.staticProperties.push(s)}this.staticStride=0,this.staticBuffer=null,this.staticData=null,this.dynamicStride=0,this.dynamicBuffer=null,this.dynamicData=null,this.initBuffers()}var n=t("pixi-gl-core"),s=t("../../core/utils/createIndicesForQuads");i.prototype.constructor=i,e.exports=i,i.prototype.initBuffers=function(){var t,e,r=this.gl,i=0;for(this.indices=s(this.size),this.indexBuffer=n.GLBuffer.createIndexBuffer(r,this.indices,r.STATIC_DRAW),this.dynamicStride=0,t=0;t<this.dynamicProperties.length;t++)e=this.dynamicProperties[t],e.offset=i,i+=e.size,this.dynamicStride+=e.size;this.dynamicData=new Float32Array(this.size*this.dynamicStride*4),this.dynamicBuffer=n.GLBuffer.createVertexBuffer(r,this.dynamicData,r.STREAM_DRAW);var o=0;for(this.staticStride=0,t=0;t<this.staticProperties.length;t++)e=this.staticProperties[t],e.offset=o,o+=e.size,this.staticStride+=e.size;for(this.staticData=new Float32Array(this.size*this.staticStride*4),this.staticBuffer=n.GLBuffer.createVertexBuffer(r,this.staticData,r.STATIC_DRAW),this.vao=new n.VertexArrayObject(r).addIndex(this.indexBuffer),t=0;t<this.dynamicProperties.length;t++)e=this.dynamicProperties[t],this.vao.addAttribute(this.dynamicBuffer,e.attribute,r.FLOAT,!1,4*this.dynamicStride,4*e.offset);for(t=0;t<this.staticProperties.length;t++)e=this.staticProperties[t],this.vao.addAttribute(this.staticBuffer,e.attribute,r.FLOAT,!1,4*this.staticStride,4*e.offset)},i.prototype.uploadDynamic=function(t,e,r){for(var i=0;i<this.dynamicProperties.length;i++){var n=this.dynamicProperties[i];n.uploadFunction(t,e,r,this.dynamicData,this.dynamicStride,n.offset)}this.dynamicBuffer.upload()},i.prototype.uploadStatic=function(t,e,r){for(var i=0;i<this.staticProperties.length;i++){var n=this.staticProperties[i];n.uploadFunction(t,e,r,this.staticData,this.staticStride,n.offset)}this.staticBuffer.upload()},i.prototype.bind=function(){this.vao.bind()},i.prototype.destroy=function(){this.dynamicProperties=null,this.dynamicData=null,this.dynamicBuffer.destroy(),this.staticProperties=null,this.staticData=null,this.staticBuffer.destroy()}},{"../../core/utils/createIndicesForQuads":149,"pixi-gl-core":7}],196:[function(t,e,r){function i(t){n.ObjectRenderer.call(this,t),this.shader=null,this.indexBuffer=null,this.properties=null,this.tempMatrix=new n.Matrix,this.CONTEXT_UID=0}var n=t("../../core"),s=t("./ParticleShader"),o=t("./ParticleBuffer");i.prototype=Object.create(n.ObjectRenderer.prototype),i.prototype.constructor=i,e.exports=i,n.WebGLRenderer.registerPlugin("particle",i),i.prototype.onContextChange=function(){var t=this.renderer.gl;this.CONTEXT_UID=this.renderer.CONTEXT_UID,this.shader=new s(t),this.properties=[{attribute:this.shader.attributes.aVertexPosition,size:2,uploadFunction:this.uploadVertices,offset:0},{attribute:this.shader.attributes.aPositionCoord,size:2,uploadFunction:this.uploadPosition,offset:0},{attribute:this.shader.attributes.aRotation,size:1,uploadFunction:this.uploadRotation,offset:0},{attribute:this.shader.attributes.aTextureCoord,size:2,uploadFunction:this.uploadUvs,offset:0},{attribute:this.shader.attributes.aColor,size:1,uploadFunction:this.uploadAlpha,offset:0}]},i.prototype.start=function(){this.renderer.bindShader(this.shader)},i.prototype.render=function(t){var e=t.children,r=e.length,i=t._maxSize,n=t._batchSize;if(0!==r){r>i&&(r=i);var s=t._glBuffers[this.renderer.CONTEXT_UID];s||(s=t._glBuffers[this.renderer.CONTEXT_UID]=this.generateBuffers(t)),this.renderer.setBlendMode(t.blendMode);var o=this.renderer.gl,a=t.worldTransform.copy(this.tempMatrix);a.prepend(this.renderer._activeRenderTarget.projectionMatrix),this.shader.uniforms.projectionMatrix=a.toArray(!0),this.shader.uniforms.uAlpha=t.worldAlpha;
var h=e[0]._texture.baseTexture;this.renderer.bindTexture(h);for(var u=0,l=0;u<r;u+=n,l+=1){var c=r-u;c>n&&(c=n);var d=s[l];d.uploadDynamic(e,u,c),t._bufferToUpdate===l&&(d.uploadStatic(e,u,c),t._bufferToUpdate=l+1),d.vao.bind().draw(o.TRIANGLES,6*c).unbind()}}},i.prototype.generateBuffers=function(t){var e,r=this.renderer.gl,i=[],n=t._maxSize,s=t._batchSize,a=t._properties;for(e=0;e<n;e+=s)i.push(new o(r,this.properties,a,s));return i},i.prototype.uploadVertices=function(t,e,r,i,n,s){for(var o,a,h,u,l,c,d,p,f,v,g=0;g<r;g++)o=t[e+g],a=o._texture,l=o.scale.x,c=o.scale.y,h=a.trim,u=a.orig,h?(p=h.x-o.anchor.x*u.width,d=p+h.width,v=h.y-o.anchor.y*u.height,f=v+h.height):(d=u.width*(1-o.anchor.x),p=u.width*-o.anchor.x,f=u.height*(1-o.anchor.y),v=u.height*-o.anchor.y),i[s]=p*l,i[s+1]=v*c,i[s+n]=d*l,i[s+n+1]=v*c,i[s+2*n]=d*l,i[s+2*n+1]=f*c,i[s+3*n]=p*l,i[s+3*n+1]=f*c,s+=4*n},i.prototype.uploadPosition=function(t,e,r,i,n,s){for(var o=0;o<r;o++){var a=t[e+o].position;i[s]=a.x,i[s+1]=a.y,i[s+n]=a.x,i[s+n+1]=a.y,i[s+2*n]=a.x,i[s+2*n+1]=a.y,i[s+3*n]=a.x,i[s+3*n+1]=a.y,s+=4*n}},i.prototype.uploadRotation=function(t,e,r,i,n,s){for(var o=0;o<r;o++){var a=t[e+o].rotation;i[s]=a,i[s+n]=a,i[s+2*n]=a,i[s+3*n]=a,s+=4*n}},i.prototype.uploadUvs=function(t,e,r,i,n,s){for(var o=0;o<r;o++){var a=t[e+o]._texture._uvs;a?(i[s]=a.x0,i[s+1]=a.y0,i[s+n]=a.x1,i[s+n+1]=a.y1,i[s+2*n]=a.x2,i[s+2*n+1]=a.y2,i[s+3*n]=a.x3,i[s+3*n+1]=a.y3,s+=4*n):(i[s]=0,i[s+1]=0,i[s+n]=0,i[s+n+1]=0,i[s+2*n]=0,i[s+2*n+1]=0,i[s+3*n]=0,i[s+3*n+1]=0,s+=4*n)}},i.prototype.uploadAlpha=function(t,e,r,i,n,s){for(var o=0;o<r;o++){var a=t[e+o].alpha;i[s]=a,i[s+n]=a,i[s+2*n]=a,i[s+3*n]=a,s+=4*n}},i.prototype.destroy=function(){this.renderer.gl&&this.renderer.gl.deleteBuffer(this.indexBuffer),n.ObjectRenderer.prototype.destroy.apply(this,arguments),this.shader.destroy(),this.indices=null,this.tempMatrix=null}},{"../../core":97,"./ParticleBuffer":195,"./ParticleShader":197}],197:[function(t,e,r){function i(t){n.call(this,t,["attribute vec2 aVertexPosition;","attribute vec2 aTextureCoord;","attribute float aColor;","attribute vec2 aPositionCoord;","attribute vec2 aScale;","attribute float aRotation;","uniform mat3 projectionMatrix;","varying vec2 vTextureCoord;","varying float vColor;","void main(void){","   vec2 v = aVertexPosition;","   v.x = (aVertexPosition.x) * cos(aRotation) - (aVertexPosition.y) * sin(aRotation);","   v.y = (aVertexPosition.x) * sin(aRotation) + (aVertexPosition.y) * cos(aRotation);","   v = v + aPositionCoord;","   gl_Position = vec4((projectionMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);","   vTextureCoord = aTextureCoord;","   vColor = aColor;","}"].join("\n"),["varying vec2 vTextureCoord;","varying float vColor;","uniform sampler2D uSampler;","uniform float uAlpha;","void main(void){","  vec4 color = texture2D(uSampler, vTextureCoord) * vColor * uAlpha;","  if (color.a == 0.0) discard;","  gl_FragColor = color;","}"].join("\n"))}var n=t("../../core/Shader");i.prototype=Object.create(n.prototype),i.prototype.constructor=i,e.exports=i},{"../../core/Shader":77}],198:[function(t,e,r){Math.sign||(Math.sign=function(t){return t=+t,0===t||isNaN(t)?t:t>0?1:-1})},{}],199:[function(t,e,r){Object.assign||(Object.assign=t("object-assign"))},{"object-assign":59}],200:[function(t,e,r){t("./Object.assign"),t("./requestAnimationFrame"),t("./Math.sign"),window.ArrayBuffer||(window.ArrayBuffer=Array),window.Float32Array||(window.Float32Array=Array),window.Uint32Array||(window.Uint32Array=Array),window.Uint16Array||(window.Uint16Array=Array)},{"./Math.sign":198,"./Object.assign":199,"./requestAnimationFrame":201}],201:[function(t,e,r){(function(t){if(Date.now&&Date.prototype.getTime||(Date.now=function(){return(new Date).getTime()}),!t.performance||!t.performance.now){var e=Date.now();t.performance||(t.performance={}),t.performance.now=function(){return Date.now()-e}}for(var r=Date.now(),i=["ms","moz","webkit","o"],n=0;n<i.length&&!t.requestAnimationFrame;++n)t.requestAnimationFrame=t[i[n]+"RequestAnimationFrame"],t.cancelAnimationFrame=t[i[n]+"CancelAnimationFrame"]||t[i[n]+"CancelRequestAnimationFrame"];t.requestAnimationFrame||(t.requestAnimationFrame=function(t){if("function"!=typeof t)throw new TypeError(t+"is not a function");var e=Date.now(),i=16+r-e;return i<0&&(i=0),r=e,setTimeout(function(){r=Date.now(),t(performance.now())},i)}),t.cancelAnimationFrame||(t.cancelAnimationFrame=function(t){clearTimeout(t)})}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],202:[function(t,e,r){function i(){}var n=t("../../core");i.prototype.constructor=i,e.exports=i,i.prototype.upload=function(t,e){"function"==typeof t&&(e=t,t=null),e()},i.prototype.register=function(){return this},i.prototype.add=function(){return this},i.prototype.destroy=function(){},n.CanvasRenderer.registerPlugin("prepare",i)},{"../../core":97}],203:[function(t,e,r){e.exports={webGL:t("./webgl/WebGLPrepare"),canvas:t("./canvas/CanvasPrepare")}},{"./canvas/CanvasPrepare":202,"./webgl/WebGLPrepare":204}],204:[function(t,e,r){function i(t){this.renderer=t,this.queue=[],this.addHooks=[],this.uploadHooks=[],this.completes=[],this.ticking=!1,this.register(o,n).register(a,s)}function n(t,e){return e instanceof h.BaseTexture&&(t.textureManager.updateTexture(e),!0)}function s(t,e){return e instanceof h.Graphics&&(t.plugins.graphics.updateGraphics(e),!0)}function o(t,e){if(t instanceof h.BaseTexture)return e.indexOf(t)===-1&&e.push(t),!0;if(t._texture&&t._texture instanceof h.Texture){var r=t._texture.baseTexture;return e.indexOf(r)===-1&&e.push(r),!0}return!1}function a(t,e){return t instanceof h.Graphics&&(e.push(t),!0)}var h=t("../../core"),u=h.ticker.shared;i.UPLOADS_PER_FRAME=4,i.prototype.constructor=i,e.exports=i,i.prototype.upload=function(t,e){"function"==typeof t&&(e=t,t=null),t&&this.add(t),this.queue.length?(this.numLeft=i.UPLOADS_PER_FRAME,this.completes.push(e),this.ticking||(this.ticking=!0,u.add(this.tick,this))):e()},i.prototype.tick=function(){for(var t,e;this.queue.length&&this.numLeft>0;){var r=this.queue[0],n=!1;for(t=0,e=this.uploadHooks.length;t<e;t++)if(this.uploadHooks[t](this.renderer,r)){this.numLeft--,this.queue.shift(),n=!0;break}n||this.queue.shift()}if(this.queue.length)this.numLeft=i.UPLOADS_PER_FRAME;else{this.ticking=!1,u.remove(this.tick,this);var s=this.completes.slice(0);for(this.completes.length=0,t=0,e=s.length;t<e;t++)s[t]()}},i.prototype.register=function(t,e){return t&&this.addHooks.push(t),e&&this.uploadHooks.push(e),this},i.prototype.add=function(t){var e,r;for(e=0,r=this.addHooks.length;e<r&&!this.addHooks[e](t,this.queue);e++);if(t instanceof h.Container)for(e=t.children.length-1;e>=0;e--)this.add(t.children[e]);return this},i.prototype.destroy=function(){this.ticking&&u.remove(this.tick,this),this.ticking=!1,this.addHooks=null,this.uploadHooks=null,this.renderer=null,this.completes=null,this.queue=null},h.WebGLRenderer.registerPlugin("prepare",i)},{"../../core":97}],205:[function(t,e,r){(function(r){t("./polyfill");var i=e.exports=t("./core");i.extras=t("./extras"),i.filters=t("./filters"),i.interaction=t("./interaction"),i.loaders=t("./loaders"),i.mesh=t("./mesh"),i.particles=t("./particles"),i.accessibility=t("./accessibility"),i.extract=t("./extract"),i.prepare=t("./prepare"),i.loader=new i.loaders.Loader,r.PIXI=i}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./accessibility":76,"./core":97,"./deprecation":154,"./extract":156,"./extras":164,"./filters":175,"./interaction":180,"./loaders":183,"./mesh":191,"./particles":194,"./polyfill":200,"./prepare":203}]},{},[205])(205)});
//# sourceMappingURL=pixi.min.js.map
// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
  "use strict";

  // This file will function properly as a <script> tag, or a module
  // using CommonJS and NodeJS or RequireJS module formats.  In
  // Common/Node/RequireJS, the module exports the Q API and when
  // executed as a simple <script>, it creates a Q global instead.

  // Montage Require
  if (typeof bootstrap === "function") {
    bootstrap("promise", definition);

// CommonJS
  } else if (typeof exports === "object" && typeof module === "object") {
    module.exports = definition();

// RequireJS
  } else if (typeof define === "function" && define.amd) {
    define(definition);

// SES (Secure EcmaScript)
  } else if (typeof ses !== "undefined") {
    if (!ses.ok()) {
      return;
    } else {
      ses.makeQ = definition;
    }

// <script>
  } else if (typeof window !== "undefined" || typeof self !== "undefined") {
    // Prefer window over self for add-on scripts. Use self for
    // non-windowed contexts.
    var global = typeof window !== "undefined" ? window : self;

    // Get the `window` object, save the previous Q global
    // and initialize Q as a global.
    var previousQ = global.Q;
    global.Q = definition();

    // Add a noConflict function so Q can be removed from the
    // global namespace.
    global.Q.noConflict = function () {
      global.Q = previousQ;
      return this;
    };

  } else {
    throw new Error("This environment was not anticipated by Q. Please file a bug.");
  }

})(function () {
"use strict";

var hasStacks = false;
try {
  throw new Error();
} catch (e) {
  hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
  // linked list of tasks (single, with head node)
  var head = {task: void 0, next: null};
  var tail = head;
  var flushing = false;
  var requestTick = void 0;
  var isNodeJS = false;
  // queue for late tasks, used by unhandled rejection tracking
  var laterQueue = [];

  function flush() {
    /* jshint loopfunc: true */
    var task, domain;

    while (head.next) {
      head = head.next;
      task = head.task;
      head.task = void 0;
      domain = head.domain;

      if (domain) {
        head.domain = void 0;
        domain.enter();
      }
      runSingle(task, domain);

    }
    while (laterQueue.length) {
      task = laterQueue.pop();
      runSingle(task);
    }
    flushing = false;
  }
  // runs a single function in the async queue
  function runSingle(task, domain) {
    try {
      task();

    } catch (e) {
      if (isNodeJS) {
        // In node, uncaught exceptions are considered fatal errors.
        // Re-throw them synchronously to interrupt flushing!

        // Ensure continuation if the uncaught exception is suppressed
        // listening "uncaughtException" events (as domains does).
        // Continue in next event to avoid tick recursion.
        if (domain) {
          domain.exit();
        }
        setTimeout(flush, 0);
        if (domain) {
          domain.enter();
        }

        throw e;

      } else {
        // In browsers, uncaught exceptions are not fatal.
        // Re-throw them asynchronously to avoid slow-downs.
        setTimeout(function () {
          throw e;
        }, 0);
      }
    }

    if (domain) {
      domain.exit();
    }
  }

  nextTick = function (task) {
    tail = tail.next = {
      task: task,
      domain: isNodeJS && process.domain,
      next: null
    };

    if (!flushing) {
      flushing = true;
      requestTick();
    }
  };

  if (typeof process === "object" &&
      process.toString() === "[object process]" && process.nextTick) {
    // Ensure Q is in a real Node environment, with a `process.nextTick`.
    // To see through fake Node environments:
    // * Mocha test runner - exposes a `process` global without a `nextTick`
    // * Browserify - exposes a `process.nexTick` function that uses
    //   `setTimeout`. In this case `setImmediate` is preferred because
    //    it is faster. Browserify's `process.toString()` yields
    //   "[object Object]", while in a real Node environment
    //   `process.nextTick()` yields "[object process]".
    isNodeJS = true;

    requestTick = function () {
      process.nextTick(flush);
    };

  } else if (typeof setImmediate === "function") {
    // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
    if (typeof window !== "undefined") {
      requestTick = setImmediate.bind(window, flush);
    } else {
      requestTick = function () {
        setImmediate(flush);
      };
    }

  } else if (typeof MessageChannel !== "undefined") {
    // modern browsers
    // http://www.nonblocking.io/2011/06/windownexttick.html
    var channel = new MessageChannel();
    // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
    // working message ports the first time a page loads.
    channel.port1.onmessage = function () {
      requestTick = requestPortTick;
      channel.port1.onmessage = flush;
      flush();
    };
    var requestPortTick = function () {
      // Opera requires us to provide a message payload, regardless of
      // whether we use it.
      channel.port2.postMessage(0);
    };
    requestTick = function () {
      setTimeout(flush, 0);
      requestPortTick();
    };

  } else {
    // old browsers
    requestTick = function () {
      setTimeout(flush, 0);
    };
  }
  // runs a task after all other tasks have been run
  // this is useful for unhandled rejection tracking that needs to happen
  // after all `then`d tasks have been run.
  nextTick.runAfter = function (task) {
    laterQueue.push(task);
    if (!flushing) {
      flushing = true;
      requestTick();
    }
  };
  return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this **might** have the nice side-effect of reducing the size of
// the minified code by reducing x.call() to merely x()
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
  return function () {
    return call.apply(f, arguments);
  };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
      var index = 0,
          length = this.length;
      // concerning the initial value, if one is not provided
      if (arguments.length === 1) {
        // seek to the first value in the array, accounting
        // for the possibility that is is a sparse array
        do {
          if (index in this) {
            basis = this[index++];
            break;
          }
          if (++index >= length) {
            throw new TypeError();
          }
        } while (1);
      }
      // reduce
      for (; index < length; index++) {
        // account for the possibility that the array is sparse
        if (index in this) {
          basis = callback(basis, this[index], index);
        }
      }
      return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
      // not a very good shim, but good enough for our one use of it
      for (var i = 0; i < this.length; i++) {
        if (this[i] === value) {
          return i;
        }
      }
      return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
      var self = this;
      var collect = [];
      array_reduce(self, function (undefined, value, index) {
        collect.push(callback.call(thisp, value, index, self));
      }, void 0);
      return collect;
    }
);

var object_create = Object.create || function (prototype) {
  function Type() { }
  Type.prototype = prototype;
  return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
  var keys = [];
  for (var key in object) {
    if (object_hasOwnProperty(object, key)) {
      keys.push(key);
    }
  }
  return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
  return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
  return (
      object_toString(exception) === "[object StopIteration]" ||
      exception instanceof QReturnValue
  );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
  QReturnValue = ReturnValue;
} else {
  QReturnValue = function (value) {
    this.value = value;
  };
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
  // If possible, transform the error stack trace by removing Node and Q
  // cruft, then concatenating with the stack trace of `promise`. See #57.
  if (hasStacks &&
      promise.stack &&
      typeof error === "object" &&
      error !== null &&
      error.stack &&
      error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
  ) {
    var stacks = [];
    for (var p = promise; !!p; p = p.source) {
      if (p.stack) {
        stacks.unshift(p.stack);
      }
    }
    stacks.unshift(error.stack);

    var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
    error.stack = filterStackString(concatedStacks);
  }
}

function filterStackString(stackString) {
  var lines = stackString.split("\n");
  var desiredLines = [];
  for (var i = 0; i < lines.length; ++i) {
    var line = lines[i];

    if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
      desiredLines.push(line);
    }
  }
  return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
  return stackLine.indexOf("(module.js:") !== -1 ||
         stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
  // Named functions: "at functionName (filename:lineNumber:columnNumber)"
  // In IE10 function name can have spaces ("Anonymous function") O_o
  var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
  if (attempt1) {
    return [attempt1[1], Number(attempt1[2])];
  }

  // Anonymous functions: "at filename:lineNumber:columnNumber"
  var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
  if (attempt2) {
    return [attempt2[1], Number(attempt2[2])];
  }

  // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
  var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
  if (attempt3) {
    return [attempt3[1], Number(attempt3[2])];
  }
}

function isInternalFrame(stackLine) {
  var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

  if (!fileNameAndLineNumber) {
    return false;
  }

  var fileName = fileNameAndLineNumber[0];
  var lineNumber = fileNameAndLineNumber[1];

  return fileName === qFileName &&
      lineNumber >= qStartingLine &&
      lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
  if (!hasStacks) {
    return;
  }

  try {
    throw new Error();
  } catch (e) {
    var lines = e.stack.split("\n");
    var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
    var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
    if (!fileNameAndLineNumber) {
      return;
    }

    qFileName = fileNameAndLineNumber[0];
    return fileNameAndLineNumber[1];
  }
}

function deprecate(callback, name, alternative) {
  return function () {
    if (typeof console !== "undefined" &&
        typeof console.warn === "function") {
      console.warn(name + " is deprecated, use " + alternative +
                   " instead.", new Error("").stack);
    }
    return callback.apply(callback, arguments);
  };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
  // If the object is already a Promise, return it directly.  This enables
  // the resolve function to both be used to created references from objects,
  // but to tolerably coerce non-promises to promises.
  if (value instanceof Promise) {
    return value;
  }

  // assimilate thenables
  if (isPromiseAlike(value)) {
    return coerce(value);
  } else {
    return fulfill(value);
  }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

// enable long stacks if Q_DEBUG is set
if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
  Q.longStackSupport = true;
}

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
  // if "messages" is an "Array", that indicates that the promise has not yet
  // been resolved.  If it is "undefined", it has been resolved.  Each
  // element of the messages array is itself an array of complete arguments to
  // forward to the resolved promise.  We coerce the resolution value to a
  // promise using the `resolve` function because it handles both fully
  // non-thenable values and other thenables gracefully.
  var messages = [], progressListeners = [], resolvedPromise;

  var deferred = object_create(defer.prototype);
  var promise = object_create(Promise.prototype);

  promise.promiseDispatch = function (resolve, op, operands) {
    var args = array_slice(arguments);
    if (messages) {
      messages.push(args);
      if (op === "when" && operands[1]) { // progress operand
        progressListeners.push(operands[1]);
      }
    } else {
      Q.nextTick(function () {
        resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
      });
    }
  };

  // XXX deprecated
  promise.valueOf = function () {
    if (messages) {
      return promise;
    }
    var nearerValue = nearer(resolvedPromise);
    if (isPromise(nearerValue)) {
      resolvedPromise = nearerValue; // shorten chain
    }
    return nearerValue;
  };

  promise.inspect = function () {
    if (!resolvedPromise) {
      return { state: "pending" };
    }
    return resolvedPromise.inspect();
  };

  if (Q.longStackSupport && hasStacks) {
    try {
      throw new Error();
    } catch (e) {
      // NOTE: don't try to use `Error.captureStackTrace` or transfer the
      // accessor around; that causes memory leaks as per GH-111. Just
      // reify the stack trace as a string ASAP.
      //
      // At the same time, cut off the first line; it's always just
      // "[object Promise]\n", as per the `toString`.
      promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
    }
  }

  // NOTE: we do the checks for `resolvedPromise` in each method, instead of
  // consolidating them into `become`, since otherwise we'd create new
  // promises with the lines `become(whatever(value))`. See e.g. GH-252.

  function become(newPromise) {
    resolvedPromise = newPromise;
    promise.source = newPromise;

    array_reduce(messages, function (undefined, message) {
      Q.nextTick(function () {
        newPromise.promiseDispatch.apply(newPromise, message);
      });
    }, void 0);

    messages = void 0;
    progressListeners = void 0;
  }

  deferred.promise = promise;
  deferred.resolve = function (value) {
    if (resolvedPromise) {
      return;
    }

    become(Q(value));
  };

  deferred.fulfill = function (value) {
    if (resolvedPromise) {
      return;
    }

    become(fulfill(value));
  };
  deferred.reject = function (reason) {
    if (resolvedPromise) {
      return;
    }

    become(reject(reason));
  };
  deferred.notify = function (progress) {
    if (resolvedPromise) {
      return;
    }

    array_reduce(progressListeners, function (undefined, progressListener) {
      Q.nextTick(function () {
        progressListener(progress);
      });
    }, void 0);
  };

  return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
  var self = this;
  return function (error, value) {
    if (error) {
      self.reject(error);
    } else if (arguments.length > 2) {
      self.resolve(array_slice(arguments, 1));
    } else {
      self.resolve(value);
    }
  };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.Promise = promise; // ES6
Q.promise = promise;
function promise(resolver) {
  if (typeof resolver !== "function") {
    throw new TypeError("resolver must be a function.");
  }
  var deferred = defer();
  try {
    resolver(deferred.resolve, deferred.reject, deferred.notify);
  } catch (reason) {
    deferred.reject(reason);
  }
  return deferred.promise;
}

promise.race = race; // ES6
promise.all = all; // ES6
promise.reject = reject; // ES6
promise.resolve = Q; // ES6

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
  //freeze(object);
  //passByCopies.set(object, true);
  return object;
};

Promise.prototype.passByCopy = function () {
  //freeze(object);
  //passByCopies.set(object, true);
  return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
  return Q(x).join(y);
};

Promise.prototype.join = function (that) {
  return Q([this, that]).spread(function (x, y) {
    if (x === y) {
      // TODO: "===" should be Object.is or equiv
      return x;
    } else {
      throw new Error("Can't join: not the same: " + x + " " + y);
    }
  });
};

/**
 * Returns a promise for the first of an array of promises to become settled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be settled
 */
Q.race = race;
function race(answerPs) {
  return promise(function (resolve, reject) {
    // Switch to this once we can assume at least ES5
    // answerPs.forEach(function (answerP) {
    //     Q(answerP).then(resolve, reject);
    // });
    // Use this in the meantime
    for (var i = 0, len = answerPs.length; i < len; i++) {
      Q(answerPs[i]).then(resolve, reject);
    }
  });
}

Promise.prototype.race = function () {
  return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
  if (fallback === void 0) {
    fallback = function (op) {
      return reject(new Error(
          "Promise does not support operation: " + op
      ));
    };
  }
  if (inspect === void 0) {
    inspect = function () {
      return {state: "unknown"};
    };
  }

  var promise = object_create(Promise.prototype);

  promise.promiseDispatch = function (resolve, op, args) {
    var result;
    try {
      if (descriptor[op]) {
        result = descriptor[op].apply(promise, args);
      } else {
        result = fallback.call(promise, op, args);
      }
    } catch (exception) {
      result = reject(exception);
    }
    if (resolve) {
      resolve(result);
    }
  };

  promise.inspect = inspect;

  // XXX deprecated `valueOf` and `exception` support
  if (inspect) {
    var inspected = inspect();
    if (inspected.state === "rejected") {
      promise.exception = inspected.reason;
    }

    promise.valueOf = function () {
      var inspected = inspect();
      if (inspected.state === "pending" ||
          inspected.state === "rejected") {
        return promise;
      }
      return inspected.value;
    };
  }

  return promise;
}

Promise.prototype.toString = function () {
  return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
  var self = this;
  var deferred = defer();
  var done = false;   // ensure the untrusted promise makes at most a
  // single call to one of the callbacks

  function _fulfilled(value) {
    try {
      return typeof fulfilled === "function" ? fulfilled(value) : value;
    } catch (exception) {
      return reject(exception);
    }
  }

  function _rejected(exception) {
    if (typeof rejected === "function") {
      makeStackTraceLong(exception, self);
      try {
        return rejected(exception);
      } catch (newException) {
        return reject(newException);
      }
    }
    return reject(exception);
  }

  function _progressed(value) {
    return typeof progressed === "function" ? progressed(value) : value;
  }

  Q.nextTick(function () {
    self.promiseDispatch(function (value) {
      if (done) {
        return;
      }
      done = true;

      deferred.resolve(_fulfilled(value));
    }, "when", [function (exception) {
      if (done) {
        return;
      }
      done = true;

      deferred.resolve(_rejected(exception));
    }]);
  });

  // Progress propagator need to be attached in the current tick.
  self.promiseDispatch(void 0, "when", [void 0, function (value) {
    var newValue;
    var threw = false;
    try {
      newValue = _progressed(value);
    } catch (e) {
      threw = true;
      if (Q.onerror) {
        Q.onerror(e);
      } else {
        throw e;
      }
    }

    if (!threw) {
      deferred.notify(newValue);
    }
  }]);

  return deferred.promise;
};

Q.tap = function (promise, callback) {
  return Q(promise).tap(callback);
};

/**
 * Works almost like "finally", but not called for rejections.
 * Original resolution value is passed through callback unaffected.
 * Callback may return a promise that will be awaited for.
 * @param {Function} callback
 * @returns {Q.Promise}
 * @example
 * doSomething()
 *   .then(...)
 *   .tap(console.log)
 *   .then(...);
 */
Promise.prototype.tap = function (callback) {
  callback = Q(callback);

  return this.then(function (value) {
    return callback.fcall(value).thenResolve(value);
  });
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
  return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
  return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
  return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
  return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
  return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
  if (isPromise(value)) {
    var inspected = value.inspect();
    if (inspected.state === "fulfilled") {
      return inspected.value;
    }
  }
  return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
  return object instanceof Promise;
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
  return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
  return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
  return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
  return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
  return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
  return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
  return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var reportedUnhandledRejections = [];
var trackUnhandledRejections = true;

function resetUnhandledRejections() {
  unhandledReasons.length = 0;
  unhandledRejections.length = 0;

  if (!trackUnhandledRejections) {
    trackUnhandledRejections = true;
  }
}

function trackRejection(promise, reason) {
  if (!trackUnhandledRejections) {
    return;
  }
  if (typeof process === "object" && typeof process.emit === "function") {
    Q.nextTick.runAfter(function () {
      if (array_indexOf(unhandledRejections, promise) !== -1) {
        process.emit("unhandledRejection", reason, promise);
        reportedUnhandledRejections.push(promise);
      }
    });
  }

  unhandledRejections.push(promise);
  if (reason && typeof reason.stack !== "undefined") {
    unhandledReasons.push(reason.stack);
  } else {
    unhandledReasons.push("(no stack) " + reason);
  }
}

function untrackRejection(promise) {
  if (!trackUnhandledRejections) {
    return;
  }

  var at = array_indexOf(unhandledRejections, promise);
  if (at !== -1) {
    if (typeof process === "object" && typeof process.emit === "function") {
      Q.nextTick.runAfter(function () {
        var atReport = array_indexOf(reportedUnhandledRejections, promise);
        if (atReport !== -1) {
          process.emit("rejectionHandled", unhandledReasons[at], promise);
          reportedUnhandledRejections.splice(atReport, 1);
        }
      });
    }
    unhandledRejections.splice(at, 1);
    unhandledReasons.splice(at, 1);
  }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
  // Make a copy so that consumers can't interfere with our internal state.
  return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
  resetUnhandledRejections();
  trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
  var rejection = Promise({
    when: function (rejected) {
      // note that the error has been handled
      if (rejected) {
        untrackRejection(this);
      }
      return rejected ? rejected(reason) : this;
    }
  }, function fallback() {
    return this;
  }, function inspect() {
    return { state: "rejected", reason: reason };
  });

  // Note that the reason has not been handled.
  trackRejection(rejection, reason);

  return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
  return Promise({
    when: function () {
      return value;
    },
    get: function (name) {
      return value[name];
    },
    set: function (name, rhs) {
      value[name] = rhs;
    },
    delete: function (name) {
      delete value[name];
    },
    post: function (name, args) {
      // Mark Miller proposes that post with no name should apply a
      // promised function.
      if (name === null || name === void 0) {
        return value.apply(void 0, args);
      } else {
        return value[name].apply(value, args);
      }
    },
    apply: function (thisp, args) {
      return value.apply(thisp, args);
    },
    keys: function () {
      return object_keys(value);
    }
  }, void 0, function inspect() {
    return { state: "fulfilled", value: value };
  });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
  var deferred = defer();
  Q.nextTick(function () {
    try {
      promise.then(deferred.resolve, deferred.reject, deferred.notify);
    } catch (exception) {
      deferred.reject(exception);
    }
  });
  return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
  return Promise({
    isDef: function () {}
  }, function fallback(op, args) {
    return dispatch(object, op, args);
  }, function () {
    return Q(object).inspect();
  });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
  return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
  return this.all().then(function (array) {
    return fulfilled.apply(void 0, array);
  }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
  return function () {
    // when verb is "send", arg is a value
    // when verb is "throw", arg is an exception
    function continuer(verb, arg) {
      var result;

      // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
      // engine that has a deployed base of browsers that support generators.
      // However, SM's generators use the Python-inspired semantics of
      // outdated ES6 drafts.  We would like to support ES6, but we'd also
      // like to make it possible to use generators in deployed browsers, so
      // we also support Python-style generators.  At some point we can remove
      // this block.

      if (typeof StopIteration === "undefined") {
        // ES6 Generators
        try {
          result = generator[verb](arg);
        } catch (exception) {
          return reject(exception);
        }
        if (result.done) {
          return Q(result.value);
        } else {
          return when(result.value, callback, errback);
        }
      } else {
        // SpiderMonkey Generators
        // FIXME: Remove this case when SM does ES6 generators.
        try {
          result = generator[verb](arg);
        } catch (exception) {
          if (isStopIteration(exception)) {
            return Q(exception.value);
          } else {
            return reject(exception);
          }
        }
        return when(result, callback, errback);
      }
    }
    var generator = makeGenerator.apply(this, arguments);
    var callback = continuer.bind(continuer, "next");
    var errback = continuer.bind(continuer, "throw");
    return callback();
  };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
  Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
  throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
  return function () {
    return spread([this, all(arguments)], function (self, args) {
      return callback.apply(self, args);
    });
  };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
  return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
  var self = this;
  var deferred = defer();
  Q.nextTick(function () {
    self.promiseDispatch(deferred.resolve, op, args);
  });
  return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
  return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
  return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
  return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
  return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
  return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
  return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
  return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
  return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
  return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
  return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
  return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
  return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
  return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
  return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
  var promise = Q(object);
  var args = array_slice(arguments, 1);
  return function fbound() {
    return promise.dispatch("apply", [
        this,
        args.concat(array_slice(arguments))
    ]);
  };
};
Promise.prototype.fbind = function (/*...args*/) {
  var promise = this;
  var args = array_slice(arguments);
  return function fbound() {
    return promise.dispatch("apply", [
        this,
        args.concat(array_slice(arguments))
    ]);
  };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
  return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
  return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
  return when(promises, function (promises) {
    var pendingCount = 0;
    var deferred = defer();
    array_reduce(promises, function (undefined, promise, index) {
      var snapshot;
      if (
          isPromise(promise) &&
          (snapshot = promise.inspect()).state === "fulfilled"
      ) {
        promises[index] = snapshot.value;
      } else {
        ++pendingCount;
        when(
            promise,
                    function (value) {
                      promises[index] = value;
                      if (--pendingCount === 0) {
                        deferred.resolve(promises);
                      }
                    },
                    deferred.reject,
                    function (progress) {
                      deferred.notify({ index: index, value: progress });
                    }
                );
      }
    }, void 0);
    if (pendingCount === 0) {
      deferred.resolve(promises);
    }
    return deferred.promise;
  });
}

Promise.prototype.all = function () {
  return all(this);
};

/**
 * Returns the first resolved promise of an array. Prior rejected promises are
 * ignored.  Rejects only if all promises are rejected.
 * @param {Array*} an array containing values or promises for values
 * @returns a promise fulfilled with the value of the first resolved promise,
 * or a rejected promise if all promises are rejected.
 */
Q.any = any;

function any(promises) {
  if (promises.length === 0) {
    return Q.resolve();
  }

  var deferred = Q.defer();
  var pendingCount = 0;
  array_reduce(promises, function (prev, current, index) {
    var promise = promises[index];

    pendingCount++;

    when(promise, onFulfilled, onRejected, onProgress);
    function onFulfilled(result) {
      deferred.resolve(result);
    }
    function onRejected() {
      pendingCount--;
      if (pendingCount === 0) {
        deferred.reject(new Error(
            "Can't get fulfillment value from any promise, all " +
            "promises were rejected."
        ));
      }
    }
    function onProgress(progress) {
      deferred.notify({
        index: index,
        value: progress
      });
    }
  }, undefined);

  return deferred.promise;
}

Promise.prototype.any = function () {
  return any(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
  return when(promises, function (promises) {
    promises = array_map(promises, Q);
    return when(all(array_map(promises, function (promise) {
      return when(promise, noop, noop);
    })), function () {
      return promises;
    });
  });
}

Promise.prototype.allResolved = function () {
  return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
  return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
  return this.then(function (promises) {
    return all(array_map(promises, function (promise) {
      promise = Q(promise);
      function regardless() {
        return promise.inspect();
      }
      return promise.then(regardless, regardless);
    }));
  });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
  return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
  return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
  return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
  return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
  return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
  if (!callback || typeof callback.apply !== "function") {
    throw new Error("Can't apply finally callback");
  }
  callback = Q(callback);
  return this.then(function (value) {
    return callback.fcall().then(function () {
      return value;
    });
  }, function (reason) {
    // TODO attempt to recycle the rejection with "this".
    return callback.fcall().then(function () {
      throw reason;
    });
  });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
  return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
  var onUnhandledError = function (error) {
    // forward to a future turn so that ``when``
    // does not catch it and turn it into a rejection.
    Q.nextTick(function () {
      makeStackTraceLong(error, promise);
      if (Q.onerror) {
        Q.onerror(error);
      } else {
        throw error;
      }
    });
  };

  // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
  var promise = fulfilled || rejected || progress ?
      this.then(fulfilled, rejected, progress) :
      this;

  if (typeof process === "object" && process && process.domain) {
    onUnhandledError = process.domain.bind(onUnhandledError);
  }

  promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {Any*} custom error message or Error object (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, error) {
  return Q(object).timeout(ms, error);
};

Promise.prototype.timeout = function (ms, error) {
  var deferred = defer();
  var timeoutId = setTimeout(function () {
    if (!error || "string" === typeof error) {
      error = new Error(error || "Timed out after " + ms + " ms");
      error.code = "ETIMEDOUT";
    }
    deferred.reject(error);
  }, ms);

  this.then(function (value) {
    clearTimeout(timeoutId);
    deferred.resolve(value);
  }, function (exception) {
    clearTimeout(timeoutId);
    deferred.reject(exception);
  }, deferred.notify);

  return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
  if (timeout === void 0) {
    timeout = object;
    object = void 0;
  }
  return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
  return this.then(function (value) {
    var deferred = defer();
    setTimeout(function () {
      deferred.resolve(value);
    }, timeout);
    return deferred.promise;
  });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
  return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
  var deferred = defer();
  var nodeArgs = array_slice(args);
  nodeArgs.push(deferred.makeNodeResolver());
  this.fapply(nodeArgs).fail(deferred.reject);
  return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
  var args = array_slice(arguments, 1);
  return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
  var nodeArgs = array_slice(arguments);
  var deferred = defer();
  nodeArgs.push(deferred.makeNodeResolver());
  this.fapply(nodeArgs).fail(deferred.reject);
  return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
  var baseArgs = array_slice(arguments, 1);
  return function () {
    var nodeArgs = baseArgs.concat(array_slice(arguments));
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(callback).fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
  };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
  var args = array_slice(arguments);
  args.unshift(this);
  return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
  var baseArgs = array_slice(arguments, 2);
  return function () {
    var nodeArgs = baseArgs.concat(array_slice(arguments));
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    function bound() {
      return callback.apply(thisp, arguments);
    }
    Q(bound).fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
  };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
  var args = array_slice(arguments, 0);
  args.unshift(this);
  return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
  return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
  var nodeArgs = array_slice(args || []);
  var deferred = defer();
  nodeArgs.push(deferred.makeNodeResolver());
  this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
  return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
  var nodeArgs = array_slice(arguments, 2);
  var deferred = defer();
  nodeArgs.push(deferred.makeNodeResolver());
  Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
  return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
  var nodeArgs = array_slice(arguments, 1);
  var deferred = defer();
  nodeArgs.push(deferred.makeNodeResolver());
  this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
  return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
  return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
  if (nodeback) {
    this.then(function (value) {
      Q.nextTick(function () {
        nodeback(null, value);
      });
    }, function (error) {
      Q.nextTick(function () {
        nodeback(error);
      });
    });
  } else {
    return this;
  }
};

Q.noConflict = function() {
  throw new Error("Q.noConflict only works when Q is used as a global");
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      this.map[name].forEach(function(value) {
        callback.call(thisArg, value, name, this)
      }, this)
    }, this)
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  var support = {
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  function Body() {
    this.bodyUsed = false


    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (!body) {
        this._bodyText = ''
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
        // Only support ArrayBuffers for POST method.
        // Receiving ArrayBuffers happens via Blobs, instead.
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = input
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input
      } else {
        request = new Request(input, init)
      }

      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return;
      }

      xhr.onload = function() {
        var status = (xhr.status === 1223) ? 204 : xhr.status
        if (status < 100 || status > 599) {
          reject(new TypeError('Network request failed'))
          return
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

/*! https://mths.be/repeat v0.2.0 by @mathias */
if (!String.prototype.repeat) {
	(function() {
		'use strict'; // needed to support `apply`/`call` with `undefined`/`null`
		var defineProperty = (function() {
			// IE 8 only supports `Object.defineProperty` on DOM elements
			try {
				var object = {};
				var $defineProperty = Object.defineProperty;
				var result = $defineProperty(object, object, object) && $defineProperty;
			} catch(error) {}
			return result;
		}());
		var repeat = function(count) {
			if (this == null) {
				throw TypeError();
			}
			var string = String(this);
			// `ToInteger`
			var n = count ? Number(count) : 0;
			if (n != n) { // better `isNaN`
				n = 0;
			}
			// Account for out-of-bounds indices
			if (n < 0 || n == Infinity) {
				throw RangeError();
			}
			var result = '';
			while (n) {
				if (n % 2 == 1) {
					result += string;
				}
				if (n > 1) {
					string += string;
				}
				n >>= 1;
			}
			return result;
		};
		if (defineProperty) {
			defineProperty(String.prototype, 'repeat', {
				'value': repeat,
				'configurable': true,
				'writable': true
			});
		} else {
			String.prototype.repeat = repeat;
		}
	}());
}
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      this.map[name].forEach(function(value) {
        callback.call(thisArg, value, name, this)
      }, this)
    }, this)
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  var support = {
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  function Body() {
    this.bodyUsed = false


    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (!body) {
        this._bodyText = ''
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
        // Only support ArrayBuffers for POST method.
        // Receiving ArrayBuffers happens via Blobs, instead.
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = input
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input
      } else {
        request = new Request(input, init)
      }

      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return;
      }

      xhr.onload = function() {
        var status = (xhr.status === 1223) ? 204 : xhr.status
        if (status < 100 || status > 599) {
          reject(new TypeError('Network request failed'))
          return
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);
