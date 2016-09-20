
!function() {
/* global describe, beforeEach, it, expect */
'use strict';

const findPath = window.flatworld.utils.findPath;

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
        
        testField(`
            s.....
            .+.0..
            ..+...
            ...+d.
            `);
    });
    
    it('now there is a block', () => {
        testField(`
            s.....
            .++0..
            ..B+..
            ....d.
            `);
    });
    
    it('a couple of them', () => {
        testField(`
            ..Bd..
            ...B+.
            .++++.
            s+..0.
            `);
    });
    
    it('more complicated stuff', () => {
        testField(`
            BBB........
            .s.B.+d.B..
            ..+0B+B.B..
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
            0....+++++.
            `);
    });
    
    it('bit longer path', () => {
        testField(`
            ....BBBBBB....
            ....Bd+..0....
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
            BBBBBBBx...B..................0....................B..+....B...
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
            BBBBBBB....B..................0....................B......BB...
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
});

function testField(field, total) {
    const width = field.trim().indexOf('\n');
    if (!new RegExp(`^\\s*([sdB0\\.\\+x]{${width}}(\\n\\s*|$))+$`).test(field) ||
            (field.match(/s/g) || []).length !== 1 ||
            (field.match(/d/g) || []).length !== 1 ||
            (field.match(/0/g) || []).length !== 1) {
        throw new Error(`incorrect field: ${field}`);
    }
    field = field.replace(/\s+/g, '');
    
    const height = field.length / width;
    const centerIndex = field.indexOf('0');
    const startIndex = field.indexOf('s');
    const destIndex = field.indexOf('d');
    
    const dx0 = centerIndex % width;
    const dy0 = Math.floor(centerIndex / width);
    const xStart = startIndex % width - dx0;
    const yStart = dy0 - Math.floor(startIndex / width);
    const xDest = destIndex % width - dx0;
    const yDest = dy0 - Math.floor(destIndex / width);
    
    // just making sure that everything is alright:
    expect(height === Math.floor(height)).toBe(true);
    expect(cell(xDest, yDest)).toBe('d');
    expect(cell(xStart, yStart)).toBe('s');
    expect(cell(0, 0)).toBe('0');
    expect(cell(width - dx0, 0)).toBe('B');
    expect(cell(-dx0 - 1, 0)).toBe('B');
    expect(cell(0, dy0 + 1)).toBe('B');
    expect(cell(0, dy0 - height)).toBe('B');
    
    const maxSteps = width * height;
    const isBlocked = next => cell(next.x, next.y) === 'B';
    
    if (total === undefined) {
        const Xs = field.match(/\x/g);
        const Ps = field.match(/\+/g);
        total = Xs && Ps ? Math.min(Xs.length, Ps.length) : (Xs || Ps || []).length;
        total += 2;
    }
    
    validatePath(findPath(xStart, yStart, xDest, yDest, maxSteps, isBlocked));
    // now find the way back:
    validatePath(findPath(xDest, yDest, xStart, yStart, maxSteps, isBlocked));
    
    const grid = Array.prototype.reduce.call(field, (res, s, i) => {
        const v = +(s === 'B');
        return (i % width ? res[res.length - 1].push(v) : res.push([v]), res);
    }, []);
    const pf = new PF.AStarFinder({ allowDiagonal: true });
    
    let d = Date.now();
    let res = pf.findPath(xStart + dx0, dy0 - yStart, xDest + dx0, dy0 - yDest, new PF.Grid(grid));
    console.log('PH: ', `${-d + (d = Date.now())}ms`, res.length);
    
    res = pf.findPath(xDest + dx0, dy0 - yDest, xStart + dx0, dy0 - yStart, new PF.Grid(grid));
    console.log('PH: ', `${-d + (d = Date.now())}ms`, res.length, 'reverse');
    
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
    
    function cell(x, y) {
        x += dx0;
        y = dy0 - y;
        return x < 0 || x >= width || y < 0 || y >= height ? 'B'
            : field[y * width + x];
    }
}

}();
