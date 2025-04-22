// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const VALUE1 = 1;
const VALUE2 = 2;

// Globals
let myInstance;
let canvasContainer;
var centerHorz, centerVert;

let isDungeonMode = false;

let currentGrid;
let numCols = 40;
let numRows = 40;
let tileSize = 16;

let tilesetImage;

function preload() {
  tilesetImage = loadImage("../../img/tileset.png");
}

class MyClass {
    constructor(param1, param2) {
        this.property1 = param1;
        this.property2 = param2;
    }

    myMethod() {
        // code to run when method is called
    }
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}

// setup() function is called once when the program starts
function setup() {
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(numCols * tileSize, numRows * tileSize);
  canvas.parent("canvas-container");
  // resize canvas is the page is resized


  $("#toggleModeButton").click(() => {
  isDungeonMode = !isDungeonMode;

  // Regenerate based on new mode
  currentGrid = isDungeonMode ? generateDungeon(numCols, numRows) : generateGrid(numCols, numRows);

  // Update button text accordingly
  $("#toggleModeButton").text(isDungeonMode ? "Switch to Overworld" : "Switch to Dungeon");
});

$("#reimagineButton").click(() => {
  currentGrid = isDungeonMode ? generateDungeon(numCols, numRows) : generateGrid(numCols, numRows);
});

  if (isDungeonMode) {
    currentGrid = generateDungeon(numCols, numRows);
  } else {
    currentGrid = generateGrid(numCols, numRows);
  }

  // create an instance of the class
  myInstance = new MyClass("VALUE1", "VALUE2");

  $(window).resize(function() {
    resizeCanvas(numCols * tileSize, numRows * tileSize);
  });
  resizeScreen();
}

function keyPressed() {
  if (key === 'D') {
    isDungeonMode = true;
    currentGrid = generateDungeon(numCols, numRows);
  } else if (key === 'O') {
    isDungeonMode = false;
    currentGrid = generateGrid(numCols, numRows);
  }
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
  if (isDungeonMode) {
    drawDungeonGrid(currentGrid);
  } else {
    drawGrid(currentGrid);
  }
}


// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    // code to run when mouse is pressed
}


function placeTile(i, j, ti, tj) {
  if (!tilesetImage) return;

  // Adjust these based on the tile size and source tile size
  const tileDrawSize = tileSize;     // How big you want the tile to appear
  const tileSourceSize = 8;  

  image(
    tilesetImage,
    j * tileDrawSize, i * tileDrawSize,   // destination x, y
    tileDrawSize, tileDrawSize,           // destination width, height
    ti * tileSourceSize, tj * tileSourceSize, // source x, y in the spritesheet
    tileSourceSize, tileSourceSize        // source width, height
  );
}


/* exported generateGrid, drawGrid */
/* global placeTile */

