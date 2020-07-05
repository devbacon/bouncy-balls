/* Custom math utility short cuts exported as MathUtils object */

export default MathUtils = {
  /* Determine trigonometry operation based on missing side */
  findRightTriangleOppositeLength(angle, adjacentLength, hypotenuseLength) {
    if (this.isValidTriangleAngle(angle)) return null;

    if (this.isValidTriangleLength(adjacentLength))
      return adjacentLength * Math.tan(angle);

    if (this.isValidTriangleLength(hypotenuseLength))
      return hypotenuseLength * Math.sin(angle);
  },

  findRightTriangleAdjacentLength(angle, oppositeLength, hypotenuseLength) {
    if (this.isValidTriangleAngle(angle)) return null;

    if (this.isValidTriangleLength(oppositeLength))
      return oppositeLength / Math.tan(angle);

    if (this.isValidTriangleLength(hypotenuseLength))
      return hypotenuseLength * Math.cos(angle);
  },

  findRightTriangleHypotenuseLength(angle, oppositeLength, adjacentLength) {
    if (this.isValidTriangleAngle(angle)) return null;

    if (this.isValidTriangleLength(oppositeLength))
      return oppositeLength / Math.sin(angle);

    if (this.isValidTriangleLength(adjacentLength))
      return adjacentLength / Math.cos(angle);
  },
  
  getRightTriangleDimensions(angle1, sideLength1, angle2, sideLength2, angle3, sideLength3) {
    /* TODO: Return all obtainable info using known sides and angles */
  },

  /* HELPER METHODS */

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

