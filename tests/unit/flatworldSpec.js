(function flatworldSpec() {
  // const MapDataManipulator = window.flatworld.MapDataManipulator;
  const { initFlatworld } = window.flatworldCreatorHelper;
  const { Flatworld, MapDataManipulator } = window.flatworld;

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

      expect(returnedObjects.length).toBe(4);
      expect(returnedObjects[0]).toEqual(map._getMovableLayer().children[0].children[0].children[0]);
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

      expect(returnedObjects.length).toBe(2);
      expect(returnedObjects[0]).toEqual(map._getMovableLayer().children[1].children[0].children[0]);
    });
    it('addLayer with subcontainers and move it', () => {
      const renderer = new PIXI.WebGLRenderer();
      map = new Flatworld(renderer.view, {
        subcontainers: {
          width: 50,
          height: 50,
          maxDetectionOffset: 100,
        },
      });
      const testLayer = map.addLayer({
        name: 'testLayer',
      });
      const sprite1 = new PIXI.Sprite(PIXI.Texture.EMPTY);
      sprite1.x = 90;
      const sprite2 = new PIXI.Sprite(PIXI.Texture.EMPTY);
      sprite2.y = 90;
      testLayer.addChild(sprite1);
      testLayer.addChild(sprite2);

      expect(testLayer instanceof map.layerTypes.staticType.constructor).toBe(true);
      expect(map._getMovableLayer().children[0].children.length).toBe(2);

      map.moveMap({ x: 1000, y: 1000 });

      expect(map.getCurrentMapCoordinates().x).toBe(1000);
      expect(map._getMovableLayer().children[0].x).toBe(0);
      expect(map._getMovableLayer().children[0].children[0].x).toBe(50);
      expect(map._getMovableLayer().children[0].children[0].children[0].x).toBe(40);

      expect(
        map.getMovableLayer().children[0].getSubcontainerConfigs().width)
      .toBe(
        map.getMovableLayer().children[0].children[0].x);

      map.moveMap({ x: 1000, y: 1000 });

      expect(map.getCurrentMapCoordinates().x).toBe(2000);
      expect(map._getMovableLayer().children[0].x).toBe(0);
      expect(map._getMovableLayer().children[0].children[0].x).toBe(50);
      expect(map._getMovableLayer().children[0].children[0].children[0].x).toBe(40);
    });
    it('getMapCoordinates', () => {
      var expectedCoordinates = new PIXI.Point(100, 100);
      var coordinatesOnMap = map.getMapCoordinates(expectedCoordinates);

      expect(JSON.stringify(coordinatesOnMap)).toBe(JSON.stringify(expectedCoordinates));

      map.getMapCoordinates({
        toGlobal: function () {
          return expectedCoordinates;
        }
      });

      expect(JSON.stringify(coordinatesOnMap)).toBe(JSON.stringify(expectedCoordinates));
    })
  });
})();
