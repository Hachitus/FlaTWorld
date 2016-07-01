/* global describe, beforeEach, it, expect, spyOn */

// const MapDataManipulator = window.flatworld.MapDataManipulator;
const flatworldCreatorHelper = window.flatworldCreatorHelper;
const MapDataManipulator = window.flatworld.MapDataManipulator;

describe('Flatworld unit tests => ', () => {
  let map;

  beforeEach(() => {
    map = initFlatworld();
  });

  it('getObjectsUnderArea - layers', () => {
    const filters = new MapDataManipulator({
      type: 'filter',
      object: 'layer',
      property: 'name',
      value: 'terrainLayer',
    });
    const returnedObjects = map.getObjectsUnderArea(
      { x: 0, y: 0, width: 50, height: 50 },
      { filters });

    expect(returnedObjects.length).toBe(1);
  });
  it('getObjectsUnderArea - objects', () => {
    const filters = new MapDataManipulator([{
      type: 'filter',
      object: 'layer',
      property: 'name',
      value: 'unitLayer',
    }, {
      type: 'filter',
      object: 'object',
      property: 'type',
      value: 'unit',
    }]);
    const returnedObjects = map.getObjectsUnderArea(
      { x: 0, y: 0, width: 50, height: 50 },
      { filters });

    expect(returnedObjects[0]).toBe(map.getMovableLayer().children[0].children[0]);
  });
});

function initFlatworld(options) {
  const map = flatworldCreatorHelper(options);
  map.getViewportArea = function getViewportAreaTest() {
    return {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    };
  };

  return map;
}
