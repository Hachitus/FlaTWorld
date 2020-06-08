/**
 * Author: https://github.com/dmitrysteblyuk
 * Thank you for the awesome path finding :)
 */

const allHexDirections = [{ x: 0, y: 1 }, { x: -1, y: 1 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
const allNormalDirections = [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: -1 }];

class PriorityQueue {
  constructor() {
    this.items = [];
    this.isPristine = true;
  }

  get length() {
    return this.items.length;
  }

  pop() {
    const stack = this.items[this.items.length - 1].stack;
    const value = stack.pop();
    if (!stack.length) {
      this.items.pop();
    }
    return value;
  }

  push(value, loss) {
    this.isPristine = false;
    const [index, match] = this.items.length ?
      binarySearch(i => this.items[i].loss - loss, 0, this.items.length)
      : [0, false];

    if (match) {
      this.items[index].stack.push(value);
    } else {
      const newItem = { stack: [value], loss: loss };
      this.items.splice(index, 0, newItem);
    }
  }
}

/**
 * Finds shortest route on a hexagon/normal grid
 * @param  {int} options.x:  xStart - start x-coordinate
 * @param  {int} options.y:  yStart - start y-coordinate
 * @param  {{ x: int, y: int }} - destination coordinates; if destination is null, then look for all reachable cells
 * @param  {int} width - width of the grid
 * @param  {int} height - height of the grid
 * @param  {int} maxTime - maximal allowed time to get to destination (must be at least 1)
 * @param  {({ x: int, y: int }, { x: int, y: int }, [currentPaths]) => int} weightFn - function that returns time between two adjacent 
 * cells. The last argument signifies a "stable path". It can be used to track for instance gasoline used through the whole route
 * @param  {boolean} allowDiagonal - if not null then apply algorithm for normal square grid
 * @return {{ x: int, y: int, time: int }[]} - path coordinates from start to destination (including starting point)
 */
function findPath(
  { x: xStart, y: yStart},
  dest,
  width,
  height,
  maxTime,
  weightFn,
  allowDiagonal = null,
  debug = false
) {

  validateArgs();

  // Counter calculates how many hexagon movements have been made so far
  let counter = 0;
  const d = Date.now();

  const hexagonGrid = allowDiagonal === null;

  const pathArr = bestDirectionAlg();

  if (debug) {
    console.log(...(dest ? [] : ['reachable: ']), // eslint-disable-line no-console
      `${Date.now() - d}ms`,
      pathArr && pathArr.length,
      `${counter} oper`,
      `${maxTime} cells`,
      `${counter / maxTime / Math.log(maxTime)} coeff`);
  }

  return pathArr;

  function bestDirectionAlg() {
    const visited = [];
    const startMinTime = dest && getMinSteps(dest.x - xStart, dest.y - yStart, hexagonGrid);
    const queue = new PriorityQueue();
    const allCoordinates = new Set();
    const start = {
      x: xStart,
      y: yStart,
      time: 0,
      prev: null
    };

    isVisited(start);
    queue.push(start, 0);

    let resPath = null;
    let allowedTime = maxTime;

    while(queue.length) {
      counter++;
      const curr = queue.pop();
      const maxRemainingTime = allowedTime - curr.time;
      const minPossibleTime = !dest || maxRemainingTime < 1 ? 1
        : getMinSteps(dest.x - curr.x, dest.y - curr.y, hexagonGrid);

      if (minPossibleTime > maxRemainingTime) {
        if (counter === 1) {
          throw new Error(`Destination ${minPossibleTime} is farther than max allowed movement: ${maxRemainingTime}`);
        }
        continue;
      }

      const directions = hexagonGrid ? allHexDirections : allNormalDirections;

      for (let i = directions.length; i-- > 0; ) {
        const x = curr.x + directions[i].x;
        const y = curr.y + directions[i].y;
        const next = { x: x, y: y };

        const weight = weightFn(next, curr, {
          isPristine: queue.isPristine,
        });

        if (weight < 0 || curr.time + weight > maxTime) {
          continue;
        }

        next.time = curr.time + weight;
        next.prev = curr;

        if (dest && x === dest.x && y === dest.y) {
          resPath = next;
          allowedTime = next.time - 1;
          break;
        }

        if (!isVisited(next)) {
          const loss = next.time +
                    (dest ? getMinSteps(dest.x - x, dest.y - y, hexagonGrid) - startMinTime : 0);
          queue.push(next, loss/* * (maxTime + 1) - next.time*/);
          if (!dest) {
            allCoordinates.add(`${next.x},${next.y}`);
          }
        }
      }
    }

    if (dest) {
      return resPath && pathListToArray(resPath);
    }

    // If we get all available coordinates (e.g. for are highlighting), not only path for start -> destination
    return [...allCoordinates].map(coordinateString => {
      const coordinates = coordinateString.split(',');
      return {
        x: +coordinates[0],
        y: +coordinates[1]
      };
    });

    function isVisited(cell) {
      // if width and height are chosen right then the key should not be negative
      const key = (cell.x - xStart + width) * height + (cell.y - yStart);

      if (key < 0) {
        if (debug) {
          console.error(cell); // eslint-disable-line no-console
        }
        throw new Error(`negative key: ${key}`);
      }

      return visited[key] ?
        visited[key] <= cell.time || (visited[key] = cell.time, false)
        : (visited[key] = cell.time, false);
    }
  }

  function validateArgs() {
    [xStart, yStart]
      .concat(dest ? [dest.x, dest.y] : [])
      .concat([width, height, maxTime])
      .forEach((arg, i) => {
        if (!isInteger(arg)) {
          throw new Error(`argument #${i} must be an integer: ${arg}`);
        }
      });

    if (maxTime < 1) {
      throw new Error(`maxTime must be at least 1: ${maxTime}`);
    }
    if (dest && xStart === dest.x && yStart === dest.y) {
      throw new Error(`starting and destination points must be different: ${xStart}, ${yStart}`);
    }
  }
}

function pathListToArray(pathList) {
  let link = pathList;
  const arr = [];

  do {
    arr.push(link);
    link = link.prev
  } while(link);

  return arr.reverse();
}

function binarySearch(sortFn, i0, i1) {
  const mid = Math.floor((i0 + i1) / 2);
  const res = sortFn(mid);

  if (res < 0) {
    return mid > i0 ? binarySearch(sortFn, i0, mid) : [i0, false];
  } else if (res > 0) {
    return mid + 1 < i1 ? binarySearch(sortFn, mid + 1, i1) : [i1, false];
  }
  return [mid, true];
}

function isInteger(x) {
  return x === Math.floor(x) && isFinite(x);
}

function getMinSteps(dx, dy, hexagonGrid) {
  if (hexagonGrid) {
    return dx > 0 && dy > 0 ? dx + dy
      : dx < 0 && dy < 0 ? -dx - dy
        : Math.max(Math.abs(dx), Math.abs(dy));
  } else {
    return Math.abs(dx) + Math.abs(dy);
  }
}

/*---------------------
------- EXPORT --------
----------------------*/
export {
  findPath
};
