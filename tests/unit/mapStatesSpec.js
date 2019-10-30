import mapStates from '../../src/core/mapStates';

describe('map states tests (behavioural tests) => ', () => {
  beforeEach(() => {
    if(!mapStates.is('statusQuo')) {
      mapStates.normalize();
    }
  });
  it('select object -> then close it', () => {
    mapStates.objectSelect();

    expect(mapStates.is('objectSelected')).toEqual(true);

    mapStates.normalize();

    expect(mapStates.is('statusQuo')).toEqual(true);
  });
  it('Select object on map -> issue order -> processing order ends -> return to normal status', () => {
    mapStates.objectSelect();

    expect(mapStates.is('objectSelected')).toEqual(true)

    mapStates.objectOrder();

    expect(mapStates.is('animatingObject')).toEqual(true)

    mapStates.objectOrderEnd();

    expect(mapStates.is('objectSelected')).toEqual(true)

    mapStates.normalize();

    expect(mapStates.is('statusQuo')).toEqual(true)
  });
});