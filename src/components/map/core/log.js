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
    debug: function(e, errorText) {
      loglevel.debug(errorText, e);
    },
    error: function (e, errorText) {
      loglevel.error(errorText, e);
    }
  };
})();