/* Custom math utility short cuts exported as MathUtils object */

export default MathUtils = {
  /* Determine trigonometry operation based on missing side */
  findRightTriangleOppositeLength(angle, adjacentLength, hypotenuseLength) {
    /* Ensure that inputs are valid */
    if(typeof angle != 'number' || 0 > angle > 180) return null;
    const parsedAdjacentLength = parseInt(adjacentLength, 2);
    const parsedHypotenuseLength = parseInt(hypotenuseLength, 2);

    if (parsedAdjacentLength) {
      /* Tangent */

      return
    }

    if (parsedHypotenuseLength) {
      /* Sine */

      return
    }
  },
  findRightTriangleAdjacentLength(angle, oppositeLength, hypotenuseLength) {
    /* Ensure that inputs are valid */
    if(typeof angle != 'number' || 0 > angle > 180) return null;
    const parsedOppositeLength = parseInt(oppositeLength, 2);
    const parsedHypotenuseLength = parseInt(hypotenuseLength, 2);

    if (parsedOppositeLength) {
      /* Tangent */
      
      return
    }

    if (parsedHypotenuseLength) {
      /* Sine */

      return
    }
  },
  findRightTriangleHypotenuseLength(angle, oppositeLength, adjacentLength) {
    /* Ensure that inputs are valid */
    if(typeof angle != 'number' || 0 > angle > 180) return null;
    const parsedOppositeLength = parseInt(oppositeLength, 2);
    const parsedAdjacentLength = parseInt(adjacentLength, 2);

    if (parsedOppositeLength) {
      /* Tangent */
      
      return
    }

    if (parsedAdjacentLength) {
      /* Sine */

      return
    }
  },
  getRightTriangleDimensions(angle1, sideLength1, angle2, sideLength2, angle3, sideLength3) {
    /* Return all obtainable info using known sides and angles */

  },
}

