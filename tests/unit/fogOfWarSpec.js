import helper from './flatworldCreatorHelper';
import fogOfWarMod from '../../src/extensions/fogOfWars/simpleFogOfWar';
import MapDataManipulator from '../../src/core/MapDataManipulator';

function filterCreator () {
  return new MapDataManipulator({
    type: 'filter',
    object: 'layer',
    property: 'selectable',
    value: true,
  });
}

xdescribe('fogOfWar tests => ', () => {
  let fogOfWarModule;
  let map;

  beforeEach(function () {
    fogOfWarModule = Object.assign({}, fogOfWarMod);
    map = helper.creator({
      subcontainers: {
        width: 50,
        height: 50,
        maxDetectionOffset: 100,
      },
    });
  })

  it('calculateCorrectCoordinates', () => {
    fogOfWarModule.init.call(
      {
        mapInstance: map,
        _properties: {
          zoomLayer: {}
        }
      }, {
        cb: () => {},
        filter: filterCreator
      });
    const testUnit = map._getMovableLayer().children[0].children[0];
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
    map._getMovableLayer().updateTransform();
    testCoordinates = fogOfWarModule.calculateCorrectCoordinates(testUnit);
    expect(`{ x: ${testCoordinates.x}, y: ${testCoordinates.y} }`).toEqual(`{ x: ${testPoint3.x}, y: ${testPoint3.y} }`, 'OBJECT');
  });

  it('activateFogOfWar works', () => {
    spyOn(map, 'createSpecialLayer');

    fogOfWarModule.init.call(
      {
        mapInstance: map,
        _properties: {
          zoomLayer: {}
        }
      }, {
        cb: () => {
          return new PIXI.Sprite(PIXI.Texture.EMPTY);
        }
      });

    expect(map.createSpecialLayer).toHaveBeenCalledWith('FoWMovableMaskLayer');
  });

  it('getFoWObjectArray', () => {
    let cb = () => {
      return new PIXI.Sprite(PIXI.Texture.EMPTY);
    };
    fogOfWarModule.activateFogOfWar(cb);
    fogOfWarModule.FOR_TESTS.setObjectsForFoW([{
      x: 10,
      y: 10
    }]);

    let cbCalled = false;
    cb = (coords) => {
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
