

import { mapObjectsToArray, flattenArrayBy1Level } from '../../../src/core/utils/dataManipulation';

describe('utils -> dataManipulation => ', () => {
  fit('mapObjectsToArray', () => {
    const object = {
      units: [{
        a: 1,
        b: 2
      }]
    };

    const manipulatedObject = mapObjectsToArray(object);

    expect(manipulatedObject).toEqual([object.units]);
  });
  it('flattenArrayBy1Level', () => {
    const array = [[1, 2], [3, 4, [5, 6]]];
    const flattenedArray = flattenArrayBy1Level(array);

    expect(flattenedArray).toEqual([1,2,3,4, [5, 6]]);

    const flattenedArray2 = flattenArrayBy1Level(flattenedArray);

    expect(flattenedArray2).toEqual([1,2,3,4,5,6]);
  });
});