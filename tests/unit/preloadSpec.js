import { Preload } from '../../src/preloading/Preload';

describe('Preload tests => ', () => {
  const mockAssets = {
    name: 'test',
    url: '../testAssets/sounds/confirm.wav',
  };
  Object.freeze(mockAssets);
  const baseUrl = '';
  const options = {
    concurrency: 15,
    crossOrigin: false,
  };
  let preload;
  let resource;
  preload = new Preload(baseUrl, options);
  const oldOnce = preload.preloaderClass.once;

  beforeEach(() => {
    preload = new Preload(baseUrl, options);
    resource = 'abc';
    
    preload.preloaderClass.once = oldOnce;
  })
  it('addResource', () => {
    spyOn(preload.preloaderClass, 'add')

    preload.addResource(resource);

    expect(preload.preloaderClass.add).toHaveBeenCalledWith(resource);
  });
  it('loadManifest', () => {
    throw new Error('NOT IMPLEMENTED')
  });
  it('resolveOnComplete', (done) => {
    spyOn(preload.preloaderClass, 'load')
    preload.preloaderClass.once = (type, callback) => {
      callback(1, 2);
    };

    const promise = preload.resolveOnComplete();

    promise.then(() => {
      expect(preload.preloaderClass.load).toHaveBeenCalled();
      done();
    });
  });
  it('setErrorHandler', () => {
    const cb = () => {};

    spyOn(preload.preloaderClass, 'on')

    preload.setErrorHandler(cb);

    expect(preload.preloaderClass.on).toHaveBeenCalledWith('error', cb);
  });
  it('setProgressHandler', () => {
    const cb = () => {};

    spyOn(preload.preloaderClass, 'on')

    preload.setProgressHandler(cb);

    expect(preload.preloaderClass.on).toHaveBeenCalledWith('progress', cb);
  });
  it('activateSound', () => {
    const pluginName = 'sound';
    // Test that the library itself doesn't throw an error:
    preload.preloaderClass.installPlugin(pluginName);

    spyOn(preload.preloaderClass, 'installPlugin')

    preload.activateSound();

    expect(preload.preloaderClass.installPlugin).toHaveBeenCalledWith('sound');
  });
});
