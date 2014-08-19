/**
 * This file containes methods to support Game of Life Jquery Plugin
 * @author Naveen I
 * @param {window} $win
 * @param {jQuery} $
 * @returns {undefined}
 */
/*jshint -W030*/
! function($win, $) {
    "use strict";
    /**
     * Method to detect support to canvas
     */
    ! function() {
        $win.canvasSupported = !! $win.HTMLCanvasElement;
        $win.canvas2DSupported = !! $win.CanvasRenderingContext2D;
        if (!$win.canvasSupported) {
            var _cnv = document.createElement("canvas");
            $win.canvasSupported = !! (_cnv.getContext && _cnv.getContext('2d'));
            $win.canvas2DSupported = $win.canvasSupported;
        }
    }();
    /**
     * This class creates warpper method to perform action on native HTML5 Canvas
     * HTML5 canvas object will be created when an instance is created.
     */
    function NativeCanvas() {
        this.ele = $('<canvas>').css('background', '#fff');
        this.grahic = this.ele[0].getContext('2d');
    }
    /*Append the CANVAS element to container*/
    NativeCanvas.prototype.appendTo = function(cntr) {
        this.ele.appendTo(cntr);
    };
    /*This method is usefull to accomidate more cell.*/
    NativeCanvas.prototype.setSize = function(width, height) {
        this.width = width;
        this.height = height;
        this.ele.attr({
            'width': width,
            'height': height
        });
    };

    /*Draws vertical and horizontal lines using lineTo method of canvas object.*/
    NativeCanvas.prototype.drawGuids = function(xGuids, yGuids, xGap, yGap, color) {
        this.grahic.lineWidth = 1;
        this.grahic.strokeStyle = color || "#000000";
        this.grahic.beginPath();
        for (var i = 0; i <= xGuids; i++) {
            this.grahic.moveTo(i * xGap, 0);
            this.grahic.lineTo(i * xGap, this.height);
        }
        for (var j = 0; j <= yGuids; j++) {
            this.grahic.moveTo(0, j * yGap);
            this.grahic.lineTo(this.width, j * yGap);
        }
        this.grahic.stroke();
    };
    /*Creates a cell at specified location. filled with balck when cell is alive*/
    NativeCanvas.prototype.drawRect = function(x, y, width, height, fill, color, stroke) {
        if (fill) {
            if (color) {
                this.grahic.fillStyle = color;
            }
            this.grahic.fillRect(x, y, width, height);
        } else {
            this.grahic.clearRect(x, y, width, height);
        }
        if (stroke) {
            this.grahic.stroke();
        }
    };

    /*wipes all cells and guides to recreate the new set of cells for current settings*/
    NativeCanvas.prototype.clear = function() {
        this.drawRect(0, 0, this.ele.width(), this.ele.height());
    };
    /*This class acts as polyfill for native canvas. creates a div and uses as canvas*/
    function PolyCanvas() {
        this.ele = $('<div class="polyCanvas">');
    }
    PolyCanvas.prototype.appendTo = function(cntr) {
        this.ele.appendTo(cntr);
    };
    PolyCanvas.prototype.setSize = function(width, height) {
        this.width = width;
        this.height = height;
        this.ele.css({
            'width': width,
            'height': height
        });
    };
    /*This method creates divs with absolute postion, top, left will be calculated based on x,y values
     *to show as guides
     **/
    PolyCanvas.prototype.drawGuids = function(xGuids, yGuids, xGap, yGap, color) {
        color = color || "#000000";
        for (var i = 0; i <= xGuids; i++) {
            $('<div class="guide"></div>').css({
                height: this.height,
                left: i * xGap,
                'background-color': color
            }).appendTo(this.ele);
        }
        for (var j = 0; j <= yGuids; j++) {
            $('<div class="guide"></div>').css({
                width: this.width,
                top: j * yGap,
                'background-color': color
            }).appendTo(this.ele);
        }
    };
    /**
     * This method creates small divs with width and height to look like cell.
     * Position absolute is used to locate at specified x,y location
     * For subsequent state change same div will be used and class will be changed to show
     * alive or dead states
     */
    PolyCanvas.prototype.drawRect = function(x, y, width, height, fill, color, stroke) {
        var _id = "#cell_" + [x, y, width, height].join('_'),
            _cell = this.ele.find(_id);
        if (!_cell.length) {
            _cell = $('<div class="cell" id="' + _id + '">').css({
                left: x,
                top: y,
                width: width,
                height: height
            }).appendTo(this.ele);
        }
        _cell[fill ? 'addClass' : 'removeClass']('alive');
    };
    /**
     * Delete all guides and cells crreated
     */
    PolyCanvas.prototype.clear = function() {
        this.ele.empty();
    };
    /*Factory method created encapsulate the creation of canvas object for drawing*/
    var CanvasProvider = {
        getCanvas: function() {
            return $win.canvasSupported ? new NativeCanvas() : new PolyCanvas();
        }
    };
    /*This class encapsulate the drawing operations on canvas object by providing
     * method names reflecting configuration / state modifications*/
    var Stage = function(cntr, conf) {
        this.cntr = cntr;
        this.conf = conf;
        this.init();
    }, _sProto = Stage.prototype;

    _sProto.getCanvasEle = function() {
        return this.canvas.ele;
    };

    _sProto.drawCellAt = function(x, y, fill) {
        this.canvas.drawRect(x * this.conf.cellW, y * this.conf.cellH, this.conf.cellW, this.conf.cellH, fill, false, this.conf.enableGuides);
    };

    _sProto.drawCells = function(cellsArr) {
        var _rows = cellsArr.length,
            _cols, _y, _x;
        for (_y = 0; _y < _rows; _y += 1) {
            _cols = cellsArr[_y].length;
            for (_x = 0; _x < _cols; _x += 1) {
                this.drawCellAt(_x, _y, cellsArr[_y][_x]);
            }
        }
    };

    _sProto.toggleGuids = function(enable) {
        var color = enable ? '#000000' : '#ffffff';
        this.canvas.drawGuids(this.conf.nXCells, this.conf.nYCells, this.conf.cellW, this.conf.cellH, color);
        this.canvas.ele.css('border', enable ? 'none' : '1px solid #000000');
    };
    /*This method tries to align the stage to horizontally and vertically center in
     * container for better representation*/
    _sProto.rePosition = function() {
        var _pH = this.ele.parent().height(),
            _eH = this.ele.height(),
            _top;
        if (_eH < _pH) {
            _top = Math.round((_pH - _eH - 80) / 2);
            this.ele.css({
                'position': 'relative',
                'top': _top + 'px'
            });
        }
    };
    /*This method helps the user to change the grid size dynamically*/
    _sProto.resize = function() {
        this.conf.width = this.conf.nXCells * this.conf.cellW;
        this.conf.height = this.conf.nYCells * this.conf.cellH;
        this.canvas.setSize(this.conf.width, this.conf.height);
        this.rePosition();
    };

    /*This method takes new configurations and repaints the stage with new set of cells*/
    _sProto.repaint = function(cells, cnfg) {
        this.conf = cnfg;
        this.canvas.clear();
        this.resize();
        this.toggleGuids(this.conf.enableGuides);
        this.drawCells(cells);
    };
    /*Main method where all new container is creatde and canvas object is appended to it*/
    _sProto.init = function() {
        this.ele = $('<div class="golStage"></div>').appendTo(this.cntr);
        this.canvas = CanvasProvider.getCanvas();
        this.canvas.appendTo(this.ele);
        this.resize();
    };
    /**
     * Constructor of plugin.
     */
    var GameOfLife = function(ele, opts) {
        this.ele = ele;
        this.cnfg = opts;
        this.cellsArr = [];
        this._init();
    }, _golProto = GameOfLife.prototype;

    /*Default configuration*/
    GameOfLife.DEFAULTS = {
        nXCells: 5, // Number of cells in x direction
        nYCells: 5, // Number of cell sin y direction
        cellW: 15, // Each cell's width
        cellH: 15, // Each cell's height
        guideWidth: 1, // Guide line width (Not in use yet)
        enableGuides: true, // Toggles the visibility of guide lines on canvas
        speed: 6 // Time delay between two stage of game. Min 1 (~=100ms), Max 10 (~=1s)
    };

    /*Function to realize the next generation of cells, based on the rules of the Game of Life
     *  For Each cell
     *      - Get all it's 8 neighbours 3 cells Top Row, 3 cells In Bottom Row, 2 adj cells
     *      - alive state cell
     *          - With less than 2 alive neighbours goes to dead state :underpopulation
     *          - With more than 3 alive neighbours goes to dead state :overpopulation
     *          - With only 2 alive or 3 alive neightbours remains in alive state
     *
     *      - dead state cell
     *          - With 3 alive neighbours goes to alive state
     *
     *  @return Object generationinfo
     *                      - alive  // Number of cell alive in current generation
     *                      - dead  // Number of cells dead
     *                      - cells // Cells in current genration alive, dead
     **/
    _golProto._nextGeneration = function() {
        var _currGen = this.cellsArr,
            _nextGen = [],
            _yCells = _currGen.length,
            _xCells, _y, _x, _genStats, tr, br, lc, rc, _8Sides;

        for (_y = 0; _y < _yCells; _y += 1) {
            _xCells = _currGen[_y].length;
            _nextGen[_y] = [];
            for (_x = 0; _x < _xCells; _x += 1) {
                // Calculate above/below/left/right row/column values
                tr = (_y - 1 >= 0) ? _y - 1 : _yCells - 1; // Pick last row if current row is 1st row
                br = (_y + 1 <= _yCells - 1) ? _y + 1 : 0; // Pick first row if current row is last row
                lc = (_x - 1 >= 0) ? _x - 1 : _xCells - 1; // Pick cell in the last column if current cell is on first column
                rc = (_x + 1 <= _xCells - 1) ? _x + 1 : 0; // Pick cell in the first column if current cell is on last column

                _8Sides = {
                    top_left: _currGen[tr][lc],
                    top_center: _currGen[tr][_x],
                    top_right: _currGen[tr][rc],
                    left: _currGen[_y][lc],
                    right: _currGen[_y][rc],
                    bottom_left: _currGen[br][lc],
                    bottom_center: _currGen[br][_x],
                    bottom_right: _currGen[br][rc]
                };

                var alive_count = 0;
                var dead_count = 0;
                for (var side in _8Sides) {
                    if (_8Sides[side]) {
                        alive_count++;
                    } else {
                        dead_count++;
                    }
                }

                var _currState = _currGen[_y][_x],
                    _newState = false;
                if (_currState) {
                    if (alive_count < 2 || alive_count > 3) {
                        // new state: dead, overpopulation/ underpopulation
                        _newState = false;
                    } else if (alive_count === 2 || alive_count === 3) {
                        // lives on to next generation
                        _newState = true;
                    }
                } else {
                    if (alive_count === 3) {
                        // new state: live
                        _newState = true;
                    }
                }
                _nextGen[_y][_x] = _newState;
            }
        }
        _genStats = {
            dead: 0,
            alive: 0
        };
        for (_y = 0; _y < _yCells; _y += 1) {
            for (_x = 0; _x < _xCells; _x += 1) {
                if (_nextGen[_y][_x]) {
                    _genStats.alive += 1;
                } else {
                    _genStats.dead += 1;
                }
            }
        }
        _genStats.cells = _nextGen;
        return _genStats;
    };

    /**
     * This function calculates one step to next genration buy calling _nextGeneration
     * function. Also, increments the generation number by 1 for current cells.
     *  Triggers:
     *      - stepped.gol:  when step action is cempleted. calls the handler with two
     *                      arguments
     *                          - generation info revceived from _nextGeneration
     *                               - alive  // Number of cell alive in current generation
     *                               - dead  // Number of cells dead
     *                               - cells // Cells in current genration alive, dead
     *                               - genNo // Current generation number
     *
     *                          - instance of GameOfLife class
     *
     *     - alldead.gol:   when all cells in current generation are in dead state.
     *                      calls the handler with two arguments, same as stepped.gol
     */
    _golProto.step = function() {
        if (isNaN(this.genrationCount)) {
            this.genrationCount = 0;
        }
        this.genrationCount += 1;
        var genInfo = this._nextGeneration();
        genInfo.genNo = this.genrationCount;
        this.cellsArr = genInfo.cells;
        this.stage.repaint(this.cellsArr, this.cnfg);
        this.ele.trigger('steped.gol', [genInfo, this]);
        if (!genInfo.alive) {
            this.ele.trigger('alldead.gol', [genInfo, this]);
            this.stop();
        }
    };
    /**
     * Stopes the execution of step function in loop.
     * Triggers:
     *      - stopped.gol - calls handler with one argument. current instance
     *
     */
    _golProto.stop = function() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.genrationCount = 0;
        this.ele.trigger('stopped.gol', this);
    };

    /**
     * Starts executing the step function in loop with the period based on speed
     * configuration applied.
     * Triggers:
     *      - started.gol
     */
    _golProto.start = function() {
        this.genrationCount = 0;
        var _scope = this;
        this.ele.trigger('started.gol', this);
        this.interval = setInterval(function() {
            _scope.step();
        }, this.cnfg.speed * 100);
    };

    /**
     * This function prepares the seed for initial generation to start Game Of Life.
     * @param {2D-Array} initState a 2D array containing the state of each cell in the grid
     *                             (optional)
     *
     */
    _golProto._initCellsState = function(initState) {
        var _csArr = [],
            _y, _x;
        for (_y = 0; _y < this.cnfg.nYCells; _y += 1) {
            _csArr[_y] = [];
            for (_x = 0; _x < this.cnfg.nXCells; _x += 1) {
                _csArr[_y][_x] = (initState && initState[_y] && initState[_y][_x]) || false;
            }
        }
        this.cellsArr = _csArr;
    };
    /**
     * This method helps to load predefined persets representing the canvas size and
     * Game of Life patterns
     */
    _golProto.applyPreset = function(opts) {
        if (typeof opts === 'object' && opts) {
            var _initState = false;
            if (opts.pattern) {
                _initState = opts.pattern;
                delete opts.pattern;
            }
            this.cnfg = $.extend(this.cnfg, opts);
            this._initCellsState(_initState);
            this.stage.repaint(this.cellsArr, this.cnfg);
        }
    };

    /**
     * This method bind Mouse down, Mouse Up and Mouse drag events on Canvas object
     * to help user to define the custom patter / to provide seed to start Game Of Life.
     * User can click on cells to toggle its state between alive / dead
     */
    _golProto._bindeEvents = function() {
        var _scope = this,
            _mouseDown, _state, _canVasEle = _scope.stage.getCanvasEle();

        function getXYPos(e) {
            var _offset = _canVasEle.offset(),
                _ret = {};
            _ret.x = Math.floor((e.pageX - _offset.left) / _scope.cnfg.cellW);
            _ret.y = Math.floor(((e.pageY - _offset.top) / _scope.cnfg.cellH));
            return _ret;
        }

        function onMouseMove(e) {
            if (_mouseDown) {
                var _xy = getXYPos(e);
                _scope.cellsArr[_xy.y][_xy.x] = _state;
                _scope.stage.drawCellAt(_xy.x, _xy.y, _state);
            }
        }

        _canVasEle.on('mousedown.gol', function(e) {
            var _xy = getXYPos(e),
                _pState;
            _mouseDown = true;
            _pState = _scope.cellsArr[_xy.y] && _scope.cellsArr[_xy.y][_xy.x];
            _state = !_pState;
            _scope.cellsArr[_xy.y][_xy.x] = _state;
            _scope.stage.drawCellAt(_xy.x, _xy.y, _state);

        });
        _canVasEle.on('mousemove.gol', onMouseMove);
        $('body').on('mouseup.gol', function() {
            //_canVasEle.off('mousemove.gol');
            _mouseDown = false;
        });
    };

    /*Main methos where all cells of grid are set to dead state and new stage object
     *is created
     */
    _golProto._init = function() {
        this._initCellsState();
        this.stage = new Stage(this.ele, this.cnfg);
        this.stage.toggleGuids(this.cnfg.enableGuides);
        this.stage.drawCells(this.cellsArr);
        this._bindeEvents();
    };
    var old = $.fn.gol;

    /*Function added to JQuery object to make it avail to be used on any Jquery wrapped DOM Element*/
    $.fn.gol = function(options) {
        var returnValue, _eles, _args = Array.prototype.slice.call(arguments, 1);
        _eles = this.each(function() {
            var $this = $(this),
                data = $this.data('atv.gol'),
                _opts = $.extend({}, GameOfLife.DEFAULTS, typeof options === 'object' && options),
                action = typeof options === 'string' && options;
            if (!data) {
                $this.data('atv.gol', (data = new GameOfLife($this, _opts)));
            }
            if (action && action.indexOf('_') !== 0 && typeof data[action] === 'function') {

                returnValue = data[action].apply(data, _args);
            }
        });
        return returnValue === undefined ? _eles : returnValue;
    };

    $.fn.gol.Constructor = GameOfLife;

    // NO CONFLICT
    // ====================

    $.fn.gol.noConflict = function() {
        $.fn.gol = old;
        return this;
    };
}(window, window.jQuery);
/*jshint +W030*/
/**
 * Detect IE
 * @param {Window} win
 * @param {Navigator} navigator
 */
