(function () {
  "use strict";

  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.UIs.default.utils.drawShapes = (function() {
    return {
      normal: drawArrow,
      arced: drawArcedArrow,
      line
    };

    /* =============== Functions for drawing arrows ================ */

    // From the website: http://www.dbp-consulting.com/tutorials/canvas/CanvasArrow.html
    /*
      @param {int} x1,y1 - the line of the shaft starts here
      @param {int} x2,y2 - the line of the shaft ends here
      @param {int or function} style - type of head to draw
          0 - filled head with back a curve drawn with arcTo
              n.b. some browsers have an arcTo bug that make this look bizarre
          1 - filled head with back a straight line
          2 - unfilled but stroked head
          3 - filled head with back a curve drawn with quadraticCurveTo
          4 - filled head with back a curve drawn with bezierCurveTo
              function(ctx,x0,y0,x1,y1,x2,y2,style) - a function provided by the user to draw the head. Point (x1,y1) is the same as the end of the line, and (x0,y0) and (x2,y2) are the two back corners. The style argument is the this for the function. An example that just draws little circles at each corner of the arrow head is shown later in this document.
          default 3 (filled head with quadratic back)
      @param {int} which - which end(s) get the arrow
          0 - neither
          1 - x2,y2 end
          2 - x1,y1 end
          3 - (that's 1+2) both ends
          default 1 (destination end gets the arrow)
      @param {float} angle - the angle θ from shaft to one side of arrow head - default π/8 radians (22 1/2°, half of a 45°)
      @param {int} length - the distance d in pixels from arrow point back along the shaft to the back of the arrow head - default 10px

      Passing in a custom head drawing routine, ie:
      var headDrawer=function(ctx,x0,y0,x1,y1,x2,y2,style)
      {
          var radius=3;
          var twoPI=2*Math.PI;
          ctx.save();
          ctx.beginPath();
          ctx.arc(x0,y0,radius,0,twoPI,false);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x1,y1,radius,0,twoPI,false);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x2,y2,radius,0,twoPI,false);
          ctx.stroke();
          ctx.restore();
      }

      Modified to support easelJS (no context editing, instead graphics-object)

      */
    function drawArrow( shape, x1, y1, x2, y2, style, which, angle, d ) {
      var graphics = shape.graphics,
         color = "#000",
         angle1, topx, topy, angle2, botx, boty;

      /* Ceason pointed to a problem when x1 or y1 were a string, and
          concatenation would happen instead of addition */
      if ( typeof ( x1 ) === 'string' ) x1 = parseInt( x1, 10 );
      if ( typeof ( y1 ) == 'string' ) y1 = parseInt( y1, 10 );
      if ( typeof ( x2 ) == 'string' ) x2 = parseInt( x2, 10 );
      if ( typeof ( y2 ) == 'string' ) y2 = parseInt( y2, 10 );
      style = typeof ( style ) != 'undefined' ? style : 3;
      which = typeof ( which ) != 'undefined' ? which : 1; // end point gets arrow
      angle = typeof ( angle ) != 'undefined' ? angle : Math.PI / 8;
      d = typeof ( d ) != 'undefined' ? d : 10;
      // default to using drawHead to draw the head, but if the style
      // argument is a function, use it instead
      var toDrawHead = typeof ( style ) != 'function' ? drawHead : style;

      /* For ends with arrow we actually want to stop before we get to the arrow
          so that wide lines won't put a flat end on the arrow. */
      var dist = Math.sqrt( ( x2 - x1 ) * ( x2 - x1 ) + ( y2 - y1 ) * ( y2 - y1 ) );
      var ratio = ( dist - d / 3 ) / dist;
      var tox, toy, fromx, fromy;
      if ( which & 1 ) {
        tox = Math.round( x1 + ( x2 - x1 ) * ratio );
        toy = Math.round( y1 + ( y2 - y1 ) * ratio );
      } else {
        tox = x2;
        toy = y2;
      }
      if ( which & 2 ) {
        fromx = x1 + ( x2 - x1 ) * ( 1 - ratio );
        fromy = y1 + ( y2 - y1 ) * ( 1 - ratio );
      } else {
        fromx = x1;
        fromy = y1;
      }

      /* Original: Draw the shaft of the arrow
         ctx.beginPath();
         ctx.moveTo(fromx,fromy);
         ctx.lineTo(tox,toy);
         ctx.stroke(); */

      // Modified easelJS-version:
      graphics.beginStroke( color )
         .moveTo( fromx, fromy )
         .lineTo( tox, toy );

      // calculate the angle of the line
      var lineangle = Math.atan2( y2 - y1, x2 - x1 );
      // h is the line length of a side of the arrow head
      var h = Math.abs( d / Math.cos( angle ) );

      if ( which & 1 ) { // handle far end arrow head
        angle1 = lineangle + Math.PI + angle;
        topx = x2 + Math.cos( angle1 ) * h;
        topy = y2 + Math.sin( angle1 ) * h;
        angle2 = lineangle + Math.PI - angle;
        botx = x2 + Math.cos( angle2 ) * h;
        boty = y2 + Math.sin( angle2 ) * h;
        toDrawHead( graphics, topx, topy, x2, y2, botx, boty, style );
      }
      if ( which & 2 ) { // handle near end arrow head
        angle1 = lineangle + angle;
        topx = x1 + Math.cos( angle1 ) * h;
        topy = y1 + Math.sin( angle1 ) * h;
        angle2 = lineangle - angle;
        botx = x1 + Math.cos( angle2 ) * h;
        boty = y1 + Math.sin( angle2 ) * h;
        toDrawHead( graphics, topx, topy, x1, y1, botx, boty, style );
      }

      return true;

      function drawHead( graphics, x0, y0, x1, y1, x2, y2, style ) {
        var backdist;
        x0 = +x0, y0 = +y0, x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2;
        // all cases do this.
        graphics.beginStroke( "#F00" )
           .moveTo( x0, y0 )
           .lineTo( x1, y1 )
           .lineTo( x2, y2 );
        switch ( style ) {
          case 0:
            // curved filled, add the bottom as an arcTo curve and fill
            backdist = Math.sqrt( ( ( x2 - x0 ) * ( x2 - x0 ) ) + ( ( y2 - y0 ) * ( y2 -
               y0 ) ) );
            graphics.arcTo( x1, y1, x0, y0, 0.55 * backdist );
            graphics.fill();
            break;
          case 1:
            // straight filled, add the bottom as a line and fill.
            graphics.beginStroke( "#F00" )
               .moveTo( x0, y0 )
               .lineTo( x1, y1 )
               .lineTo( x2, y2 )
               .lineTo( x0, y0 )
               .fill();
            break;
          case 2:
            // unfilled head, just stroke.
            break;
          case 3:
            //filled head, add the bottom as a quadraticCurveTo curve and fill
            var cpx = ( x0 + x1 + x2 ) / 3;
            var cpy = ( y0 + y1 + y2 ) / 3;
            graphics.beginFill()
               .quadraticCurveTo( cpx, cpy, x0, y0 );
            break;
          case 4:
            //filled head, add the bottom as a bezierCurveTo curve and fill
            var cp1x, cp1y, cp2x, cp2y;
            var shiftamt = 5;
            if ( x2 === x0 ) {
              // Avoid a divide by zero if x2==x0
              backdist = y2 - y0;
              cp1x = ( x1 + x0 ) / 2;
              cp2x = ( x1 + x0 ) / 2;
              cp1y = y1 + backdist / shiftamt;
              cp2y = y1 - backdist / shiftamt;
            } else {
              backdist = Math.sqrt( ( ( x2 - x0 ) * ( x2 - x0 ) ) + ( ( y2 - y0 ) * ( y2 -
                 y0 ) ) );
              var xback = ( x0 + x2 ) / 2;
              var yback = ( y0 + y2 ) / 2;
              var xmid = ( xback + x1 ) / 2;
              var ymid = ( yback + y1 ) / 2;

              var m = ( y2 - y0 ) / ( x2 - x0 );
              var dx = ( backdist / ( 2 * Math.sqrt( m * m + 1 ) ) ) / shiftamt;
              var dy = m * dx;
              cp1x = xmid - dx;
              cp1y = ymid - dy;
              cp2x = xmid + dx;
              cp2y = ymid + dy;
            }

            graphics.bezierCurveTo( cp1x, cp1y, cp2x, cp2y, x0, y0 );
            graphics.fill();
            break;
        }
      }
    }
    function drawArcedArrow( graphics, x, y, r, startangle, endangle, anticlockwise,
       style, which, angle, d ) {
      var sx, sy, lineangle, destx, desty;

      style = typeof ( style ) != 'undefined' ? style : 3;
      which = typeof ( which ) != 'undefined' ? which : 1; // end point gets arrow
      angle = typeof ( angle ) != 'undefined' ? angle : Math.PI / 8;
      d = typeof ( d ) != 'undefined' ? d : 10;
      // Old: ctx.save();
      graphics.beginPath();
      graphics.arc( x, y, r, startangle, endangle, anticlockwise );
      graphics.stroke();

      graphics.strokeStyle = 'rgba(0,0,0,0)'; // don't show the shaft
      if ( which & 1 ) { // draw the destination end
        sx = Math.cos( startangle ) * r + x;
        sy = Math.sin( startangle ) * r + y;
        lineangle = Math.atan2( x - sx, sy - y );

        if ( anticlockwise ) {
          destx = sx + 10 * Math.cos( lineangle );
          desty = sy + 10 * Math.sin( lineangle );
        } else {
          destx = sx - 10 * Math.cos( lineangle );
          desty = sy - 10 * Math.sin( lineangle );
        }
        drawArrow( graphics, sx, sy, destx, desty, style, 2, angle, d );
      }
      if ( which & 2 ) { // draw the origination end
        sx = Math.cos( endangle ) * r + x;
        sy = Math.sin( endangle ) * r + y;
        lineangle = Math.atan2( x - sx, sy - y );
        if ( anticlockwise ) {
          destx = sx - 10 * Math.cos( lineangle );
          desty = sy - 10 * Math.sin( lineangle );
        } else {
          destx = sx + 10 * Math.cos( lineangle );
          desty = sy + 10 * Math.sin( lineangle );
        }
        drawArrow( graphics, sx, sy, destx, desty, style, 2, angle, d );
      }
    }
    /* =============================== */

    function line(graphics, from, to, options = { color: "#000000", style: 5 }) {
      var { color, style } = options;

      graphics.lineStyle(style, color);
      graphics.moveTo(from.x, from.y);
      graphics.lineTo(to.x, to.y);
      graphics.endFill();

      return graphics;
    }
  })();
})();