function generateGrid(numCols, numRows) {
  let grid = Array(numRows).fill().map(() => Array(numCols).fill(" ")); // blank

  // Optional: Generate river with 50% chance
  if (random() < 0.5) {
    generateRiver(grid, numCols, numRows);
  }

  let seedCount = floor(random(1));
  for (let i = 0; i < seedCount; i++) {
    let x = floor(random(numCols));
    let y = floor(random(numRows));
    grid[y][x] = "W";
  }

  
  for (let pass = 0; pass < 2; pass++) {
    let newGrid = grid.map(row => row.slice());

    for (let y = 0; y < numRows; y++) {
      for (let x = 0; x < numCols; x++) {
        if (grid[y][x] !== " ") continue;

        let waterNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            let ny = y + dy;
            let nx = x + dx;
            if (nx >= 0 && nx < numCols && ny >= 0 && ny < numRows) {
              if (grid[ny][nx] === "W") {
                waterNeighbors++;
              }
            }
          }
        }

        
        if (waterNeighbors >= 3) {
          newGrid[y][x] = "W";
        }
      }
    }

    grid = newGrid;
  }


 
  
  for (let y = 0; y < numRows; y++) {
    for (let x = 0; x < numCols; x++) {
      if (grid[y][x] !== " ") continue;

      // Create a per-tile radius between 3 and 8 based on noise
      let localRadius = floor(map(noise(x * 0.1, y * 0.1), 0, 1, 3, 10));
      let closestWaterDist = Infinity;

      for (let dy = -localRadius; dy <= localRadius; dy++) {
        for (let dx = -localRadius; dx <= localRadius; dx++) {
          let ny = y + dy;
          let nx = x + dx;
          if (nx >= 0 && nx < numCols && ny >= 0 && ny < numRows) {
            if (grid[ny][nx] === "W") {
              let dist = sqrt(dx * dx + dy * dy);
              if (dist < closestWaterDist) {
                closestWaterDist = dist;
              }
            }
          }
        }
      }

      if (closestWaterDist < localRadius) {
        // Falloff within the localRadius
        let falloff = map(closestWaterDist, 1, localRadius, 1.0, 0.0, true);
        let noiseVal = noise((x + 1000) * 0.1, (y + 1000) * 0.1); // use offset to vary dirt noise
        if (noiseVal < falloff) {
          grid[y][x] = "D";
        }
      }
    }
  }
  for (let y = 0; y < numRows; y++) {
    for (let x = 0; x < numCols; x++) {
      if (grid[y][x] !== "G") continue; // only consider grass tiles

      // Chunky patches using noise
      let noiseVal = noise((x + 5000) * 0.07, (y + 5000) * 0.07);

      // Only some areas — and bigger blobs using noise threshold
      if (noiseVal > 0.55 && noiseVal < 0.65) {
        grid[y][x] = "D";
      }
    }
  }

 Fill remaining with grass
  for (let y = 0; y < numRows; y++) {
    for (let x = 0; x < numCols; x++) {
      if (grid[y][x] === " ") {
        grid[y][x] = "G"; // grass
      }
    }
  }

  return grid;
}



function generateRiver(grid, numCols, numRows) {
  let edge = floor(random(3));
  let x, y, dx, dy;

  // Start from a random edge
  if (edge === 0) { // top edge
    x = floor(random(numCols));
    y = 0;
    dx = 0;
    dy = 1;
  } else if (edge === 1) { // left edge
    x = 0;
    y = floor(random(numRows));
    dx = 1;
    dy = 0;
  } else { // right edge
    x = numCols - 1;
    y = floor(random(numRows));
    dx = -1;
    dy = 0;
  }

  // Use a noise offset for smooth directional bias
  let t = random(1000); // random noise seed per river

  while (x >= 0 && x < numCols && y >= 0 && y < numRows) {
    for (let wy = -1; wy <= 1; wy++) {
      for (let wx = -1; wx <= 1; wx++) {
        let nx = x + wx;
        let ny = y + wy;

        if (nx >= 0 && nx < numCols && ny >= 0 && ny < numRows) {
          let distance = abs(wx) + abs(wy);

          // Center tile always, side tiles only sometimes
          if (distance === 0 || (distance === 1 && random() < 0.5)) {
            grid[ny][nx] = "W";
          }
        }
      }
    }

    // Smooth river curve using Perlin noise
    let n = noise(x * 0.1, y * 0.1, t);

    if (dx === 0) {
      if (n < 0.45 && x > 0) x -= 1; // curve left
      else if (n > 0.6 && x < numCols - 1) x += 1; // curve right
    } else if (dy === 0) {
      if (n < 0.7 && y > 0) y -= 1; // curve up
      else if (n > 0.6 && y < numRows - 1) y += 1; // curve down
    }

    // Continue forward
    x += dx;
    y += dy;
  }
}





function drawGrid(grid) {
  background(120); 


  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      let code = grid[i][j];
      let variation = (i + j) % 4;

      if (code === "G") {
        placeTile(i, j, 1 , 0); // grass row
      } else if (code === "D") {
        placeTile(i, j, 0, 3); // dirt row
      } else if (code === "W") {
        placeTile(i, j, 3, 14); 
      }
    }
  }
}











