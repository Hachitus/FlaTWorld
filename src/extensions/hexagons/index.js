import * as eventListeners from './eventListeners/units.js';
import * as hexagonPlugin from './selectHexagonPlugin';
import * as pathfinding from './pathFinding/findPath';
import * as utils from './utils/'
import * as objects from './Objects.js';

const toBeExported = {};
toBeExported.setupHexagonClick = eventListeners.setupHexagonClick;
toBeExported.selectHexagonObject = hexagonPlugin.selectHexagonObject;
toBeExported.pathfinding = pathfinding;
toBeExported.utils = utils;
toBeExported.objects = objects;

export default toBeExported;
