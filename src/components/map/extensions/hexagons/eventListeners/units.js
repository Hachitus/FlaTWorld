(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var { utils, mapEvents, UI, MapDataManipulator, eventListeners, mapStates, mapLog } = window.flatworld;
  var { hexagons } = window.flatworld.extensions;

  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.extensions.hexagons.setupHexagonClick = _setupUnitsHexagonClick;
  window.flatworld.extensions.hexagons._tests._isBlocked = _isBlocked;
  window.flatworld.extensions.hexagons._tests._orderListener = _orderListener;
  window.flatworld.extensions.hexagons._tests._tapListener = _tapListener;

  /*---------------------
  ------ VARIABLES ------
  ----------------------*/
  let FTW, ui;

  /*---------------------
  ------- PUBLIC --------
  ----------------------*/
  /**
   * Handles the eventlistner for selecting objects on the map. THe actual logic for detecting the objects under mouse
   * etc. are in selectHexagonPlugin
   *
   * @class extensions.hexagons.setupHexagonClick
   * @requires Hammer.js. Some events are done with Hammer.js, so we need it to handle those events correctly
   * @event                 Mapselect and objectsSelected (objectsSelected will have parameter for the objects that were selected)
   * @param  {Map} map      The currently use Map instance
   * @return {Boolean}      True
   */
  function _setupUnitsHexagonClick(mapInstance) {
    if (!mapInstance) {
      throw new Error('eventlisteners initialization requires flatworld instance as a parameter');
    }

    FTW = mapInstance;

    ui = UI();

    eventListeners.on('select', _tapListener);
    eventListeners.on('order', _orderListener);

    return true;
  }

  /*----------------------
  ------- PUBLIC ---------
  ----------------------*/
  /**
   * the listener that received the event object
   *
   * @private
   * @method _tapListener
   * @param  {Event} e      Event object
   */
  function _tapListener(e) {
    const globalCoords = utils.mouse.eventData.getHAMMERPointerCoords(e);
    const getData = {
      allData(object) {
        return object.data.typeData;
      },
    };
    const containerFilter = new MapDataManipulator({
      type: 'filter',
      object: 'layer',
      property: 'name',
      value: 'unitLayer',
    });
    var objects;

    mapStates.objectSelect();

    objects = FTW.getObjectsUnderArea(globalCoords, { filters: containerFilter });
    objects = utils.dataManipulation.mapObjectsToArray(objects);
    objects = utils.dataManipulation.flattenArrayBy1Level(objects);

    if (!objects.length) {
      FTW.currentlySelectedObjects = undefined;
      mapLog.debug('No objects found for selection!');
      // Delete the UI objects, as player clicked somewhere that doesn't have any selectable objects
      ui.showSelections([]);
      return;
    }

    FTW.currentlySelectedObjects = objects;
    mapEvents.publish('objectsSelected', objects);
    ui.showSelections(objects, getData);
    FTW.drawOnNextTick();
  }
  /**
   * This listener is for the situation, where we have an object and we issue an order / action to
   * that unit. For example to move from one hexagon to another.
   *
   * @private
   * @method _orderListener
   * @param  {Event} e      Event object
   */
  function _orderListener(e) {
    var selectedObjectsCoordinates;
    let globalCoords, selectedObject;

    if (!FTW.currentlySelectedObjects) {
      mapLog.debug('No objects selected for orders! ' + JSON.stringify(selectedObject));
      return;
    } else if (FTW.currentlySelectedObjects.length > 1) {
      mapLog.debug('the selected object is only supported to be one atm.' + JSON.stringify(FTW.currentlySelectedObjects));
      return;
    }

    selectedObject = FTW.currentlySelectedObjects[0];
    selectedObjectsCoordinates = FTW.getMapCoordinates(selectedObject);

    mapStates.objectOrder();

    if (FTW.isSupportedTouch) {
      globalCoords = FTW.getMapCoordinates(utils.mouse.eventData.getHAMMERPointerCoords(e));
    } else {
      globalCoords = FTW.getMapCoordinates(utils.mouse.eventData.getPointerCoords(e));
    }
    globalCoords = hexagons.utils.getClosestHexagonCenter(globalCoords);

    const objectIndexes = hexagons.utils.calculateIndex(selectedObjectsCoordinates);
    const destinationIndexes = hexagons.utils.calculateIndex(globalCoords);

    let pathsToCoordinates = hexagons.pathfinding.findPath(objectIndexes.x, objectIndexes.y, destinationIndexes.x, destinationIndexes.y, 100, _isBlocked);
    pathsToCoordinates = pathsToCoordinates.map(coords => {
      return hexagons.utils.indexToCoordinates(coords);
    });
    
    selectedObject.move(globalCoords);
    mapEvents.publish('objectMoves', selectedObject);

    ui.showUnitMovement(pathsToCoordinates);

    mapStates.objectOrderEnd();
    FTW.drawOnNextTick();
  }

  function _isBlocked(dataObject) {
    /* We use the EARLIER path to test, how much moving to the next area will require. We can
     * not use the next area to test it, as that could lead to nasty surpises (like units
     * couldn't move to an area at all, because they have 1 move and it requires 2 moves)
     */
    const prevCoordinates = dataObject.prev;
    const selectedObject = FTW.currentlySelectedObjects[0];    
    const correctHexagon = FTW.hexagonIndexes[prevCoordinates.x][prevCoordinates.y];
    const isBlocked = correctHexagon.mountain || (dataObject.len > selectedObject.data.typeData.move);
    
    return isBlocked;
  }
})();