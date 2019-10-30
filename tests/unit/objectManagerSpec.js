import ObjectManager from '../../src/core/ObjectManager';
import * as Pixi from 'pixi.js';

describe('ObjectManager tests => ', () => {
  it('retrieve', () => {
    const objectManager = new ObjectManager();
    const globalCoords = {
      x: 1,
      y: 1,
    };
    const cont1 = new Pixi.Container();
    const cont2 = new Pixi.Container();
    const obj1 = new Pixi.DisplayObject()
    const obj2 = new Pixi.DisplayObject()
    cont1.addChild(obj1);
    cont2.addChild(obj2);
    const containers = [ cont1, cont2 ];
    const options = {
      type: undefined,
      size: {
        width: 0,
        height: 0
      }
    };

    let objects = objectManager.retrieve(globalCoords);

    expect(objects).toEqual([]);

    objects = objectManager.retrieve(globalCoords, containers, options);

    expect(objects.length).toEqual(containers.length);
    expect(objects[0]).toEqual(containers[0].children[0]);
    
    obj2.hitTest = () => false;
    objects = objectManager.retrieve(globalCoords, containers, options);

    expect(objects.length).toEqual(1);
    expect(objects).toEqual([obj1]);
  });
});
