/* Take care with the order of arguments in MathUtils methods */
import MathUtils from './modules/math-utils.js';

/* 
  Development Notes:
    - Consider front loading some of the computation on page load
    - Control CSS animations and transitions with JS
*/

const debug = true;

/* TODO: Move colors to CSS */
const colorHex = {
  red: '#F00',
  cyan: '#0FF',
  green: '#0F0',
  magenta: '#F0F',
  blue: '#00F',
  yellow: '#FF0',
};

const complementaryColors = [
  [colorHex.red, colorHex.cyan],
  [colorHex.green, colorHex.magenta],
  [colorHex.blue, colorHex.yellow],
];

const relativeAngleReferences = {
  topStart: 0,
  topRight: 45,
  right: 90,
  bottomRight: 135,
  bottom: 180,
  bottomLeft: 225,
  left: 270,
  topLeft: 315,
  topEnd: 360,
};

class Ball {
  constructor(startX, startY, direction, speed) {
    /* Randomize colors */
    const colorPairIndex = Math.floor(Math.random() * complementaryColors.length);
    const colorPair = complementaryColors[colorPairIndex];
    this.primaryColor = colorPair[0];
    this.secondaryColor = colorPair[1];

    /* Generate ball DOM element with selected colors */
    const element = document.createElement('div');
    element.addEventListener('click', this.leaveDOM.bind(this));
    element.style.background = `linear-gradient(35deg, ${this.primaryColor}, ${this.secondaryColor})`;
    element.style.left = `${startX}px`;
    element.style.top = `${startY}px`;
    element.classList.add('ball');
    
    /* Bound properties */
    this.boundAreaEl = null;
    this.boundAreaHeight = null;
    this.boundAreaWidth = null;
    /* Ball properties */
    this.element = element;
    this.styles = null;
    this.computedStyles = null;
    this.diameter = null;
    this.radius = null;
    this.direction = direction;
    this.speed = speed;
    /* Coordinate plane starts at top left of bound area */
    this.top = startY;
    this.right = null;
    this.bottom = null;
    this.left = startX;
    this.crossQuadrantRangeTop = null;
    this.crossQuadrantRangeRight = null;
    this.crossQuadrantRangeBottom = null;
    this.crossQuadrantRangeLeft = null;
    this.nextBounceWall = null;
    this.nextBounceCoordinates = {};
    /* this.nextWallCollision = null;
    this.nextWallCollisionCoords = null; */
    this.distanceToNextWall = null;
    this.timeToNextWall = null;
    this.moveX = 0;
    this.moveY = 0;
    this.nextMove = null;
    this.bounceCount = 0;
    this.generalDecimalLimit = 3;

    if (debug) console.log(`Created ball object at coordinates [${startX},${startY}] 
      facing angle ${direction} with speed of ${speed}`, this);
  }

  enterDOM(container) {
    if (debug) console.log(`Ball element entering DOM in containing element`, this.element, container);
    container.appendChild(this.element);
    this.boundAreaEl = container;
    this.updateProps();
    this.checkStartCoords();
    this.moveToWall();
  }

  /* Make sure that start XY coordinates are in bounds */
  checkStartCoords() {
    if (debug) console.log(`Ensuring that starting coordinated are in bounds`, this.element, container);
    const xInBounds = MathUtils.isWithinRange(this.startX, [this.boundAreaLeft, this.boundAreaRight]);
    const yInBounds = MathUtils.isWithinRange(this.startY, [this.boundAreaTop, this.boundAreaBottom]);

    if (!xInBounds || !yInBounds)
      this.leaveDOM();
    else
      if (debug) console.log(`Starting coordinate are indeed within bounds`);
  }

  updateProps() {
    if (debug) console.log(`Updating all object properties`);
    /* this.updateBoundProps();
    this.updateBallProps(); */
    this.diameter = this.element.offsetWidth;
    this.radius = this.diameter / 2;
    /* this.boundAreaHeight = this.boundAreaEl.offsetHeight - this.diameter;
    this.boundAreaWidth = this.boundAreaEl.offsetWidth - this.diameter; */
    /* Inner bound limits that factor radius of ball */
    this.boundAreaTop = this.radius;
    this.boundAreaRight = this.boundAreaEl.offsetWidth - this.radius;
    this.boundAreaBottom = this.boundAreaEl.offsetHeight - this.radius;
    this.boundAreaLeft = this.radius;
    this.computedStyles = window.getComputedStyle(this.element);
    this.top = MathUtils.limitDecimals(this.parseComputedTop + this.moveY, this.generalDecimalLimit);
    this.left = MathUtils.limitDecimals(this.parseComputedLeft + this.moveX, this.generalDecimalLimit);
    this.right = MathUtils.limitDecimals(this.boundAreaWidth - this.left, this.generalDecimalLimit);
    this.bottom = MathUtils.limitDecimals(this.boundAreaHeight - this.top, this.generalDecimalLimit);
    this.updateCrossQuadrantRanges();
    this.findBounceCoordinates();
    const stateSnapshot = JSON.parse(JSON.stringify(this));
    if (debug) console.log(`Properties update completed`, stateSnapshot, this.element);
  }

