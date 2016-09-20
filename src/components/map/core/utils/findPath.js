!function() {

window.flatworld.utils.findPath = findPath;

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
 * @param  {(x: number, y: number) => boolean} isBlocked - function that returns true if coordinate is blocked
 * @return {number[]} - path coordinates from start to destination (including starting point)
 */

function findPath(xStart, yStart, xDest, yDest, maxSteps, isBlocked) {
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
    
    const pathList = bestDirectionAlg();
    const pathArr = pathList && pathListToArray(pathList);
    
    console.log(`${Date.now() - d} ms`, `${counter} oper`, `${maxSteps} cells`,
        `${counter / maxSteps / Math.log(maxSteps)} coeff`);
    
    return pathArr;
    
    function bestDirectionAlg() {
        const size = maxSteps + 1;
        const visited = [];
        const startMinSteps = getMinSteps(xDest - xStart, yDest - yStart);
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
            const minSteps = remainingSteps && getMinSteps(xDest - curr.x, yDest - curr.y);
            
            if (minSteps && minSteps <= remainingSteps) {
                const directions = getBestDirections(xDest - curr.x, yDest - curr.y);
                
                for (let i = directions.length; i-- > 0; ) {
                    const x = curr.x + directions[i][0];
                    const y = curr.y + directions[i][1];
                    
                    if (x === xDest && y === yDest) {
                        resPath = { len: curr.len + 1, prev: curr, x: x, y: y };
                        maxLen = curr.len;
                        break;
                    }
                    
                    let next;
                    if (!isVisited(x, y, curr.len) && !isBlocked(next = { len: curr.len + 1, prev: curr, x: x, y: y })) {
                        const loss = curr.len + minSteps - directions[i][2] - startMinSteps;
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
    let i = list.len;
    const arr = new Array(i * 2);
    
    while (--i >= 0) {
        arr[i * 2] = list.x;
        arr[i * 2 + 1] = list.y;
        list = list.prev;
    }
    return arr;
}
/*
class PriorityQueue {
    constructor() {
        this.stacks = [];
        this.losses = [];
    }
    
    get length() {
        return this.losses.length;
    }
    
    pop() {
        const loss = this.losses[this.losses.length - 1];
        const value = this.stacks[loss].pop();
        if (!this.stacks[loss].length) {
            delete this.stacks[loss];
            this.losses.pop();
        }
        return value;
    }
    
    push(value, loss) {
        if (this.stacks[loss]) {
            this.stacks[loss].push(value);
        } else {
            this.stacks[loss] = [value];
            const index = binarySearch(i => this.losses[i] - loss, 0, this.losses.length)[0];
            this.losses.splice(index, 0, loss);
        }
    }
}
*/

class PriorityQueue {
    constructor() {
        this.stacks = [];
    }
    
    get length() {
        return this.stacks.length;
    }
    
    pop() {
        const stack = this.stacks[this.stacks.length - 1];
        const value = stack.pop();
        if (!stack.length) {
            this.stacks.pop();
        }
        return value;
    }
    
    push(value, loss) {
        const [index, match] = this.stacks.length ?
            binarySearch(i => this.stacks[i]._loss - loss, 0, this.stacks.length)
            : [0, false];
        
        if (match) {
            this.stacks[index].push(value);
        } else {
            const stack = [value];
            this.stacks.splice(index, 0, stack);
            stack._loss = loss;
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

function getBestDirections(dx, dy) {
    return dx > 0 ?
            (dy > 0 ? allDirections.north_east
            : dy < 0 ?
                (dx < -dy ? allDirections.south_south_east
                : dx > -dy ? allDirections.south_east_east
                : allDirections.south_east)
            : allDirections.east)
        : dx < 0 ?
            (dy > 0 ?
                (-dx < dy ? allDirections.north_north_west
                : -dx > dy ? allDirections.north_west_west
                : allDirections.north_west)
            : dy < 0 ? allDirections.south_west
            : allDirections.west)
        : (dy > 0 ? allDirections.north
            : dy < 0 ? allDirections.south
            : null);
}

const allDirections = {
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

function getMinSteps(dx, dy) {
    return dx > 0 && dy > 0 ? dx + dy
        : dx < 0 && dy < 0 ? -dx - dy
        : Math.max(Math.abs(dx), Math.abs(dy));
}

}();
