Conway's Game of Life
=====================

The Game of Life, also known simply as Life, is a cellular automaton devised by the British mathematician John Horton Conway in 1970.
The "game" is a zero-player game, meaning that its evolution is determined by its initial state, requiring no further input. One interacts with the Game of Life by creating an initial configuration and observing how it evolves.


Rules
-----

The universe of the Game of Life is finite two-dimensional orthogonal grid of square cells, each of which is in one of two possible states, alive or dead. Every cell interacts with its eight neighbors, which are the cells that are horizontally, vertically, or diagonally adjacent. At each step in time, the following transitions occur:

Any live cell with fewer than two live neighbors dies, as if caused by under-population.

Any live cell with two or three live neighbors lives on to the next generation.

Any live cell with more than three live neighbors dies, as if by overcrowding.

Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.

The initial pattern constitutes the seed of the system. The first generation is created by applying the above rules simultaneously to every cell in the seed — births and deaths occur simultaneously, and the discrete moment at which this happens is sometimes called a tick (in other words, each generation is a pure function of the preceding one). The rules continue to be applied repeatedly to create further generations.

The code
--------

This is a Javascript implementation of Conway's Game of Life.

In order to run the game open the 'index.html'. There will be a 5x5 world rendered. Dead cells are in white; alive cells are in black. To change the state of one cell you should click the cell.

When you click 'Step' it will run one tick one the world applying the rules of the game to the world. If you click 'Start' it will run ticks automatically.The simulation self sustains till all the cells die or you click 'Stop' button.

Supported Browsers
------------------
- IE >= 6 (Yes IE6 also)
- Chrome
- Mozilla
- Safari

> *Best viewed in chrome browser (Thanks to V8)*

Known Issues
------------
- Left panel configuration options show extra 1px border on top and bottom in IE6
- Higher grid size causes performance issue in IE browser

How to build
------------
- Open command prompt in project folder
- Run `npm install -d`
- Once done, run `grunt`

> *Requires node and grunt cli pre installed in system to build source. Refer `package.json` for required modules* 