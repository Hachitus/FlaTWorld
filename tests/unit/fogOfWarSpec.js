(function forOfWarSpec() {
  // const MapDataManipulator = window.flatworld.MapDataManipulator;
  const fogOfWarMod = window.flatworld.extensions.fogOfWars.simpleFogOfWar;
  const { creator } = window.flatworldCreatorHelper;

  describe('fogOfWar tests => ', () => {
    let fogOfWarModule;
    let map;

    beforeEach(function () {
      fogOfWarModule = Object.assign({}, fogOfWarMod);
      map = creator.initFlatworld([fogOfWarModule], {
        subcontainers: {
          width: 50,
          height: 50,
          maxDetectionOffset: 100,
        },
      });
    })

    it('calculateCorrectCoordinates', () => {
      const testUnit = map.getMovableLayer().children[0].children[0];
      const testPoint = new PIXI.Point(10, 10);
      const testPoint2 = new PIXI.Point(20, 10);
      const testPoint3 = new PIXI.Point(-1980, 10);

      let testCoordinates = fogOfWarModule.calculateCorrectCoordinates(testUnit);
      expect(`{ x: ${testCoordinates.x}, y: ${testCoordinates.y} }`).toEqual(`{ x: ${testPoint.x}, y: ${testPoint.y} }`, 'OBJECT');

      testUnit.parent.x = 10;
      testUnit.parent.updateTransform();
      testCoordinates = fogOfWarModule.calculateCorrectCoordinates(testUnit);
      expect(`{ x: ${testCoordinates.x}, y: ${testCoordinates.y} }`).toEqual(`{ x: ${testPoint2.x}, y: ${testPoint2.y} }`, 'OBJECT');

      map.moveMap({ x: -2000 });
      map.getMovableLayer().updateTransform();
      testCoordinates = fogOfWarModule.calculateCorrectCoordinates(testUnit);
      expect(`{ x: ${testCoordinates.x}, y: ${testCoordinates.y} }`).toEqual(`{ x: ${testPoint3.x}, y: ${testPoint3.y} }`, 'OBJECT');
    });

    it('activateFogOfWar works', () => {
      const cb = () => {
        return new PIXI.Sprite(PIXI.Texture.EMPTY);
      };

      spyOn(map, 'createSpecialLayer');

      fogOfWarModule.activateFogOfWar(cb);

      expect(map.createSpecialLayer).toHaveBeenCalledWith('FoWMovableMaskLayer');
    });

    it('getFoWObjectArray', () => {
      const cb = () => {
        return new PIXI.Sprite(PIXI.Texture.EMPTY);
      };
      fogOfWarModule.activateFogOfWar(cb);
      fogOfWarModule.FOR_TESTS.setObjectsForFoW([{
        x: 10,
        y: 10
      }]);

      let cbCalled = false;
      const cb = (coords) => {
        cbCalled = true;
        return coords;
      };
      const returnedArrays = fogOfWarModule.getFoWObjectArray(cb);

      expect(returnedArrays[0] instanceof PIXI.Sprite).toBeTruthy();
      expect(returnedArrays.length).toBe(2);
      expect(returnedArrays[0].x).toBe(10);
      expect(cbCalled).toBe(true);
    });
    it('refreshFoW works', () => {
      fogOfWarModule.refreshFoW();
    });
  });
})();
