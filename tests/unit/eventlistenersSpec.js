import eventlisteners from '../../src/core/eventlisteners';

describe('eventlisteners tests => ', () => {
  const type = 'test';
  const cbOn = () => {};
  const cbOff = () => {}

  beforeEach(() => {
    eventlisteners.setDetector(type, cbOn, cbOff);
  })
  it('on, off and isOn', () => {
    const toSpy = {
      cb: () => {}
    };
    spyOn(toSpy, 'cb');

    eventlisteners.on(type, toSpy.cb)
    expect(eventlisteners.isOn(type, toSpy.cb)).toBe(true);

    eventlisteners.off(type, toSpy.cb)
    expect(eventlisteners.isOn(type, toSpy.cb)).toBe(false);
  });
  it('set and get activityState', () => {
    const state = 'abc';
    eventlisteners.setActivityState(type, state);

    expect(eventlisteners.getActivityState(type)).toEqual(state)
  });
  it('clearDetector', () => {
    eventlisteners.on(type);
    eventlisteners.clearDetector(type);
  });
});
