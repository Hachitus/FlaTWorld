'use strict';

window.graphicData = {
  nonScaled: {
    terrainBase: {
      json: '/testAssets/images/terrain/hexagonTerrainsRealisticNonScaled.json'
    },
    unit: {
      json: '/testAssets/images/units/testHexagonUnits.json'
    }
  },
  realistic: {
  	terrainBase: {
  		json: '/testAssets/images/terrain/hexagonTerrainsRealistic.json',
  		initialScale: 0.505
  	},
  	unit: {
  		json: '/testAssets/images/units/testHexagonUnits.json'
  	}
  },
  simple: {
  	terrainBase: {
  		json: '/testAssets/images/terrain/hexagonTerrainsSimple.json',
  		initialScale: 0.512
  	},
  	unit: {
  		json: '/testAssets/images/units/hexagonUnitsSimple.json',
  		initialScale: 0.512
  	}
  }
};