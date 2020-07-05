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

const boxAngles = {
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
    
    /* Dynamic properties */
    this.boundAreaEl = null;
    this.boundAreaStyles = null;
    this.boundAreaHeight = null;
    this.boundAreaWidth = null;
    this.element = element;
    this.styles = null;
    this.circumference = null;
    this.radius = null;
    this.direction = direction;
    this.speed = speed;
    /* Coordinate plane starts at top left of bound area */
    this.x = startX;
    this.y = startY;
    this.spaceTop = null;
    this.spaceRight = null;
    this.spaceBottom = null;
    this.spaceLeft = null;
    this.nextWallCollision = null;
  }

  enterDOM(container) {
    this.boundAreaEl = container;
    container.appendChild(this.element);
    this.updatePropData();
  }

  updatePropData() {
    this.boundAreaStyles = window.getComputedStyle(this.boundAreaEl);
    this.boundAreaHeight = this.boundAreaStyles.getPropertyValue('height');
    this.boundAreaWidth = this.boundAreaStyles.getPropertyValue('width');
    this.styles = window.getComputedStyle(this.element);
    this.circumference = this.styles.getPropertyValue('width');
    this.radius = this.circumference / 2;
    this.x = this.element.offsetLeft;
    this.y = this.element.offsetTop;
    this.spaceTop = this.y - this.radius;
    this.spaceRight = this.boundAreaWidth - this.x - this.radius;
    this.spaceBottom = this.boundAreaHeight - this.y - this.radius;
    this.spaceLeft = this.x - this.radius;
    this.nextWallCollision = this.findNextWallCollision();
  }

  findNextWallCollision() {
    if (boxAngles.topLeft < this.direction < boxAngles.topRight) {
      return 'top';
    }
    if (boxAngles.topRight < this.direction < boxAngles.bottomRight) {
      return 'right';
    }
    if (boxAngles.bottomRight < this.direction < boxAngles.bottomLeft) {
      return 'bottom';
    }
    if (boxAngles.bottomLeft < this.direction < boxAngles.topLeft) {
      return 'left';
    }
    return 'error';
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

    this.updatePropData();
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

  findHypotenuseBySides(length1, length2) {
    return Math.sqrt(Math.pow(length1, 2) + Math.pow(length2, 2));
  }

  findTransitionEndPosition(angle, wall) {
    
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
