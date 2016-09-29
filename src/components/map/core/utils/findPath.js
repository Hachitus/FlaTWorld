!function() {

window.flatworld.utils.findPath = findPath;

const debug = true;

// Any hexagon grid can be represented as a square grid
// with intersections in hexagons centers (easy to see when you connect them).
// The only difference is that there're 6 allowed directions where unit can move
// from one intersection (hexagon center) to another in one step.
// Imagine we have coordinate axis with Y-axis pointing to top-left corner
// and X-axis pointing to top-right-corner.
// Thus, it will take two steps to go in direction [1, 1] and [-1, -1]
// and only one step to go in directions [1, 0], [1, -1], [0, -1], [-1, 0], [0, 1].
// Now that we have set ground for the problem let's begin.

/**
 * Finds shortest route on a hexagon/normal grid
 * @param  {int} options.x:  xStart - start x-coordinate
 * @param  {int} options.y:  yStart - start y-coordinate
 * @param  {int} options.x:  xDest - destination x-coordinate
 * @param  {int} options.y:  yDest - destination y-coordinate
 * @param  {int} maxAllowedDistance - maximal allowed distance to get to destination (must be at least 1)
 * @param  {({ x: int, y: int }) => boolean} isBlocked - function that returns true if next (x, y) cell is blocked
 * @param  {({ x: int, y: int }, { x: int, y: int }) => int} weight - function that returns distance between two adjacent cells
 * @param  {int} maxStepDistance - maximal possible distance between two adjacent cells
 * @param  {int} maxYCoordDiff - maximal possible difference between yStart and other Y-coordinates
 * @param  {boolean} allowDiagonal - if not null then apply algorithm for normal square grid
 * @return {{ x: int, y: int }[]} - path coordinates from start to destination (including starting point)
 */
function findPath(
            { x: xStart, y: yStart},
            { x: xDest, y: yDest },
            maxAllowedDistance,
            isBlocked,
            weight = () => 1,
            maxStepDistance = 1,
            maxYCoordDiff = Math.ceil(Math.sqrt(maxAllowedDistance)),
            allowDiagonal = null
        ) {
    
    validateArgs();
    
    let counter = 0;
    const d = Date.now();
    
    const hexagonGrid = allowDiagonal === null;
    const pathList = bestDirectionAlg();
    const pathArr = pathList && pathListToArray(pathList);
    
    console.log(`${Date.now() - d}ms`,
        pathArr && pathArr.length,
        `${counter} oper`,
        `${maxAllowedDistance} cells`,
        `${counter / maxAllowedDistance / Math.log(maxAllowedDistance)} coeff`);
    
    return pathArr;
    
    function bestDirectionAlg() {
        const visited = [];
        const startMinDistance = getMinSteps(xDest - xStart, yDest - yStart, hexagonGrid);
        const queue = new PriorityQueue();
        queue.push({
            x: xStart,
            y: yStart,
            distance: 0,
            prev: null
        }, 0);
        
        let resPath = null;
        let allowedDistance = maxAllowedDistance;
        let key;
        
        while(queue.length) {
            counter++;
            const curr = queue.pop();
            const maxRemainingDistance = allowedDistance - curr.distance;
            const minPossibleDistance = maxRemainingDistance > 0 ? getMinSteps(xDest - curr.x, yDest - curr.y, hexagonGrid) : 1;
            
            if (minPossibleDistance > maxRemainingDistance) {
                continue;
            }
            
            const directions = getBestDirections(xDest - curr.x, yDest - curr.y, hexagonGrid);
            
            for (let i = directions.length; i-- > 0; ) {
                const x = curr.x + directions[i][0];
                const y = curr.y + directions[i][1];
                const next = { x: x, y: y };
                
                if (debug && maxYCoordDiff < Math.abs(y - yStart)) {
                    throw new Error(`maxYCoordDiff ${maxYCoordDiff} less than distance by "y" to (${x}, ${y}) from (${xStart}, ${yStart})`);
                }
                if (isBlocked(next)) {
                    continue;
                }
                
                const stepDistance = weight(curr, next);
                if (debug && (!isInteger(stepDistance) || stepDistance < 1)) {
                    throw new Error(`weight returned not positive integer for (${curr.x}, ${curr.y}), (${x}, ${y}): ${stepDistance}`);
                }
                next.distance = curr.distance + stepDistance;
                next.prev = curr;
                
                if (x === xDest && y === yDest) {
                    resPath = next;
                    allowedDistance = next.distance - 1;
                    break;
                }
                
                if (!isVisited(next)) {
                    // for debug purposes only:
                    if (debug && minPossibleDistance - directions[i][2] !== getMinSteps(xDest - x, yDest - y, hexagonGrid)) {
                        console.error(next, [xDest, yDest], directions);
                        throw new Error('directions loss is not correct!');
                    }
                    
                    const nextMinDistance = next.distance + minPossibleDistance - directions[i][2];
                    const loss = (nextMinDistance - startMinDistance)/* * (maxAllowedDistance + 1) - next.distance*/;
                    queue.push(next, loss);
                }
            }
        }
        return resPath;
        
        function isVisited(cell) {
            const key = (cell.x - xStart) * (maxYCoordDiff + 1) + (cell.y - yStart);
            return key in visited ?
                visited[key] <= cell.distance || (visited[key] = cell.distance, false)
                : (visited[key] = cell.distance, false)
        }
    }
    
    function validateArgs() {
        [xStart, yStart, xDest, yDest, maxAllowedDistance, maxStepDistance].forEach((arg, i) => {
            if (!isInteger(arg)) {
                throw new Error(`argument #${i} must be an integer: ${arg}`);
            }
        });
        if (maxAllowedDistance < 1) {
            throw new Error(`maxAllowedDistance must be at least 1: ${maxAllowedDistance}`);
        }
        if (maxStepDistance < 1) {
            throw new Error(`maxStepDistance must be at least 1: ${maxAllowedDistance}`);
        }
        if (xStart === xDest && yStart === yDest) {
            throw new Error(`starting and destination points must be different: ${xStart}, ${yStart}`);
        }
        if (isBlocked({ x: xDest, y: yDest })) {
            throw new Error(`destination must not be blocked: ${xDest}, ${yDest}`);
        }
    }
}

function pathListToArray(pathList) {
    let link = pathList;
    const arr = [];
    
    do arr.push({ x: link.x, y: link.y });
    while(link = link.prev);
    
    return arr.reverse();
}

class PriorityQueue {
    constructor() {
        this.items = [];
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

function getBestDirections(dx, dy, hexagonGrid) {
    return hexagonGrid ? getBestHexDirections(dx, dy)
        : getBestNormalDirections(dx, dy)
}

function getBestHexDirections(dx, dy) {
    return dx > 0 ?
            (dy > 0 ? hexDirections.north_east
            : dy < 0 ?
                (dx < -dy ? hexDirections.south_south_east
                : dx > -dy ? hexDirections.south_east_east
                : hexDirections.south_east)
            : hexDirections.east)
        : dx < 0 ?
            (dy > 0 ?
                (-dx < dy ? hexDirections.north_north_west
                : -dx > dy ? hexDirections.north_west_west
                : hexDirections.north_west)
            : dy < 0 ? hexDirections.south_west
            : hexDirections.west)
        : (dy > 0 ? hexDirections.north
            : dy < 0 ? hexDirections.south
            : null);
}

function getBestNormalDirections(dx, dy) {
    return dx > 0 ?
            (dy > 0 ? normalDirections.north_east
            : dy < 0 ? normalDirections.south_east
            : normalDirections.east)
        : dx < 0 ?
            (dy > 0 ? normalDirections.north_west
            : dy < 0 ? normalDirections.south_west
            : normalDirections.west)
        : (dy > 0 ? normalDirections.north
            : dy < 0 ? normalDirections.south
            : null);
}

const normalDirections = {
    north: [[0, 1, 1], [1, 0, -1], [-1, 0, -1], [0, -1, -1]],
    south: [[0, -1, 1], [-1, 0, -1], [1, 0, -1], [0, 1, -1]],
    east: [[1, 0, 1], [0, 1, -1], [0, -1, -1], [-1, 0, -1]],
    west: [[-1, 0, 1], [0, -1, -1], [0, 1, -1], [1, 0, -1]],
    north_east: [[0, 1, 1], [1, 0, 1], [0, -1, -1], [-1, 0, -1]],
    south_west: [[0, -1, 1], [-1, 0, 1], [0, 1, -1], [1, 0, -1]],
    north_west: [[0, 1, 1], [-1, 0, 1], [0, -1, -1], [1, 0, -1]],
    south_east: [[0, -1, 1], [1, 0, 1], [0, 1, -1], [-1, 0, -1]]
};

const hexDirections = {
    north: [[0, 1, 1], [-1, 1, 0], [1, 0, 0], [1, -1, -1], [-1, 0, -1], [0, -1, -1]],
    south: [[0, -1, 1], [1, -1, 0], [-1, 0, 0], [-1, 1, -1], [1, 0, -1], [0, 1, -1]],
    east: [[1, 0, 1], [1, -1, 0], [0, 1, 0], [-1, 1, -1], [0, -1, -1], [-1, 0, -1]],
    west: [[-1, 0, 1], [-1, 1, 0], [0, -1, 0], [1, -1, -1], [0, 1, -1], [1, 0, -1]],
    north_west: [[-1, 1, 1], [0, 1, 0], [-1, 0, 0], [0, -1, -1], [1, 0, -1], [1, -1, -1]],
    south_east: [[1, -1, 1], [0, -1, 0], [1, 0, 0], [0, 1, -1], [-1, 0, -1], [-1, 1, -1]],
    north_east: [[0, 1, 1], [1, 0, 1], [1, -1, 0], [-1, 1, 0], [-1, 0, -1], [0, -1, -1]],
    south_west: [[0, -1, 1], [-1, 0, 1], [-1, 1, 0], [1, -1, 0], [1, 0, -1], [0, 1, -1]],
    north_north_west: [[0, 1, 1], [-1, 1, 1], [-1, 0, 0], [1, 0, 0], [1, -1, -1], [0, -1, -1]],
    south_south_east: [[0, -1, 1], [1, -1, 1], [1, 0, 0], [-1, 0, 0], [-1, 1, -1], [0, 1, -1]],
    north_west_west: [[-1, 0, 1], [-1, 1, 1], [0, 1, 0], [0, -1, 0], [1, -1, -1], [1, 0, -1]],
    south_east_east: [[1, 0, 1], [1, -1, 1], [0, -1, 0], [0, 1, 0], [-1, 1, -1], [-1, 0, -1]]
};

function getMinSteps(dx, dy, hexagonGrid) {
    if (hexagonGrid) {
        return dx > 0 && dy > 0 ? dx + dy
            : dx < 0 && dy < 0 ? -dx - dy
            : Math.max(Math.abs(dx), Math.abs(dy));
    } else {
        return Math.abs(dx) + Math.abs(dy);
    }
}

}();
