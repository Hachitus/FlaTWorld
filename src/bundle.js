import * as core from './core/';
import { default as extensions } from './extensions/';
import * as UIModule from './UIs/';
import * as hexaFactory from './factories/hexaFactory';

const UIs = UIModule.UIs;

const toBeExported = core;
toBeExported.extensions = extensions;
toBeExported.UIs = UIs;
toBeExported.factories = hexaFactory;

module.exports = toBeExported;