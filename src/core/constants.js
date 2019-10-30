import * as PIXI from 'pixi.js';
// const { PIXI } = window.flatworld_libraries;

export const constants = {
  ZERO_COORDINATES: new PIXI.Point(0,0),
  VERSION: '0.6.5',
  DEFAULT_SCALE_MODE: 0,
};
export function getWindow() {
  return window;
}
/*---------------------
--------- API ---------
----------------------*/
export default constants;
