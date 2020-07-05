/* 
  Development Notes:
    - Consider front loading some of the computation on page load 

  TODOs:
    [] Create first ball drop
      [] Start with simple drop from center and straight down
      [] Generate origin, trajectory, and spin
      [] Create ball with complimentary color gradient
      [] Launch ball with generated variables
*/

const colorHex = {
  red: '#F00',
  cyan: '#0FF',
  green: '#0F0',
  magenta: '#F0F',
  blue: '#00F',
  yellow: 'FF0'
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
  constructor(boundAreaEl, startX, startY, direction, speed) {
    /* Randomize colors */
    const colorPairIndex = Math.floor(Math.random() * complementaryColors.length);
    const colorPair = complementaryColors[colorPairIndex];
    this.primaryColor = colorPair[0];
    this.secondaryColor = colorPair[1];

    /* Generate ball DOM element with selected colors */
    const element = document.createElement('div');
    element.style.background = `linear-gradient(35deg, ${this.primaryColor}, ${this.secondaryColor})`;
    element.classList.add('ball');

    /* Static properties */
    this.boundAreaEl = boundAreaEl;
    this.element = element;
    
    /* Dynamic properties */
    this.boundAreaStyles = window.getComputedStyle(this.boundAreaEl);
    this.boundAreaHeight = this.boundAreaStyles.getPropertyValue('height');
    this.boundAreaWidth = this.boundAreaStyles.getPropertyValue('width');
    this.styles = null;
    this.circumference = null;
    this.radius = null;
    this.direction = direction;
    this.speed = speed;
    this.x = startX;
    this.y = startY;
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
}

/* Set click listener bounding area to spawn in bouncy */
const boundAreaEl = document.querySelector('#ball-bounding-area');
boundAreaEl.addEventListener('click', spawnBall);

function spawnBall() {
  const ball = new Ball(boundAreaEl, 0, 0, 150, 10);
  boundAreaEl.appendChild(ball.element);
}