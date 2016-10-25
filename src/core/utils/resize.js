/**
 * @class utils.resize
 * @return {Object}      toggleFullScreen, setToFullSize, getWindowSize
 */

/**
 * @method toggleFullScreen
 */
function toggleFullScreen() {
  const elem = document.body; // Make the body go full screen.
  const isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) ||
     (
     document.mozFullScreen || document.webkitIsFullScreen);

  isInFullScreen ? cancelFullScreen(document) : requestFullScreen(elem);

  return false;

  /*-------------------------
  --------- PRIVATE ---------
  -------------------------*/
  /* global ActiveXObject */
  function cancelFullScreen(el) {
    const requestMethod = el.cancelFullScreen ||
       el.webkitCancelFullScreen ||
       el.mozCancelFullScreen ||
       el.exitFullscreen;
    if (requestMethod) { // cancel full screen.
      requestMethod.call(el);
    } else if (typeof window.ActiveXObject !== 'undefined') { // Older IE.
      const wscript = new ActiveXObject('WScript.Shell');
      wscript !== null && wscript.SendKeys('{F11}');
    }
  }
  function requestFullScreen(el) {
    // Supports most browsers and their versions.
    const requestMethod = el.requestFullScreen ||
       el.webkitRequestFullScreen ||
       el.mozRequestFullScreen ||
       el.msRequestFullScreen;

    if (requestMethod) { // Native full screen.
      requestMethod.call(el);
    } else if (typeof window.ActiveXObject !== 'undefined') { // Older IE.
      const wscript = new ActiveXObject('WScript.Shell');
      wscript !== null && wscript.SendKeys('{F11}');
    }
    return false;
  }
}
/**
 * Sets canvas size to maximum width and height on the browser, not using fullscreen
 *
 * @method setToFullSize
 * @param {HTMLElement} context        DOMElement Canvas context
 */
function setToFullSize(context) {
  return function fullSize() {
    const size = getWindowSize();

    context.canvas.width = size.x;
    context.canvas.height = size.y;
  };
}
/**
 * Get browser windows size
 *
 * @method getWindowSize
 * @param {HTMLElement} context        DOMElement Canvas context
 */
function getWindowSize() {
  return {
    x: window.innerWidth,
    y: window.innerHeight
  };
}
/**
 * Resizes the PIXI renderer to the current most wide and high element status. Basically
 * canvas size === window size.
 *
 * @static
 * @method resizeRenderer
 * @param {PIXI.WebGLRenderer} renderer   The renderer for the map
 * @param {Function} drawOnNextTick       Function that handles re-rendering canvas
 */
function resizePIXIRenderer(renderer, drawOnNextTick) {
  const windowSize = getWindowSize();

  renderer.autoResize = true; // eslint-disable-line no-param-reassign
  renderer.resize(windowSize.x, windowSize.y);
  drawOnNextTick();
}

/**
 * Setup correct css for setting up fullsize (window size) canvas
 *
 * @param {Element} canvasElement
 */
function fullsizeCanvasCSS(canvasElement) {
  canvasElement.style.position = 'absolute';
  canvasElement.style.display = 'block';
  canvasElement.style.left = '0px';
  canvasElement.style.top = '0px';
}

export default {
  toggleFullScreen,
  setToFullSize,
  getWindowSize,
  resizePIXIRenderer,
  fullsizeCanvasCSS
};