  get parseComputedTop() {
    return parseInt(this.computedStyles.top);
  }

  get parseComputedLeft() {
    return parseInt(this.computedStyles.left);
  }

  /* updateBoundProps() {
    if (debug) console.log(`Updating boundary properties`);
    this.boundAreaHeight = this.boundAreaEl.offsetHeight;
    this.boundAreaWidth = this.boundAreaEl.offsetWidth;
  }

  updateBallProps() {
    if (debug) console.log(`Updating ball properties`);
    this.styles = window.getComputedStyle(this.element);
    this.diameter = this.element.offsetWidth;
    this.radius = this.diameter / 2;
    this.top = MathUtils.limitDecimals(this.top + this.moveY);
    this.left = MathUtils.limitDecimals(this.left + this.moveX);
    this.right = MathUtils.limitDecimals(this.boundAreaWidth - this.left);
    this.bottom = MathUtils.limitDecimals(this.boundAreaHeight - this.top);
    this.updateCrossQuadrantRanges();
    this.findNextWallCollision();
  } */

  /* 
    Cross quadrants are angle ranges used to check which wall the ball will land on
    Imagine lines expanding from the ball to the boundary corners
    Range values are converted to a 360 deg angle system to match with this.direction
  */
  updateCrossQuadrants() {
    if (debug) console.log(`Updating cross quadrants`);

    /* Use objects for semantics */
    this.crossQuadrantTop = {
      start: MathUtils.limitDecimals(360 - MathUtils.calcTangentAngle(this.boundAreaLeft, this.boundAreaTop)),
      end: MathUtils.limitDecimals(MathUtils.calcTangentAngle(this.boundAreaRight, this.boundAreaTop))
    };
    this.crossQuadrantRight = {
      start: MathUtils.limitDecimals(90 - MathUtils.calcTangentAngle(this.boundAreaTop, this.boundAreaRight)),
      end: MathUtils.limitDecimals(90 + MathUtils.calcTangentAngle(this.boundAreaBottom, this.boundAreaRight))
    };
    this.crossQuadrantBottom = {
      start: MathUtils.limitDecimals(180 - MathUtils.calcTangentAngle(this.boundAreaRight, this.boundAreaBottom)),
      end: MathUtils.limitDecimals(180 + MathUtils.calcTangentAngle(this.boundAreaLeft, this.boundAreaBottom))
    };
    this.crossQuadrantLeft = {
      start: MathUtils.limitDecimals(270 - MathUtils.calcTangentAngle(this.boundAreaBottom, this.boundAreaLeft)),
      end: MathUtils.limitDecimals(270 + MathUtils.calcTangentAngle(this.boundAreaTop, this.boundAreaLeft))
    };

    /* Use array ranges for utility */
    this.crossQuadrantRangeTop = [this.crossQuadrantTop.start, this.crossQuadrantTop.end];
    this.crossQuadrantRangeRight = [this.crossQuadrantRight.start, this.crossQuadrantRight.end];
    this.crossQuadrantRangeBottom = [this.crossQuadrantBottom.start, this.crossQuadrantBottom.end];
    this.crossQuadrantRangeLeft = [this.crossQuadrantLeft.start, this.crossQuadrantLeft.end];

    if (debug) console.log(`Cross quadrant update complete`);
  }

