"use strict";

/* global XXH */
/* exported --
    p3_preload
    p3_setup
    p3_worldKeyChanged
    p3_tileWidth
    p3_tileHeight
    p3_tileClicked
    p3_drawBefore
    p3_drawTile
    p3_drawSelectedTile
    p3_drawAfter
*/

function p3_preload() {}

function p3_setup() {
  noiseScale = 0.05;
  islandSpacing = 50;
}

let worldSeed;
let noiseScale;
let islandSpacing;

// let clouds = [];



function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);



  noiseSeed(worldSeed);
  randomSeed(worldSeed);
  
  noiseScale = 0.03 + 0.04 * (worldSeed % 100) / 100; // slightly randomized
  islandSpacing = 15 + (worldSeed % 5) * 20; // 80 to 160
}

function p3_tileWidth() {
  if (currentWorldMode === "civilization") {
    return 32; 
  }
  return 48;
}

function p3_tileHeight() {
  if (currentWorldMode === "civilization") {
    return 16; 
  }
  return 24;
}



let clicks = {};

function p3_tileClicked(i, j) {
  let key = [i, j];
  
  if (!(key in clicks)) {
    clicks[key] = { count: 0, time: 0 };
  }
  
  clicks[key].count += 1;
  clicks[key].time = millis();
}

function p3_drawBefore() {

}

function p3_drawTile(i, j) {
  noStroke();
  push();

  let tw = p3_tileWidth();
  let th = p3_tileHeight();

  

  let nx = i * noiseScale;
  let ny = j * noiseScale;
  let elevation = noise(nx, ny);

 
  let centerX = Math.round(i / islandSpacing) * islandSpacing;
  let centerY = Math.round(j / islandSpacing) * islandSpacing;
  let distance = dist(i, j, centerX, centerY);
  elevation -= distance * 0.01;

 
  if (elevation > 0.52) {
    let greenShade = map(elevation, 0.52, 1.0, 150, 255); // darker green at lower, lighter at higher
    greenShade = constrain(greenShade, 150, 255);
    fill(34, greenShade, 34); // green Land
  } else if (elevation > 0.43) {
    let rockyGray = 100 + noise(i * 0.5, j * 0.5) * 50;
    fill(rockyGray);
  } else if (elevation > 0.39) {
    fill(238, 214, 175); // Sand
  } else if (elevation > 0.3) {
    fill(173, 216, 230); // Shallow water
  } else {
    let deepness = map(elevation, 0.2, 0.0, 200, 50); // 200 
    deepness = constrain(deepness, 50, 200); 
    fill(0, 0, deepness); // dark blue range // Deep water
  }



 
  beginShape();
  vertex(-tw, 0);
  vertex(0, th);
  vertex(tw, 0);
  vertex(0, -th);
  endShape(CLOSE);

  
  let clickData = clicks[[i, j]];
  if (clickData) {
    let timeSinceClick = millis() - clickData.time;
    let size = min(20, 5 + timeSinceClick / 1000);

    fill(255, 255, 100, 150);
    ellipse(0, 0, size, size);
  }

  pop();
}


//underwater 2nd map

