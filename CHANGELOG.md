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