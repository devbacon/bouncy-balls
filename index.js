/* Take care with the order of arguments in MathUtils methods */
import MathUtils from './modules/math-utils.js';

/* TODO: Find a way to differentiate between balls in log */
const debug = false;

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

const boundingShadowWidth = 7;

class Ball {
  constructor(startX, startY, size, direction, speed) {
    /* Randomize colors */
    const colorPairIndex = Math.floor(Math.random() * complementaryColors.length);
    const colorPair = complementaryColors[colorPairIndex];
    this.primaryColor = colorPair[0];
    this.secondaryColor = colorPair[1];

    /* Generate ball DOM element with selected colors */
    const element = document.createElement('div');
    element.addEventListener('click', this.leaveDOM.bind(this));
    // element.style.background = `linear-gradient(35deg, ${this.primaryColor}, ${this.secondaryColor})`;
    element.style.width = size + 'px';
    element.style.height = size + 'px';
    element.style.left = `${startX - size / 2}px`;
    element.style.top = `${startY - size / 2}px`;
    element.classList.add('ball');
    
    /* Ball properties */
    this.element = element;
    this.computedStyles = {};
    this.diameter = size;
    this.radius = size / 2;
    this.direction = direction;
    this.speed = speed;
    /* Bound properties */
    this.boundAreaEl = null;
    this.boundAreaElHeight = 0;
    this.boundAreaElWidth = 0;
    /* Inner bound limits that factor radius of ball */
    this.boundAreaTop = this.radius;
    this.boundAreaRight = 0;
    this.boundAreaBottom = 0;
    this.boundAreaLeft = this.radius;
    /* Coordinate plane starts at top left of bound area */
    this.startX = startX;
    this.startY = startY;
    this.top = startY;
    this.right = null;
    this.bottom = null;
    this.left = startX;
    /* Use objects for semantics */
    this.crossQuadrantTop = { start: 0, end: 0 };
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
    this.moveCount = 0;
    this.generalDecimalLimit = 3;

    if (debug) console.log(`Created ball object at coordinates [${startX},${startY}] 
      facing angle ${direction} with speed of ${speed}`, this);
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

    if (this.boundAreaEl.contains(this.element))
      this.moveToWall();
  }

  leaveDOM(event) {
    if (debug) console.log(`Removing ball element from DOM`);
    if (event) event.stopPropagation();
    this.boundAreaEl.removeChild(this.element);
  }

  /* Make sure that start XY coordinates are in bounds */
  checkStartCoords() {
    if (debug) console.log(`Ensuring that starting coordinated are in bounds`);
    const xInBounds = MathUtils.isWithinRange(this.startX, [this.boundAreaLeft, this.boundAreaRight]);
    const yInBounds = MathUtils.isWithinRange(this.startY, [this.boundAreaTop, this.boundAreaBottom]);

    if (!xInBounds || !yInBounds) {
      if (debug) console.log(`Starting coordinates [${this.startX},${this.startY}] are not 
        within bounds [[${this.boundAreaLeft},${this.boundAreaRight}],[${this.boundAreaTop},${this.boundAreaBottom}]]`);
      this.leaveDOM();
    } else {
      if (debug) console.log(`Starting coordinates are indeed within bounds`);
    }
  }

