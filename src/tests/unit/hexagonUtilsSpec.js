/* global describe, beforeEach, it, expect */
'use strict';

describe("hexagon extension, testing utils => ", function () {
  const HEXAGONS_UTILS = window.flatworld.extensions.hexagons.utils;
  var radius, hexagonPoints, gridSize;

  beforeEach(function () {
    radius = 60;
    HEXAGONS_UTILS.init(radius);
    hexagonPoints = HEXAGONS_UTILS.getHexagonPoints(radius);
    gridSize = {
      rows: 10,
      columns: 10
    };
    HEXAGONS_UTILS.init(radius);
  });

  it("getHexagonPoints", function () {
    let points = HEXAGONS_UTILS.getHexagonPoints(radius);

    expect(points).toBeDefined();
  });
  it("calcShortDiagonal", function () {
    let shortDiagonal = HEXAGONS_UTILS.calcShortDiagonal();

    expect(shortDiagonal).toEqual(103);

    shortDiagonal = HEXAGONS_UTILS.calcShortDiagonal({ radius: radius + 5 });
    expect(shortDiagonal).toEqual(112);

    shortDiagonal = HEXAGONS_UTILS.calcShortDiagonal({ radius: radius + 5.2 });
    expect(shortDiagonal).toEqual(112);

    shortDiagonal = HEXAGONS_UTILS.calcShortDiagonal({ radius: radius + 5.9 });
    expect(shortDiagonal).toEqual(114);
  });
  it("calcLongDiagonal", function () {
    let longDiagonal = HEXAGONS_UTILS.calcLongDiagonal();

    expect(longDiagonal).toEqual(120);

    longDiagonal = HEXAGONS_UTILS.calcLongDiagonal({ radius: radius + 5 });
    expect(longDiagonal).toEqual(130);

    longDiagonal = HEXAGONS_UTILS.calcLongDiagonal({ radius: radius + 5.2 });
    expect(longDiagonal).toEqual(130);

    longDiagonal = HEXAGONS_UTILS.calcLongDiagonal({ radius: radius + 5.9 });
    expect(longDiagonal).toEqual(131);
  });
  it("createHexagonGridCoordinates", function () {
    var hexagonGrid;

    hexagonGrid = HEXAGONS_UTILS.createHexagonGridCoordinates(gridSize);

    expect(hexagonGrid[0].x).toEqual(0, "FIRST X");
    expect(hexagonGrid[0].y).toEqual(0, "FIRST Y");
    expect(hexagonGrid[10].x).toEqual(-51, "SECOND X");
    expect(hexagonGrid[15].y).toEqual(90, "SECOND Y");
  });
  it("hexaHitTest", function () {
    var isHit;

    isHit = HEXAGONS_UTILS.hexaHitTest(hexagonPoints, {x:0, y:0}, {x:0, y:0});

    expect(isHit).toEqual(true);

    isHit = HEXAGONS_UTILS.hexaHitTest(hexagonPoints, {x:100, y:100}, {x:0, y:0});

    expect(isHit).toEqual(false);
  });
  it("getClosestHexagonCenter", function () {
    var closestCenter;

    closestCenter = HEXAGONS_UTILS.getClosestHexagonCenter({
      x: 199,
      y: 199
    });

    expect(closestCenter).toEqual({
      x: 155,
      y: 240
    });

    closestCenter = HEXAGONS_UTILS.getClosestHexagonCenter({
      x: 199.12,
      y: 199.55
    });

    expect(closestCenter).toEqual({
      x: 155,
      y: 240
    });
  });
});