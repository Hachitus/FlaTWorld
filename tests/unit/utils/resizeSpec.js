

import { toggleFullScreen, setToFullSize, getWindowSize, resizePIXIRenderer, fullsizeCanvasCSS  } from '../../../src/core/utils/resize';

describe('utils -> shapes => ', () => {
  it('toggleFullScreen', () => {
    let called = false;
    const body = document.querySelector('body');
    body.webkitRequestFullScreen = () => { called = true };
    body.mozRequestFullScreen = () => { called = true };
    toggleFullScreen();

    expect(called).toEqual(true);
  });
  it('setToFullSize', () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    setToFullSize(context)();

    expect(context.canvas.width).toBeGreaterThan(0);
  });
  it('getWindowSize', () => {
    const size = getWindowSize();

    expect(size.x).toBeGreaterThan(0);
    expect(size.y).toBeGreaterThan(0);
  });
  it('resizePIXIRenderer', () => {
    let called = 0;
    const drawOnNextTick = () => {
      called++;
    };
    const renderer = {
      resize: () => {
        called++;
      }
    }
    

    resizePIXIRenderer(renderer, drawOnNextTick);

    expect(called).toEqual(2);
  });
  it('fullsizeCanvasCSS', () => {
    const canvasElement = document.createElement('canvas');

    fullsizeCanvasCSS(canvasElement);

    expect(canvasElement.style.position).toEqual('absolute');
  });
});
