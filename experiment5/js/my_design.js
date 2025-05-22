/* exported p4_inspirations, p4_initialize, p4_render, p4_mutate */


function getInspirations() {
  return [
  
    {
      name: "Train Wreck", 
      assetUrl: "https://cdn.glitch.global/3abd0223-86fb-43ce-a00a-fde12615bcd5/train-wreck.jpg?v=1714798264965",
      credit: "Train Wreck At Monteparnasse, Levy & fils, 1895"
    },
    {
      name: "Eiffel Tower",
      assetUrl: "https://cdn.glitch.global/9aa9cd41-4c96-435c-80e9-8b3793b3ae25/4b366ed6-ff19-4f3b-9a9e-cb54358d2930.image.png?v=1746763754355",
      credit: "Eiffel Tower at sunset"
    },
    {
      name: "Car",
      assetUrl: "../img/car.png", // use relative path
      credit: "Classic Car Photo"
    },
  ];
}

function initDesign(inspiration) {
  resizeCanvas(inspiration.image.width/2, inspiration.image.height/2);
  let design = { bg:128, fg:[] };

  if (inspiration.name === "Eiffel Tower") {
     const scaleX = inspiration.image.width / width;
    const scaleY = inspiration.image.height / height;

    for (let i = 0; i < 1250; i++) {
      let w = random(width / 20, width / 5);
      let h = random(height / 20, height / 5);
      let x = random(width - w);
      let y = random(height - h);

      const col = inspiration.image.get(int(x * scaleX), int(y * scaleY));

      design.fg.push({
        x, y, w, h,
        fill: [red(col), green(col), blue(col)],
        type: "tower"
      });
    }
  }
  else if (inspiration.name === "Car") {
    for (let i = 0; i < 1000; i++) {
      let w = random(width / 10, width / 5);
      let h = random(height / 10, height / 5);
      let x = random(width - w);
      let y = random(height - h);

      // scale x/y to sample the correct color from the full-size image
      const scaleX = inspiration.image.width / width;
      const scaleY = inspiration.image.height / height;
      const col = inspiration.image.get(int(x * scaleX), int(y * scaleY));

      design.fg.push({
        x, y, w, h,
        fill: [red(col), green(col), blue(col)]
      });
    }
  }
  
  else if (inspiration.name === "Train Wreck") {
  for (let i = 0; i < 1500; i++) {
    design.fg.push({
      x: random(width),
      y: random(height),
      w: random(width / 4),
      h: random(height / 4),
      fill: random(255),
      type: "wreck"
    });
  }
}
  else {
    for (let i = 0; i < 1500; i++) {
      design.fg.push({
        x: random(width),
        y: random(height),
        w: random(width/4),
        h: random(height/4),
        fill: random(255)
      });
    }
  }

  return design;
}



function renderDesign(design, inspiration) {
  background(design.bg);
  noStroke();

  for (let box of design.fg) {
    let col = box.fill;
    if (!Array.isArray(col)) {
      col = [col, col, col];
    }

    fill(col[0], col[1], col[2], 180);

   if (inspiration.name === "Car") {
      rect(box.x, box.y, box.w, box.h);
    }
    else if (inspiration.name === "Train Wreck") {
      ellipse(box.x, box.y, box.w, box.h);
    }
    else {
      triangle(
        box.x, box.y,
        box.x + box.w / 2, box.y - box.h,
        box.x + box.w, box.y
      );
    }
  }
}

function renderToCanvas(pg, design, inspiration) {
  pg.clear();
  pg.noStroke();
  for (let box of design.fg) {
    let col = box.fill;
    if (!Array.isArray(col)) {
      col = [col, col, col];
    }
    pg.fill(col[0], col[1], col[2], 180);

    if (inspiration.name === "Car") {
      pg.rect(box.x, box.y, box.w, box.h);
    } else if (inspiration.name === "Train Wreck") {
      pg.ellipse(box.x, box.y, box.w, box.h);
    } else {
      pg.triangle(box.x, box.y,
                  box.x + box.w / 2, box.y - box.h,
                  box.x + box.w, box.y);
    }
  }
}


function mutateDesign(design, inspiration, rate) {
  design.bg = mut(design.bg, 0, 255, rate);

  for (let box of design.fg) {
    if (inspiration.name === "Car") {
      let col = box.fill;
      if (!Array.isArray(col)) {
        col = [red(col), green(col), blue(col)];
      }

      box.x = mut(box.x, 0, width, rate);
      box.y = mut(box.y, 0, height, rate);
      box.w = mut(box.w, width / 10, width / 3, rate);  
      box.h = mut(box.h, height / 10, height / 3, rate);
    }

    else if (box.type === "tower") {
    box.x = mut(box.x, 0, width, rate);
    box.y = mut(box.y, 0, height, rate);
    box.w = mut(box.w, width / 20, width / 3, rate);
    box.h = mut(box.h, height / 20, height / 3, rate);

    let col = box.fill;
    if (!Array.isArray(col)) {
      col = [red(col), green(col), blue(col)];
    }
    box.fill = col.map(c => mut(c, 0, 255, rate));
  }

    else if (box.type === "wreck") {
      box.x = mut(box.x, 0, width, rate);
      box.y = mut(box.y, 0, height, rate);
      box.w = mut(box.w, 0, width / 2, rate);
      box.h = mut(box.h, 0, height / 2, rate);

      let col = box.fill;
      if (!Array.isArray(col)) {
        col = [red(col), green(col), blue(col)];
      }
      let gray = (col[0] + col[1] + col[2]) / 3;
      let newGray = mut(gray, 0, 255, rate);
      box.fill = [newGray, newGray, newGray];
    }
  }
}



function mut(num, min, max, rate) {
    return constrain(randomGaussian(num, (rate * (max - min)) / 10), min, max);
}
