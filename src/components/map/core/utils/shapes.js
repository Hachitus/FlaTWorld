(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  const { PIXI } = window.flatworld_libraries;

  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.utils.shapes = {
    createSquare
  };

  function createSquare() {
    var graphics = new PIXI.Graphics();

    graphics.lineStyle(2, 0x0000FF, 1);
    graphics.drawRect(50, 250, 100, 100);

    return graphics;
  }
})();
