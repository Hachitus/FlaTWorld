import * as PIXI from 'pixi.js';
import Flatworld from '../../src/core/Flatworld';
import objects from '../../src/core/Objects';

export default {
  creator: privateCreator,
  initFlatworld: privateInitFlatworld
};

function privateCreator(flatworldOptions) {
  const renderer = new PIXI.Renderer();
  const map = new Flatworld(renderer.view, flatworldOptions);

  const unitLayer = map.addLayer({
    name: 'unitLayer',
  });
  const testUnits = [
    new objects.ObjectSpriteUnit(PIXI.Texture.EMPTY, { x: 10, y: 10 }),
    new objects.ObjectSpriteUnit(PIXI.Texture.EMPTY, { x: 90, y: 90 }),
  ];
  testUnits.forEach(o => unitLayer.addChild(o));

  const terrrainLayer = map.addLayer({
    name: 'terrainLayer',
  });
  const testTerrain = new objects.ObjectSpriteTerrain();
  testTerrain.x = 20;
  testTerrain.y = 20;
  const testTerrain2 = new objects.ObjectSpriteTerrain();
  testTerrain2.x = 123;
  testTerrain2.y = 20;
  const testTerrain3 = new objects.ObjectSpriteTerrain();
  testTerrain3.x = 123;
  testTerrain3.y = 110;
  const testTerrain4 = new objects.ObjectSpriteTerrain();
  testTerrain4.x = 20;
  testTerrain4.y = 140;
  [testTerrain, testTerrain2, testTerrain3, testTerrain4].forEach(o => terrrainLayer.addChild(o));

  return map;
}

function privateInitFlatworld(modules, options) {
  const map = privateCreator(options);

  if (modules && module.length) {
    modules.forEach(function(module) {
      module.init(map);
    });
  }

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