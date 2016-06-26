/* global describe, beforeEach, it, expect, spyOn */
describe('fogOfWar tests => ', () => {
  // const MapDataManipulator = window.flatworld.MapDataManipulator;
  const fogOfWarModule = window.flatworld.extensions.fogOfWars.simpleFogOfWar;
  const flatworldCreatorHelper = window.flatworldCreatorHelper;
  let map;

  beforeEach(() => {
    map = flatworldCreatorHelper();
    fogOfWarModule.init(map);
  });

  it('activation works', (done) => {
    const cb = () => {
      expect(true).toBe(true);
      done();
    };
    console.log(map.getMovableLayer());
    fogOfWarModule.getFoWObjectArray(cb);
  });
  it('activation works', (done) => {
    const cb = () => {
      expect(true).toBe(true);
      done();
    };
    fogOfWarModule.activate(cb);
  });
});
