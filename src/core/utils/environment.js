/**
 * @class utils.environment
 * @return {Object}      getPixelRatio
 */

/**
 * @method getPixelRatio
 * @requires Canvas element in the DOM. This needs to be found
 * @param  {HTMLElement} canvasElement       HTML canvas element
 * @return {Number}
 */
export function getPixelRatio(canvasElement) {
  const DPR = window.devicePixelRatio || 1;
  const ctx = (canvasElement && canvasElement.getContext('2d')) || document.createElement('canvas').getContext('2d');
  const bsr = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;

  return DPR / bsr;
}

/**
 * Detects wether webGL is supported or not
 *
 * @author alteredq / http://alteredqualia.com/
 * @author author mr.doob / http://mrdoob.com/
 * From three.js: https://github.com/mrdoob/three.js/blob/master/examples/js/Detector.js
 * 
 * @param  {HTMLElement} canvasElement       HTML canvas element
 */
export function isWebglSupported(canvas = document.createElement( 'canvas' )) {
  try {
    return !! ( window.WebGLRenderingContext &&
      ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );
  } catch ( e ) {
    return false;
  }
}

/**
 * Detect if device supports touch events
 *
 * @method isMobile
 * @return {Boolean}
 */
export function isTouchDevice() {
  if (hasOnTouchStart()) {
    return true;
  } else {
    return false;
  }
}

/**
 * Detect mobile environment
 *
 * @method isMobile
 * @return {Boolean}
 */
export function isMobile() {
  const screenSize = (screen.width <= 640) || (window.matchMedia && window.matchMedia('only screen and (max-width: 640px)').matches);
  const features = hasOnTouchStart() || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);

  return features && screenSize;
}


function hasOnTouchStart() {
  return 'ontouchstart' in document.documentElement;
}
/*---------------------
--------- API ---------
----------------------*/
export default {
  getPixelRatio,
  isWebglSupported,
  isTouchDevice,
  isMobile
};
