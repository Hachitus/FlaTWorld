(function () {
  'use strict';

  /*-----------------------
  ---------- API ----------
  -----------------------*/
  window.flatworld.generalUtils.environmentDetection = setupEnvironmentDetection();

  /*-----------------------
  --------- PUBLIC --------
  -----------------------*/
  /**
   * @namespace flatworld.generalUtils
   * @class environmentDetections
   * @return {Object}                         Holds methods in this class
   */
  function setupEnvironmentDetection() {
    return {
      isMobile,
      isTouchDevice
    };

    /**
     * Detect mobile environment
     *
     * @method isMobile
     * @return {Boolean}
     */
    function isMobile() {
      var screenSize = (screen.width <= 640) || (window.matchMedia && window.matchMedia('only screen and (max-width: 640px)').matches );
      var features = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);

      return features && screenSize;
    }
  }
  /**
   * Detect if device supports touch events
   *
   * @method isMobile
   * @return {Boolean}
   */
  function isTouchDevice() {
    if ("ontouchstart" in document.documentElement) {
      return true;
    } else {
      return false;
    }
  }
})();