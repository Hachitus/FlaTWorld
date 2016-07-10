(function objectsSpec() {
  const flatworldCreatorHelper = window.flatworldCreatorHelper;
  const ObjectSprite = window.flatworld.objects.ObjectSprite;
  const ObjectSpriteTerrain = window.flatworld.objects.ObjectSpriteTerrain;
  const ObjectSpriteUnit = window.flatworld.objects.ObjectSpriteUnit;

  let map;

  describe('object tests => ', () => {

    beforeEach(() => {
      map = flatworldCreatorHelper();
    });      

    it('ObjectSprite', () => {
      const object = new ObjectSprite(PIXI.Texture.EMPTY, { x: 0, y: 0 });
      expect(object).toBeDefined();
    });

    it('ObjectSpriteUnit', () => {
      const movableLayer = map.getMovableLayer();
      const unit10_10 = movableLayer.children[0].children[0];

      map.moveMap({ x: -50 });
      movableLayer.updateTransform();

      let test = movableLayer.toLocal(new PIXI.Point(0, 0));
      expect(movableLayer.x).toBe(-50);
      expect(test.x).toBe(50);
      expect(test.y).toBe(0);

      test = unit10_10.toGlobal(new PIXI.Point(0, 0));
      expect(test.x).toBe(-40);
      expect(test.y).toBe(10);

      map.moveMap({ x: 50, y: -10 });
      movableLayer.updateTransform();
      test = unit10_10.toLocal(new PIXI.Point(50, 50));
      expect(test.x).toBe(40);
      expect(test.y).toBe(50);
    });
  });
})();
