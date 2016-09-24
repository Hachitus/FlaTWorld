(function UISpec() {
  describe('UI and UI themes => ', function () {
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
        showUnitMovement: function (coordinates, options) {
          return [ coordinates, options];
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

    it('everything defined', function () {
      let ui = UI(UITheme, {});

      expect(ui).toBeDefined();
      expect(UITheme).toBeDefined();
    });

    it('showSelections', function () {
      var result;
      let ui = UI(UITheme, {});

      result = ui.showSelections.apply(ui, passedArguments);

      expect(result).toEqual(returnedArguments);

      passedArguments[0] = [1,2];
      returnedArguments[0] = [1,2];

      result = ui.showSelections.apply(ui, passedArguments);

      expect(result).toEqual(returnedArguments);
    });

    it('showUnitMovement', function () {
      var point1 = new PIXI.Point(10,10);
      var point2 = new PIXI.Point(100,100);
      var result;
      let ui = UI(UITheme, {});

      result = ui.showUnitMovement([point1, point2]);

      expect(JSON.stringify(result)).toEqual(JSON.stringify([[point1, point2], undefined]));
    });

    it('add methods', function () {
      let ui = UI(UITheme, {});

      ui.testFunc = function () {
        return 55;
      };

      expect(ui.testFunc()).toEqual(55);
    });
  });
})();