function generateDungeon(numCols, numRows) {
  let grid = Array(numRows).fill().map(() => Array(numCols).fill("_")); // background fill

  let rooms = [];
  let maxRooms = 5;
  let minDistance = 2;

  
  let centerRoomW = 10;
  let centerRoomH = 8;
  let centerX = floor(numCols / 2 - centerRoomW / 2);
  let centerY = floor(numRows / 2 - centerRoomH / 2);

  for (let y = centerY; y < centerY + centerRoomH; y++) {
    for (let x = centerX; x < centerX + centerRoomW; x++) {
      grid[y][x] = ".";
    }
  }

  rooms.push({ x: centerX, y: centerY, w: centerRoomW, h: centerRoomH });

  for (let attempt = 0; attempt < 100 && rooms.length < maxRooms; attempt++) {
    let roomWidth = floor(random(5, 15));
    let roomHeight = floor(random(5, 15));
    let roomX = floor(random(2, numCols - roomWidth - 2));
    let roomY = floor(random(2, numRows - roomHeight - 2));

    let tooClose = false;
    for (let room of rooms) {
      if (roomX + roomWidth + minDistance >= room.x &&
          roomX <= room.x + room.w + minDistance &&
          roomY + roomHeight + minDistance >= room.y &&
          roomY <= room.y + room.h + minDistance) {
        tooClose = true;
        break;
      }
    }

    if (tooClose) continue;

    for (let y = roomY; y < roomY + roomHeight; y++) {
      for (let x = roomX; x < roomX + roomWidth; x++) {
        grid[y][x] = "."; // floor tile
      }
    }

    rooms.push({ x: roomX, y: roomY, w: roomWidth, h: roomHeight });
  }

  for (let i = 0; i < rooms.length - 1; i++) {
    let roomA = rooms[i];
    let roomB = rooms[i + 1];

    let ax = floor(roomA.x + roomA.w / 2);
    let ay = floor(roomA.y + roomA.h / 2);
    let bx = floor(roomB.x + roomB.w / 2);
    let by = floor(roomB.y + roomB.h / 2);

    if (random() < 0.5) {
      carveHorizontal(grid, ax, bx, ay);
      carveVertical(grid, ay, by, bx);
    } else {
      carveVertical(grid, ay, by, ax);
      carveHorizontal(grid, ax, bx, by);
    }
  }

  return grid;
}

function carveHorizontal(grid, x1, x2, y) {
  for (let x = min(x1, x2); x <= max(x1, x2); x++) {
    if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
      grid[y][x] = ".";
    }
  }
}

function carveVertical(grid, y1, y2, x) {
  for (let y = min(y1, y2); y <= max(y1, y2); y++) {
    if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
      grid[y][x] = ".";
    }
  }
}

function gridCheck(grid, i, j, target) {
  return i >= 0 && i < grid.length && j >= 0 && j < grid[0].length && grid[i][j] === target;
}

function gridCode(grid, i, j, target) {
  let north = gridCheck(grid, i - 1, j, target) ? 1 : 0;
  let south = gridCheck(grid, i + 1, j, target) ? 2 : 0;
  let east = gridCheck(grid, i, j + 1, target) ? 4 : 0;
  let west = gridCheck(grid, i, j - 1, target) ? 8 : 0;
  return north + south + east + west;
}

const lookup = [
  [0, 0], [1, 0], [2, 0], [3, 0],
  [4, 0], [5, 0], [6, 0], [7, 0],
  [0, 1], [1, 1], [2, 1], [3, 1],
  [4, 1], [5, 1], [6, 1], [7, 1]
];

function drawContext(grid, i, j, target, ti, tj) {
  let code = gridCode(grid, i, j, target);
  const [tiOffset, tjOffset] = lookup[code];
  placeTile(i, j, ti + tiOffset, tj + tjOffset);
}

function drawDungeonGrid(grid) {
  background(60);

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      let code = grid[i][j];
      let variation = (i + j) % 4;

      if (code === ".") {
        placeTile(i, j, 4, 24); // grass row  // dungeon floor
      } else if (code === "_") {
        placeTile(i, j, 15, 24);  // dungeon background
      }
    }
  }
}
