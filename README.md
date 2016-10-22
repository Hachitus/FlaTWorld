[![GPLv3 Affero License](http://img.shields.io/badge/license-LGPLv3-blue.svg)](https://www.gnu.org/licenses/agpl.html)
[![Gitter](https://badges.gitter.im/Hachitus/FlaTWorld.svg)](https://gitter.im/Hachitus/FlaTWorld)

#PRE-ALPHA!
The development is still in pre-alpha stage. Basic features are mostly done for the engine, but the API and structure can still go under dramatic changes, please take that into account! Also please contact me if you plan to use the engine or have questions! Gitter is an easy option too.

#Introduction
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
  * [Roadmap](#roadmap)
    * [2016-10](#2016-10)
    * [2016-11](#2016-11)
    * [2016-12](#2016-12)
    * [2017-01](#2017-01)
    * [2017-02](#2017-02)
  * [Sponsors](#sponsors)
  * [Credits](#credits)

#Hot links
* [API documentation](http://hachitus.github.io/FlaTWorld/)
* [Contribution guidelines](CONTRIBUTING.md)
* [Chat in Gitter](https://gitter.im/Hachitus/FlaTWorld)
* [Base plunkr](http://plnkr.co/edit/X9XexHw65aB5Sa6xSroZ?p=preview)
* [Changelog](CHANGELOG.md)

#Developing
##Installation
You can

    git clone https://github.com/Hachitus/FlaTWorld.git

Then install dependencies for building

    npm install

Then build for development

    npm run build

And the current distribution build will be in: src/dist/ (flatworld.js and flatworld_libraries.js)

If you need files for production, deploy

    npm run deploy

And the production files (uglified) will be in: dist/ (flatworld.js and flatworld_libraries.js)

##Examples
Best example is found in [plunkr](http://plnkr.co/edit/X9XexHw65aB5Sa6xSroZ?p=preview). This is the base map created with the engine. The latest example will be found from the engines manual tests (in src/tests/-folder). A working example should also be found in: *http://warmapengine.level7.fi/tests/*, but not quaranteed that it is always on (as server can be down or dns changed).

##Setup a simple map
The main module for the whole map is core.Flatworld, so you should always primarily look through it's API and then dig deeper. The best examples for setting up a map at the moment is still going through the code. Check the test-files: tests/manualTest.html and tests/manualStressTest.html (which are more comprehensive). They use horizontalHexaFactory to go through the map data and setup objects based on that data. You can use horizontalHexaFactory if you want or setup your own factory and own data structure. Factories always have to follow a certain data structure so they might not be something everyone wants or can cope with.

Simple unfinished example:

	import { Preload } from '/components/preloading/preloading';
	import { ObjectTerrain, ObjectUnit } from "/components/map/extensions/hexagons/Objects";

	preload = new Preload( "", { crossOrigin: false } );
	preload.addResource( "terrainBase.json" );

	preload.resolveOnComplete().then(() => {
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

		thisLayer = map.addLayer(layerOptions);
		newObject = new ObjectTerrain({ x: 1, y: 1 }, objData, objectOptions);
		thisLayer.addChild(newObject);
	})

##Factories
Factories are the ones that get the server-side data, iterate through it and create the necessary objects to the FlaTWorld map.

You most likely need to implement your own factory function for your game, if the game is not very close to the factory that the engine provides. At the moment I suggest you read through the code in [horizontalHexaFactory.js](src/factories/horizontalHexaFactory.js) and create your own based on that.

##Extensions
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

##Templates
All UIThemes should extend the UIParent module and they have to implement methods listed in UIs private function validateUITheme.

You have to initialize the UI by calling UIInit method in flatworld.

##Events
For events involved with the FlaTWorld map, you should check the current list from the [mapEvents.js](src/components/map/core/mapEvents.js) file. We try to keep it as up-to-date as possible.

#Requirements and efficiency goals
##Supported environments
* Desktop: Edge, Chrome, Firefox, Safari
* Mobile: Devices not listed, but basically anything that has browser, with these restrictions:
  * WebGL support: [supported devices](http://caniuse.com/#feat=webgl), [webgl on your browser](http://www.doesmybrowsersupportwebgl.com/)
  * Must support ES6 or if you use the transpiled version, then babel restrictions apply for ES6.

##Aimed mapsize and efficiency
These are still subject to change (both raised and lowered). The map is planned to be big! In the way that I checked pretty much the biggest civilization community made maps and got over it. Since those maps do not seem to be sufficient for the plans I have for the engine! But these are still very realistic goals with the present setup.
* Maximum map size: 225 000 000 pixels (15k * 15k)
* Total object count on map: ~50k
* FPS in mobile min. 30. No FPS goal set for desktop as mobile defines the limits.

###2016-10###
* Pathfinding and commading of units.
* Setup webpack

###2016-11###
* Redesign UI modules
* Finish default UI theme
  * Selection of more than one unit. Proper example graphics.

###2016-12###
* Setting up animations and polishing graphics to work correctly.
  * Like no flickering, no disturbing blurriness.

###2017-01###
* Not yet determined which extensions will be in the initial release, but at least half of these should be ready till this point:
  * hotkeys
  * push notifications (like turn changes)
  * gamepad support
  * offline functionality

###2017-02###
* Example game that runs on browser, without server side. Though just simple example, not really suitable for actual playing.
* Documentation polished.
* Start server side functionality. Remains to be seen how much of it is in github...

#Sponsors
Thank you to browserstack for providing magnificient testing tools
<a href="http://www.browserstack.com"><img alt="browserstack logo" src="https://raw.githubusercontent.com/Hachitus/warmapengine/master/nonModuleRelated/browserStackLogo.png" width="150"/></a>

#Credits
Copyright (c) 2016 Janne Hyytiä

Graphics:
* Realistic units from freeciv.

#Thank yous
https://github.com/dmitrysteblyuk (Pathfinding module)
