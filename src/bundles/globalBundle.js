const core = require('bundles/coreBundle');
const log = require('components/logger/log');
const mapMovement = require('components/map/extensions/mapMovement/mapMovement');
const UIDefaultTemplate = require('components/map/UIs/default/default');
const Preload = require('components/preloading/Preload');
const generalUtils = require('components/utilities/index');

/* Export factories */
const factories = require('factories/index');

/* Export hexagon plugin */
const hexagonPlugin = require('components/map/extensions/hexagons/index');

window.flatworld = core;
window.flatworld.log = log;
window.flatworld.Preload = Preload.Preload;
window.flatworld.generalUtils = generalUtils;
window.flatworld.factories = factories;
window.flatworld.UITemplates = window.flatworld.UITemplates || {};
window.flatworld.UITemplates.default = UIDefaultTemplate;
window.flatworld.extensions = window.flatworld.extensions || {};
window.flatworld.extensions.hexagons = hexagonPlugin;
window.flatworld.extensions.mapMovement = mapMovement;