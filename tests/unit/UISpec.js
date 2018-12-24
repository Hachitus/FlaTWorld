import UI from '../testAssets/js/UI/UI';
import * as PIXI from 'pixi.js';

describe('UI and UI themes => ', function () {
  let UITheme, passedArguments, returnedArguments, mockedMap;

  beforeEach(function () {
    UITheme = {
      showSelections: function (object, getDatas, options) {
        return [ object, getDatas, options];
      },
      highlightSelectedObject: function (object, getDatas, options) {
        return [ object, getDatas, options];
      },
      showUnitMovement: function (coordinates, options) {
        return [ coordinates, options];
      },
      unSelect: function (/* coordinates, options */) {
        return 1;
      }
    };
    passedArguments = [
      {
        propi: 1
      },
      2,
      {
        UIThemeOptions: 3
      }
    ];
    returnedArguments = [
      {
        propi: 1
      },
      2,
      3
    ];
    mockedMap = {
      drawOnNextTick: function() {}
    };
  });

  it('everything defined', function () {
    const ui = UI(UITheme, mockedMap);

    expect(ui).toBeDefined();
    expect(UITheme).toBeDefined();
  });

  it('showSelections', function () {
    const ui = UI(UITheme, mockedMap);

    let result = ui.showSelections.apply(ui, passedArguments);

    expect(result[0][0]).toEqual(returnedArguments[0]);
    expect(result[1]).toEqual(returnedArguments[1]);
    expect(result[2]).toEqual(returnedArguments[2]);

    passedArguments[0] = [1,2];
    returnedArguments[0] = [1,2];

    result = ui.showSelections.apply(ui, passedArguments);

    expect(result).toEqual(returnedArguments);
  });

  it('showUnitMovement', function () {
    const point1 = new PIXI.Point(10,10);
    const point2 = new PIXI.Point(100,100);
    const ui = UI(UITheme, mockedMap);

    const result = ui.showUnitMovement([point1, point2]);

    expect(JSON.stringify(result)).toEqual(JSON.stringify([[point1, point2], undefined]));
  });

  it('add methods', function () {
    const ui = UI(UITheme, mockedMap);

    ui.testFunc = function () {
      return 55;
    };

    expect(ui.testFunc()).toEqual(55);
  });
});
