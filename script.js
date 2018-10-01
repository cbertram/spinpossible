function resize() {
    var canvas = document.getElementById("game-canvas");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetWidth;
    drawBoard();
};
window.onresize = function(event) {resize();};

var ctx;

window.onload = function() {
    ctx = document.getElementById("game-canvas").getContext("2d");
    resize();
    updateSize();
    scramble();
    drawBoard();
};

var size;
var nums;
var colors;
var numMoves = 0;

function drawBoard() {
    //if(ctx == undefined)
    //    ctx = document.getElementById("game-canvas").getContext("2d");
    var w = ctx.canvas.width;
    ctx.clearRect(0, 0, w, w);
    ctx.font = Math.floor(w/(2*size))+"px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for(i = 0; i < size; i++) {
        for(j = 0; j < size; j++) {
            ctx.save();
            
            ctx.translate(w*(j+0.5)/size, w*(i+0.5)/size);
            if(nums[i*size+j] < 0)
                ctx.rotate(Math.PI);
            
            ctx.fillStyle = colors[Math.floor((Math.abs(nums[i*size+j])-1)/size)];
            ctx.fillRect(-w/2/size, -w/2/size, w/size, w/size);
            
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.rect(-w/2/size, -w/2/size, w/size, w/size);
            ctx.stroke();

            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.beginPath();
            ctx.moveTo(-0.8*w/2/size, 0.8*Math.sqrt(3)/2*w/2/size);
            ctx.lineTo(0.8*w/2/size, 0.8*Math.sqrt(3)/2*w/2/size);
            ctx.lineTo(0, -0.8*Math.sqrt(3)/2*w/2/size);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = "black";
            ctx.fillText(Math.abs(nums[i*size+j]), 0, 0);
            
            ctx.restore();
        }
    }
}

function updateSize() {
    size = Number(document.getElementById("select-size").value);
    nums = [];
    for(i = 1; i <= size*size; i++)
        nums.push(i);

    colors = [];
    for(i = 0; i < size; i++) {
        var r = Math.ceil(100+Math.random()*155);
        var g = Math.ceil(100+Math.random()*155);
        var b = Math.ceil(100+Math.random()*155);
        colors.push("rgb("+r+","+g+","+b+")");
    }
}

function writeNumMoves() {
    document.getElementById("num-moves").innerHTML = numMoves;
}

function scramble() {
    numMoves = 0;
    writeNumMoves();
    var numSwaps = 900+Math.round(Math.random()*100);
    for(i = 0; i < numSwaps; i++) {
        var ax = Math.floor(Math.random()*size);
        var ay = Math.floor(Math.random()*size);
        var bx = Math.floor(Math.random()*size);
        var by = Math.floor(Math.random()*size);
        rotate(Math.min(ax, bx), Math.min(ay, by),
               Math.max(ax, bx), Math.max(ay, by), false);
    }
}

function rotate(fx, fy, tx, ty, count=true) { // fromX, fromY, toX, toY
    if(fx === tx && fy === ty) return;
    //console.log(fx+" "+fy+"   "+tx+" "+ty);
    if(count) {
        numMoves++;
        writeNumMoves();
    }
    
    for(y = fy; y <= Math.floor((fy+ty)/2); y++) {
        for(x = fx; x <= tx; x++) {
            if((fy-ty) % 2 == 0 && y === Math.floor((fy+ty)/2) && x > (fx+tx)/2) break;
            var a = y*size+x;
            var b = (ty-(y-fy))*size + (tx-(x-fx));
            //console.log(a+","+b);
            
            var tmp = nums[a];
            nums[a] = -nums[b];
            nums[b] = -tmp;
        }
    }
}


function getMousePos(event) {
    var bound = ctx.canvas.getBoundingClientRect();
    return {
        x: event.clientX - bound.left,
        y: event.clientY - bound.top
    };
}

var dragFrom = -1;
document.addEventListener("mousedown", function(event) {
    dragFrom = getMousePos(event);
}, false);

document.addEventListener("mousemove", function(event) {
    if(dragFrom != -1) {
        currPos = getMousePos(event);
        drawBoard();
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillRect(dragFrom.x, dragFrom.y,
                     currPos.x-dragFrom.x, currPos.y-dragFrom.y);
    }
}, false);

document.addEventListener("mouseup", function(event) {
    var dragTo = getMousePos(event);

    var w = ctx.canvas.width;
    
    var minX = Math.min(dragFrom.x, dragTo.x);
    var minY = Math.min(dragFrom.y, dragTo.y);
    var maxX = Math.max(dragFrom.x, dragTo.x);
    var maxY = Math.max(dragFrom.y, dragTo.y);

    var fromX = Math.floor(minX/(w/size));
    var fromY = Math.floor(minY/(w/size));
    var   toX = Math.floor(maxX/(w/size));
    var   toY = Math.floor(maxY/(w/size));

    if(!(fromX < 0 || size <= fromX || fromY < 0 || size <= fromY ||
         toX < 0 || size <= toX || toY < 0 || size <= toY))
        rotate(fromX, fromY, toX, toY);
    
    dragFrom = -1;
    drawBoard();

    if(!(fromX < 0 || size <= fromX || fromY < 0 || size <= fromY ||
         toX < 0 || size <= toX || toY < 0 || size <= toY)) {
        var solved = true;
        for(i = 0; i < size*size; i++)
            if(nums[i] != i+1)
                solved = false;
        if(solved)
            alert("Solved!");
    }
}, false);
