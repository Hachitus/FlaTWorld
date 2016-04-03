[![GPLv3 Affero License](http://img.shields.io/badge/license-LGPLv3-blue.svg)](https://www.gnu.org/licenses/agpl.html)
[![Gitter](https://badges.gitter.im/Hachitus/FlaTWorld.svg)](https://gitter.im/Hachitus/FlaTWorld)

#PRE-ALPHA!
The development is still in pre-alpha stage. The most drastic changes have been done and the basic functionality and API is in place. The API and structure can still go under dramatic changes after feedback. If you use the engine for something serious, please take that into account! Also it is good to contact me, if you use the engine for something, as I can provide assistance and will know what people are using it for and can develop the engine a lot more efficiently following a correct path.

Next development phase contains building example game for the engine slowly and adding features to it. These feature can or can not be added to the engine. Based on the situation they are in the engine or as a separate example of how to build the game on top of the engine.

#Introduction
2D (turn-based) strategy game engine for browsers. The engine originally got into development to get an engine for more hard-core turn-based games and not casual games (though it can most certainly be used for those!). Some features are in my roadmap to do, for the next 6-9 months. Why is was decided to create the engine, was that I saw huge potential for turn-based games in browser and have been waiting for years to get a decent one. But that never happened.

The engine will also get a server-side implementation in node.js (for turn-based games). But it is still not sure, how much of this implementation can be used as-is in the general engine and how much will be example game-related code.

The development is done in ES6 and transpiled to work on all browsers that are supported. the official support for the engine is IE11+.

If you are interested contact me (http://hyytia.level7.fi/). I am very eager to get any feedback or help with the project.

Table of contents
=================

  * [Hot links](#Hot-links)
  * [Developing](#Developing)
    * [Examples](#Examples)
    * [Setup a simple map](#Setup-a-simple-map)
    * [Plugins](#Plugins)
    * [Events](#Events)
    * [Templates](#Templates)
  * [Roadmap](#Roadmap)
    * [2016-05](#2016-05)
    * [2016-06](#2016-06)
    * [2016-07](#2016-07)
    * [2016-08](#2016-08)
    * [2016-09](#2016-09)
    * [2016-11](#2016-11)
    * [2017-01](#2017-01)
  * [Sponsors](#Sponsors)
  * [Credits](#Credits)

#Hot links
* [API documentation](http://hachitus.github.io/FlaTWorld/documentation/)
* [Contribution guidelines](CONTRIBUTING.md)
* [Chat in Gitter](https://gitter.im/Hachitus/FlaTWorld)
* [Base plunkr](https://plnkr.co/edit/X9XexHw65aB5Sa6xSroZ?p=preview)
* [Changelog](CHANGELOG.md)

#Developing
##Examples
Best example is found in [plunkr](https://plnkr.co/edit/X9XexHw65aB5Sa6xSroZ?p=preview). This is the base map created with the engine. The latest example will be found from the engines manual tests (in src/tests/-folder). A working example should also be found in: *http://warmapengine.level7.fi/tests/*, but not quaranteed that it is always on (as server can be down or dns changed).

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
The map supports adding extensions and even some of the core libraries parts have been implemented as extensions. You must comply to just couple rules:
* Be careful when constructing an extension. They have a lot of freedom to mess around with the map data (which might change in the future).
* Must return an object containing:
  * Init method
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
UI interface is implemented so that map uses the UI.js module to implement API and to that API you pass in the UITheme
module you want to use in the game. All UIThemes should implement at least the core functionality API.

UI Templates use the methods that UI.js offers them. They do not need to inherit anything, but they will be used through UI.js and must comply to the necessary methods that UI.js uses.

##Events
For events involved with the FlaTWorld map, you should check the current list from the [mapEvents.js](src/components/map/core/mapEvents.js) file. We try to keep it as up-to-date as possible.

#Roadmap
###2016-05###
- Created own repository and very basic base for server-side

###2016-06###
- Minimap and Fog of War layer added

###2016-07###
- Simple example game working, that will be developed through the year

###2016-08###
* Preliminary server-side functionality ready
  * Normal API works, with most likely mongoDB
  * Receives and sends data correctly, but does not generate turns yet

###2016-09###
- Map generator ready

###2016-11###

- Server-side logic for turn-based strategy ready
- The map has been extended with several more features
  - animation
  - offline functionality
  - hotkeys
  - push notifications

###2017-01###

- Example game ready
- Documentation finished
- Front- and server-sides are ready for version 1.0

#Sponsors
Thank you to browserstack for providing magnificient testing tools
<a href="http://www.browserstack.com"><img alt="browserstack logo" src="https://raw.githubusercontent.com/Hachitus/warmapengine/master/nonModuleRelated/browserStackLogo.png" width="150"/></a>

#Credits
Copyright (c) 2016 Janne Hyytiä

Graphics:
* http://kenney.nl/assets/hexagon-pack
* Originally everything was from freeciv, but those are being refactored away.