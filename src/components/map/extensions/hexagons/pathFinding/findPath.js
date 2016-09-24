!function() {

window.flatworld.extensions.hexagons.pathfinding.findPath = findPath;

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
 * Finds shortest route on a hexagon grid
 * @param  {number} x - start x-coordinate
 * @param  {number} y - start y-coordinate
 * @param  {number} xDest - destination x-coordinate
 * @param  {number} yDest - destination y-coordinate
 * @param  {number} maxSteps - maximum allowed number of steps (must be at least 1)
 * @param  {{ len: number, x: number, y: number, prev: Object } => boolean} isBlocked -
 *                 function that returns true if coordinate is blocked;
 *                 it also can increase "len" property of passed object for weighted graph
 * @return {number[]} - path coordinates from start to destination (including starting point)
 */

function findPath(xStart, yStart, xDest, yDest, maxSteps, isBlocked, allowDiagonal) {
    for (let i = 0; i < 5; i++) {
        if (!isInteger(arguments[i])) {
            throw new Error(`argument #${i} must be an integer: ${arguments[i]}`);
        }
    }
    if (maxSteps <= 0) {
        throw new Error(`maxSteps must be greater or equal to 1: ${maxSteps}`);
    }
    if (xStart == xDest && yStart == yDest) {
        throw new Error(`starting and destination points must be different: ${xStart}, ${yStart}`);
    }
    
    let counter = 0;
    const d = Date.now();
    
    const hexagonGrid = allowDiagonal === undefined;
    const pathList = bestDirectionAlg();
    const pathArr = pathList && pathListToArray(pathList);
    
    console.log(`${Date.now() - d}ms`,
        pathArr && pathArr.length / 2,
        `${counter} oper`,
        `${maxSteps} cells`,
        `${counter / maxSteps / Math.log(maxSteps)} coeff`);
    
    return pathArr;
    
    function bestDirectionAlg() {
        const size = maxSteps + 1;
        const visited = [];
        const startMinSteps = getMinSteps(xDest - xStart, yDest - yStart, hexagonGrid);
        const queue = new PriorityQueue();
        queue.push({
            len: 1,
            prev: null,
            x: xStart,
            y: yStart
        }, 0);
        
        let resPath = null;
        let maxLen = maxSteps + 1;
        let key;
        
        while(queue.length) {
            counter++;
            const curr = queue.pop();
            const remainingSteps = maxLen - curr.len;
            const minSteps = remainingSteps > 0 && getMinSteps(xDest - curr.x, yDest - curr.y, hexagonGrid);
            
            if (minSteps && minSteps <= remainingSteps) {
                const directions = getBestDirections(xDest - curr.x, yDest - curr.y, hexagonGrid);
                
                for (let i = directions.length; i-- > 0; ) {
                    const x = curr.x + directions[i][0];
                    const y = curr.y + directions[i][1];
                    const next = { len: curr.len + 1, prev: curr, x: x, y: y };
                    
                    if (isBlocked(next)) {
                        // for debug purposes only:
                        if (x === xDest && y === yDest) {
                            throw new Error('destination must not be blocked!');
                        }
                        continue;
                    }
                    
                    if (x === xDest && y === yDest) {
                        resPath = next;
                        maxLen = next.len - 1;
                        break;
                    }
                    
                    if (!isVisited(x, y, next.len)) {
                        // for debug purposes only:
                        if (minSteps - directions[i][2] !== getMinSteps(xDest - x, yDest - y, hexagonGrid)) {
                            console.error([x, y], [xDest, yDest], directions);
                            throw new Error('directions loss is not correct!');
                        }
                        
                        const minTotalSteps = (/*current steps*/next.len - 1) + (/*min left steps*/minSteps - directions[i][2]);
                        const loss = (minTotalSteps - startMinSteps)/* * size - next.len*/;
                        queue.push(next, loss);
                    }
                }
            }
        }
        return resPath;
        
        function isVisited(x, y, len) {
            const key = (x - xStart) * size + (y - yStart);
            return visited[key] ?
                visited[key] <= len || (visited[key] = len, false)
                : (visited[key] = len, false)
        }
    }
}

function pathListToArray(pathList) {
    let list = pathList;
    const arr = [];
    
    do arr.unshift({ x: list.y, y: list.x });
    while(list = list.prev);
    
    return arr;
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