import mapEvents from '../../src/core/mapEvents';
import * as sinon from 'sinon';
import * as constants from '../../src/core/constants';

const jasmineClock = jasmine.clock();
// We might want to mock this later on, if we change testing framework
const windowMock = {
  setTimeout: window.setTimeout.bind(window)
}

describe('mapEvents tests => ', () => {
  let constantMock;
  jasmineClock.install();
  jasmineClock.mockDate(new Date());

  beforeEach(() => {
    constantMock = sinon.stub(constants, 'getWindow').returns(windowMock);
    mapEvents.removeAllListeners();
  });
  afterAll(() => {
    constantMock.restore();
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
  it('custom timers with cooldowns', () => {
    const testCooldown = 50;
    let cbFinished = 'no';
    const testCallback = function (datas) {
      cbFinished = datas;
    };

    expect(cbFinished).toBe('no', '1st');

    mapEvents.subscribe('test2', testCallback);
    /* first publish should go through no matter the cooldown */
    mapEvents.publish({ name: 'test2', cooldown: 20 }, 'firstPublishAlwaysGoesThrough');
    expect(cbFinished).toEqual('firstPublishAlwaysGoesThrough');

    /* Since the cooldown is 50ms and we tick only 30ms, this shouldn't trigger */
    jasmineClock.tick(30);
    mapEvents.publish({ name: 'test2', cooldown: testCooldown }, 'ThisOneDoesntTriggerWithOnly30Milliseconds');
    expect(cbFinished).toEqual('firstPublishAlwaysGoesThrough');

    /* This one waits for 30 + 40 milliseconds, which is longer than the given cooldown of 50 milliseconds, so the callback
      should get called synchronously */
    jasmineClock.tick(40);
    mapEvents.publish({ name: 'test2', cooldown: testCooldown }, 'ThisOneIsOkWith30+40MilliSeconds');
    jasmineClock.tick(1);
    expect(cbFinished).toEqual('ThisOneIsOkWith30+40MilliSeconds');

    jasmineClock.tick(20);
    mapEvents.publish({ name: 'test2', cooldown: testCooldown }, 'ThisShouldntTriggerEitherWith20MilliSeconds');
    expect(cbFinished).toEqual('ThisOneIsOkWith30+40MilliSeconds');
  });
  it('debounce', () => {
    let cbFinished = 'no';
    const testCallback = mapEvents.debounce(function (datas) {
      cbFinished = datas;
    }, 20);

    mapEvents.subscribe('test3', testCallback);
    mapEvents.publish('test3', 'WithDebounceItTakes20MillisecondsToActivate');
    jasmineClock.tick(5);
    expect(cbFinished).toEqual('no');
    jasmineClock.tick(50);
    expect(cbFinished).toEqual('WithDebounceItTakes20MillisecondsToActivate');

    mapEvents.publish({ name: 'test3', cooldown: 40 }, 'Happens');
    expect(cbFinished).toEqual('WithDebounceItTakes20MillisecondsToActivate');
    jasmineClock.tick(50);
    expect(cbFinished).toEqual('Happens');

    jasmineClock.tick(15);
    expect(cbFinished).toEqual('Happens');
  });
});