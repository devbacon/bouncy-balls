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
    this.offsetTop = startY;
    this.offsetRight = null;
    this.offsetBottom = null;
    this.offsetLeft = startX;
    /* this.spaceTop = null;
    this.spaceRight = null;
    this.spaceBottom = null;
    this.spaceLeft = null; */

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
  }

  updateAllProps() {
    this.updateBoundProps();
    this.updateBallProps();
  }

  updateBoundProps() {
    this.boundAreaStyles = window.getComputedStyle(this.boundAreaEl);
    this.boundAreaHeight = this.boundAreaStyles.getPropertyValue('height');
    this.boundAreaWidth = this.boundAreaStyles.getPropertyValue('width');
  }

  updateBallProps() {
    this.styles = window.getComputedStyle(this.element);
    this.circumference = this.styles.getPropertyValue('width');
    this.radius = this.circumference / 2;
    /* this.spaceTop = this.offsetTop - this.radius;
    this.spaceRight = this.boundAreaWidth - this.offsetLeft - this.radius;
    this.spaceBottom = this.boundAreaHeight - this.offsetTop - this.radius;
    this.spaceLeft = this.offsetLeft - this.radius; */
    this.offsetTop = this.element.offsetTop;
    this.offsetRight = this.boundAreaWidth - this.offsetLeft;
    this.offsetBottom = this.boundAreaHeight - this.offsetTop;
    this.offsetLeft = this.element.offsetLeft;
    this.updateCrossQuadrentRanges();
    this.nextWallCollision = this.findNextWallCollision();
  }

  /* 
    Cross quadrants are angle ranges used to check which wall the ball will land on
    Imagine lines expanding from the ball to the boundary corners
    Range values are converted to a 360 deg angle system to match with this.direction
  */
  updateCrossQuadrentRanges(wall) {
    this.crossQuadrantRangeTop = [
      360 - MathUtils.calcDoubleTangentAngle(this.offsetLeft, this.offsetTop),
      MathUtils.calcDoubleTangentAngle(this.offsetRight, this.offsetTop)
    ];
    this.crossQuadrantRangeRight = [
      90 - MathUtils.calcDoubleTangentAngle(this.offsetTop, this.offsetRight),
      90 + MathUtils.calcDoubleTangentAngle(this.offsetBottom, this.offsetRight)
    ];
    this.crossQuadrantRangeBottom = [
      180 - MathUtils.calcDoubleTangentAngle(this.offsetLeft, this.offsetBottom),
      180 + MathUtils.calcDoubleTangentAngle(this.offsetRight, this.offsetBottom)
    ];
    this.crossQuadrantRangeLeft = [
      270 - MathUtils.calcDoubleTangentAngle(this.offsetTop, this.offsetLeft),
      270 + MathUtils.calcDoubleTangentAngle(this.offsetBottom, this.offsetLeft)
    ];
  }

  /* Determine next wall collision */
  findNextWallCollision() {
    
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