/*jshint -W030 */
! function(win, navigator) {
    "use strict";
    var myNav = navigator.userAgent.toLowerCase();
    win.isIE = (myNav.indexOf('msie') !== -1) ? parseInt(myNav.split('msie')[1]) : false;
}(window, navigator);
/**
 * Fixing Height problem in IE < 8
 * @param {Window} win
 * @param {JQuery} $
 */
! function(win, $) {
    "use strict";
    var _mainDiv, _body, _navBarHeight = 50;

    function resize() {
        _mainDiv = _mainDiv || $('#main');
        _body = _body || $('body');
        _mainDiv.height(_body.height() - _navBarHeight);
    }
    if (win.isIE < 8) {
        $('html').addClass('ielt8');
    } else if (win.isIE < 9) {
        $('html').addClass('ielt9');
    }

    if (win.isIE && win.isIE < 8) {
        resize();
        $(win).resize(resize);
    }
}(window, window.jQuery);
/*jshint +W030 */
/**
 * This function contains various Game Of Life patterns
 * @param {type} $win
 * @param {type} $
 */
/*jshint -W030*/
! function($win, $) {
    var _patterns = {};

    var _stillLifes = _patterns["Still lifes"] = {};

    _stillLifes.Block = {
        nXCells: 10,
        nYCells: 10,
        cellW: 15,
        cellH: 15,
        enableGuides: true,
        speed: 6,
        pattern: [
            [false, false, false, false, false, false, false, false, false, false],
            [false, true, true, false, false, false, false, true, true, false],
            [false, true, true, false, false, false, false, true, true, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, true, true, false, false, false, false, false, false, false],
            [false, true, true, false, false, false, true, true, false, false],
            [false, false, false, false, false, false, true, true, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false]
        ]
    };

    _stillLifes.Beehive = {
        nXCells: 10,
        nYCells: 10,
        cellW: 15,
        cellH: 15,
        enableGuides: true,
        speed: 6,
        pattern: [
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, true, true, false, false, false, false],
            [false, false, false, true, false, false, true, false, false, false],
            [false, false, false, false, true, true, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, true, true, false, false, false, false, false, false],
            [false, true, false, false, true, false, false, false, false, false],
            [false, false, true, true, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false]
        ]
    };

    _stillLifes.Loaf = {
        nXCells: 10,
        nYCells: 10,
        cellW: 15,
        cellH: 15,
        enableGuides: true,
        speed: 6,
        pattern: [
            [false, false, false, false, false, false, false, false, false, false],
            [false, true, true, false, false, false, false, false, false, false],
            [true, false, false, true, false, false, false, false, false, false],
            [false, true, false, true, false, false, false, false, false, false],
            [false, false, true, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, true, true, false, false],
            [false, false, false, false, false, true, false, false, true, false],
            [false, false, false, false, false, false, true, false, true, false],
            [false, false, false, false, false, false, false, true, false, false]
        ]
    };


    var _oscillators = _patterns.Oscillators = {};

    _oscillators.Toad = {
        nXCells: 10,
        nYCells: 10,
        cellW: 15,
        cellH: 15,
        enableGuides: false,
        speed: 6,
        pattern: [
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, true, true, true, false, false, false],
            [false, false, false, true, true, true, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false]
        ]
    };

    _oscillators.Beacon = {
        nXCells: 10,
        nYCells: 10,
        cellW: 15,
        cellH: 15,
        enableGuides: true,
        speed: 6,
        pattern: [
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, true, true, false, false, false, false, false, false],
            [false, false, true, true, false, false, false, false, false, false],
            [false, false, false, false, true, true, false, false, false, false],
            [false, false, false, false, true, true, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false]
        ]
    };


    var _spaceShips = _patterns.Spaceships = {};


    _spaceShips.Glider = {
        nXCells: 10,
        nYCells: 10,
        cellW: 15,
        cellH: 15,
        enableGuides: true,
        speed: 6,
        pattern: [
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, true, false, false, false, false, false, false, false],
            [false, false, false, true, false, false, false, false, false, false],
            [false, true, true, true, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, true, false, false, false],
            [false, false, false, false, false, false, false, true, false, false],
            [false, false, false, false, false, true, true, true, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false]
        ]
    };

    _spaceShips['Lightweight spaceship'] = {
        nXCells: 10,
        nYCells: 10,
        cellW: 15,
        cellH: 15,
        enableGuides: true,
        speed: 6,
        pattern: [
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, true, false, false, true, false, false, false],
            [false, false, false, false, false, false, false, true, false, false],
            [false, false, false, true, false, false, false, true, false, false],
            [false, false, false, false, true, true, true, true, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false]
        ]
    };

    $win.golPatterns = {
        //Clone and return the configuration and pattern matching the name and category.
        //Clone require to avoid any changes made to pattern by user.
        getByName: function(cat, name) {
            var _ret = _patterns[cat] && _patterns[cat][name];
            if (_ret) { //Clone
                _ret = $.extend({}, _ret);
            }
            return _ret;
        },
        //Returns all the registered patterns by category
        //  {
        //      'Still Lifes' : ['Block' ........]
        //      ...
        //      ..
        //      .
        //  }
        getNames: function() {
            var _cats = Object.keys(_patterns),
                _ret = {};
            _cats.forEach(function(catName) {
                _ret[catName] = Object.keys(_patterns[catName]);
            });
            return _ret;
        }
    };

}(window, window.jQuery);
/*jshint +W030*/
/**
 * This file contains
 * - all the methods required to query and change the state of the dom elements.
 * - Usage of Game Of Life Plugin
 * - Configurations Parsing from dom
 * - Loading presets and apply to stage
 * - Utils to convert date object
 */
