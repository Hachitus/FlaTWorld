window.flatworldCreatorHelper = {
  creator: privateCreator,
  initFlatworld: privateInitFlatworld
};

function privateCreator(flatworldOptions) {
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

  map.getMovableLayer().addChild(terrrainLayer, unitLayer);

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