(function mapLayersSpec() {
  const flatworldCreatorHelper = window.flatworldCreatorHelper;
  const { mapLayers } = window.flatworld;

  describe('Flatworld unit tests => ', () => {
    let map;

    xbeforeEach(() => {
      map = initFlatworld();
    });

    xit('getObjectsUnderArea - layers', () => {
    });

  function initFlatworld(options) {
    const map = flatworldCreatorHelper(options);
    map.getViewportArea = function getViewportAreaTest() {
      return {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
    };

    return map;
  }
})();
