(function forOfWarSpec() {
  // const MapDataManipulator = window.flatworld.MapDataManipulator;
  const fogOfWarModule = window.flatworld.extensions.fogOfWars.simpleFogOfWar;
  const flatworldCreatorHelper = window.flatworldCreatorHelper;

  describe('fogOfWar tests => ', () => {
    let map; // eslint-disable-line no-unused-vars

    beforeEach(() => {
      map = initFlatworld();
    });

    it('getFoWObjectArray works without subcontainers', () => {
      let cbCalled = false;
      const cb = () => {
        cbCalled = true;
      };
      const returnedArrays = fogOfWarModule.getFoWObjectArray(cb);

      expect(returnedArrays.length).toBeGreaterThan(0);
      expect(cbCalled).toBe(true);
    });
    it('getFoWObjectArray works with subcontainers', () => {
      map = initFlatworld({
        subcontainers: {
          width: 50,
          height: 50,
        },
      });
      let cbCalled = false;
      const cb = () => {
        cbCalled = true;
      };
      const returnedArrays = fogOfWarModule.getFoWObjectArray(cb);

      expect(returnedArrays.length).toBeGreaterThan(0);
      expect(cbCalled).toBe(true);
    });
    it('activation works', (done) => {
      const cb = () => {
        expect(true).toBe(true);
        done();
      };
      fogOfWarModule.activate(cb);
    });
    it('refreshFoW works', () => {
      fogOfWarModule.refreshFoW();
    });
  });

  function initFlatworld(options) {
    const map = flatworldCreatorHelper(options);
    fogOfWarModule.init(map);
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
