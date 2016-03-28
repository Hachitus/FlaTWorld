(function () {
  'use strict';

  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var mapLog = window.flatworld.log;

  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.mapAPI = setupMapAPI();

  /*---------------------
  -------- PUBLIC -------
  ----------------------*/
  /**
   * Singleton. Uses JSON only data flow
   *
   * @namespace flatworld
   * @class mapApi
   * @static
   */
  function setupMapAPI() {
    const APIs = {};

    /*---------------------
    --------- API ---------
    ----------------------*/
    return {
      get,
      post,
      add,
      remove,
      update,
      getAllAPIs
    };

    /*---------------------
    -------- PUBLIC -------
    ----------------------*/
    /**
     * Get data from server
     *
     * @method get
     * @param  {String} name    The indentifier for this API call / endpoint
     * @param  {Array} params   Params that are sent to the callbacks that have been attached to handle this API data
     * @return {Promise}        ES6 native Promise as the API advances
     */
    function get(type, params) {
      return _doFetch("get", type, params);
    }
    /**
     * Send data to server
     *
     * @method post
     * @param  {String} name    The indentifier for this API call / endpoint
     * @param  {Array} params   Params that are sent to the callbacks that have been attached to handle this API data. E.g. at least the
     * POST data that will be sent to server needs to be set in the callback to the object.body property.
     * @return {Promise}        ES6 native Promise as the API advances
     */
    function post(type, params) {
      return _doFetch("post", type, params);
    }
    /**
     * Add a new mapApi endpoint
     *
     * @method add
     * @param {String}    type            Basically the name of the mapAPI. Like "moveUnit".
     * @param {Function}  cb              Callback that returns the data that is sent to this API endpoint. Callback gets these parameters
     * 1. request type: post, get etc.
     * 2. completeData: { baseUrl, cbs }
     * 3. params: params that were sent to the mapAPI function as extra, like in post(type, params)
     * HAS to return:
     * {}.body = the data to be sent
     * {}.url = url where the data is sent to
     * @param {String}    baseUrl         The url where the mapApi queries are sent to
     */
    function add(type, cb, baseUrl) {
      if (APIs[type]) {
        mapLog.debug("API endpoint already exists and has been defined " + type + ", " + baseUrl + ", " + JSON.stringify(cb));
      }

      APIs[type] = {
        baseUrl: baseUrl,
        cbs: cb ? [cb] : []
      };
    }
    /**
     * Removes mapApi endpoint
     *
     * @method remove
     * @param {String}    type            Basically the name of the mapAPI. Like "moveUnit".
     */
    function remove(type) {
      if (!APIs[type]) {
        mapLog.debug("API endpoint not found for removing!");
      }

      delete APIs[type];
    }
    /**
     * Add a new mapApi endpoint
     *
     * @method update
     * @param {String}    type            Basically the name of the mapAPI. Like "moveUnit".
     * @param {Function}  cb              Callback that returns the data that is sent to this API endpoint
     * @param {Function}  what            The update made
     */
    function update(type, cb, what) {
      if (!APIs[type] || !APIs[type].cbs) {
        mapLog.debug("API endpoint not found for updating!");
      }

      APIs[type].cbs.push(cb);
    }
    /**
     * Does the actual fetch from the API endpoint
     *
     * @method _doFetch
     * @private
     * @param  {String} fetchType   post or get
     * @param  {String} type        name of the endpoint
     * @param  {Array} params       Params that are sent to the callbacks that have been attached to handle this API data. E.g. at least
     * the POST data that will be sent to server needs to be set in the callback to the object.body property.
     * @return {Promise}            The result of the fetch
     */
    function _doFetch(fetchType, type, params) {
      if (!APIs[type]) {
        mapLog.error("API endpoint for fetch not found: " + fetchType + "/" + type + ", " + ( params ? params[0] : "no params"));
        return;
      }

      let completeData = APIs[type];

      APIs[type].cbs.forEach((cb) => {
        completeData = cb(fetchType, completeData, params);
      });

      return fetch(completeData.url, {
          method: fetchType,
          body: completeData.body
        })
        .then(function (response) {
          return response.json();
        }).then(function (json) {
          mapLog.debug('parsed json', json);
        }).catch(function (ev) {
          mapLog.debug('mapAPI http request failed', ev);
        });
    }
    /**
     * Just returns all API endpoint definitions to be checked or modified as pleased. Only for advanced use.
     *
     * @method getAllAPIs
     * @return {Object} returns object that hosts all the API endpoint definitions
     */
    function getAllAPIs() {
      return APIs;
    }
  }
})();