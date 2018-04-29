

import mapEvents from '../../src/core/mapEvents';

describe('mapEvents tests => ', () => {
  beforeEach(() => {
    mapEvents.removeAllListeners();
  })
  it('basic', () => {
    let cbFinished = 'no';
    const testCallback = function (datas/* , context */) {
      cbFinished = datas;
    };

    mapEvents.subscribe('test', testCallback);
    mapEvents.publish('test', [ 'called', 'called2', 'called3' ]);
    expect(cbFinished).toEqual(['called', 'called2', 'called3']);

    // We test that the timer works!
    mapEvents.subscribe('test', testCallback);
    mapEvents.publish({ name: 'test' }, ['called3', 'called4']);

    expect(cbFinished).toEqual(['called3', 'called4']);
  });
  // possibly can cause issues at some point since uses setTimeouts and actual timing?
  it('custom timers with cooldowns', (done) => {
    const testCooldown = 50;
    let cbFinished = 'no';
    const testCallback = function (datas) {
      cbFinished = datas;
    };

    expect(cbFinished).toBe('no');

    /* When .subscribe is called, the mapEvents internal timer is set off (to 0). Which means next publish call with any
      cooldown-value, will get called nonetheless */
    mapEvents.subscribe('test2', testCallback);
    /* .publish should go through, since we just created test2 with .subscribe and cooldowns don't have effect on the
      first publish call */
    mapEvents.publish({ name: 'test2', cooldown: 20 }, [1, 2]);

    expect(cbFinished).toEqual([1, 2], 'FIRST');

    /* This one has timeout set to 5 milliseconds and our cooldown in milliseconds is 50, the 50 milliseconds should not
      have passed from the call to publish last time couple rows higher. So the callback should get called */
    window.setTimeout(() => {
      expect(cbFinished).toEqual([1, 2], 'SECOND');
      mapEvents.publish({ name: 'test2', cooldown: testCooldown }, [3, 4]);
    }, 5);

    /* This one waits for 100 milliseconds, which is longer than the given cooldown of 50 milliseconds, so the callback
      should get called */
    window.setTimeout(() => {
      expect(cbFinished).toEqual([1, 2], 'THIRD');
      mapEvents.publish({ name: 'test2', cooldown: testCooldown }, [5, 6]);
    }, 100);

    expect(cbFinished).toEqual([1, 2], 'FOURTH');

    /* This one waits for more than 100 milliseconds, which is longer than the last setTimeout, which set the [5, 6] 
    values, so the callback should have set the [5, 6] values correctly through callback */
    window.setTimeout(() => {
      expect(cbFinished).toEqual([5, 6], 'FINAL');
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