(function () {
  'use strict';

  /*---------------------
  --------- API ---------
  ----------------------*/
  var loglevel = window.flatworld_libraries.log;

  loglevel.enableAll();
  /**
   * @namespace flatworld
   * @class log
   * @requires loglevel.js for frontend logging, or something similar
   **/
  window.flatworld.log = {
    debug(e, errorText) {
      loglevel.debug(errorText, e);
    },
    error(e, errorText) {
      loglevel.error(errorText, e);
    },
  };
})();
