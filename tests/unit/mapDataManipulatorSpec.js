describe('mapDataManipulator => ', () => {
  const MapDataManipulator = window.flatworld.MapDataManipulator;
  const mapLayers = window.flatworld.mapLayers;
  const objects = window.flatworld.objects;
  const utils = window.flatworld.utils;
  let layerRules;
  let objectRules;
  let testLayers;
  let testObjects;

  beforeEach(() => {
    layerRules = {
      type: 'filter',
      object: 'layer',
      property: 'selectable',
      value: true,
    };
    objectRules = {
      type: 'filter',
      object: 'object',
      property: 'name',
      value: 'DefaultTerrainObject',
    };
    testLayers = [new mapLayers.MapLayer({
      selectable: false,
      name: 'terrainLayer',
    }),
    new mapLayers.MapLayer({
      selectable: true,
      name: 'unitLayer',
    }),
    new mapLayers.MapLayer({
      selectable: false,
      name: 'unitLayer',
    })];
    testObjects = [
      new objects.ObjectSpriteTerrain(),
      new objects.ObjectSpriteUnit(),
    ];
  });

  it('constructing without params should throw error', () => {
    spyOn(utils.general, 'requireParameter');
    new MapDataManipulator(); // eslint-disable-line no-new
    expect(utils.general.requireParameter).toHaveBeenCalled();
  });
  it('filter layers', () => {
    const mapDataManipulator = new MapDataManipulator(layerRules);

    let foundLayers = mapDataManipulator.filter(testLayers);

    expect(foundLayers[0]).toBe(testLayers[1]);

    testLayers[2].selectable = true;
    foundLayers = mapDataManipulator.filter(testLayers);

    expect(foundLayers).toEqual([testLayers[1], testLayers[2]]);
  });
  it('filter objects', () => {
    const mapDataManipulator = new MapDataManipulator(objectRules);

    let foundObjects = mapDataManipulator.filter(testObjects);

    expect(foundObjects[0]).toBe(testObjects[0]);

    testObjects[1].name = 'DefaultTerrainObject';
    foundObjects = mapDataManipulator.filter(testObjects);

    expect(foundObjects).toEqual([testObjects[0], testObjects[1]]);
  });
  it('filter both', () => {
    const layerAndObjectsFilter = new MapDataManipulator([layerRules, objectRules]);
    const allObjects = testObjects.concat(testLayers);

    const foundObjects = layerAndObjectsFilter.filter(allObjects);

    expect(foundObjects[0]).toBe(testObjects[0]);
    expect(foundObjects[1]).toBe(testLayers[1]);
  });
});
