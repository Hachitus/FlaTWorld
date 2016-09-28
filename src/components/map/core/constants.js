(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  const { PIXI } = window.flatworld_libraries;

  const constants = {
    ZERO_COORDINATES: new PIXI.Point(0,0),
    VERSION: '0.5.0'
  };

  window.flatworld.constants = constants;
})();