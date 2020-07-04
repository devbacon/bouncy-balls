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
