import * as PIXI from 'pixi.js';

/**
 * @method createSquare
 * 
 * @return {Pixi.Graphics}
 */
export function createSquare() {
  const graphics = new PIXI.Graphics();

  graphics.lineStyle(2, 0x0000FF, 1);
  graphics.drawRect(50, 250, 100, 100);

  return graphics;
}

/*---------------------
--------- API ---------
----------------------*/
export default {
  createSquare
};
