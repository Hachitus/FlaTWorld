'use strict';

window.mapData = {
  gameID: "53837d47976fed3b24000005",
  turn: 1,
  startPoint: { x: 41, y: 47 },
  element: "#mapCanvas",
  layers: [{
    type: "layer",
    coord: { x: 0, y: 0 },
    name: "terrainLayer",
    group: "terrain", // For quadTrees
    specials: [{
      interactive: false
    }],
    options: {
      cache: true
    },
    objectGroups: [{
      type: "ObjectTerrain",
      name: "Terrain", // For quadTrees and debugging
      typeImageData: "terrainBase",
      objects: [{
        objType:0,
        name:"swamp",
        _id:"53837d49976fed3b240006b8",
        coord:{
          x:"0",
          y:"0"
        },
        data: {},
        lastSeenTurn:"1"
      },{
        objType:1,
        name:"swamp",
        _id:"53837d49976fed3b240006bd",
        coord:{
          x:"0",
          y:"208"
        },
        data: {},
        lastSeenTurn:"1"
      },
      {
        objType:2,
        name:"tundra",
        _id:"53837d49976fed3b240006c2",
        coord:{
          x:"60",
          y:"103"
        },
        data: {},
        lastSeenTurn:"1"
      },
      {
        objType:3,
        name:"forest",
        _id:"53837d49976fed3b240006c7",
        coord:{
          x:"120",
          y:"208"
        },
        data: {},
        lastSeenTurn:"1"
      }]
    }]
  },{
    type: "layer",
    coord: {
      x: "0",
      y: "0"
    },
    name: "unitLayer",
    group: "unit", // For quadTrees
    options: {
      cache: "false"
    },
    objectGroups: [{
      type: "ObjectUnit",
      name: "Unit", // I guess only for debugging?
      typeImageData: "unit",
      objects: [{
        objType:0,
        name: "Tank you",
        coord: {
          x:"60",
          y:"103"
        },
        data: {
          playerID: 0,
          hp: 10
        },
        lastSeenTurn:"1"
      }]
    }]
  }]
};