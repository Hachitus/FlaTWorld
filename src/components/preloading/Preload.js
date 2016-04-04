(function () {
  "use strict";

  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var { Q, PIXI } = window.flatworld_libraries;

  /*-----------------------
  ---------- API ----------
  -----------------------*/
  class Preload {
    /**
     * Preloads assets before initializing map.
     *
     * @namespace flatworld
     * @class Preload
     * @constructor
     * @requires Q for promises
     * @todo should you use PIXI here or just https://github.com/englercj/resource-loader straight?
     */
    constructor (baseUrl, options = { concurrency: 15, crossOrigin: false }) {
      var { concurrency } = options;

      this.preloaderClass = new PIXI.loaders.Loader(baseUrl, concurrency);
    }
    /**
     * @method resolveOnComplete
     * @return {Promise} Return promise object, that will be resolved when the preloading is finished
     **/
    resolveOnComplete () {
      var promise = Q.defer();

      this.preloaderClass.load();

      this.preloaderClass.once('complete', function(loader, resources) {
        promise.resolve(loader, resources);
      });

      return promise.promise;
    }
    /**
     * @method addResource
     **/
    addResource (resource) {
      this.preloaderClass.add(resource);
    }
    /**
     * Preload assets
     *
     * @method loadManifest
     **/
    loadManifest () {
      return this;
    }
    /**
     * Error handler if something goes wrong when preloading
     *
     * @method setErrorHandler
     **/
    setErrorHandler (errorCB) {
      this.preloaderClass.on("error", errorCB);

      return this;
    }
    /**
     * Progress handler for loading. You should look easeljs docs for more information
     *
     * @method setProgressHandler
     **/
    setProgressHandler (progressCB) {
      this.preloaderClass.on("error", progressCB);

      return this;
    }
    /**
     * Activate sound preloading also
     *
     * @method activateSound
     **/
    activateSound () {
      this.preloaderClass.installPlugin();
    }
  }

  window.flatworld.Preload = Preload;
})();