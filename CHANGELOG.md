<a name="0.1.1"></a>
# 0.1.1 Bug fixes (2016-05-??)
## Bug Fixes
* If minimap canvas was not given flatworld main module threw an error.
* Minimap optimizations (caching)

## Features
* Added fog of war
* Added garbage collection method to API (came with PIXIv4)

## Others
* Placed test and dist folders more properly. I can now develop the backend part also more easier.
* Style changes for jshint (and jscs removed)
* Moved graphicData to it's own file, since it's supposed to be changeable.

<a name="0.1.0"></a>
# 0.1.0 Bug fixes (2016-04-24)
## Bug Fixes
* Context menu is totally disabled now and right click works better cross browser.
* ES6 away from test scripts. Was failing on android.

## Features
* Scale mode can be changed with parameters.
* Added buggy minimap (but working). I introduced too many changes when making the minimap and thus decided to add it to this update. It's still in development.

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