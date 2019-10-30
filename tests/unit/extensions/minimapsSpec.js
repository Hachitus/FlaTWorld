// import helper from '../flatworldCreatorHelper';
// import pixelizedMinimap from '../../../src/extensions/minimaps/pixelizedMinimap';
// import scaledMinimap from '../../../src/extensions/minimaps/scaledMinimap';

// Not in use
xdescribe('Scaled minimap => ', function () {
  var UITheme, passedArguments, returnedArguments;

  beforeEach(function () {
    UITheme = {
      showSelections: function (object, getDatas, options) {
        return [ object, getDatas, options];
      },
      highlightSelectedObject: function (object, getDatas, options) {
        return [ object, getDatas, options];
      },
      showUnitMovement: function (object, getDatas, options) {
        return [ object, getDatas, options];
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
  });

  it('scaled', function () {
    let ui = UI(UITheme, {});

    expect(ui).toBeDefined();
    expect(UITheme).toBeDefined();
  });
});

// Not in use
xdescribe('pixelized minimap => ', function () {
  var UITheme, passedArguments, returnedArguments;

  beforeEach(function () {
    UITheme = {
      showSelections: function (object, getDatas, options) {
        return [ object, getDatas, options];
      },
      highlightSelectedObject: function (object, getDatas, options) {
        return [ object, getDatas, options];
      },
      showUnitMovement: function (object, getDatas, options) {
        return [ object, getDatas, options];
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
  });

  it('scaled', function () {
    let ui = UI(UITheme, {});

    expect(ui).toBeDefined();
    expect(UITheme).toBeDefined();
  });
});
