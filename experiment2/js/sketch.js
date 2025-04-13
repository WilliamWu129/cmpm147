// sketch.js - purpose and description here
// Author: William Wu
// Date:  4/13/25

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
}

// setup() function is called once when the program starts
let seed = 239;

const grassColor = "#3CB371";
const skyColor = "#69ade4";
const stoneColor = "#858290";
const treeColor = "#33330b";
const rocks = "#FAEBD7";
const sun = "#FFD700";


function setup() {
  canvasContainer = select('#canvas-container');
  let canvas = createCanvas(canvasContainer.width, canvasContainer.height);
  canvas.parent('canvas-container');
  createButton("reimagine").mousePressed(() => seed++);
}
function windowResized() {
  resizeCanvas(canvasContainer.width, canvasContainer.height);
}

function draw() {
  randomSeed(seed);
  noStroke();

  fill(skyColor);
  rect(0, 0, width, height / 2);

  fill(255, 300);
  noStroke();


  let numClouds = 5; 

  for (let i = 0; i < numClouds; i++) {
    // Move clouds right over time
    let cloudX = (i * 100 + millis() * 0.02) % (width + 100) - 50;  
    // Each cloud spaced 100px apart, loops around screen
  
    let cloudY = noise(i * 1000 + millis() * 0.00005) * height / 3;
  
    let cloudSize = random(30, 60);

    for (let j = 0; j < 1; j++) {
      let offsetX = random(-cloudSize, cloudSize);
      let offsetY = random(-cloudSize / 2, cloudSize / 2);
      ellipse(cloudX + offsetX, cloudY + offsetY, random(40, 5000), random(20, 35));
    }
  }

  randomSeed(seed + 100000);  // So sun stays in place until "reimagine"
  let sunX = noise(seed + 50000) * width * 1.3 + width * 0.05;
  let sunY = random(height * 0.05, height * 0.3);

  // Draw the sun
  fill(255, 204, 0, 50);  // Transparent yellow glow
  ellipse(sunX, sunY, 300, 300);  // Larger glow

  fill(sun);
  ellipse(sunX, sunY, 150, 150);  // Actual sun  // Size of sun (adjust as needed)
      
    

  fill(stoneColor);
  beginShape();
  vertex(0, height);
  const steps = 10;
  
  for (let i = 0; i <= steps; i++) {
    let x = (width * i) / steps;
    let noiseFactor = pow(noise(i * 10 + seed), 0.3);
    let y = height / 2 - noiseFactor * height / 3 - random(-20, 20);

    vertex(x, y);
  }
  vertex(width, height);
  endShape(CLOSE);
  
  fill(grassColor);
  beginShape();
  vertex(0, height);  // Bottom left corner

  const grassSteps = 15;  // More steps = smoother curve
  const grassBase = height / 2;  // Base height for grass hill

  for (let i = 0; i <= grassSteps; i++) {
    let x = (width * i) / grassSteps;

    // Small bumps in grass line
    let noiseFactor = noise(i * 2 + seed); 
    let y = grassBase - noiseFactor * 80;   

    vertex(x, y);
  }

  vertex(width, height);  // Bottom right corner
  endShape(CLOSE);
  
  

  fill(rocks);
  noStroke();

  const numRocks = 100 * random();
  const scrub = mouseX/width;
  
  for (let i = 0; i < numRocks; i++) {
    let z = random();  
    let rockX = width * ((random() + (scrub / 300 + millis() / 10000000.0) / z) % 1);
    let rockY = random(height * 0.5, height);  // Near bottom of canvas

    let sizeFactor = map(rockY, height * 0.7, height, 0.5, 1.5); 
      
    let rockW = random(3, 10) * sizeFactor;  // Small rocks
    let rockH = random(4, 9) * sizeFactor;

    ellipse(rockX, rockY, rockW, rockH);  
  }

  
  fill(treeColor);
  const trees = 200*random();
  for (let i = 0; i < trees; i++) {
    let z = random();
    let x = width * ((random() + (scrub/50 + millis() / 500000.0) / z) % 1);
    let s = (width + height) / 100 / z;  
    let y = height / 2 + height / 20 / z;
    triangle(x, y - s, x - s / 4, y, x + s / 4, y);
  }
}

