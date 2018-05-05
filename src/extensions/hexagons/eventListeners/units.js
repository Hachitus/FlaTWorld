import {  utils, mapEvents, MapDataManipulator, eventListeners, mapStates, log } from '../../../core/';
import { findPath } from '../pathFinding/findPath';
import * as hexaUtils from '../utils/';
const hexagons = {
  findPath,
  utils: hexaUtils
};

/*---------------------
------ VARIABLES ------
----------------------*/
const unitLayerFilter = new MapDataManipulator({
  type: 'filter',
  object: 'layer',
  property: 'selectable',
  value: true
});
const terrainLayerFilter = new MapDataManipulator({
  type: 'filter',
  object: 'layer',
  property: 'name',
  value: 'terrainLayer'
});
/* @todo This must be changed to outside the module */
let weight = () => 0;
let FTW;

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
function setupHexagonClick(mapInstance, weightFn, getData) {
  if (!mapInstance) {
    throw new Error('eventlisteners initialization requires flatworld instance as a parameter');
  }

  FTW = mapInstance;

  eventListeners.on('select', _tapListener);
  eventListeners.on('order', _orderListener);

  mapInstance.setPrototype('getData', getData);

  weight = weightFn || weight;

  return true;
}

/**
 * the listener that received the event object
 *
 * @private
 * @method _tapListener
 * @param  {Event} e      Event object
 */
function _tapListener(e) {
  const globalCoords = utils.mouse.eventData.getHAMMERPointerCoords(e);
  mapStates.objectSelect();

  let objects = FTW.getObjectsUnderArea(globalCoords, { filters: unitLayerFilter });
  objects = utils.dataManipulation.mapObjectsToArray(objects);
  objects = utils.dataManipulation.flattenArrayBy1Level(objects);

  FTW.currentlySelectedObjects = objects;

  FTW.drawOnNextTick();

  return true;
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
  // We want to wrap the whole functionality in try catch, to cancel the order state, if any
  // errors occur. Otherwise the states can get stuck more easily in a situation, where you can
  // not move anything (if objectOrder stays on, then the map won't allow you to move units)
  try {
    mapStates.objectOrder();

    if (!FTW.currentlySelectedObjects) {
      throw 'No objects selected for orders!';
    } else if (FTW.currentlySelectedObjects.length > 1) {
      throw 'the selected object is only supported to be one atm.' + JSON.stringify(FTW.currentlySelectedObjects[0]);
    }

    const selectedObject = FTW.currentlySelectedObjects[0];
    const selectedObjectsCoordinates = selectedObject.getMapCoordinates();
    const globalCoords = utils.mouse.eventData.getGlobalCoordinates(e, FTW.isSupportedTouch);

    const objects = FTW.getObjectsUnderArea(globalCoords, { filters: terrainLayerFilter });

    if (!objects.length) {
      throw 'No terrain objects found for destination!';
    }

    const objectIndexes = hexagons.utils.hexagonMath.coordinatesToIndexes(selectedObjectsCoordinates);
    const centerCoords = {
      x: objects[0].getMapCoordinates().x,
      y: objects[0].getMapCoordinates().y
    } ;
    const destinationIndexes = hexagons.utils.hexagonMath.coordinatesToIndexes(centerCoords);

    let pathsToCoordinates;

    if (objectIndexes.x === destinationIndexes.x && objectIndexes.y === destinationIndexes.y) {
      pathsToCoordinates = [];
    } else {
      try {
        const timeUnits = selectedObject.data.typeData.move;
        pathsToCoordinates = hexagons.findPath(
          objectIndexes, 
          destinationIndexes, 
          +FTW.getMapsize().x, 
          +FTW.getMapsize().y, 
          +timeUnits, 
          _isBlocked
        );
        pathsToCoordinates = pathsToCoordinates.map(coords => {
          return hexagons.utils.hexagonMath.indexesToCoordinates(coords);
        });
      } catch (e) {
        if (!pathsToCoordinates || pathsToCoordinates.length < 1) {
          e.message = 'the destination was farther than the given maximum distance';
        } else {
          e.message += `, EXTRA INFO: ' + 'start and end point are same, destination is blocked, unit could not reach the destination or 
                        something else happened`;
        }

        throw e;
      }
    }

    selectedObject.move(pathsToCoordinates);
    
    mapEvents.publish('unitMoved', pathsToCoordinates);

    mapStates.objectOrderEnd();
    FTW.drawOnNextTick();
  } catch(e) {
    mapStates.objectOrderEnd();
    log.debug(e);
    return;
  }
}

function _isBlocked(nextCoordinates, queue) {
  /* We use the EARLIER path to test, how much moving to the next area will require. We can
   * not use the next area to test it, as that could lead to nasty surpises (like units
   * couldn't move to an area at all, because they have 1 move and it requires 2 moves)
   */
  const correctHexagon = FTW.hexagonIndexes[nextCoordinates.x] && FTW.hexagonIndexes[nextCoordinates.x][nextCoordinates.y];
  const returnedWeight = weight(correctHexagon, FTW.currentlySelectedObjects[0], { nextCoordinates, queue });
  
  if (!correctHexagon) {
    return -1;
  } else if ((returnedWeight || returnedWeight === 0) && isInteger(returnedWeight)) {
    return returnedWeight;
  } else if (returnedWeight && !isInteger(returnedWeight)) {
    throw new Error('weight callback has to return an integer');
  }

  return -1;
}

function isInteger(x) {
  return x === Math.floor(x) && isFinite(x);
}

/*---------------------
--------- API ---------
----------------------*/
const _tests = {
  _isBlocked,
  _orderListener,
  _tapListener
};
export {
  setupHexagonClick,
  _tests
};
