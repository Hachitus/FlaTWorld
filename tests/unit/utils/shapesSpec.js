

import { createSquare } from '../../../src/core/utils/shapes';
import * as Pixi from 'pixi.js';

describe('utils -> shapes => ', () => {
  it('createSquare', () => {
    const square = createSquare();
    const graphics = new Pixi.Graphics();

    graphics.lineStyle(2, 0x0000FF, 1);
    graphics.drawRect(50, 250, 100, 100);

    expect(square).toEqual(graphics);
  });
});
