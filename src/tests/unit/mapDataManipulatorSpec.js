/* global describe, beforeEach, it, expect */
'use strict';

describe("mapDataManipulator => ", function () {
  const MapDataManipulator = window.flatworld.MapDataManipulator;
  const mapLayers = window.flatworld.mapLayers;
  const objects = window.flatworld.objects;
  var layerRules, objectRules, testLayers, testObjects;

  beforeEach(function () {
    layerRules = {
      type: "filter",
      object: "layer",
      property: "selectable",
      value: true
    };
    objectRules = {
      type: "filter",
      object: "object",
      property: "name",
      value: "DefaultTerrainObject"
    };
    testLayers = [new mapLayers.MapLayer({
      selectable: false,
      name: "terrainLayer"
    }),
    new mapLayers.MapLayer({
      selectable: true,
      name: "unitLayer"
    }),
    new mapLayers.MapLayer({
      selectable: false,
      name: "unitLayer"
    })];
    testObjects = [
      new objects.ObjectSpriteTerrain(),
      new objects.ObjectSpriteUnit()
    ];
  });

  it("filter layers", function () {
    var mapDataManipulator = new MapDataManipulator(layerRules);
    var foundLayers;

    foundLayers = mapDataManipulator.filter(testLayers);

    expect(foundLayers[0]).toBe(testLayers[1]);

    testLayers[2].selectable = true;
    foundLayers = mapDataManipulator.filter(testLayers);

    expect(foundLayers).toEqual([testLayers[1], testLayers[2]]);
  });
  it("filter objects", function () {
    var mapDataManipulator = new MapDataManipulator(objectRules);
    var foundObjects;

    foundObjects = mapDataManipulator.filter(testObjects);

    expect(foundObjects[0]).toBe(testObjects[0]);

    testObjects[1].name = "DefaultTerrainObject";
    foundObjects = mapDataManipulator.filter(testObjects);

    expect(foundObjects).toEqual([testObjects[0], testObjects[1]]);
  });
});