function p3_drawUnderwaterTile(i, j) {
  noStroke();
  push();

  let tw = p3_tileWidth();
  let th = p3_tileHeight();


  let nx = i * noiseScale;
  let ny = j * noiseScale;
  let elevation = noise(nx, ny);

  // Basic terrain
  if (elevation < 0.3) {
    fill(0, 0, 80); // Deep water
  } else if (elevation < 0.5) {
    fill(0, 100, 200); // Coral reefs
  } else if (elevation < 0.7) {
    fill(220, 200, 150); // Sandy seafloor
  } else {
    fill(50, 50, 70); // Dark cliffs
  }

  beginShape();
  vertex(-tw, 0);
  vertex(0, th);
  vertex(tw, 0);
  vertex(0, -th);
  endShape(CLOSE);
  
  pop(); 

  // Unique tile key for randomness
  let key = [i, j];

  let cityChance = (XXH.h32('city:' + key, worldSeed) % 1000);

  // Only allow cities if on solid ground (sand or cliff)
  if (elevation > 0.5 && cityChance < 5) { 
    drawSingleBuilding(i, j);
  }
  // Tiny fish swim - even without clicks
  let fishChance = (XXH.h32('fish:' + key, worldSeed) % 100);
  if (fishChance < 5) { // small chance (0.5%)
    push();
    let t = millis() / 1000;
    let swimX = 10 * sin(t + (i + j));
    let swimY = 3 * sin(t * 2 + (i - j));
    
    translate(swimX, swimY);
    
    fill(255, 200, 0);
    ellipse(1, 1, 10, 5); // fish body
    
    pop();
  }

  // Coral growth 
  let clickData = clicks[key];
  if (clickData) {
    push();
    translate(0, 0);

    let timeSinceClick = (millis() - clickData.time) / 1000.0;
    let coralSize = min(30, 5 + timeSinceClick * 3); // grows up to 30px

    // Giant coral if clicked 5+ times
    if (clickData.count >= 5) {
      coralSize *= 2;
    }

    // Stable random coral hue
    let coralHue = (XXH.h32('coral:' + key, worldSeed) % 360);
    colorMode(HSB, 360, 100, 100);
    fill(coralHue, 80, 100, 180);
    colorMode(RGB, 255);

    noStroke();
    ellipse(0, 0, coralSize, coralSize * 0.8); // slightly oval coral

    pop();
  }
}

function p3_drawCivilizationTile(i, j) {
  noStroke();
  push();

  let tw = p3_tileWidth();
  let th = p3_tileHeight();

  let key = [i, j];
  let clickData = clicks[key];

  let nx = i * noiseScale;
  let ny = j * noiseScale;
  let elevation = noise(nx, ny);

  // based on elevation
  if (elevation > 0.65) {
    let shade = map(elevation, 0.62, 1.0, 200, 255);
    shade = constrain(shade, 200, 255);
    fill(shade, shade, 255); // Slight bluish-white
  } else if(elevation > 0.58){ 
    let rockyShade = map(elevation, 0.58, 0.75, 100, 180);
    rockyShade = constrain(rockyShade, 100, 180);
    fill(rockyShade); // pure gray
  } else if (elevation > 0.3) {
    fill(34, 139, 34); // Land
  } else {
    fill(0, 191, 255); // Water
  }

  beginShape();
  vertex(-tw, 0);
  vertex(0, th);
  vertex(tw, 0);
  vertex(0, -th);
  endShape(CLOSE);


  if (clickData) {
    push();
    let timeSinceClick = (millis() - clickData.time) / 1000.0;
    let shrubSize = min(20, 5 + timeSinceClick * 2); // grows over time

    let variant = XXH.h32("civilflora:" + [i, j], worldSeed) % 3;

    if (variant === 0) {
      fill(34, 139, 34); // green shrub
      ellipse(0, 0, shrubSize, shrubSize * 0.8);
    } else {
      let hue = (XXH.h32("civilflower:" + [i, j], worldSeed) % 360);
      colorMode(HSB, 360, 100, 100);
      fill(hue, 80, 100, 180);
      colorMode(RGB, 255);
      ellipse(0, 0, shrubSize * 0.7, shrubSize * 0.7);
    }
    pop();
  }

  // Spawn buildings
  if (elevation > 0.4 && elevation <= 0.58) {
    let cityCenterChance = (XXH.h32('civCityCenter:' + [i, j], worldSeed) % 1000);
    let cityNearChance = (XXH.h32('civCityNear:' + [i, j], worldSeed) % 1000);

    if (cityCenterChance < 3 || cityNearChance < 30) {
      drawSingleBuilding(i, j);
    }
  }

  pop();
}



