(function minimapsSpec() {
  describe('Scaled minimap => ', function () {
    const scaledMinimap = window.flatworld.extensions.minimaps.scaled;
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

  describe('pixelized minimap => ', function () {
    const scaledMinimap = window.flatworld.extensions.minimaps.pixelized;
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
})();
