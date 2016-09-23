
!function() {
/* global describe, beforeEach, it, expect */
'use strict';

const findPath = window.flatworld.utils.findPath;
const compareToPathFindingJS = false;

describe('findPath', () => {
    const falseFn = () => false;
    
    it('should fail', () => {
        expect(() => findPath(0, 0, 1, 2, 0, falseFn)).toThrowError(/maxSteps/);
        expect(() => findPath(0, '0', 1, 2, 5, falseFn)).toThrowError(/must be an integer/);
        expect(() => findPath(0, Infinity, 1, 2, 5, falseFn)).toThrowError(/must be an integer/);
        expect(() => findPath(4, 1, 4, 1, 100, falseFn)).toThrowError(/must be different/);
    });
    
    it('should find path for simple fields without blocked cells', () => {
        expect(findPath(1, 1, 0, 0, 10, falseFn).length).toEqual(3 * 2);
        expect(findPath(-10, 5, 0, 0, 20, falseFn).length).toEqual(11 * 2);
        expect(findPath(10, -5, 7, 4, 20, falseFn).length).toEqual(10 * 2);
        expect(findPath(-10, -5, 1, 1, 20, falseFn).length).toEqual(18 * 2);
        
        expect(findPath(1, 1, 0, 0, 10, falseFn, false).length).toEqual(3 * 2);
        expect(findPath(-10, 5, 0, 0, 20, falseFn, false).length).toEqual(16 * 2);
        expect(findPath(10, -5, 7, 4, 20, falseFn, false).length).toEqual(13 * 2);
        expect(findPath(-10, -5, 1, 1, 20, falseFn, false).length).toEqual(18 * 2);
        
        testField(`
            s.....
            .+....
            ..+...
            ...+d.
            `);
    });
    
    it('now there is a block', () => {
        testField(`
            s.....
            .++...
            ..B+..
            ....d.
            `);
    });
    
    it('a couple of them', () => {
        testField(`
            ..Bd..
            ...B+.
            .++++.
            s+....
            `);
    });
    
    it('more complicated stuff', () => {
        testField(`
            BBB........
            .s.B.+d.B..
            ..+.B+B.B..
            ...+B+.....
            ...+B+.B...
            ..BB++.....
            .B....B....
            ....B......
            `);
    });
    
    it('too many blocks', () => {
        testField(`
            BBB........
            Bs.B.Bd.B..
            B+.B..B+B..
            B+.B....+..
            B.+B.BBB+B.
            B.B+B..BB+.
            .B..+BB.B+.
            .....+++++.
            `);
    });
    
    it('bit longer path', () => {
        testField(`
            ....BBBBBB....
            ....Bd+.......
            BBBBBB.+......
            Bs....BB+.....
            B.+.....B++++.
            B..+.....BBBB+
            ....++++++++++
            `);
    });
    
    it('large field', () => {
        testField(`
            ...xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.....
            ...xBBBBBBBB.......................................BBBBBBBx....
            ...Bxxx....B.......................................B.dxxxxx....
            BBBBBBBx...B.......................................B..+....B...
            BsxxxxxxB...BB.....................................B...+.......
            B.+......B....BBB..................................B....+......
            B..+......B......BBBBBBBBBBBBBBBBBB................B.....+.....
            B...+......BB...............B......................B......+....
            B....+.......B...............B.....................B.......+...
            B.....+......B................B....................B........+..
            .......+.....B.................B...........BBBBBBBBB.........+.
            ........+....B..................B...BBBBBBBB..................+
            .........+.....B.................BB...........................+
            ..........+........................BBBBBBBBBBBBBBBBBBBBBBBBBBB+
            ...........++++++++++++++++++++++++++++++++++++++++++++++++++B+
            .............................................................++
            `, 74);
    });
    
    it('no way', () => {
        testField(`
            ...............................................................
            ....BBBBBBBB.......................................BBBBBBB.....
            ...B.......B.......................................B.d...BB....
            BBBBBBB....B.......................................B......BB...
            Bs......B...BB.....................................BBBBBBBBB...
            B........B....BBB..................................B...........
            B.........B......BBBBBBBBBBBBBBBBBB................B...........
            B..........BB...............B......................B...........
            B............B...............B.....................B...........
            B............B................B....................B...........
            .............B.................B...........BBBBBBBBB...........
            .............B..................B...BBBBBBBB...................
            ...............B.................BB............................
            ...................................BBBBBBBBBBBBBBBBBBBBBBBBBBB.
            .............................................................B.
            ...............................................................
            `, 0);
    });
    
    (compareToPathFindingJS ? it : xit)('random grids', () => {
        testField(getRandomGrid(10));
        testField(getRandomGrid(10));
        testField(getRandomGrid(10));
        testField(getRandomGrid(100, .7));
        testField(getRandomGrid(300, .5));
        testField(getRandomGrid(500, .4));
    });
});

function testField(field, total) {
    let isMatrix = typeof field !== 'string';
    let width = isMatrix && field[0].length;
    
    if (!isMatrix) {
        width = field.trim().indexOf('\n');
        if (!new RegExp(`^\\s*([sdB\\.\\+x]{${width}}(\\n\\s*|$))+$`).test(field) ||
                (field.match(/s/g) || []).length !== 1 ||
                (field.match(/d/g) || []).length !== 1) {
            throw new Error(`incorrect field: ${field}`);
        }
        field = field.replace(/\s+/g, '');
    }
    
    const height = isMatrix ? field.length : field.length / width;
    const size = width * height;
    const startIndex = isMatrix ? Math.floor(Math.random() * size) : field.indexOf('s');
    let destIndex = isMatrix ? Math.floor(Math.random() * size) : field.indexOf('d');
    if (destIndex === startIndex) {
        destIndex = destIndex < size / 2 ? size - 1 : 0;
    }
    
    const dx0 = isMatrix ? 0 : Math.floor(Math.random() * width);
    const dy0 = isMatrix ? 0 : Math.floor(Math.random() * height);
    const xStart = startIndex % width - dx0;
    const yStart = dy0 - Math.floor(startIndex / width);
    const xDest = destIndex % width - dx0;
    const yDest = dy0 - Math.floor(destIndex / width);
    
    // just making sure that everything is alright:
    if (!isMatrix) {
        expect(height === Math.floor(height)).toBe(true);
        expect(cell(xDest, yDest)).toBe('d');
        expect(cell(xStart, yStart)).toBe('s');
        expect(cell(width - dx0, 0)).toBe('B');
        expect(cell(-dx0 - 1, 0)).toBe('B');
        expect(cell(0, dy0 + 1)).toBe('B');
        expect(cell(0, dy0 - height)).toBe('B');
    }
    
    const maxSteps = size;
    const grid = isMatrix ? field : Array.prototype.reduce.call(field, (res, s, i) => {
        const v = +(s === 'B');
        return (i % width ? res[res.length - 1].push(v) : res.push([v]), res);
    }, []);
    
    const isBlocked = next => cell(next.x, next.y, true);
    
    if (!isMatrix) {
        if (total === undefined) {
            const Xs = field.match(/\x/g);
            const Ps = field.match(/\+/g);
            total = Xs && Ps ? Math.min(Xs.length, Ps.length) : (Xs || Ps || []).length;
            total += 2;
        }
        
        validatePath(findPath(xStart, yStart, xDest, yDest, maxSteps, isBlocked));
        // now find the way back:
        validatePath(findPath(xDest, yDest, xStart, yStart, maxSteps, isBlocked));
    } else if (width < 20) {
        const copy = grid.map(row => row.slice(0));
        copy[dy0 - yStart][xStart + dx0] = 'S';
        copy[dy0 - yDest][xDest + dx0] = 'D';
        console.log(copy.map(row => row.join(' ')).join('\n'));
    }
    
    if (compareToPathFindingJS) {
        const pf = new PF.AStarFinder({ allowDiagonal: false });
        
        let d = Date.now();
        let res = pf.findPath(xStart + dx0, dy0 - yStart, xDest + dx0, dy0 - yDest, new PF.Grid(grid));
        total = res.length || null;
        console.log('PH: ', `${-d + (d = Date.now())}ms`, total);
        validatePath(findPath(xStart, yStart, xDest, yDest, maxSteps, isBlocked, false));
        
        res = pf.findPath(xDest + dx0, dy0 - yDest, xStart + dx0, dy0 - yStart, new PF.Grid(grid));
        total = res.length || null;
        console.log('PH: ', `${-d + (d = Date.now())}ms`, total, 'reverse');
        validatePath(findPath(xDest, yDest, xStart, yStart, maxSteps, isBlocked, false));
    }
    
    function validatePath(path) {
        for (let i = 2; i < path && path.length; i += 2) {
            const dx = path[i - 2] - path[i];
            const dy = path[i - 1] - path[i + 1];
            if (dx === dy || [-1, 0, 1].indexOf(dx) < 0 || [-1, 0, 1].indexOf(dy) < 0) {
                throw new Error(`invalid path returned: ${path}`);
            }
        }
        expect(path && path.length / 2).toBe(total || null);
    }
    
    function cell(x, y, useGrid) {
        x += dx0;
        y = dy0 - y;
        return x < 0 || x >= width || y < 0 || y >= height ? (useGrid ? 1 : 'B')
            : useGrid ? grid[y][x] : field[y * width + x];
    }
}

function getRandomGrid(width, blockedRatio = .3, height = width) {
    const res = [];
    for (let i = 0; i < height; i++) {
        const row = [];
        for (let j = 0; j < width; j++) {
            row.push(Math.random() < blockedRatio ? 1 : 0);
        }
        res.push(row);
    }
    return res;
}

}();


/*
// pathFinding.js fails on reverse:

1 0 0 0 S 0 0 0 0 1
0 0 1 0 1 0 0 0 1 0
D 0 0 0 0 0 0 1 0 1
1 0 1 0 0 0 0 0 0 0
0 0 1 0 1 0 0 1 0 0
0 1 1 1 0 1 0 1 0 1
0 0 0 1 0 0 1 1 1 0
0 0 0 0 0 1 1 0 0 0
1 1 0 0 0 1 0 1 1 0
1 1 0 0 0 0 1 0 0 0

 */