function drawSingleBuilding(i, j) {
  push();
  let tw = p3_tileWidth();
  let th = p3_tileHeight();

  let buildingHeight = 50 + (XXH.h32('building:' + [i, j], worldSeed) % 80); // Height 30–110 pixels
  
  // Draw top (raised up)
  fill(100, 100, 200, 230); // blueish
  noStroke();
  
  beginShape();
  vertex(-tw, -buildingHeight);
  vertex(0, th - buildingHeight);
  vertex(tw, -buildingHeight);
  vertex(0, -th - buildingHeight);
  endShape(CLOSE);

  // Right wall
  fill(80, 80, 220, 255); // darker
  beginShape();
  vertex(0, th - buildingHeight); // top
  vertex(tw, -buildingHeight);    // top
  vertex(tw, 0);                  // ground
  vertex(0, th);                  // ground
  endShape(CLOSE);

  // Left wall
  fill(60, 60, 180, 255); // slightly darker
  beginShape();
  vertex(0, th - buildingHeight); // top
  vertex(-tw, -buildingHeight);   // top
  vertex(-tw, 0);                 // ground
  vertex(0, th);                  // ground
  endShape(CLOSE);

  pop();
}


function drawRaisedTile(x, y, h) {
  push();
  translate(x, y);

  // Set color for the top
  fill(100, 100, 200, 200);
  noStroke();

  // Draw top (standard diamond shape)
  beginShape();
  vertex(0, 0);
  vertex(tw / 2, th / 2);
  vertex(0, th);
  vertex(-tw / 2, th / 2);
  endShape(CLOSE);

  // Set color for walls (darker)
  fill(70, 70, 230, 255); // fully solid


  // Draw right wall
  beginShape();
  vertex(0, th);
  vertex(tw / 2, th / 2);
  vertex(tw / 2, th / 2 + h);
  vertex(0, th + h);
  endShape(CLOSE);

  // Draw left wall
  beginShape();
  vertex(0, th);
  vertex(-tw / 2, th / 2);
  vertex(-tw / 2, th / 2 + h);
  vertex(0, th + h);
  endShape(CLOSE);

  pop();
}





function p3_drawSelectedTile(i, j) {
  noFill();
  stroke(0, 255, 0, 128);

  let tw = p3_tileWidth();
  let th = p3_tileHeight();


  beginShape();
  vertex(-tw, 0);
  vertex(0, th);
  vertex(tw, 0);
  vertex(0, -th);
  endShape(CLOSE);

  noStroke();
  fill(0);
  text("tile " + [i, j], 0, 0);
}

function p3_drawAfter() {
  if (currentWorldMode === "civilization") {
    noStroke();
    let step = 100; // spacing between cloud checks in pixels

    for (let sx = 0; sx < width; sx += step) {
      for (let sy = 0; sy < height; sy += step) {
        // Convert screen coordinates to world coordinates
        let [wx, wy] = screenToWorld([sx, sy], [camera_offset.x, camera_offset.y]);

        // Use integer grid to avoid jitter
        let cloudX = Math.floor(wx / 4);
        let cloudY = Math.floor(wy / 4);

        let hash = XXH.h32("cloud:" + [cloudX, cloudY], worldSeed) % 1000;
        if (hash < 20) {
          let cloudOffsetX = (XXH.h32("cloudx:" + [cloudX, cloudY], worldSeed) % 20) - 10;
          let cloudOffsetY = (XXH.h32("cloudy:" + [cloudX, cloudY], worldSeed) % 10) - 5;
          let cloudSize = 200 + (XXH.h32("cloudsize:" + [cloudX, cloudY], worldSeed) % 60);

          fill(255, 120);
          ellipse(sx + cloudOffsetX, sy + cloudOffsetY, cloudSize * 2, cloudSize);
          ellipse(sx + cloudOffsetX + cloudSize * 0.3, sy + cloudOffsetY + cloudSize * 0.1, cloudSize, cloudSize * 0.8);
          ellipse(sx + cloudOffsetX - cloudSize * 0.3, sy + cloudOffsetY + cloudSize * 0.1, cloudSize, cloudSize * 0.8);
        }
      }
    }
  }
}


