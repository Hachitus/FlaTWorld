window.flatworldCreatorHelper = function () {
  	const { Flatworld, objects }  = window.flatworld;
	const renderer = new PIXI.WebGLRenderer();
	const map = new Flatworld(renderer.view);

	let unitLayer = map.addLayer({ name: "unitLayer"});
	let testUnit = new objects.ObjectSpriteUnit();
	unitLayer.addChild(testUnit);

	let terrrainLayer = map.addLayer({ name: "terrrainLayer"});
	let testTerrain = new objects.ObjectSpriteTerrain();
	terrrainLayer.addChild(testTerrain);

	map.getMovableLayer().addChild(unitLayer, terrrainLayer);

	return map;
};