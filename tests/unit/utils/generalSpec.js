

import { chunkArray, flatten2Levels, requireParameter, pixelEpsilonEquality } from '../../../src/core/utils/general';

describe('utils -> general => ', () => {
  let oldTouchStart;

  beforeEach(() => {
    oldTouchStart = document.documentElement.ontouchstart;
  });
  afterEach(() => {
    document.documentElement.ontouchstart = oldTouchStart;
  });

  it('pixelEpsilonEquality', () => {
    expect(pixelEpsilonEquality(1,2)).toEqual(true);
    expect(pixelEpsilonEquality(1,-2)).toEqual(true);
    expect(pixelEpsilonEquality(0.95,1)).toEqual(true);
    expect(pixelEpsilonEquality(1,1)).toEqual(true);

    expect(pixelEpsilonEquality(-0.90,-0.01)).toEqual(false);
    expect(pixelEpsilonEquality(0.9501,0.94)).toEqual(false);
  });
  it('requireParameter', () => {
    const errorText = `Function 'class' requires parameter 'param'`;

    expect(() => requireParameter('class', 'param')).toThrow(new Error(errorText));
  });
  it('flatten2Levels', () => {
    const array = [
      [1,2],[3,4],
    ];

    expect(flatten2Levels(array)).toEqual([1,2,3,4]);
  });
  it('chunkArray', () => {
    const array = [
      1,2,3,4
    ];
    const chunkSize = 2;

    expect(chunkArray(array, chunkSize)).toEqual([[1,2], [3,4]])
  });
});