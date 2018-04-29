

import { MapLayer, MapLayerParent, MapSubcontainer } from '../../src/core/MapLayers';
import { MapDataManipulator } from '../../src/core/index';
import * as Pixi from 'pixi.js';

describe('mapLayers tests => ', () => {
  let mapLayer;
  let mapLayerParent;
  let UIObject;

  beforeEach(() => {
    mapLayer = new MapLayer({
      name: 'layer1',
      coord: { x: 0, y: 0 },
      specialLayer: false,
      zoomLayer: true,
      selectable: false});
    mapLayerParent = new MapLayerParent({
      name: 'parent',
      coord: { x: 0, y: 0 },
      subcontainers: {
        width: 100,
        height: 100,
        maxDetectionOffset: 100
      },
      specialLayer: false,
      zoomLayer: true,
      selectable: false});

    UIObject = new Pixi.DisplayObject();
  })
  describe('MapLayer', () => {
    it('subContainers', () => {
      mapLayer.subcontainersConfig = {
        width: 1,
        height: 1,
      };

      expect(mapLayer.hasSubcontainers()).toBeTruthy();

      mapLayer.subcontainersConfig = {
        width: 0,
        height: 0,
      };

      expect(mapLayer.hasSubcontainers()).toBeFalsy();
    });
    it('move', () => {
      mapLayer.move({ x: 1, y: 2 })
      expect([mapLayer.x, mapLayer.y]).toEqual([ 1, 2 ]);
    });
    it('zoom', () => {
      mapLayer.setZoom(0.5);
      expect(mapLayer.getZoom()).toEqual(0.5);

      mapLayer.setZoom(5);
      expect(mapLayer.getZoom()).toEqual(5);

      mapLayer.setZoom(-5)
      expect(mapLayer.getZoom()).toEqual(-5);
    });
    it('getPrimaryLayers', () => {
      mapLayer.addChild(mapLayerParent);
      // Special layers shouldn't come out from getPrimaryLayers
      UIObject.specialLayer = true;
      mapLayer.addChild(UIObject);

      let primaryLayers = mapLayer.getPrimaryLayers();
      expect(primaryLayers.length).toEqual(1);
      expect(primaryLayers[0]).toBe(mapLayerParent);
      
      const filters = new MapDataManipulator({
        type: 'filter',
        object: 'layer',
        property: 'abc',
        value: true,
      });

      primaryLayers = mapLayer.getPrimaryLayers({ filters });
      expect(primaryLayers.length).toBeFalsy();
    });
    it('getObjects', () => {
      expect(mapLayer.getObjects).toThrow(new Error('Has to be implemented in child class'));
    });
    it('createUILayer', () => {
      const UILayer = mapLayer.createUILayer();

      expect(mapLayer.children.length).toEqual(1);
      expect(mapLayer.children[0]).toBe(UILayer);
      expect(mapLayer.getUILayer()).toBe(UILayer);
    });
    it('addUIObject', () => {
      const UIName = 'UIName';

      mapLayer.addUIObject(UIObject, UIName);

      expect(mapLayer.UILayer.children.length).toEqual(1);
      expect(mapLayer.UILayer.children[0]).toEqual(UIObject);
    });
    it('deleteUIObjects', () => {
      const UIName = 'UIName';
      const UIName2 = UIName + 1;
      const UIObject2 = new Pixi.DisplayObject();

      mapLayer.addUIObject(UIObject, UIName);
      mapLayer.addUIObject(UIObject2, UIName2);
      expect(mapLayer.UILayer.children.length).toEqual(2);
      
      mapLayer.deleteUIObjects(UIName);
      expect(mapLayer.UILayer.children.length).toEqual(1);

      mapLayer.addUIObject(UIObject, UIName);      
      mapLayer.deleteUIObjects();
      expect(mapLayer.UILayer.children.length).toEqual(0);
    });
  });
  describe('MapLayerParent', () => {
    it('addChild', () => {
      mapLayerParent.addChild(UIObject);

      expect(mapLayerParent.children[0].children[0]).toBe(UIObject);
    });
    it('getObjects', () => {
      mapLayerParent.addChild(UIObject);
      const objects = mapLayerParent.getObjects();
      
      expect(objects[0]).toBe(UIObject)
    });
    it('subContainers - configs', () => {
      expect(mapLayerParent.hasSubcontainers()).toBeTruthy();
      expect(mapLayerParent.getSubcontainerConfigs()).toBeTruthy();
    });
    it('subContainers - get them', () => {
      const subcontainer1 = new Pixi.Container();
      const subcontainer2 = new Pixi.Container();
      subcontainer2.x = 200
      subcontainer2.y = 200
      mapLayerParent.addChild(subcontainer1, subcontainer2);

      expect(mapLayerParent.getSubcontainers()).toEqual([subcontainer1.parent]);
      expect(mapLayerParent.getSubcontainersByCoordinates({
        x: 50,
        y: 50
      })).toEqual([subcontainer1.parent]);
      expect(mapLayerParent.getSubcontainersByCoordinates({
        x: 200,
        y: 200
      })).toEqual([]);
    });
  });
  describe('MapSubcontainer', () => {
    it('getSubcontainerArea', () => {
      let container = new MapSubcontainer({
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });

      expect(container.getSubcontainerArea()).toEqual({
        x: 0,
        y: 0,
        width: 100,
        height: 100
      });

      container = new MapSubcontainer({
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });
      container.x = 50;
      container.y = 50;

      expect(container.getSubcontainerArea({ toGlobal: false })).toEqual({
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });
    });
    it('getSubcontainerArea - parameter required', () => {
      expect(() => new MapSubcontainer()).toThrow(new Error('MapSubcontainer requires size parameter'));
    });
  });
  
});