  findBounceCoordinates() {
    if (debug) console.log(`Finding next bounce coordinates`);
    const adjacentAngle = null;
    const opposingLength = null;

    /* Hit top bound */
    if (MathUtils.isWithinRange(this.direction, this.crossQuadrantRangeTop)) {
      this.nextBounceWall = 'top';
      this.nextBounceCoordinates.y = this.boundAreaTop;

      const movingUpLeft = MathUtils.isWithinRange(this.direction, [this.crossQuadrantTop.start, 360]);
      const movingUpRight = MathUtils.isWithinRange(this.direction, [0, this.crossQuadrantTop.end]);
      
      if (movingUpLeft) {
        adjacentAngle = this.direction - 360;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.top);
        this.nextBounceCoordinates.x = this.left - opposingLength;
      } else if (movingUpRight) {
        adjacentAngle = this.direction;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.top);
        this.nextBounceCoordinates.x = this.left + opposingLength;
      } else { /* Moving straight up */
        this.nextBounceCoordinates.x = this.left;
      }
    }
    
    /* Hit right bound */
    if (MathUtils.isWithinRange(this.direction, this.crossQuadrantRangeRight)) {
      this.nextBounceWall = 'right';
      this.nextBounceCoordinates.x = this.boundAreaRight;
      
      const movingUpRight = MathUtils.isWithinRange(this.direction, [this.crossQuadrantRight.start, 90]);
      const movingDownRight = MathUtils.isWithinRange(this.direction, [90, this.crossQuadrantRight.end]);
      
      if (movingUpRight) {
        adjacentAngle = 90 - this.direction;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.right);
        this.nextBounceCoordinates.y = this.top - opposingLength;
      } else if (movingDownRight) {
        adjacentAngle = this.direction - 90;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.right);
        this.nextBounceCoordinates.y = this.top + opposingLength;
      } else { /* Moving straight right */
        this.nextBounceCoordinates.y = this.top;
      }
    }

    /* Hit bottom bound */
    if (MathUtils.isWithinRange(this.direction, this.crossQuadrantRangeBottom)) {
      this.nextBounceWall = 'bottom';
      this.nextBounceCoordinates.y = this.boundAreaBottom;
      
      const movingDownRight = MathUtils.isWithinRange(this.direction, [this.crossQuadrantBottom.start, 180]);
      const movingDownLeft = MathUtils.isWithinRange(this.direction, [180, this.crossQuadrantBottom.end]);
      
      if (movingDownRight) {
        adjacentAngle = 180 - this.direction;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.bottom);
        this.nextBounceCoordinates.x = this.left + opposingLength;
      } else if (movingDownLeft) {
        adjacentAngle = this.direction - 180;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.bottom);
        this.nextBounceCoordinates.x = this.left - opposingLength;
      } else { /* Moving straight down */
        this.nextBounceCoordinates.x = this.left;
      }
    }

    /* Hit left bound */
    if (MathUtils.isWithinRange(this.direction, this.crossQuadrantRangeLeft)) {
      this.nextBounceWall = 'left';
      this.nextBounceCoordinates.x = this.boundAreaLeft;
      
      const movingDownLeft = MathUtils.isWithinRange(this.direction, [this.crossQuadrantLeft.start, 270]);
      const movingUpLeft = MathUtils.isWithinRange(this.direction, [270, this.crossQuadrantLeft.end]);
      
      if (movingDownLeft) {
        adjacentAngle = 270 - this.direction;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.left);
        this.nextBounceCoordinates.y = this.top + opposingLength;
      } else if (movingUpLeft) {
        adjacentAngle = this.direction - 270;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.left);
        this.nextBounceCoordinates.y = this.top - opposingLength;
      } else { /* Moving straight left */
        this.nextBounceCoordinates.y = this.top;
      }
    }

    /* TODO: Catch corners */
    if (debug) console.log(`Finding next bounce coordinates`);
  }

  /* Determine next wall collision */
  /* TODO: Factor in corners */
  findNextWallCollision() {
    if (debug) console.log(`Finding next wall collision`);
    let collisionAngle = null;
    let collisionTangentLength = null;
    let nextWallCalcCoord = null;

    const leftTop = this.direction > this.crossQuadrantRangeTop[0] && this.direction < 360;
    const rightTop = this.direction > 0 && this.direction < this.crossQuadrantRangeTop[1];
    
    /* Hit in top cross quadrant */
    if (leftTop || rightTop) {
      if (leftTop) {
        collisionAngle = 360 - this.direction;
        collisionTangentLength = MathUtils.calcRightTriangleOppositeLength(collisionAngle, this.top, null);
        nextWallCalcCoord = MathUtils.limitDecimals(this.left - this.radius - collisionTangentLength);
        this.nextWallCollisionCoords = [nextWallCalcCoord, 0];
        this.moveX = -collisionTangentLength + this.radius;
      }

      if (rightTop) {
        collisionAngle = this.direction;
        collisionTangentLength = MathUtils.calcRightTriangleOppositeLength(collisionAngle, this.top, null);
        nextWallCalcCoord = MathUtils.limitDecimals(this.left - this.radius + collisionTangentLength);
        this.nextWallCollisionCoords = [nextWallCalcCoord, 0];
        this.moveX = collisionTangentLength - this.radius;
      }

      this.moveY = -this.top + this.radius;
      this.nextWallCollision = 'top';
    }

    const topRight = this.direction > this.crossQuadrantRangeRight[0] && this.direction < 90;
    const bottomRight = this.direction > 90 && this.direction < this.crossQuadrantRangeRight[1];
    
    /* Hit in right cross quadrant */
    if (topRight || bottomRight) {
      if (topRight) {
        collisionAngle = 90 - this.direction;
        collisionTangentLength = MathUtils.calcRightTriangleOppositeLength(collisionAngle, this.right, null);
        nextWallCalcCoord = MathUtils.limitDecimals(this.top - this.radius - collisionTangentLength);
        this.nextWallCollisionCoords = [this.boundAreaWidth, nextWallCalcCoord];
        this.moveY = -collisionTangentLength + this.radius;
      }

      if (bottomRight) {
        collisionAngle = this.direction - 90;
        collisionTangentLength = MathUtils.calcRightTriangleOppositeLength(collisionAngle, this.right, null);
        nextWallCalcCoord = MathUtils.limitDecimals(this.top - this.radius + collisionTangentLength);
        this.nextWallCollisionCoords = [this.boundAreaWidth, nextWallCalcCoord];
        this.moveY = collisionTangentLength - this.radius;
      }

      this.moveX = this.right - this.radius;
      this.nextWallCollision = 'right';
    }
    
    const rightBottom = this.direction > this.crossQuadrantRangeBottom[0] && this.direction < 180;
    const leftBottom = this.direction > 180 && this.direction < this.crossQuadrantRangeBottom[1];
    
    /* Hit in bottom cross quadrant */
    if (rightBottom || leftBottom) {
      if (rightBottom) {
        collisionAngle = 180 - this.direction;
        collisionTangentLength = MathUtils.calcRightTriangleOppositeLength(collisionAngle, this.bottom, null);
        nextWallCalcCoord = MathUtils.limitDecimals(this.left - this.radius + collisionTangentLength);
        this.nextWallCollisionCoords = [nextWallCalcCoord, this.boundAreaHeight];
        this.moveX = collisionTangentLength;
      }

      if (leftBottom) {
        collisionAngle = this.direction - 180;
        collisionTangentLength = MathUtils.calcRightTriangleOppositeLength(collisionAngle, this.bottom, null);
        nextWallCalcCoord = MathUtils.limitDecimals(this.left - this.radius - collisionTangentLength);
        this.nextWallCollisionCoords = [nextWallCalcCoord, this.boundAreaHeight];
        this.moveX = -collisionTangentLength;
      }

      this.moveY = this.bottom - this.radius;
      this.nextWallCollision = 'bottom';
    }

    const bottomLeft = this.direction > this.crossQuadrantRangeLeft[0] && this.direction < 270;
    const topLeft = this.direction > 270 && this.direction < this.crossQuadrantRangeLeft[1];

    /* Hit in left cross quadrant */
    if (bottomLeft || topLeft) {
      if (bottomLeft) {
        collisionAngle = 270 - this.direction;
        collisionTangentLength = MathUtils.calcRightTriangleOppositeLength(collisionAngle, this.left, null);
        nextWallCalcCoord = MathUtils.limitDecimals(this.top + this.radius + collisionTangentLength);
        this.nextWallCollisionCoords = [0, nextWallCalcCoord];
        this.moveY = -collisionTangentLength + this.radius;
      }

      if (topLeft) {
        collisionAngle = this.direction - 270;
        collisionTangentLength = MathUtils.calcRightTriangleOppositeLength(collisionAngle, this.left, null);
        nextWallCalcCoord = MathUtils.limitDecimals(this.top - this.radius + collisionTangentLength);
        this.nextWallCollisionCoords = [0, nextWallCalcCoord];
        this.moveY = collisionTangentLength - this.radius;
      }
      
      this.moveX = -this.left;
      this.nextWallCollision = 'left';
    }

    this.moveX = MathUtils.limitDecimals(this.moveX);
    this.moveY = MathUtils.limitDecimals(this.moveY);

    this.distanceToNextWall = MathUtils.limitDecimals(
      MathUtils.calcHypotenuseBySides(this[this.nextWallCollision], collisionTangentLength));
    this.timeToNextWall = MathUtils.limitDecimals(this.distanceToNextWall / this.speed);
    if (debug) console.log(`Next collision is ${this.nextWallCollision} wall 
      at coordinates [${this.nextWallCollisionCoords}]`);
  }

  moveToWall() {
    if (debug) console.log(`Starting move to ${this.nextWallCollision} wall`);
    this.element.style.transitionTimingFunction = 'linear';
    this.element.style.transitionDuration = `${this.timeToNextWall}s`;
    this.element.style.transform = `translate(${this.moveX}px, ${this.moveY}px)`;
    const msTravelTime = this.timeToNextWall * 1000;
    if (debug) console.log(`Setting up ball to hit coordinates [${this.nextWallCollisionCoords}] 
      with transform translation values [${this.moveX},${this.moveY}] in ${this.timeToNextWall} seconds`);

    if (this.bounceCount < 10) {
      this.nextMove = setTimeout(() => {
        if (debug) console.log(`Arrived at ${this.nextWallCollision} wall`);
        this.updateDirection();
        this.updateBallPosition();
      }, msTravelTime);
    }
  }

  updateBallPosition() {
    if (debug) console.log(`Ball styles before update are top:${this.element.style.top} left:${this.element.style.left}`);
    // this.element.style.transitionDuration = `0s`;
    this.element.style.top = this.top - this.radius + 'px';
    this.element.style.left = this.left - this.radius + 'px';
    // this.element.style.transform = `translate(0px, 0px)`;
    if (debug) console.log(`Updating ball styles to top:${this.element.style.top} left:${this.element.style.left}`);
  }

  updateDirection() {
    if (debug) console.log(`Updating direction from ${this.direction}`);
    this.bounceCount++;
    let adjacentAngle = null;
    let opposingAngle = null;

   switch (this.nextWallCollision) {
    case 'top':
      /* Moving to the right */
      if (this.moveX > 0) {
        adjacentAngle = this.direction;
        opposingAngle = MathUtils.findRemainingTriangleAngle(adjacentAngle, 90);
        this.direction = 90 + opposingAngle;
      } else {
      /* Moving to the left */
        adjacentAngle = 360 - this.direction;
        opposingAngle = MathUtils.findRemainingTriangleAngle(adjacentAngle, 90);
        this.direction = 270 - opposingAngle;
      }
      console.log('Adjacent angle: ' + adjacentAngle);
      console.log('Opposing angle: ' + opposingAngle);
      break;
    case 'right':
      /* Moving to the bottom */
      if (this.moveY > 0) {
        adjacentAngle = this.direction - 90;
        opposingAngle = MathUtils.findRemainingTriangleAngle(adjacentAngle, 90);
        this.direction = 180 + opposingAngle;
      } else {
      /* Moving to the top */
        adjacentAngle = this.direction;
        opposingAngle = MathUtils.findRemainingTriangleAngle(adjacentAngle, 90);
        this.direction = 360 + opposingAngle;
      }
      console.log('Adjacent angle: ' + adjacentAngle);
      console.log('Opposing angle: ' + opposingAngle);
      break;
    case 'bottom':
      /* Moving to the right */
      if (this.moveX > 0) {
        adjacentAngle = 180 - this.direction;
        opposingAngle = MathUtils.findRemainingTriangleAngle(adjacentAngle, 90);
        this.direction = 90 - opposingAngle;
      } else {
      /* Moving to the left */
        adjacentAngle = this.direction - 180;
        opposingAngle = MathUtils.findRemainingTriangleAngle(adjacentAngle, 90);
        this.direction = 270 + opposingAngle;
      }
      console.log('Adjacent angle: ' + adjacentAngle);
      console.log('Opposing angle: ' + opposingAngle);
      break;
    case 'left':
      /* Moving to the bottom */
      if (this.moveY > 0) {
        adjacentAngle = 270 - this.direction;
        opposingAngle = MathUtils.findRemainingTriangleAngle(adjacentAngle, 90);
        this.direction = 0 + opposingAngle;
      } else {
      /* Moving to the top */
        adjacentAngle = this.direction - 270;
        opposingAngle = MathUtils.findRemainingTriangleAngle(adjacentAngle, 90);
        this.direction = 180 + opposingAngle;
      }
      console.log('Adjacent angle: ' + adjacentAngle);
      break;
    default:
      break;
    }

    if (debug) console.log(`New direction is ${this.direction}`);
    this.updateProps();
    this.moveToWall();
  }

  stopMoving() {

  }

  leaveDOM(event) {
    if (event) event.stopPropagation();
    this.boundAreaEl.removeChild(this.element);
  }
}

/* Set click listener bounding area to spawn in bouncy */
const boundAreaEl = document.querySelector('#ball-bounding-area');
boundAreaEl.addEventListener('click', addBall);

function addBall() {
  const ball = new Ball(50, 50, 181, 400);
  ball.enterDOM(boundAreaEl);
}
