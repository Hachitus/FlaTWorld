/* global describe, beforeEach, it, expect */
'use strict';

describe("UI and UI themes => ", function () {
  const UI = window.flatworld.UI;
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

  it("everything defined", function () {
    let ui = UI(UITheme, {});

    expect(ui).toBeDefined();
    expect(UITheme).toBeDefined();
  });

  it("showSelections", function () {
    var result;
    let ui = UI(UITheme, {});

    result = ui.showSelections.apply(ui, passedArguments);

    expect(result).toEqual(returnedArguments);

    passedArguments[0] = [1,2];
    returnedArguments[0] = [1,2];

    result = ui.showSelections.apply(ui, passedArguments);

    expect(result).toEqual(returnedArguments);
  });

  it("showUnitMovement", function () {
    var result;
    let ui = UI(UITheme, {});

    result = ui.showUnitMovement.apply(ui, passedArguments);

    expect(result).toEqual(returnedArguments);
  });

  it("add methods", function () {
    let ui = UI(UITheme, {});

    ui.testFunc = function () {
      return 55;
    };

    expect(ui.testFunc()).toEqual(55);
  });
});