/*jshint -W030*/
! function($win, $) {
    "use strict";

    /**Utils*/
    ! function() {
        var second = 1000,
            minute = second * 60,
            hour = minute * 60,
            day = hour * 24,
            week = day * 7,
            month = week * 30,
            year = month * 365;
        /**
         * Returns object contains y, M, d, h, m, s from milli secs
         * @param {Number} msecs milli secs
         * @param {boolean} includeSecs return object to include secs or not
         * @param {boolean} includeZeros return object to include zero values
         * @returns {Object}
         */
        Object.toTimeParts = function(msecs, includeSecs, includeZeros) {
            var res = {}, _mSign = 1,
                _diff = msecs;
            if (_diff < 0) {
                _mSign = -1;
                _diff = _diff * _mSign;
            }
            res.y = Math.floor(_diff / year) * _mSign;
            _diff = _diff % year;
            res.M = Math.floor(_diff / month) * _mSign;
            _diff = _diff % month;
            res.d = Math.floor(_diff / day) * _mSign;
            _diff = _diff % day;
            res.h = Math.floor(_diff / hour) * _mSign;
            _diff = _diff % hour;
            res.m = Math.floor(_diff / minute) * _mSign;
            if (includeSecs) {
                res.s = Math.floor((_diff % minute) / second) * _mSign;
            }
            if (!includeZeros) {
                Object.keys(res).forEach(function(key) {
                    if (res[key] === 0) {
                        delete res[key];
                    }
                });
            }
            return res;
        };
    }();
    /**/



    var Page = {}; //Page Object 

    /**
     * Thsi function validates the configuration modification. Reset invalid configuratiions.
     * Return value of this function will be feeded GameOfLife plugin
     * @returns 
     *      nXCells - Number of cells in x direction
            nYCells - Number of cell sin y direction
            cellW   - Each cell's width
            cellH   - Each cell's height
            enableGuides    - Toggles the visibility of guide lines on canvas
            speed   - Time delay between two stage of game. Min 1 (~=100ms), Max 10 (~=1s)
     */
    function getValidConf() {
        var cnfg = {};
        $.each(Page.ele.configFrm.serializeArray(), function(ind, obj) {
            cnfg[obj.name] = obj.value;
        });

        if (isNaN(cnfg.cells)) {
            cnfg.cells = 5;
        } else {
            cnfg.cells = parseInt(cnfg.cells, 10);
            cnfg.cells = cnfg.cells < 0 ? 0 : cnfg.cells > 50 ? 50 : cnfg.cells;
        }
        Page.ele.cells.val(cnfg.cells);

        if (isNaN(cnfg.cellW)) {
            cnfg.cellW = 15;
        } else {
            cnfg.cellW = parseInt(cnfg.cellW, 10);
            cnfg.cellW = cnfg.cellW < 1 ? 1 : cnfg.cellW > 50 ? 50 : cnfg.cellW;
        }
        Page.ele.cellW.val(cnfg.cellW);

        if (isNaN(cnfg.cellH)) {
            cnfg.cellH = 15;
        } else {
            cnfg.cellH = parseInt(cnfg.cellH, 10);
            cnfg.cellH = cnfg.cellH < 1 ? 1 : cnfg.cellH > 50 ? 50 : cnfg.cellH;
        }
        Page.ele.cellH.val(cnfg.cellH);

        if (isNaN(cnfg.speed)) {
            cnfg.speed = 6;
        } else {
            cnfg.speed = parseInt(cnfg.speed, 10);
            cnfg.speed = cnfg.speed < 1 ? 1 : cnfg.speed > 10 ? 10 : cnfg.speed;
        }
        Page.ele.speed.val(cnfg.speed);

        return {
            nXCells: cnfg.cells,
            nYCells: cnfg.cells,
            cellW: cnfg.cellW,
            cellH: cnfg.cellH,
            enableGuides: !! cnfg.showGuides,
            speed: cnfg.speed
        };
    }

    /**
     * This method invokes plugin functions to stop current execution and 
     * apply new configurations.
     * @param {Object} state 
     *      nXCells - Number of cells in x direction
            nYCells - Number of cell sin y direction
            cellW   - Each cell's width
            cellH   - Each cell's height
            enableGuides    - Toggles the visibility of guide lines on canvas
            speed   - Time delay between two stage of game. Min 1 (~=100ms), Max 10 (~=1s)
            pattern - (optional) initial state of cells 2D array
     **/
    Page.setGameState = function(state) {
        Page.ele.canvasCntr.gol('stop');
        Page.ele.canvasCntr.gol('applyPreset', state);
        Page.ele.genNum.html(0);
        Page.ele.alive.html(0);
        Page.ele.dead.html(0);
        Page.ele.timeElapsed.html(0);
    };

    /*
     * Applies preset values into Configuration panel DOM fields
     * and call setGameState function to apply preset loaded to game
     */
    Page.applyPreset = function(preset) {
        Page.ele.cells.val(preset.nXCells);
        Page.ele.cellW.val(preset.cellW);
        Page.ele.cellH.val(preset.cellH);
        Page.ele.speed.val(preset.speed);
        Page.ele.showGuides.prop('checked', preset.enableGuides);
        Page.setGameState(preset);
    };

    /**
     * This function binds events to listeners
     *  - all Game Config / State controling DOM elemnts
     *  - canvas container for game state related events
     *
     */
    Page.bindEvents = function() {
        Page.ele.btnStep.click(function() {
            Page.ele.canvasCntr.gol('step');
        });
        Page.ele.btnStart.click(function() {
            Page.ele.canvasCntr.gol('start');
        });
        Page.ele.btnStop.click(function() {
            Page.ele.canvasCntr.gol('stop');
        });
        Page.ele.btnApply.click(function() {
            var _props = getValidConf(),
                _val;
            _val = Page.ele.golPresets.val();
            if (_val) {
                _val = _val.split(',');
                _val = $win.golPatterns.getByName.apply(null, _val);
            }
            _props.pattern = _val && _val.pattern;
            Page.setGameState(_props);
        });

        Page.ele.canvasCntr.on('steped.gol', function(ev, genInfo, inst) {
            var _timeElapsed = genInfo.genNo * inst.cnfg.speed * 100,
                _ts = '';
            _timeElapsed = Object.toTimeParts(_timeElapsed, true);

            $.each(_timeElapsed, function(name, val) {
                _ts += ' ' + val + name;
            });
            _timeElapsed = _ts.split(' ');
            _ts = _timeElapsed.pop();
            if (_timeElapsed.length) {
                _ts = _timeElapsed.pop() + ' ' + _ts;
            }
            Page.ele.genNum.html(genInfo.genNo);
            Page.ele.alive.html(genInfo.alive);
            Page.ele.dead.html(genInfo.dead);
            Page.ele.timeElapsed.html(_ts || '0');
        });
        Page.ele.canvasCntr.on('stopped.gol', function() {
            Page.ele.configBtnsWrp.removeClass('started');
        });
        Page.ele.canvasCntr.on('alldead.gol', function() {});
        Page.ele.canvasCntr.on('started.gol', function() {
            Page.ele.configBtnsWrp.addClass('started');
        });
        Page.ele.on('click.accordion', '[data-toggle-class]', function(e) {
            var _this = $(this),
                _data = _this.data(),
                _cls = _data.toggleClass,
                _target = _data.target;
            _this.closest(_target).toggleClass(_cls);
        });
        Page.ele.golPresets.on('change', function() {
            var _val = Page.ele.golPresets.val();
            Page.ele.golPresetsHint[_val ? 'hide' : 'show']();
            if (_val) {
                _val = _val.split(',');
                _val = $win.golPatterns.getByName.apply(null, _val);
            }
            if (!_val) {
                _val = {
                    nXCells: 10,
                    nYCells: 10,
                    cellW: 15,
                    cellH: 15,
                    enableGuides: true,
                    speed: 6
                };
            }
            Page.applyPreset(_val);
        });
    };

    /**
     * This method gets the name of preses defined in patterns.js  and creates
     * a dropdown box to allow user to choose from
     */
    Page.loadPrsesets = function() {
        if ($win.golPatterns && $win.golPatterns.getNames) {
            var _opts = $win.golPatterns.getNames();
            Object.keys(_opts).forEach(function(catName) {
                var _grp = $('<optgroup label="' + catName + '"></optgroup>').appendTo(Page.ele.golPresets);
                _opts[catName].forEach(function(name) {
                    _grp.append('<option value="' + catName + ',' + name + '">' + name + '</option>');
                });
            });
        }
    };

    /**
     * This is the main method. Invoked when DOM is ready.
     *  - Queries dom using ng-query attribute and maintians the refernce of tragetted dom elements
     *  - Initiates Game Of Life plugin on canvas container
     *  - Binds events
     * @param {Jquery-DOM} pageEle - Div with #main
     */
    Page.init = function(pageEle) {
        Page.ele = pageEle;
        Page.ele.find('[ng-query]').each(function() {
            var _thisEle = $(this);
            Page.ele[_thisEle.attr('ng-query')] = _thisEle;
        });
        Page.ele.canvasCntr.gol();
        Page.loadPrsesets();
        Page.bindEvents();
    };


    $(function() {
        Page.init($('#main'));
    });
}(window, window.jQuery);
/*jshint +W030*/
