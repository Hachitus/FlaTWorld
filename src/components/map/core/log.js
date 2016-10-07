(function () {
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
    debug(e) {
      loglevel.debug(e);
    },
    error(e) {
      loglevel.error(e);
    }
  };
})();
