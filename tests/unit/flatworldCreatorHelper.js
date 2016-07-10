window.flatworldCreatorHelper = function flatworldCreatorHelper(flatworldOptions) {
  const { Flatworld, objects } = window.flatworld;
  const renderer = new PIXI.WebGLRenderer();
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
  [testTerrain].forEach(o => terrrainLayer.addChild(o));

  map.getMovableLayer().addChild(unitLayer, terrrainLayer);

  return map;
};
