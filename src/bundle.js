export * from './core/';
import * as allExtensions from './extensions/';
import * as Pixi from 'pixi.js';

export const extensions = allExtensions;
export const Preloader = Pixi.Loader;