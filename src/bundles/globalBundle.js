var core = require('bundles/coreBundle');
var log = require('components/logger/log');
var mapMovement = require('components/map/extensions/mapMovement/mapMovement');
var UIDefaultTemplate = require('components/map/UIs/default/default');
var Preload = require('components/preloading/Preload');
var generalUtils = require('components/utilities/index');

/* Export factories */
var factories = require('factories/index');

/* Export hexagon plugin */
var hexagonPlugin = require('components/map/extensions/hexagons/index');

window.flatworld = core;
window.flatworld.Q = Q;
window.flatworld.log = log;
window.flatworld.Preload = Preload.Preload;
window.flatworld.generalUtils = generalUtils;
window.flatworld.factories = factories;
window.flatworld.UITemplates = window.flatworld.UITemplates || {};
window.flatworld.UITemplates.default = UIDefaultTemplate;
window.flatworld.extensions = window.flatworld.extensions || {};
window.flatworld.extensions.hexagons = hexagonPlugin;
window.flatworld.extensions.mapMovement = mapMovement;