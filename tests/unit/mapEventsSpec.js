(function mapEventsSpec() {
  const mapEvents = window.flatworld.mapEvents;
  let map;

  describe('mapEvents tests => ', () => {
    beforeEach(() => {
      mapEvents.removeAllListeners();
    })
    it('basic', () => {
      let cbFinished = 'no';
      const testCallback = function (datas, context) {
        cbFinished = datas;
        console.log(console.time())
      };

      mapEvents.subscribe('test', testCallback);
      mapEvents.publish('test', [ 'called', 'called2', 'called3' ]);
      expect(cbFinished).toEqual(['called', 'called2', 'called3']);

      // We test that the timer works!
      mapEvents.subscribe('test', testCallback);
      mapEvents.publish({ name: 'test' }, ['called3', 'called4']);

      expect(cbFinished).toEqual(['called3', 'called4']);
    });
    it('custom cooldown (very flaky as timing involved, we should have a better one)', (done) => {
      let cbFinished = 'no';
      const testCallback = function (datas) {
        cbFinished = datas;
      };

      expect(cbFinished).toBe('no');

      mapEvents.subscribe('test2', testCallback);
      mapEvents.publish({ name: 'test2', cooldown: 20 }, [1, 2]);
      expect(cbFinished).toEqual([1, 2], 'FIRST');

      window.setTimeout(() => {
        expect(cbFinished).toEqual([1, 2], 'SECOND');
        mapEvents.publish({ name: 'test2', cooldown: 45 }, [3, 4]);
      }, 5);

      window.setTimeout(() => {
        expect(cbFinished).toEqual([1, 2], 'THIRD');
        mapEvents.publish({ name: 'test2', cooldown: 50 }, [5, 6]);
      }, 10);

      expect(cbFinished).toEqual([1, 2], 'FOURTH');

      window.setTimeout(() => {
        expect(cbFinished).toEqual([5, 6]);
        done();
      }, 200);
    });
    it('debounce', (done) => {
      let cbFinished = 'no';
      const testCallback = mapEvents.debounce(function (datas) {
        cbFinished = datas;
      }, 10);

      mapEvents.subscribe('test3', testCallback);
      mapEvents.publish('test3', 22);
      mapEvents.subscribe('test3', testCallback);
      mapEvents.publish('test3', [1, 2]);

      window.setTimeout(() => {
        mapEvents.publish({ name: 'test3', cooldown: 1 }, [3, 4]);
        expect(cbFinished).toEqual([1, 2]);
      }, 11);
      window.setTimeout(() => {
        expect(cbFinished).toEqual([3, 4]);
        done();
      }, 45)
    });
  });
})();
