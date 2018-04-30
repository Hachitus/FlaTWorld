

import { getPixelRatio, isWebglSupported, isTouchDevice, isMobile } from '../../../src/core/utils/environment';

describe('utils -> environment => ', () => {
  let canvas;
  let oldTouchStart;

  beforeEach(() => {
    canvas = document.createElement("canvas");
    oldTouchStart = document.documentElement.ontouchstart;
  });
  afterEach(() => {
    document.documentElement.ontouchstart = oldTouchStart;
  });
  it('getPixelRatio', () => {
    spyOn(canvas, 'getContext').and.returnValue({
      webkitBackingStorePixelRatio: 0.5
    });
    window.devicePixelRatio = 1;

    expect(getPixelRatio(canvas)).toEqual(2);
    expect(canvas.getContext).toHaveBeenCalledWith('2d');

    expect(getPixelRatio()).toEqual(1);
  });
  it('isWebglSupported', () => {
    const canvas = document.createElement( 'canvas' );

    spyOn(canvas, 'getContext').and.returnValue({ a:1 });

    expect(isWebglSupported(canvas)).toEqual(true);
    expect(canvas.getContext).toHaveBeenCalledWith('webgl');
  });
  it('isTouchDevice', () => {
    document.documentElement.ontouchstart = () => {};

    expect(isTouchDevice(canvas)).toEqual(true);

    delete document.documentElement.ontouchstart;

    expect(isTouchDevice(canvas)).toEqual(false);
  });
  // This test is not very throroughly made. We can make this more extensive later. We just need to
  // be able to mock window-related objects.
  it('isMobile', () => {
    expect(isMobile()).toEqual(false);
  });
});