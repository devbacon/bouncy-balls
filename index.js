/* Take care with the order of arguments in MathUtils methods */
import MathUtils from './modules/math-utils.js';

/* 
  Development Notes:
    - Consider front loading some of the computation on page load
    - Control CSS animations and transitions with JS
*/

/* TODO: Move colors to CSS */
const colorHex = {
  red: '#F00',
  cyan: '#0FF',
  green: '#0F0',
  magenta: '#F0F',
  blue: '#00F',
  yellow: '#FF0'
};

const complementaryColors = [
  [colorHex.red, colorHex.cyan],
  [colorHex.green, colorHex.magenta],
  [colorHex.blue, colorHex.yellow]
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
  topEnd: 360
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
    element.classList.add('ball');
    
    /* Bound properties */
    this.boundAreaEl = null;
    this.boundAreaStyles = null;
    this.boundAreaHeight = null;
    this.boundAreaWidth = null;

    /* Ball properties */
    this.element = element;
    this.styles = null;
    this.circumference = null;
    this.radius = null;
    this.direction = direction;
    this.speed = speed;
    /* Coordinate plane starts at top left of bound area */
    this.top = startY;
    this.right = null;
    this.bottom = null;
    this.left = startX;

    /* Relation properties */
    this.crossQuadrantRangeTop = null;
    this.crossQuadrantRangeRight = null;
    this.crossQuadrantRangeBottom = null;
    this.crossQuadrantRangeLeft = null;
    this.nextWallCollision = null;
  }

  enterDOM(container) {
    this.boundAreaEl = container;
    container.appendChild(this.element);
    this.updateAllProps();
    console.log(this);
  }

  updateAllProps() {
    this.updateBoundProps();
    this.updateBallProps();
  }

  updateBoundProps() {
    this.boundAreaStyles = window.getComputedStyle(this.boundAreaEl);
    this.boundAreaHeight = this.boundAreaEl.offsetHeight;
    this.boundAreaWidth = this.boundAreaEl.offsetWidth;
  }

  updateBallProps() {
    this.styles = window.getComputedStyle(this.element);
    this.circumference = this.element.offsetWidth;
    this.radius = this.circumference / 2;
    this.top = this.element.offsetTop + this.radius;
    this.left = this.element.offsetLeft + this.radius;
    this.right = this.boundAreaWidth - this.left;
    this.bottom = this.boundAreaHeight - this.top;
    this.updateCrossQuadrentRanges();
    this.findNextWallCollision();
  }

  /* 
    Cross quadrants are angle ranges used to check which wall the ball will land on
    Imagine lines expanding from the ball to the boundary corners
    Range values are converted to a 360 deg angle system to match with this.direction
  */
  updateCrossQuadrentRanges() {
    this.crossQuadrantRangeTop = [
      360 - MathUtils.calcTangentAngle(this.left, this.top),
      MathUtils.calcTangentAngle(this.right, this.top)
    ];
    this.crossQuadrantRangeRight = [
      90 - MathUtils.calcTangentAngle(this.top, this.right),
      90 + MathUtils.calcTangentAngle(this.bottom, this.right)
    ];
    this.crossQuadrantRangeBottom = [
      180 - MathUtils.calcTangentAngle(this.right, this.bottom),
      180 + MathUtils.calcTangentAngle(this.left, this.bottom)
    ];
    this.crossQuadrantRangeLeft = [
      270 - MathUtils.calcTangentAngle(this.bottom, this.left),
      270 + MathUtils.calcTangentAngle(this.top, this.left)
    ];
  }

  /* Determine next wall collision */
  /* TODO: Factor in corners */
  findNextWallCollision() {
    if (this.direction > this.crossQuadrantRangeTop[0] && this.direction < this.crossQuadrantRangeTop[1]) {
      this.nextWallCollision = 'top';
    }
    if (this.direction > this.crossQuadrantRangeRight[0] && this.direction < this.crossQuadrantRangeRight[1]) {
      this.nextWallCollision = 'right';
    }
    if (this.direction > this.crossQuadrantRangeBottom[0] && this.direction < this.crossQuadrantRangeBottom[1]) {
      this.nextWallCollision = 'bottom';
    }
    if (this.direction > this.crossQuadrantRangeLeft[0] && this.direction < this.crossQuadrantRangeLeft[1]) {
      this.nextWallCollision = 'left';
    }
  }

  /* Travel along path based on direction and velocity */
  startTransition() {
    /* 
      Steps:
        1. Figure out which wall will be hit
        2. Check the distance between ball edge and wall, factoring in direction
          - Literal edge case: if ball is heading for a corner at a 45deg angle
        3. Determine how long it will take to reach wall using distance and speed
        4. Set CSS transition based on gathered parameters
          - Set transition-origin to the wall edge direction
    */

    this.updateAllProps();
    this.element.style.transitionOrigin = nextWallCollision;

    /* Determine distance to wall, travel time, and landing coordinates */
    switch (nextWallCollision) {
      case 'top':
        
        break;
      case 'right':

        break;
      case 'bottom':

        break;
      case 'left':

        break;
      default:
        break;
    }
    
    this.element.style.transitionDuration = distanceToWall / this.speed;
  }

  findTransitionEnd(angle, wall) {
    
  }

  leaveDOM(event) {
    event.stopPropagation();
    this.boundAreaEl.removeChild(this.element);
  }
}

/* Set click listener bounding area to spawn in bouncy */
const boundAreaEl = document.querySelector('#ball-bounding-area');
boundAreaEl.addEventListener('click', addBall);

function addBall() {
  const ball = new Ball(0, 0, 150, 10);
  ball.enterDOM(boundAreaEl);
}
