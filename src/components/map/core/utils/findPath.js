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
    const tramped = [xStart, yStart, 1];
    
    let counter = 0;
    const d = Date.now();
    
    const pathObj = recursiveAlg(xStart, yStart, maxSteps + 1, { x: xStart, y: yStart }, 1);
    const pathArr = pathObj && pathToArray(pathObj);
    
    console.log(`${Date.now() - d} ms`, `${counter} oper`, `${maxSteps} cells`,
        `${counter / maxSteps / Math.log(maxSteps)} coeff`);
    
    return pathArr;
    
    function recursiveAlg(xLast, yLast, maxPathLen, currPath, len) {
        counter++;
        let resPath = null;
        let maxLen = maxPathLen;
        const directions = getBestDirections(xDest - xLast, yDest - yLast);
        
        for (let i = 0; i < directions.length; i++) {
            const x = xLast + directions[i][0];
            const y = yLast + directions[i][1];
            
            if (x === xDest && y === yDest) {
                return { depth: len + 1, p: currPath, x: x, y: y };
            }
            
            const remainingSteps = maxLen - len;
            const noWay = !remainingSteps ||
                getMinSteps(xDest - x, yDest - y) > remainingSteps ||
                isBlocked(x, y) ||
                isTramped(x, y, len);
            
            if (!noWay) {
                const newPath = recursiveAlg(x, y, maxLen, { p: currPath, x: x, y: y }, len + 1);
                if (newPath) {
                    resPath = newPath;
                    maxLen = newPath.depth - 1;
                }
            }
        }
        return resPath;
    }
    
    function isTramped(x, y, len) {
        const [index, match] = tramped.length ?
            binarySearch(i => x - tramped[i *= 3] || y - tramped[i + 1], 0, tramped.length / 3)
            : [0, false];
        const j = index * 3;
        
        return match ?
            tramped[j + 2] <= len || (tramped[j + 2] = len, false)
            : (tramped.splice(j, 0, x, y, len), false);
    }
}

function pathToArray(pathObj) {
    let p = pathObj;
    let i = p.depth;
    const res = new Array(i * 2);
    
    while (--i >= 0) {
        res[i * 2] = p.x;
        res[i * 2 + 1] = p.y;
        p = p.p;
    }
    return res;
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
    north: [[0, 1], [-1, 1], [1, 0], [1, -1], [-1, 0], [0, -1]],
    south: [[0, -1], [1, -1], [-1, 0], [-1, 1], [1, 0], [0, 1]],
    east: [[1, 0], [1, -1], [0, 1], [-1, 1], [0, -1], [-1, 0]],
    west: [[-1, 0], [-1, 1], [0, -1], [1, -1], [0, 1], [1, 0]],
    north_west: [[-1, 1], [0, 1], [-1, 0], [0, -1], [1, 0], [1, -1]],
    south_east: [[1, -1], [0, -1], [1, 0], [0, 1], [-1, 0], [-1, 1]],
    north_east: [[0, 1], [1, 0], [1, -1], [-1, 1], [-1, 0], [0, -1]],
    south_west: [[0, -1], [-1, 0], [-1, 1], [1, -1], [1, 0], [0, 1]],
    north_north_west: [[0, 1], [-1, 1], [-1, 0], [1, 0], [1, -1], [0, -1]],
    south_south_east: [[0, -1], [1, -1], [1, 0], [-1, 0], [-1, 1], [0, 1]],
    north_west_west: [[-1, 0], [-1, 1], [0, 1], [0, -1], [1, -1], [1, 0]],
    south_east_east: [[1, 0], [1, -1], [0, -1], [0, 1], [-1, 1], [-1, 0]]
};

function getMinSteps(dx, dy) {
    return dx > 0 && dy > 0 ? dx + dy
        : dx < 0 && dy < 0 ? -dx - dy
        : Math.max(Math.abs(dx), Math.abs(dy));
}

}();
