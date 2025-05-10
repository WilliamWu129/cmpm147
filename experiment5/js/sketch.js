/* sketch.js – drives p4 engine within the formatted template */

let inspirations, design, bestDesign;
let slider, mutationLabel, activeScore, bestScore, fpsCounter;
let mutationCount = 0;
let canvas;
let currentInspiration, currentInspirationPixels;

function setupUIReferences() {
  // grab DOM elements
  const sel = document.getElementById('inspiration-select');
  const restartBtn = document.getElementById('restart');
  slider = document.getElementById('mutation-slider');
  mutationLabel = document.getElementById('mutation-label');
  activeScore = document.getElementById('active-score');
  bestScore = document.getElementById('best-score');
  fpsCounter = document.getElementById('fpsCounter');
  // hook restart to reset
  restartBtn.onclick = () => loadInspiration(parseInt(sel.value));
  // update mutation label live
  slider.oninput = () => mutationLabel.textContent = slider.value;
}

function preload() {
  inspirations = getInspirations();
  // load each image
  for (let insp of inspirations) {
    insp.image = loadImage(insp.assetUrl);
  }
}

function setup() {
  setupUIReferences();

  // populate dropdown once
  const sel = document.getElementById('inspiration-select');
  sel.innerHTML = '';
  inspirations.forEach((insp,i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = insp.name;
    sel.appendChild(opt);
  });
  // on change
  sel.onchange = () => loadInspiration(parseInt(sel.value));

  // create canvas in container
  const container = document.getElementById('canvas-container');
  const w = container.clientWidth;
  const h = w * 0.6; // or some aspect ratio
  canvas = createCanvas(w, h);
  canvas.parent('canvas-container');

  // start with first
  loadInspiration(0);
  noLoop();
}

function loadInspiration(idx) {
  currentInspiration = inspirations[idx];
  // resize to image dims
  resizeCanvas(currentInspiration.image.width/2, currentInspiration.image.height/2);
  design = initDesign(currentInspiration);
  bestDesign = JSON.parse(JSON.stringify(design));
  // draw base image and capture pixels
  image(currentInspiration.image, 0, 0, width, height);
  loadPixels();
  currentInspirationPixels = pixels;
  currentScore = -Infinity;
  loop();
}

function draw() {
  if (!design) return;

  randomSeed(mutationCount++);
  const candidate = JSON.parse(JSON.stringify(bestDesign));
  mutateDesign(candidate, currentInspiration, slider.value/100);

  randomSeed(0);
  renderDesign(candidate, currentInspiration);
  const score = evaluate();

  activeScore.textContent = score.toFixed(5);
  fpsCounter.textContent = Math.round(frameRate());

  if (score > currentScore) {
    currentScore = score;
    bestDesign = candidate;
    bestScore.textContent = score.toFixed(5);
    memorialize();
  }
}

function evaluate() {
  loadPixels();
  let err = 0;
  for (let i=0; i<pixels.length; i++) err += sq(pixels[i] - currentInspirationPixels[i]);
  return 1/(1 + err/pixels.length);
}

function memorialize() {
  const url = canvas.elt.toDataURL();
  const img = document.createElement('img');
  img.className = 'memory';
  img.src = url;
  img.width = width/2;
  img.height = height/2;
  const mem = document.getElementById('memory');
  mem.insertBefore(img, mem.firstChild);
  if (mem.childNodes.length > mem.dataset.maxItems) mem.removeChild(mem.lastChild);
}
