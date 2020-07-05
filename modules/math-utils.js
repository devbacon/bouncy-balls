/* Custom math utility short cuts exported as MathUtils object */

export default MathUtils = {
  /* Determine trigonometry operation based on missing side */
  findRightTriangleOppositeLength(angle, adjacentLength, hypotenuseLength) {
    /* Ensure that inputs are valid */
    if (this.isValidTriangleAngle(angle)) return null;

    if (this.isValidTriangleLength(adjacentLength))
      return adjacentLength * Math.tan(angle);

    if (this.isValidTriangleLength(hypotenuseLength))
      return Math.sin(angle);
  },

  findRightTriangleAdjacentLength(angle, oppositeLength, hypotenuseLength) {
    /* Ensure that inputs are valid */
    if (this.isValidTriangleAngle(angle)) return null;

    if (this.isValidTriangleLength(oppositeLength))
      return

    if (this.isValidTriangleLength(hypotenuseLength))
      return
  },

  findRightTriangleHypotenuseLength(angle, oppositeLength, adjacentLength) {
    /* Ensure that inputs are valid */
    if (this.isValidTriangleAngle(angle)) return null;

    if (this.isValidTriangleLength(oppositeLength))
      return

    if (this.isValidTriangleLength(adjacentLength))
      return
  },
  
  getRightTriangleDimensions(angle1, sideLength1, angle2, sideLength2, angle3, sideLength3) {
    /* Return all obtainable info using known sides and angles */

  },

  /* Helper methods */
  
  /* Validation */
  isValidTriangleAngle(angle) {
    if (typeof angle != 'number' || 0 > angle > 180) return false;
    return true;
  },
  
  isValidTriangleLength(number) {
    if (typeof number != 'number' || number < 1) return false;
    return true;
  },
}

