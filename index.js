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
    this.boundAreaElHeight = 0;
    this.boundAreaElWidth = 0;
    /* Inner bound limits that factor radius of ball */
    this.boundAreaTop = 0;
    this.boundAreaRight = 0;
    this.boundAreaBottom = 0;
    this.boundAreaLeft = 0;
    /* Ball properties */
    this.element = element;
    this.computedStyles = {};
    this.diameter = 0;
    this.radius = 0;
    this.direction = direction;
    this.speed = speed;
    /* Coordinate plane starts at top left of bound area */
    this.top = startY;
    this.right = null;
    this.bottom = null;
    this.left = startX;
    /* Use objects for semantics */
    this.crossQuadrantTop = { start: 0 , end: 0 };
    this.crossQuadrantRight = { start: 0, end: 0 };
    this.crossQuadrantBottom = { start: 0, end: 0 };
    this.crossQuadrantLeft = { start: 0, end: 0 };
    /* Use array ranges for utility */
    this.crossQuadrantRangeTop = [];
    this.crossQuadrantRangeRight = [];
    this.crossQuadrantRangeBottom = [];
    this.crossQuadrantRangeLeft = [];
    this.nextBounceWall = '';
    this.nextBounceCoordinates = { x: 0, y: 0 };
    this.directionAfterBounce = null;
    this.distanceToNextWall = 0;
    this.secondsToNextWall = 0;
    this.translate = { x: 0, y: 0 };
    this.nextMoveTimer = null;
    this.bounceCount = 0;
    this.generalDecimalLimit = 3;

    if (debug) console.log(`Created ball object at coordinates [${startX},${startY}] 
      facing angle ${direction} with speed of ${speed}`, this);
  }

  get boundingClientRect() {
    return this.element.getBoundingClientRect();
  }

  get parseComputedTop() {
    return parseInt(this.computedStyles.top);
  }

  get parseComputedLeft() {
    return parseInt(this.computedStyles.left);
  }

  enterDOM(container) {
    if (debug) console.log(`Ball element entering DOM in containing element`, this.element, container);
    container.appendChild(this.element);
    this.boundAreaEl = container;
    this.updateState();
    this.checkStartCoords();
    this.moveToWall();
  }

  leaveDOM(event) {
    if (event) event.stopPropagation();
    this.boundAreaEl.removeChild(this.element);
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

  updateState() {
    if (debug) console.log(`Updating all object properties`);
    this.diameter = this.element.offsetWidth;
    this.radius = this.diameter / 2;
    this.boundAreaElHeight = this.boundAreaEl.offsetHeight;
    this.boundAreaElWidth = this.boundAreaEl.offsetWidth;
    this.boundAreaTop = this.radius;
    this.boundAreaRight = this.boundAreaEl.offsetWidth - this.radius;
    this.boundAreaBottom = this.boundAreaEl.offsetHeight - this.radius;
    this.boundAreaLeft = this.radius;
    /* this.computedStyles = window.getComputedStyle(this.element);
    this.top = MathUtils.limitDecimals(this.parseComputedTop + this.translate.y, this.generalDecimalLimit);
    this.left = MathUtils.limitDecimals(this.parseComputedLeft + this.translate.x, this.generalDecimalLimit);
    this.right = MathUtils.limitDecimals(this.boundAreaWidth - this.left, this.generalDecimalLimit);
    this.bottom = MathUtils.limitDecimals(this.boundAreaHeight - this.top, this.generalDecimalLimit); */
    this.top = this.boundingClientRect.top;
    this.left = this.boundingClientRect.left;
    this.right = this.boundAreaWidth - this.left;
    this.bottom = this.boundAreaHeight - this.top;
    this.updateCrossQuadrantRanges();
    this.updateDirection();
    this.updateBounceData();
    const stateSnapshot = JSON.parse(JSON.stringify(this));
    if (debug) console.log(`Properties update completed`, stateSnapshot, this.element);
  }

  /* 
    Cross quadrants are angle ranges used to check which wall the ball will land on.
    Imagine lines expanding from the ball to the boundary corners.
    Range values are converted to a 360 deg angle system to match with this.direction.
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

  updateBounceData() {
    if (debug) console.log(`Finding next bounce coordinates`);
    /* If ball will bounce left or right */
    let relativeBounceDirection = null;
    let adjacentAngle = null;
    let opposingLength = null;

    /* Hit top bound */
    if (MathUtils.isWithinRange(this.direction, this.crossQuadrantRangeTop)) {
      this.nextBounceWall = 'top';
      this.nextBounceCoordinates.y = this.boundAreaTop;

      const movingUpLeft = MathUtils.isWithinRange(this.direction, [this.crossQuadrantTop.start, 360]);
      const movingUpRight = MathUtils.isWithinRange(this.direction, [0, this.crossQuadrantTop.end]);
      
      if (movingUpLeft) {
        relativeBounceDirection = 'left';
        adjacentAngle = this.direction - 360;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.top);
        this.nextBounceCoordinates.x = this.left - opposingLength;
      } else if (movingUpRight) {
        relativeBounceDirection = 'right';
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
        relativeBounceDirection = 'left';
        adjacentAngle = 90 - this.direction;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.right);
        this.nextBounceCoordinates.y = this.top - opposingLength;
      } else if (movingDownRight) {
        relativeBounceDirection = 'right';
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
        relativeBounceDirection = 'left';
        adjacentAngle = 180 - this.direction;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.bottom);
        this.nextBounceCoordinates.x = this.left + opposingLength;
      } else if (movingDownLeft) {
        relativeBounceDirection = 'right';
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
        relativeBounceDirection = 'left';
        adjacentAngle = 270 - this.direction;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.left);
        this.nextBounceCoordinates.y = this.top + opposingLength;
      } else if (movingUpLeft) {
        relativeBounceDirection = 'right';
        adjacentAngle = this.direction - 270;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.left);
        this.nextBounceCoordinates.y = this.top - opposingLength;
      } else { /* Moving straight left */
        this.nextBounceCoordinates.y = this.top;
      }
    }

    // Find direction after bounce
    const opposingAngle = 180 - adjacentAngle;
    if (relativeBounceDirection === 'left')
      this.directionAfterBounce = this.direction - opposingAngle;
    if (relativeBounceDirection === 'right')
      this.directionAfterBounce = this.direction + opposingAngle;

    // Ensure that the 360 deg angle system is maintained by wrapping values
    // If direction is over 360 then reduce it by 360
    this.directionAfterBounce %= 360;
    // If direction is negative then add 360 to it
    if (this.directionAfterBounce < 0)
      this.directionAfterBounce += 360;

    /* TODO: Catch corners */
    if (!adjacentAngle || !opposingLength)
      if (debug) console.log(`Hit a corner!`);

    this.nextBounceCoordinates.x = MathUtils.limitDecimals(this.nextBounceCoordinates.x, this.generalDecimalLimit);
    this.nextBounceCoordinates.y = MathUtils.limitDecimals(this.nextBounceCoordinates.y, this.generalDecimalLimit);
    this.translate.x = this.left + this.nextBounceCoordinates.x;
    this.translate.y = this.top + this.nextBounceCoordinates.y;
    this.distanceToNextWall = MathUtils.limitDecimals(
      MathUtils.calcHypotenuseBySides(this[this.nextBounceWall], opposingLength), this.generalDecimalLimit);
    this.secondsToNextWall = MathUtils.limitDecimals(this.distanceToNextWall / this.speed, this.generalDecimalLimit);

    if (debug) console.log(`Next bounce is on ${this.nextBounceWall} wall 
      at coordinates [${this.nextBounceCoordinates.x}, ${this.nextBounceCoordinates.y}]`);
  }

  moveToWall() {
    if (debug) console.log(`Starting move to ${this.nextBounceWall} wall`);
    this.element.style.transitionTimingFunction = 'linear';
    this.element.style.transitionDuration = `${this.secondsToNextWall}s`;
    this.element.style.transform = `translate(${this.translate.x}px, ${this.translate.y}px)`;
    /* this.element.style.left = this.left - this.radius;
    this.element.style.top = this.top - this.radius; */
    const msTravelTime = this.secondsToNextWall * 1000;
    if (debug) console.log(`Setting up ball to hit coordinates [${this.nextBounceCoordinates}] 
      with left and top values [${this.translate.x},${this.translate.y}] in ${this.secondsToNextWall} seconds`);

    if (this.bounceCount < 10) {
      this.nextMoveTimer = setTimeout(() => {
        if (debug) console.log(`Arrived at ${this.nextBounceWall} wall`);
        this.updateState();
        this.moveToWall();
        // this.updateBallPosition();
      }, msTravelTime);
    }
  }

  /* updateBallElementLocation() {
    if (debug) console.log(`Ball styles before update are top:${this.element.style.top} left:${this.element.style.left}`);
    // this.element.style.transitionDuration = `0s`;
    const boundingRect = this.element.getBoundingClientRect();
    this.element.style.top = this.element.getBoundingClientRect() + 'px';
    this.element.style.left = this.left - this.radius + 'px';
    // this.element.style.transform = `translate(0px, 0px)`;
    if (debug) console.log(`Updating ball styles to top:${this.element.style.top} left:${this.element.style.left}`);
  } */

  stopMoving() {

  }
}

/* Set click listener bounding area to spawn in bouncy */
const boundAreaEl = document.querySelector('#ball-bounding-area');
boundAreaEl.addEventListener('click', addBall);

function addBall() {
  const ball = new Ball(50, 50, 181, 400);
  ball.enterDOM(boundAreaEl);
}
