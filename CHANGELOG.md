<a name="0.7.0"></a>
# 0.7.0 Changes the library to event based (2020-06-08)
* I'll be honest. The game engine stopped being developed a long while ago already, because of multiple reasons. I doubt anyone uses the engine as such and it's still anyway under 1.0, so there will be multiple unreported (or documented) changes in this release and many breaking changes. Since those have happened in the last 2-3 years, it's not good use of time to document them at the moment. I'm still slowly developing something based on this engine.
* The logic was changed to more event-based instead of being unnecessarily tied to the code. Library should communicate through events.

## Breaking changes
* Removed the UI.js and themes. We do things event based

## Features
* Added currentlySelectedObjects setter to flatworld, to give ability to set selectedObjects and control how they are set.

## Possible breaking changes
* Added argument to weightFn in hexagon extensions and changes the functionality a bit. The argument makes it possible to track the whole path being generated.

## Features
* Possibilty to filter with mapDataManipulator using "and / or" option.

<a name="0.6.5"></a>
# 0.6.5 Bug fixes (2017-09-14)

## Possible breaking changes
* Removed MapLayer.getUIObjects
* 'objectMove' event sends a sligthly modified data
* MapApi removed. This was not really supposed to be in anyway, I don't think it belong to the engine.

## Bug fixes
* For of war, remove particleContainer as it was causing issues.
* Hexagon-plugin multiple fixes.
* MapMovement-plugin fixed issues with the queue

# Others
* Pixi.js updated 4.2.1 -> 4.3.2

<a name="0.6.4"></a>
# 0.6.3 Bug fixes (2017-03-14)

## Possible breaking changes
* Changed hexagon selection to work based on selectable-property instead of name

## Bug fixes
* Added floor option for special distance

<a name="0.6.3"></a>
# 0.6.3 Bug fixes (2017-03-14)

## Bug fixes
* Selecting objects didn't take element position into account (assumed canvas is in 0,0 coordinates)
* Updating PIXI from 4.1.0 to 4.3.2
* Removed Q from dependencies, using native ES6 promises
* Added mapAPI.put and use it rather than mapAPI.post (whole thing should be refactored to something more general later anyway)
* Added anchor as optional parameter for objects
* Some other smaller bug fixes

<a name="0.6.2"></a>
# 0.6.2 npm published in UMD (2016-11-23)

## Others
* This update was mostly just to publish the engine to npm.
* Added fetch polyfill
* CalculateHexa function as public function, instead of private
* Exported the object function, so those can be used to extend the classes

<a name="0.6.1"></a>
# 0.6.1 Tiny milestone for UI (2016-11-09)

## Possible breaking changes
* Changed UI.showSelections-method logic, not API.

## Bug fixes
* Pinch was moving the map when zooming (github: #29)

## Others
* Added some methods regarding UIs: flatworld.initUI, UI.unSelect
* Added validation to UI.js for themes.

<a name="0.6.0"></a>
# 0.6.0 Pathfinding (2016-10-30)

## Possible breaking changes
* flatworld.getMovableLayer and flatworld.getZoomLayer removed
* Added a default prevention of selecting text with mouse. Optional parameter to activate.
* Everything under webpack
* Support for non-subcontainer layer structure removed

## Bug fixes
* Fix several issues with iPhones

## Features
* Added hexagon pathfinding
* Added allMapObjects, alternative data structure, so that you don't always have to retrieve them from individual layers.
* Added pre-calculated map coordinates for objects, so that we don't always need to make conversions for objects to map coordinates (in ObjectSprite as in new ObjectSprite().coordinates)
* Added getMapCoordinates in flatworld
* Extensions have a bit different initialization now and can receive parameters.
* Added utils.general.toggleMouseTextSelection

## Others
* Added constants.js
* Officially moved to alpha development stage

<a name="0.5.0"></a>
# 0.5.0 Fog of war polish and multi-development setups (2016-09-25)

## Bug Fixes
* Fog of war works is synced with map rendering by adding pre-rendering scripts to the engine.

## Features
* Map can have pre-rendering functions

## Others
* Using github issues for task tracking and milestones for roadmap.
* Renamed staticLayer to zoomLayer

<a name="0.4.0"></a>
# 0.4.0 Bug fixes (2016-08-31)

## Bug Fixes
* Caching functionality removed! From the whole library. Currently it was not working correctly and and should have been checked through anyway. It's not considered needed for now.
* Fog of war works correctly now.
* Map movement edge white area flickering polished to be better.

## Features
* Added debounce functionality to mapEvents and the subcribe callback now receives better argument.
* Added ES6 version to dist-files

## Others
* Added 2 different prototype graphics theme for the map.
* Uses official PIXIv4 now

<a name="0.3.0"></a>
# 0.3.0 Bug fixes (2016-08-02)

## Bug Fixes
* Major Fog of War optimizations.
* MapLayerParent.getSubcontainers should have flattened the arrays (breaking change).

## Features
* Added filtering option for MapLayer.getObjects-method.

## Others
* Eslint issues. It actually works.

<a name="0.2.0"></a>
# 0.2.0 Bug fixes (2016-07-??)

## Bug Fixes
* If minimap canvas was not given flatworld main module threw an error.
* Minimap optimizations (caching)
* Multiple small fixes (unfortunately due to nature of the update, not specified individually)

## Features
* Added fog of war
* Added garbage collection method to API (came with PIXIv4)

## Others
* Placed test and dist folders more properly. I can now develop the backend part also more easier.
* Style changes for jshint (and jscs removed)
* Moved graphicData to it's own file, since it's supposed to be changeable.
* Added eslint to the project instead of jshint

<a name="0.1.0"></a>
# 0.1.0 Bug fixes (2016-04-24)

## Bug Fixes
* Context menu is totally disabled now and right click works better cross browser.
* ES6 away from test scripts. Was failing on android.

## Features
* Scale mode can be changed with parameters.
* Added buggy minimap (but working). I introduced too many changes when making the minimap and thus decided to add it to this update. It's still in development, as not of priority right now!

## Others
* Renamed horizontalHexaFactory -> hexaFactory, it will later support vertical too.
* README install instructions and requirements added.
* Changed to use new PIXI v4

<a name="0.0.1"></a>
# 0.0.1 Tiny bug fixes to kickstart the official versions development (2016-04-03)

## Bug Fixes
* Changed README
* Stripped gulp-uglify from development version, sourcemaps were not working.

## Features
* Added scale mode as an option to horizontalHexaFactory

## Others
* Locked webgl renderer as the only possibility in the engine @FlaTWorld.js. We do not need to support canvas.