  updateState() {
    if (debug) console.log(`Updating all object properties`);
    this.boundAreaElHeight = this.boundAreaEl.offsetHeight;
    this.boundAreaElWidth = this.boundAreaEl.offsetWidth;
    this.boundAreaTop = this.radius + boundingShadowWidth;
    this.boundAreaRight = this.boundAreaEl.offsetWidth - this.radius - boundingShadowWidth;
    this.boundAreaBottom = this.boundAreaEl.offsetHeight - this.radius - boundingShadowWidth;
    this.boundAreaLeft = this.radius + boundingShadowWidth;
    this.computedStyles = window.getComputedStyle(this.element);
    this.top = this.parseComputedTop + this.radius;
    this.left = this.parseComputedLeft + this.radius;
    this.right = this.boundAreaElHeight - this.left;
    this.bottom = this.boundAreaElWidth - this.top;
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
      start: MathUtils.limitDecimals(360 - MathUtils.calcTangentAngle(
        this.left, this.top), this.generalDecimalLimit),
      end: MathUtils.limitDecimals(MathUtils.calcTangentAngle(
        this.right, this.top), this.generalDecimalLimit)
    };
    this.crossQuadrantRight = {
      start: MathUtils.limitDecimals(90 - MathUtils.calcTangentAngle(
        this.top, this.right), this.generalDecimalLimit),
      end: MathUtils.limitDecimals(90 + MathUtils.calcTangentAngle(
        this.bottom, this.right), this.generalDecimalLimit)
    };
    this.crossQuadrantBottom = {
      start: MathUtils.limitDecimals(180 - MathUtils.calcTangentAngle(
        this.right, this.bottom), this.generalDecimalLimit),
      end: MathUtils.limitDecimals(180 + MathUtils.calcTangentAngle(
        this.left, this.bottom), this.generalDecimalLimit)
    };
    this.crossQuadrantLeft = {
      start: MathUtils.limitDecimals(270 - MathUtils.calcTangentAngle(
        this.bottom, this.left), this.generalDecimalLimit),
      end: MathUtils.limitDecimals(270 + MathUtils.calcTangentAngle(
        this.top, this.left), this.generalDecimalLimit)
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
    this.updateCrossQuadrants();
    this.nextBounceWall = null;

    /* Bounce direction(left, right, flip) relative to the current direction */
    let relativeBounceDirection = null;
    let adjacentAngle = null;
    let opposingLength = null;

    /* Hit top bound */
    if (MathUtils.isWithinWrapRange(this.direction, this.crossQuadrantRangeTop, 360, true)) {
      this.nextBounceWall = 'top';
      this.nextBounceCoordinates.y = this.boundAreaTop;

      const movingUpLeft = MathUtils.isWithinRange(this.direction, [this.crossQuadrantTop.start, 360]);
      const movingUpRight = MathUtils.isWithinRange(this.direction, [0, this.crossQuadrantTop.end]);
      
      if (movingUpLeft) {
        relativeBounceDirection = 'left';
        adjacentAngle = this.direction - 360;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.top);
        this.nextBounceCoordinates.x = this.left - opposingLength;
        this.directionAfterBounce = 180 + adjacentAngle;
      } else if (movingUpRight) {
        relativeBounceDirection = 'right';
        adjacentAngle = this.direction;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.top);
        this.nextBounceCoordinates.x = this.left + opposingLength;
        this.directionAfterBounce = 180 - adjacentAngle;
      } else { /* Moving straight up */
        this.nextBounceCoordinates.x = this.left;
      }
    }

    /* Hit right bound */
    if (MathUtils.isWithinRange(this.direction, this.crossQuadrantRangeRight, true)) {
      this.nextBounceWall = 'right';
      this.nextBounceCoordinates.x = this.boundAreaRight;
      
      const movingUpRight = MathUtils.isWithinRange(this.direction, [this.crossQuadrantRight.start, 90]);
      const movingDownRight = MathUtils.isWithinRange(this.direction, [90, this.crossQuadrantRight.end]);
      
      if (movingUpRight) {
        relativeBounceDirection = 'left';
        adjacentAngle = 90 - this.direction;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.right);
        this.nextBounceCoordinates.y = this.top - opposingLength;
        this.directionAfterBounce = 270 + adjacentAngle;
      } else if (movingDownRight) {
        relativeBounceDirection = 'right';
        adjacentAngle = this.direction - 90;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.right);
        this.nextBounceCoordinates.y = this.top + opposingLength;
        this.directionAfterBounce = 270 - adjacentAngle;
      } else { /* Moving straight right */
        this.nextBounceCoordinates.y = this.top;
      }
    }

    /* Hit bottom bound */
    if (MathUtils.isWithinRange(this.direction, this.crossQuadrantRangeBottom, true)) {
      this.nextBounceWall = 'bottom';
      this.nextBounceCoordinates.y = this.boundAreaBottom;
      
      const movingDownRight = MathUtils.isWithinRange(this.direction, [this.crossQuadrantBottom.start, 180]);
      const movingDownLeft = MathUtils.isWithinRange(this.direction, [180, this.crossQuadrantBottom.end]);
      
      if (movingDownRight) {
        relativeBounceDirection = 'left';
        adjacentAngle = 180 - this.direction;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.bottom);
        this.nextBounceCoordinates.x = this.left + opposingLength;
        this.directionAfterBounce = 360 - adjacentAngle;
      } else if (movingDownLeft) {
        relativeBounceDirection = 'right';
        adjacentAngle = this.direction - 180;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.bottom);
        this.nextBounceCoordinates.x = this.left - opposingLength;
        this.directionAfterBounce = adjacentAngle;
      } else { /* Moving straight down */
        this.nextBounceCoordinates.x = this.left;
      }
    }

    /* Hit left bound */
    if (MathUtils.isWithinRange(this.direction, this.crossQuadrantRangeLeft, true)) {
      this.nextBounceWall = 'left';
      this.nextBounceCoordinates.x = this.boundAreaLeft;
      
      const movingDownLeft = MathUtils.isWithinRange(this.direction, [this.crossQuadrantLeft.start, 270]);
      const movingUpLeft = MathUtils.isWithinRange(this.direction, [270, this.crossQuadrantLeft.end]);
      
      if (movingDownLeft) {
        relativeBounceDirection = 'left';
        adjacentAngle = 270 - this.direction;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.left);
        this.nextBounceCoordinates.y = this.top + opposingLength;
        this.directionAfterBounce = 90 + adjacentAngle;
      } else if (movingUpLeft) {
        relativeBounceDirection = 'right';
        adjacentAngle = this.direction - 270;
        opposingLength = MathUtils.calcRightTriangleOppositeLength(adjacentAngle, this.left);
        this.nextBounceCoordinates.y = this.top - opposingLength;
        this.directionAfterBounce = 90 - adjacentAngle;
      } else { /* Moving straight left */
        this.nextBounceCoordinates.y = this.top;
      }
    }

    // Find direction after bounce
    const opposingAngle = adjacentAngle ? 90 - adjacentAngle : 0;
    if (relativeBounceDirection === 'left')
      this.directionAfterBounce = this.direction - (opposingAngle * 2);
    else if (relativeBounceDirection === 'right')
      this.directionAfterBounce = this.direction + (opposingAngle * 2);
    else /* This should catch corners too */
      this.directionAfterBounce = this.direction + 180;

    // Ensure that the 360 deg angle system is maintained by wrapping values
    // If direction is over 360 then reduce it by 360
    this.directionAfterBounce %= 360;
    // If direction is negative then add 360 to it
    if (this.directionAfterBounce < 0)
      this.directionAfterBounce += 360;

    if (!relativeBounceDirection)
      if (debug) console.log(`Going to hit a corner`);

    this.nextBounceCoordinates.x = MathUtils.limitDecimals(this.nextBounceCoordinates.x, this.generalDecimalLimit);
    this.nextBounceCoordinates.y = MathUtils.limitDecimals(this.nextBounceCoordinates.y, this.generalDecimalLimit);
    this.translate.x = this.left + this.nextBounceCoordinates.x;
    this.translate.y = this.top + this.nextBounceCoordinates.y;
    this.distanceToNextWall = MathUtils.limitDecimals(
      MathUtils.calcHypotenuseBySides(this[this.nextBounceWall], opposingLength), this.generalDecimalLimit);
    this.secondsToNextWall = MathUtils.limitDecimals(this.distanceToNextWall / this.speed, this.generalDecimalLimit);

    if (debug) console.log(`Adjacent angle: ${adjacentAngle} Opposing length: ${opposingLength}`);
    if (debug) console.log(`Next bounce is on ${this.nextBounceWall} wall 
      at coordinates [${this.nextBounceCoordinates.x}, ${this.nextBounceCoordinates.y}]`);
  }

  moveToWall() {
    if (debug) console.log(`Starting move to ${this.nextBounceWall} wall`);
    this.moveCount++;
    this.element.style.transitionTimingFunction = 'linear';
    this.element.style.transitionDuration = `${this.secondsToNextWall}s`;
    this.element.style.left = this.nextBounceCoordinates.x - this.radius + 'px';
    this.element.style.top = this.nextBounceCoordinates.y - this.radius + 'px';
    const msTravelTime = this.secondsToNextWall * 1000;
    if (debug) console.log(`Moving ball to coordinates [${this.nextBounceCoordinates.x},
      ${this.nextBounceCoordinates.y}] in ${this.secondsToNextWall} seconds`);

    this.nextMoveTimer = setTimeout(() => {
      if (debug) console.log(`Arrived at ${this.nextBounceWall} wall`);
      this.direction = this.directionAfterBounce;
      this.updateState();
      this.moveToWall();
    }, msTravelTime);
  }

  stopMoving() {

  }
}

/* Set click listener bounding area to spawn in bouncy */
const boundAreaEl = document.querySelector('#ball-bounding-area');
boundAreaEl.addEventListener('click', addRandomBall);

function addBall() {
  const ball = new Ball(50, 50, 50, 170, 400);
  ball.enterDOM(boundAreaEl);
}

/* Find better way to do randomization later */
function addRandomBall() {
  const boundWidth = boundAreaEl.offsetWidth;
  const boundHeight = boundAreaEl.offsetHeight;
  const diameter = MathUtils.getRandomIntInRange(30, 50);
  const radius = diameter / 2;
  const startX = MathUtils.getRandomIntInRange(radius, boundWidth - radius);
  const startY = MathUtils.getRandomIntInRange(radius, boundHeight - radius);
  const direction = MathUtils.getRandomInt(360);
  const speed = MathUtils.getRandomIntInRange(100, 600);
  const ball = new Ball(startX, startY, diameter, direction, speed);
  ball.enterDOM(boundAreaEl);
}
