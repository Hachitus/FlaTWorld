[![GPLv3 Affero License](http://img.shields.io/badge/license-LGPLv3-blue.svg)](https://www.gnu.org/licenses/agpl.html)
[![Gitter](https://badges.gitter.im/Hachitus/FlaTWorld.svg)](https://gitter.im/Hachitus/FlaTWorld)

# Development halted
Unfortunately for several (personal) reasons, I've decided to cancel the development of the engine. There was a game in an ok status being developed with it, so with small performance and bug tweaks then engine was in quite a good shape already. But there is a time for everything.

# ALPHA!
The development is still in alpha stage. Basic features are mostly done for the engine, but the API and structure can still go under changes, please take that into account! Also please contact me if you plan to use the engine or have questions! Gitter is an easy option too.

# Introduction
2D turn-based strategy game engine for browsers. The engine originally got into development to get an engine for more hard-core turn-based games and not casual games. I was frustrated at waiting for those games and decided to start making it on my own. Browser environment is a perfect match for turn-based multiplayer. You can continue your turn easily anywhere, any time!

If you are interested contact me (http://hyytia.level7.fi/). I am eager and grateful to get any feedback or help with the project.

Table of contents
=================

  * [Hot links](#hot-links)
  * [Developing](#developing)
    * [Installation](#installation)
    * [Examples](#examples)
    * [Setup a simple map](#setup-a-simple-map)
    * [Factories](#factories)
    * [Extensions](#extensions)
    * [Templates](#templates)
    * [Events](#events)
  * [Requirements and restrictions](#requirements-and-efficiency-goals)
    * [Supported environments](#supported-environments)
    * [Aimed mapsize and efficiency](#aimed-mapsize-and-efficiency)
  * [Sponsors](#sponsors)
  * [Credits](#credits)

# Hot links
* [API documentation](http://hachitus.github.io/FlaTWorld/)
* [Contribution guidelines](CONTRIBUTING.md)
* [Chat in Gitter](https://gitter.im/Hachitus/FlaTWorld)
* [Base plunkr](http://plnkr.co/edit/X9XexHw65aB5Sa6xSroZ?p=preview)
* [Changelog](CHANGELOG.md)

# Developing
## Installation
    npm i flatworld

## Examples
Best example is found in [plunkr](http://plnkr.co/edit/asL1N4?p=info). This is the base map created with the engine. The latest example will be found from the engines manual tests (in src/tests/-folder). A working example should also be found in: *http://flatworld.level7.fi/manualStressTest.html*, but not quaranteed that it is always on (as server can be down or dns changed).

## Setup a simple map
The main module for the whole map is core.Flatworld, so you should always primarily look through it's API and then dig deeper. The best examples for setting up a map at the moment is still going through the code. Check the test-files: tests/manualTest.html and tests/manualStressTest.html (which are more comprehensive). They use horizontalHexaFactory to go through the map data and setup objects based on that data. You can use horizontalHexaFactory if you want or setup your own factory and own data structure. Factories always have to follow a certain data structure so they might not be something everyone wants or can cope with.

Simple example:

	import Loader from 'resource-loader';
	import { ObjectTerrain, ObjectUnit } from "/components/map/extensions/hexagons/Objects";

	const baseUrl = '';
	preload = new Loader( baseUrl, { crossOrigin: false } );
	preload.add( "terrainBase.json" );

	preload.load(() => {
		var map, thisLayer, newObject;
		var layerOptions = {
	    	name: "terrainLayer",
	      	drawOutsideViewport: {
	        	x: 100,
	        	y: 100
	      	},
	      	selectable: layerData.name === "unitLayer" ? true : false
	    };
	    var objData = {
          typeData: "typeData,
          activeData: "someData"
        };
        var currentFrame = 1;
        var hexagonRadius = 50;
        var objectOptions = {
            currentFrame,
        	radius: hexagonRadius
        };

		map = new Map(canvasElement, mapOptions );
		dialog_selection = document.getElementById("selectionDialog");
	    defaultUI = new UI_default(dialog_selection, map);

	    /* Initialize UI as singleton */
	    UI(defaultUI, map);

		map.init( pluginsToActivate, startPoint );

		thisLayer = map.addLayer('terrain', layerOptions);
		newObject = new ObjectTerrain({ x: 1, y: 1 }, objData, objectOptions);
		thisLayer.addChild(newObject);
	})

## Factories
Factories are the ones that get the server-side data, iterate through it and create the necessary objects to the FlaTWorld map.

You most likely need to implement your own factory function for your game, if the game is not very close to the factory that the engine provides. At the moment I suggest you read through the code in [hexaFactory.js](tests/manual/hexaFactory.js) and create your own based on that.

## Extensions
The map supports adding extensions and even some of the core libraries parts have been implemented as extensions. You must comply to few rules:
* Be careful when constructing an extension. They have a lot of freedom to mess around with the map data (which might change in the future).
* When extension is initialized, it will create this.mapInstance and this.protectedProperties. First has the current instantiated map and second the private methods and properties for plugins to use
* Extensions init-method must return promise, to verify, when the plugin is ready
* All parameters extensions can receive are functions, that are bound in plugin context
* Must return an object containing:
  * init-method
  * 'PluginName' variable, which has same value as the exported library name

You can see the required format from e.g. [hexagon](src/components/map/extensions/hexagons/selectHexagonPlugin.js) extension.

The format for these rules as an example:
```javascript

	export const sameNameThatIsExported = setupModuleFunction();

	function setupModuleFunction() {
    return {
  	  pluginName: "sameNameThatIsExported",
  	  init: function(map) {}
    }
	}

```

## Templates
All UIThemes should extend the UIParent module and they have to implement methods listed in UIs private function validateUITheme.

You have to initialize the UI by calling UIInit method in flatworld.

## Events
For events involved with the FlaTWorld map, you should check the current list from the [mapEvents.js](src/components/map/core/mapEvents.js) file. We try to keep it as up-to-date as possible.

# Requirements and efficiency goals
## Supported environments
* Desktop: Edge, Chrome, Firefox, Safari
* Mobile: Devices not listed, but basically anything that has browser, with these restrictions:
  * WebGL support: [supported devices](http://caniuse.com/#feat=webgl), [webgl on your browser](http://www.doesmybrowsersupportwebgl.com/)
  * Must support ES6 or if you use the transpiled version, then babel restrictions apply for ES6.

## Aimed mapsize and efficiency
These are still subject to change (both raised and lowered). The map is planned to be big! In the way that I checked pretty much the biggest civilization community made maps and got over it. Since those maps do not seem to be sufficient for the plans I have for the engine! But these are still very realistic goals with the present setup.
* Maximum map size: 225 000 000 pixels (15k * 15k)
* Total object count on map: ~50k
* FPS in mobile min. 30. No FPS goal set for desktop as mobile defines the limits.

# Credits
Testing:
* Thank you to browserstack for providing magnificient testing tools
<a href="http://www.browserstack.com"><img alt="browserstack logo" src="https://raw.githubusercontent.com/Hachitus/warmapengine/master/nonModuleRelated/browserStackLogo.png" width="150"/></a>

Graphics:
* Realistic units from freecivs amplio set (http://download.gna.org/freeciv/contrib/tilesets/amplio/Readme).

Sounds:
* http://www.freesound.org/people/_hash_Hazard/sounds/127601/
* http://www.freesound.org/people/Artmasterrich/sounds/345458/

Contributors:
* https://github.com/dmitrysteblyuk (Pathfinding module)
