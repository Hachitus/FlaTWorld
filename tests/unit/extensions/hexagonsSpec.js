(function hexagonsSpec() {
  // const MapDataManipulator = window.flatworld.MapDataManipulator;
  const { createHexagonDataStructure, _isBlocked, _orderListener } = window.flatworld.extensions.hexagons._tests;
  const flatworldCreatorHelper = window.flatworldCreatorHelper;
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

      map = flatworldCreatorHelper(options);

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
        }
      }];
    })

    it('createHexagonDataStructure', () => {
      selectHexagonObject.init(map);

    	const createdStructure = createHexagonDataStructure(map.getMovableLayer(), map.allMapObjects.terrainLayer);

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
      const e = {
        center: {
          x: 100,
          y: 100
        },
        offsetX: 100,
        offsetY: 100
      }
      
      spyOn(mapStates, 'objectOrder');
      spyOn(map.currentlySelectedObjects[0], 'move');
      spyOn(mapEvents, 'publish');
      spyOn(mapStates, 'objectOrderEnd');
      spyOn(map, 'drawOnNextTick');
      map.getMovableLayer().toLocal = function(coord, object) {
        return new PIXI.Point(object.x, object.y);
      };

      _orderListener(e);

      expect(mapStates.objectOrder).toHaveBeenCalled();
      expect(map.currentlySelectedObjects[0].move).toHaveBeenCalledWith({
        x: 52,
        y: 150
      });
      expect(mapEvents.publish).toHaveBeenCalledWith('objectMoves', map.currentlySelectedObjects[0]);
      expect(map.currentlySelectedObjects[0].move).toHaveBeenCalledWith({
        x: 52,
        y: 150
      });
      expect(mapStates.objectOrderEnd).toHaveBeenCalled();
      expect(map.drawOnNextTick).toHaveBeenCalled();
    });
	});
})();
