import mapStates from '../../src/core/mapStates';

describe('map states tests (behavioural tests) => ', () => {
  beforeEach(() => {
    if(!mapStates.is('statusQuo')) {
      mapStates.normalize();
    }
  });
  it('fail and check that failing works', () => {
    mapStates.objectSelectDialog();

    expect(mapStates.is('objectSelectDialogOpened')).toEqual(true);

    expect(() => mapStates.objectOrder()).toThrow();
  });
  it('Open object dialog -> then close it', () => {
    mapStates.objectSelectDialog();

    expect(mapStates.is('objectSelectDialogOpened')).toEqual(true);

    mapStates.normalize();

    expect(mapStates.is('statusQuo')).toEqual(true);
  });
  it('Open object dialog -> select object -> then close it', () => {
    mapStates.objectSelectDialog();

    expect(mapStates.is('objectSelectDialogOpened')).toEqual(true);

    mapStates.objectSelect()

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

  it('open UI -> close UI', () => {
    mapStates.UIOpen();

    expect(mapStates.is('mainUIOpened')).toEqual(true)

    mapStates.UIClose();

    expect(mapStates.is('statusQuo')).toEqual(true)
  });
});