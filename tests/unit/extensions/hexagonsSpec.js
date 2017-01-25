// DISABLED

(function hexagonsSpec() {
  // const MapDataManipulator = window.flatworld.MapDataManipulator;
  const { createHexagonDataStructure, _isBlocked, _orderListener } = window.flatworld.extensions.hexagons._tests;
  const { creator } = window.flatworldCreatorHelper;
  const { UI, eventListeners, mapStates, mapEvents } = window.flatworld;
  const { selectHexagonObject, utils } = window.flatworld.extensions.hexagons;

  const radius = 60;

  describe('extensions -> hexagons => ', () => {
    let options, map;

    beforeEach(() => {
      options = {
          subcontainers: {
          width: 100,
          height: 100,
          maxDetectionOffset: 0
        }
      };

      // We need to stub these, othewise the test will error. These are unrelevant to our tests.
      spyOn(eventListeners, 'on');

      map = creator(options);

      utils.init(radius);

      // Creating the map.allMapObjects dataStructure
      map.init();

      selectHexagonObject.init(map);

      map.currentlySelectedObjects = [{
        data: {
          typeData: {
            move: 2
          }
        },
        move: function() {},
        position: {
          x: 10,
          y: 10
        },
        toGlobal: function () {
          return {
            x: 10,
            y: 10
          };
        },
        x: 10,
        y: 10,
        getMapCoordinates() {
          return {
            x: 10,
            y: 10
          };
        },
        getCenterCoordinates() {
          return {
            x: 61,
            y: 71
          };
        }
      }];
    })

    it('createHexagonDataStructure', () => {
      selectHexagonObject.init(map);

    	const createdStructure = createHexagonDataStructure(map.allMapObjects.terrainLayer);

    	expect(createdStructure[0][0]).toBe(map.allMapObjects.terrainLayer[0]);
		});

    it('_isBlocked', () => {
      pathFindingObj = {
        len: 2,
        x: 1,
        y: 0,
        prev: {
          len: 1,
          prev: null,
          x: 0,
          y: 0
        }
      };
      const isItBlocked = _isBlocked(pathFindingObj);

      expect(isItBlocked).toBe(false);
    });

    it('_orderListener', () => {
      const x = 150;
      const y = 100;
      const e = {
        center: {
          x,
          y
        },
        offsetX: x,
        offsetY: y
      }
      // We need to create this, as normally hexagon objects create the hitTest method, but in
      // this case we do not use the hexagon objects.
      Object.getPrototypeOf(map.currentlySelectedObjects[0]).hitTest = function () {
        return false;
      };
      spyOn(map.allMapObjects.terrainLayer[1], 'hitTest').and.returnValue(true);
      
      spyOn(mapStates, 'objectOrder');
      
      spyOn(map.currentlySelectedObjects[0], 'move');
      spyOn(mapEvents, 'publish');
      spyOn(mapStates, 'objectOrderEnd');
      spyOn(map, 'drawOnNextTick');
      map._getMovableLayer().toLocal = function(coord, object) {
        return object ? new PIXI.Point(object.x, object.y) : coord;
      };

      _orderListener(e);

      expect(mapStates.objectOrder).toHaveBeenCalled();
      expect(map.currentlySelectedObjects[0].move).toHaveBeenCalledWith(new PIXI.Point(
        x,
        y
      ));
      expect(mapEvents.publish).toHaveBeenCalledWith('objectMoves', map.currentlySelectedObjects[0]);
      expect(map.currentlySelectedObjects[0].move).toHaveBeenCalledWith(new PIXI.Point(
        x,
        y
      ));
      expect(mapStates.objectOrderEnd).toHaveBeenCalled();
      expect(map.drawOnNextTick).toHaveBeenCalled();
    });
	});
});
