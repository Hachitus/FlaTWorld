export * from './core/';
import * as allExtensions from './extensions/';
import * as Pixi from 'pixi.js';
import * as hexaFactory from './factories/hexaFactory';

export const extensions = allExtensions;
export const Preloader = Pixi.loaders.Loader;
export const factories = hexaFactory;