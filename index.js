// wireworld
var canvas;
var ctx;
var currentChooseCell = 3; // empty
var $ = (id)=> document.getElementById(id);

function initHandler() {
    $('pallet').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.srcElement.dataset.v) {
            currentChooseCell = parseInt(e.srcElement.dataset.v, 10);
            console.log(currentChooseCell);
        }
    });
    $('buttonStart').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        mode = 'running';
        if (timer) { 
            window.cancelAnimationFrame(timer);
        }
        timer = 0;
        timer = window.requestAnimationFrame(loop);

        showInfo();
    });
    $('buttonStop').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        mode = 'idle';
        if (timer) { 
            window.cancelAnimationFrame(timer);
        }
        showInfo();
    });
    $('buttonStep').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        mode = 'step';
        if (timer) { 
            window.cancelAnimationFrame(timer);
        }
        loop();
        showInfo();
    });
    $('buttonReset').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        mode = 'idle';
        if (timer) { 
            window.cancelAnimationFrame(timer);
        }
        init();
        loop();
        showInfo();
    });

    $('myCanvas').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var rect = e.target.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
        if (Math.floor(y / boxSize) < gridRows && Math.floor(x / boxSize) < gridColumns) {
            grid[Math.floor(y / boxSize)][Math.floor(x / boxSize)] = currentChooseCell;

            drawGrid(gridColumns, gridRows);
            showInfo();
        } else {
            console.log("out of canvas.")
        }
    });
    var mousedown;
    $('myCanvas').addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        mousedown = true;
    });
    $('myCanvas').addEventListener('mouseup', function(e) {
        e.preventDefault();
        e.stopPropagation();
        mousedown = false;
    });
    $('myCanvas').addEventListener('mousemove', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (mousedown) {
            console.log(e.button);
            var rect = e.target.getBoundingClientRect();
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
            if (Math.floor(y / boxSize) < gridRows && Math.floor(x / boxSize) < gridColumns) {
                if (e.button === 2) {
                grid[Math.floor(y / boxSize)][Math.floor(x / boxSize)] = 0;
                } else {
                grid[Math.floor(y / boxSize)][Math.floor(x / boxSize)] = currentChooseCell;
                }

                drawGrid(gridColumns, gridRows);
                showInfo();
            }
        }
    });
    // delete (set empty cell)
    $('myCanvas').addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var rect = e.target.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
        if (Math.floor(y / boxSize) < gridRows && Math.floor(x / boxSize) < gridColumns) {
            grid[Math.floor(y / boxSize)][Math.floor(x / boxSize)] = 0; // empty
        }
        drawGrid(gridColumns, gridRows);
        showInfo();
    });
}

function init() {
    canvas = $('myCanvas');
    ctx = canvas.getContext('2d');
    // バッファサイズ
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    // 表示サイズ
    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";

    frame = 0;
    tick = 0;
    mode = 'idle';

    initGrid(gridRows, gridColumns);
}

var frame = 0;
var tick;
var boxSize = 12;
var timer = 0;
var mode;
var flagStep = false;

var grid;
var gridRows = 50;
var gridColumns = 50;
function initGrid(cols, rows) {
    grid = [];
    for (var i = 0; i < rows; i++) {
        grid[i] = new Array(cols).fill(0);
    }
}
function calcGrid(cols, rows) {
    // need tmp grid
    var tmpGrid = [];
    for (var i = 0; i < rows; i++) {
        tmpGrid[i] = new Array(cols).fill(0);
    }

    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
            // Empty->Empty
            if (grid[y][x] == 0) {
                tmpGrid[y][x] = 0;
            }
            // Electron head -> Electron tail
            if (grid[y][x] == 1) {
                tmpGrid[y][x] = 2;
            }
            // Electron tail->Conductor
            if (grid[y][x] == 2) {
                tmpGrid[y][x] = 3;
            }
            // 近傍セルのうち1つまたは2つが電子の頭の場合、電子の頭にする
            if (grid[y][x] == 3) {
                var electronHeadCount = 0;
                if (y-1 >= 0) {
                    if (x-1 >= 0) {
                        if (grid[y-1][x-1] == 1) electronHeadCount++;
                    }
                    
                    if (grid[y-1][x-0] == 1) electronHeadCount++;

                    if (x+1 <= cols) {
                        if (grid[y-1][x+1] == 1) electronHeadCount++;
                    }
                }

                if (x-1 >= 0) {
                    if (grid[y+0][x-1] == 1)  electronHeadCount++;
                }
                
                // tmpGrid[y+0][x+0] = grid[y+0][x+0]; // self

                if (x+1 <= cols) {
                    if (grid[y+0][x+1] == 1) electronHeadCount++;
                }
                

                if (y+1 <= rows) {
                    if (x-1 >= 0) {
                        if (grid[y+1][x-1] == 1) electronHeadCount++;
                    }
                    
                    if (grid[y+1][x-0] == 1) electronHeadCount++;

                    if (x+1 <= cols) {
                        if (grid[y+1][x+1] == 1) electronHeadCount++;
                    }
                }

                if (electronHeadCount == 1 || electronHeadCount == 2) {
                    tmpGrid[y][x] = 1;
                } else {
                    tmpGrid[y][x] = grid[y][x];
                }
            }
        }
    }

    return tmpGrid;
}
function drawGrid(cols, rows) {
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
            switch (grid[y][x]) {
                case 0: // empty
                    ctx.fillStyle ="rgb(0,0,0)";
                break;
                case 1: // Electron head(Blue)
                    ctx.fillStyle ="rgb(0,0,255)";
                break;
                case 2: // Electron tail (Red)
                    ctx.fillStyle ="rgb(255,0,0)";
                break;
                case 3: // Conductor (Yellow)
                    ctx.fillStyle ="rgb(255,255,0)";
                break;
                default:
                    ctx.fillStyle ="rgb(0,0,0)";
            }
            
            ctx.fillRect(x * boxSize, y * boxSize, boxSize, boxSize);
            ctx.strokeStyle="rgb(0,10,50)";
            ctx.strokeRect(x * boxSize, y * boxSize, boxSize, boxSize);
        }
    }
}

function loop() {

    if (mode == 'running') {
        timer = window.requestAnimationFrame(loop);
        frame++;
        if (frame % 10 == 0) {
            return;
        }
    }

    tick++;

    // CLAEAR
    ctx.fillStyle ="rgba(255,255,255, 0.01)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    grid = calcGrid(gridColumns, gridRows)
    drawGrid(gridColumns, gridRows);

    showInfo();
}

function showInfo() {
    $('tick').innerHTML = tick;
    $('tick4').innerHTML = tick % 4;
    $('mode').innerHTML = mode;
}

function main() {
    initHandler();
    init();
    loop();
    showInfo();
}
window.onload = main;
