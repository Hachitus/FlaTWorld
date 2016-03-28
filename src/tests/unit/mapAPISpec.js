/* global describe, beforeEach, afterEach, it, spyOn, expect */
'use strict';

var mapAPI = window.flatworld.mapAPI;

describe("mapAPI => ", () => {
  var type, cb, baseUrl, queryStatus;

  beforeEach(function () {
    queryStatus = 0;
    type = "orderUnit";
    cb = function (queryType, completeData, params) {
      return queryType + completeData.baseUrl + completeData.cbs.length + params;
    };
    baseUrl = "//test.warmapengine.level7.fi/API/orderUnit/";
    mapAPI.add(type, cb, baseUrl);
  });
  afterEach(() => {
    mapAPI.remove(type);
  });

  it("add", () => {
    expect(Object.keys(mapAPI.getAllAPIs()).length).toEqual(1);
  });
  it("remove", () => {
    mapAPI.remove(type);

    expect(Object.keys(mapAPI.getAllAPIs()).length).toEqual(0);
  });
  it("get", () => {
    var prom = promiseHelper();
    spyOn(window, "fetch").and.callFake( function () {
      return prom;
    });
    var promise = mapAPI.get(type, "");

    expect(promise.then).toBeDefined();
    expect(queryStatus).toEqual(2);
    expect(window.fetch).toHaveBeenCalled();
  });
  it("post", () => {
    var prom = promiseHelper();
    spyOn(window, "fetch").and.callFake( function () {
      return prom;
    });
    var promise = mapAPI.post(type, "");

    expect(promise.then).toBeDefined();
    expect(queryStatus).toEqual(2);
    expect(window.fetch).toHaveBeenCalled();
  });
  it("update", () => {
  });

  /* PRIVATE function to help with dealing promises and their returned objects */
  function promiseHelper() {
    return {
      then: function () {
        queryStatus++;
        return window.fetch();
      },
      catch: function () {
        return {
          then: 1
        };
      }
    };
  }
});