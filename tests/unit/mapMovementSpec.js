import helper from './flatworldCreatorHelper';
import mapMovement from '../../src/extensions/mapMovement/mapMovement';

describe('mapMovement extension => ', function () {
  var subcontainerArea;
  var subContainer = {
    getSubcontainerArea: function () {
      return subcontainerArea;
    }
  };
  var ZOOM = 0.9;
  var viewportArea;
  var map;

  beforeEach(function () {
    map = helper.initFlatworld();
    viewportArea = {
      x: 50,
      y: 50,
      width: 500,
      height: 500
    };
    subcontainerArea = {
      x: 0,
      y: 0
    };
    mapMovement._testObject._setMap({
      drawOnNextTick: function () {
        return true;
      },
      getViewportArea: function () {
        return viewportArea;
      },
      getZoom: function () {
        return ZOOM;
      }
    });
  });

  it('getViewportCoordinates', function () {
    var calculatedViewportArea;

    mapMovement._testObject.setOffsetSize(viewportArea);
    calculatedViewportArea = mapMovement._testObject.getViewportWithOffset(viewportArea, {
      scale: ZOOM
    });
    expect(calculatedViewportArea).toEqual({
      x: -61,
      y: -61,
      width: 722,
      height: 722
    });
  });
  it('testRectangleIntersect', function () {
    var calculatedViewportArea;

    calculatedViewportArea = mapMovement._testObject.testRectangleIntersect(viewportArea, viewportArea);
    expect(calculatedViewportArea).toEqual(true);
  });
  it('isObjectOutsideViewport', function () {
    var isOutside, isNotOutside;

    isOutside = mapMovement._testObject.isObjectOutsideViewport(subContainer, viewportArea);
    expect(isOutside).toBe(true, 'should be outside viewport');

    subcontainerArea = {
      x: 100,
      y: 100,
      width: 800,
      height: 800
    };
    isNotOutside = mapMovement._testObject.isObjectOutsideViewport(subContainer, viewportArea);
    expect(isNotOutside).toBe(false, 'should be outside viewport');

    subcontainerArea = {
      x: 0,
      y: 0,
      width: 100,
      height: 100
    };
    isNotOutside = mapMovement._testObject.isObjectOutsideViewport(subContainer, viewportArea);
    expect(isNotOutside).toBe(false, 'should be inside viewport');
  });
});
