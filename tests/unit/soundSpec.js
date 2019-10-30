import Sound from '../../src/core/Sound';
import { Howl } from 'howler';

describe('Sound tests => ', () => {
  let sound;
  const mockSound = {
    name: 'test',
    url: '../testAssets/sounds/confirm.wav',
  };
  Object.freeze(mockSound);

  beforeEach(() => {
    sound = new Sound();
  })
  it('add and remove', () => {
    const howlObject = sound.add(mockSound.name, mockSound.url, mockSound.options);

    expect(howlObject instanceof Howl).toEqual(true);
    expect(sound._allSounds).toEqual({ [mockSound.name]: howlObject });

    sound.remove(mockSound.name);

    expect(Object.keys(sound._allSounds).length).toEqual(0);
  });
  it('play and stop', () => {
    const howlObject = sound.add(mockSound.name, mockSound.url, mockSound.options);

    spyOn(howlObject, 'play');
    spyOn(howlObject, 'stop');

    sound.play(mockSound.name);
    sound.stop(mockSound.name);

    expect(howlObject.play).toHaveBeenCalled();
    expect(howlObject.stop).toHaveBeenCalled();
  });
  it('fade', () => {
    const howlObject = sound.add(mockSound.name, mockSound.url, mockSound.options);

    spyOn(howlObject, 'fade');

    sound.fade(mockSound.name, 1, 0, 1);

    expect(howlObject.fade).toHaveBeenCalled();
  });
});
