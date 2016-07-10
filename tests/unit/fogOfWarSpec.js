(function forOfWarSpec() {
  // const MapDataManipulator = window.flatworld.MapDataManipulator;
  const fogOfWarMod = window.flatworld.extensions.fogOfWars.simpleFogOfWar;
  const flatworldCreatorHelper = window.flatworldCreatorHelper;

  describe('fogOfWar tests => ', () => {
    it('calculateCorrectCoordinates', () => {
      const fogOfWarModule = Object.assign({}, fogOfWarMod);
      const map = initFlatworld(fogOfWarModule);
      const testUnit = map.getMovableLayer().children[0].children[0];

      let testCoordinates = fogOfWarModule.calculateCorrectCoordinates(testUnit);
      expect(testCoordinates).toEqual(new PIXI.Point(10, 10), 'OBJECT');

      testUnit.parent.x = 10;
      testUnit.parent.updateTransform();
      testCoordinates = fogOfWarModule.calculateCorrectCoordinates(testUnit);
      expect(testCoordinates).toEqual(new PIXI.Point(20, 10), 'PARENTLAYER');

      map.moveMap({ x: -2000 });
      map.getMovableLayer().updateTransform();
      testCoordinates = fogOfWarModule.calculateCorrectCoordinates(testUnit);
      expect(testCoordinates).toEqual(new PIXI.Point(-1980, 10), 'MOVABLELAYER');
    });
    it('getFoWObjectArray works without subcontainers', () => {
      const fogOfWarModule = Object.assign({}, fogOfWarMod);

      let cbCalled = false;
      const cb = () => {
        cbCalled = true;
        return new PIXI.Sprite(PIXI.Texture.EMPTY);
      };
      const returnedArrays = fogOfWarModule.getFoWObjectArray(cb);

      expect(returnedArrays[0] instanceof PIXI.Sprite).toBeTruthy();
      expect(cbCalled).toBe(true);
    });
    it('getFoWObjectArray works with subcontainers', () => {
      const fogOfWarModule = Object.assign({}, fogOfWarMod);
      const map = initFlatworld(fogOfWarModule, {
        subcontainers: {
          width: 50,
          height: 50,
          maxDetectionOffset: 100,
        },
      });

      const usesSubcontainers = map.usesSubcontainers();
      expect(usesSubcontainers).toBe(true);

      let cbCalled = false;
      const cb = (coords) => {
        cbCalled = true;
        return coords;
      };
      const returnedArrays = fogOfWarModule.getFoWObjectArray(cb);

      expect(returnedArrays.length).toBe(2);
      expect(returnedArrays[0].x).toBe(10);
      expect(cbCalled).toBe(true);
    });
    it('activateFogOfWar works', () => {
      const fogOfWarModule = Object.assign({}, fogOfWarMod);
      initFlatworld(fogOfWarModule);

      const cb = () => {
        expect(true).toBe(true);
        return new PIXI.Sprite(PIXI.Texture.EMPTY);
      };
      fogOfWarModule.activateFogOfWar(cb);
    });
    it('refreshFoW works', () => {
      const fogOfWarModule = Object.assign({}, fogOfWarMod);
      initFlatworld(fogOfWarModule);

      fogOfWarModule.refreshFoW();
    });
  });

  function initFlatworld(FoWModule, options) {
    const map = flatworldCreatorHelper(options);
    FoWModule.init(map);
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
