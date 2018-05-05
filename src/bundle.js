export * from './core/';
import * as allExtensions from './extensions/';
import * as Pixi from 'pixi.js';
import * as UIModule from './UIs/';
import * as hexaFactory from './factories/hexaFactory';

export const extensions = allExtensions;
export const Preloader = Pixi.loaders.Loader;
export const UIs = UIModule.UIs;
export const factories = hexaFactory;