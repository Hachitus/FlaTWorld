import MapDataManipulator from '../../src/core/MapDataManipulator';
import mapLayers from '../../src/core/MapLayers';
import objects from '../../src/core/Objects';
import utils from '../../src/core/utils/';

describe('mapDataManipulator => ', () => {
  let layerRules;
  let objectRules;
  let testLayers;
  let testObjects;
  let allObjects

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
      name: 'unitLayer1',
    }),
    new mapLayers.MapLayer({
      selectable: false,
      name: 'unitLayer2',
    })];
    testObjects = [
      new objects.ObjectSpriteTerrain(),
      new objects.ObjectSpriteUnit(),
    ];
    allObjects = testObjects.concat(testLayers);
  });

  it('constructing without params should throw error', () => {
    spyOn(utils.general, 'requireParameter');
    new MapDataManipulator(); // eslint-disable-line no-new
    expect(utils.general.requireParameter).toHaveBeenCalled();
  });
  it('filter layers', () => {
    const mapDataManipulator = new MapDataManipulator(layerRules);

    let foundLayers = mapDataManipulator.filter(testLayers);

    expect(foundLayers[0].name).toEqual(testLayers[1].name);

    testLayers[2].selectable = true;
    foundLayers = mapDataManipulator.filter(testLayers);

    expect(foundLayers).toEqual([testLayers[1], testLayers[2]]);
  });
  it('filter objects', () => {
    const mapDataManipulator = new MapDataManipulator(objectRules);

    let foundObjects = mapDataManipulator.filter(testObjects);

    expect(foundObjects[0].name).toEqual(testObjects[0].name);

    testObjects[1].name = 'DefaultTerrainObject';
    foundObjects = mapDataManipulator.filter(testObjects);

    expect(foundObjects).toEqual([testObjects[0], testObjects[1]]);
  });
  it('filter both', () => {
    const layerAndObjectsFilter = new MapDataManipulator([layerRules, objectRules]);

    const foundObjects = layerAndObjectsFilter.filter(allObjects);

    expect(foundObjects[0]).toBe(testObjects[0]);
    expect(foundObjects[1]).toBe(testLayers[1]);
  });
  it('filter matchAny', () => {
    const layerRulesFailing = {
      type: 'filter',
      object: 'layer',
      property: 'selectable',
      value: 'dlfkdfkd',
    };
    const failingRuleWithMatchAny = {
      matchAny: true,
      rules: [layerRules, layerRulesFailing]
    };

    let mapDataManipulator = new MapDataManipulator([layerRules, layerRulesFailing, objectRules]);
    let found = mapDataManipulator.filter(allObjects);

    expect(found.length).toBe(1);

    mapDataManipulator = new MapDataManipulator([failingRuleWithMatchAny, objectRules]);
    found = mapDataManipulator.filter(allObjects);

    expect(found.length).toBe(2);
  });
});
