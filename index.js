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

class Ball {
  constructor() {
    // Compute all randomized variables upon creation
    const colorPairIndex = Math.floor(Math.random() * complementaryColors.length);
    const colorPair = complementaryColors[colorPairIndex];
    const primaryColor = colorPair[0];
    const secondaryColor = colorPair[1];
    const element = document.createElement('div');
    element.style.background = `linear-gradient(35deg, ${primaryColor}, ${secondaryColor})`;
    
    this.primaryColor = primaryColor;
    this.secondaryColor = secondaryColor;
    this.element = element;
  }
}