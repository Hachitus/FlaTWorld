(function flatworldSpec() {
  // const MapDataManipulator = window.flatworld.MapDataManipulator;
  const flatworldCreatorHelper = window.flatworldCreatorHelper;
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
    xit('getObjectsUnderArea with subcontainers', () => {
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

      expect(testLayer instanceof map.layerTypes.staticType.layer.constructor).toBe(true);
      expect(map.getMovableLayer().children[0].children.length).toBe(2);

      map.moveMap({ x: 1000, y: 1000 });

      expect(map.getMovableLayer().x).toBe(1000);
      expect(map.getMovableLayer().children[0].x).toBe(0);
      expect(map.getMovableLayer().children[0].children[0].x).toBe(50);
      expect(map.getMovableLayer().children[0].children[0].children[0].x).toBe(40);

      expect(
        map.getMovableLayer().children[0].getSubcontainerConfigs().width)
      .toBe(
        map.getMovableLayer().children[0].children[0].x);

      map.moveMap({ x: 1000, y: 1000 });

      expect(map.getMovableLayer().x).toBe(2000);
      expect(map.getMovableLayer().children[0].x).toBe(0);
      expect(map.getMovableLayer().children[0].children[0].x).toBe(50);
      expect(map.getMovableLayer().children[0].children[0].children[0].x).toBe(40);
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
})();
