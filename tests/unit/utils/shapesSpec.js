

import { createSquare } from '../../../src/core/utils/shapes';
import * as Pixi from 'pixi.js';

describe('utils -> shapes => ', () => {
  it('createSquare', () => {
    const square = createSquare();
    const graphics = new Pixi.Graphics();

    graphics.lineStyle(2, 0x0000FF, 1);
    graphics.drawRect(50, 250, 100, 100);

    // Both instances have their own IDs, so we ignore them, setting them manualle to match.
    square.geometry.id = 0;
    square.geometry.buffers[0].id = 0;
    square.geometry.buffers[1].id = 1;
    graphics.geometry.id = 0;
    graphics.geometry.buffers[0].id = 0;
    graphics.geometry.buffers[1].id = 1;

    expect(square).toEqual(graphics);
  });
});
