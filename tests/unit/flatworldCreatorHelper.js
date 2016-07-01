window.flatworldCreatorHelper = function flatworldCreatorHelper(flatworldOptions) {
  const { Flatworld, objects } = window.flatworld;
  const renderer = new PIXI.WebGLRenderer();
  const map = new Flatworld(renderer.view, flatworldOptions);

  const unitLayer = map.addLayer({
    name: 'unitLayer',
  });
  const testUnit = new objects.ObjectSpriteUnit();
  testUnit.x = 10;
  testUnit.y = 10;
  unitLayer.addChild(testUnit);

  const terrrainLayer = map.addLayer({
    name: 'terrainLayer',
  });
  const testTerrain = new objects.ObjectSpriteTerrain();
  testTerrain.x = 20;
  testTerrain.y = 20;
  terrrainLayer.addChild(testTerrain);

  map.getMovableLayer().addChild(unitLayer, terrrainLayer);

  return map;
};
