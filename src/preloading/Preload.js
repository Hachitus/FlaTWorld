import * as PIXI from 'pixi.js';

export class Preload {
  /**
   * Preloads assets before initializing map.
   *
   * @namespace flatworld
   * @class Preload
   * @constructor
   * @requires Q for promises
   * @todo should you use PIXI here or just https://github.com/englercj/resource-loader straight?
   */
  constructor(baseUrl, options = { concurrency: 15, crossOrigin: false }) {
    const { concurrency } = options;

    this.preloaderClass = new PIXI.loaders.Loader(baseUrl, concurrency);
  }
  /**
   * @method resolveOnComplete
   * @return {Promise} Return promise object, that will be resolved when the preloading is finished
   **/
  resolveOnComplete() {
    const promise = new Promise((resolve, reject) => {
      try {
        this.preloaderClass.load();

        this.preloaderClass.once('complete', function (loader, resources) {
          resolve(loader, resources);
        });
      } catch (e) {
        reject(e);
      }
    });

    return promise;
  }
  /**
   * @method addResource
   **/
  addResource(resource) {
    this.preloaderClass.add(resource);
  }
  /**
   * Preload assets
   *
   * @method loadManifest
   **/
  loadManifest() {
    return this;
  }
  /**
   * Error handler if something goes wrong when preloading
   *
   * @method setErrorHandler
   **/
  setErrorHandler(callback) {
    this.preloaderClass.on('error', callback);

    return this;
  }
  /**
   * Progress handler for loading. You should look easeljs docs for more information
   *
   * @method setProgressHandler
   **/
  setProgressHandler(callback) {
    this.preloaderClass.on('progress', callback);

    return this;
  }
  /**
   * Activate sound preloading also
   *
   * @method activateSound
   **/
  activateSound() {
    this.preloaderClass.installPlugin();
  }
}

/*---------------------
--------- API ---------
----------------------*/
export default {
  Preload
};
