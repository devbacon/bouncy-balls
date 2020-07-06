/* Custom math utility short cuts */
const MathUtils = {
  findRemainingTriangleAngle(angle1, angle2) {
    if (angle1 + angle2 > 180) return null;
    return 180 - angle1 - angle2;
  },

  calcHypotenuseBySides(length1, length2) {
    return Math.sqrt(Math.pow(length1, 2) + Math.pow(length2, 2));
  },

  calcRightTriangleOppositeLength(angle, adjacentLength, hypotenuseLength) {
    if (this.isValidTriangleAngle(angle)) {
      const radians = this.degreesToRadians(angle);

      if (this.isValidTriangleLength(adjacentLength))
        return adjacentLength * Math.tan(radians);
  
      if (this.isValidTriangleLength(hypotenuseLength))
        return hypotenuseLength * Math.sin(radians);
    }

    return null;
  },

  calcRightTriangleAdjacentLength(angle, oppositeLength, hypotenuseLength) {
    if (!this.isValidTriangleAngle(angle)) {
      const radians = this.degreesToRadians(angle);

      if (this.isValidTriangleLength(oppositeLength))
        return oppositeLength / Math.tan(radians);
  
      if (this.isValidTriangleLength(hypotenuseLength))
        return hypotenuseLength * Math.cos(radians);
    }

    return null;
  },

  calcRightTriangleHypotenuseLength(angle, oppositeLength, adjacentLength) {
    if (!this.isValidTriangleAngle(angle)) {
      const radians = this.degreesToRadians(angle);

      if (this.isValidTriangleLength(oppositeLength))
        return oppositeLength / Math.sin(radians);
  
      if (this.isValidTriangleLength(adjacentLength))
        return adjacentLength / Math.cos(radians);
    }

    return null;
  },

  calcTangentAngle(oppositeLength, adjacentLength) {
    if (this.isValidTriangleLength(oppositeLength) && this.isValidTriangleLength(adjacentLength))
      return this.radiansToDegrees(Math.atan(oppositeLength / adjacentLength));
  },

  calcDoubleTangentAngle(oppositeLength1, oppositeLength2, adjacentLength) {
    return this.calcTangentAngle(oppositeLength1, adjacentLength) + this.calcTangentAngle(oppositeLength2, adjacentLength);
  },
  
  getRightTriangleDimensions(angle1, sideLength1, angle2, sideLength2, angle3, sideLength3) {
    /* TODO: Return all obtainable info using known sides and angles */
  },

  /* HELPER METHODS */

  /* Validation */
  isValidTriangleAngle(angle) {
    if (typeof angle != 'number' || angle < 0 || angle > 180) return false;
    return true;
  },

  isValidTriangleLength(number) {
    if (typeof number != 'number' || number < 1) return false;
    return true;
  },

  /* Conversions */
  radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
  },

  degreesToRadians(degrees) {
    return degrees * Math.PI / 180
  }
};

export default MathUtils;
