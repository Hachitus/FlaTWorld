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
function getPixelRatio(canvasElement) {
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
 */
function isWebglSupported() {
  try {
    const canvas = document.createElement( 'canvas' );

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
function isTouchDevice() {
  if ('ontouchstart' in document.documentElement) {
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
function isMobile() {
  const screenSize = (screen.width <= 640) || (window.matchMedia && window.matchMedia('only screen and (max-width: 640px)').matches);
  const features = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);

  return features && screenSize;
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
