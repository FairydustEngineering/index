let attractorPoints = [];
let points = {};
let flowIndex = 0;

// Parameters for the DeJong Attractor
const A = -0.827;
const B = -1.637;
const C = 1.659;
const D = -0.943;
const MULT = 250.0; // Scale factor
const PRE_COMPUTE = 55000; // More points for smoother flow
const Y = 110;

// Parameters for the sparkling effect
const MAX_BRIGHTNESS = 255;
const MIN_BRIGHTNESS = 20;
let ACTIVE_POINTS_PERCENT = 0.001; // Percent of points active at any time
const FLOW_SPEED = 10; // Controls the speed of the flow effect

let wordmark;
function preload() {
  wordmark = loadImage("feee.svg");
}

function setup() {
  pixelDensity(2);
  createCanvas(windowWidth, windowHeight, bgCanvas);

  // Pre-compute attractor points
  attractorPoints = preComputeAttractor(PRE_COMPUTE);

  // Center coordinates for drawing
  const centerX = width / 2;
  const centerY = height / 2 + Y;

  // Initialize all possible points with inactive state
  for (let point of attractorPoints) {
    const screenX = Math.floor(point[0] * MULT + centerX);
    const screenY = Math.floor(point[1] * MULT + centerY);
    const key = `${screenX},${screenY}`;

    points[key] = {
      x: screenX,
      y: screenY,
      brightness: 0,
      // brightness: random(MIN_BRIGHTNESS, 255),
      fadeSpeed: Math.floor(random(1, 4)),
      colorShift: [0, 0, 0],
      active: false,
    };
  }
}

function draw() {
  // background(0);

  if (frameCount === 1) {
    ACTIVE_POINTS_PERCENT = 0.0002;
  }
  if (frameCount === 287) {
    ACTIVE_POINTS_PERCENT = 0.01;
  }
  if (frameCount === 290) {
    ACTIVE_POINTS_PERCENT = 0.12;
  }
  if (frameCount === 296) {
    ACTIVE_POINTS_PERCENT = 0.00025;
  }
  // if (frameCount < 90 && frameCount > 60) {
  //   ACTIVE_POINTS_PERCENT = 0.1;
  // }

  // Update flow_index to create motion along the attractor
  flowIndex = (flowIndex + FLOW_SPEED) % PRE_COMPUTE;

  // First, decrease brightness of existing active points and possibly deactivate some
  for (let key in points) {
    let point = points[key];
    if (point.active) {
      if (point.brightness <= point.fadeSpeed + MIN_BRIGHTNESS) {
        // Randomly decide if the point should stay lit with minimum brightness
        // if (random() < 0.3) {
        if (false) {
          point.brightness = MIN_BRIGHTNESS;
        } else {
          point.active = false;
          point.brightness = 0;
        }
      } else {
        point.brightness = max(point.brightness - point.fadeSpeed, 0);
      }

      // Randomly deactivate some points for sparkle effect
      if (random() < 0.01) {
        point.active = false;
      }
    }
  }

  // Activate points in a flowing pattern and some random ones
  const activeCount = Math.floor(PRE_COMPUTE * ACTIVE_POINTS_PERCENT);

  // Activate points in the flow region (consecutive segment of the attractor)
  for (let i = 0; i < activeCount / 2; i++) {
    const idx = (flowIndex + i) % PRE_COMPUTE;
    const point = attractorPoints[idx];
    const screenX = Math.floor(point[0] * MULT + width / 2);
    const screenY = Math.floor(point[1] * MULT + height / 2 + Y);
    const key = `${screenX},${screenY}`;

    if (points[key]) {
      const p = points[key];
      if (!p.active || p.brightness < MAX_BRIGHTNESS / 2) {
        p.active = true;
        // Slightly randomize brightness for twinkling effect
        p.brightness = random(MAX_BRIGHTNESS - 4, MAX_BRIGHTNESS);
        // Occasionally change fade speed for more variance
        if (random() < 0.1) {
          p.fadeSpeed = Math.floor(random(1, 6));
        }
      }
    }
  }

  // Randomly activate some points throughout the attractor for sparkle
  for (let i = 0; i < activeCount / 2; i++) {
    const idx = Math.floor(random(PRE_COMPUTE));
    const point = attractorPoints[idx];
    const screenX = Math.floor(point[0] * MULT + width / 2);
    const screenY = Math.floor(point[1] * MULT + height / 2 + Y);
    const key = `${screenX},${screenY}`;

    if (points[key]) {
      const p = points[key];
      if (!p.active || random() < 0.1) {
        // Occasionally reactivate even active points
        p.active = true;
        p.brightness = random(MAX_BRIGHTNESS - 100, MAX_BRIGHTNESS - 50);
      }
    }
  }

  // Draw all active points with their current brightness
  noStroke();
  for (let key in points) {
    const point = points[key];
    if (point.active && point.brightness > 0) {
      fill(
        point.brightness,
        point.brightness,
        point.brightness,
        point.brightness,
      );
      ellipse(point.x, point.y, 2, 2);
    }
  }

  // Draw text
  fill(200, 200, 200);
  // textAlign(CENTER);
  // textSize(16);
  // text("fairydust.engineering", width / 2, height - 50);
}

// Function to pre-compute the attractor points
function preComputeAttractor(length) {
  let points = [];

  // Start with initial point
  points.push([0.1, 0.1]);

  // Compute subsequent points
  for (let i = 1; i <= length; i++) {
    const prev = points[i - 1];
    const xNew = sin(prev[1] * A) - cos(prev[0] * B);
    const yNew = sin(prev[0] * C) - cos(prev[1] * D);

    points.push([xNew, yNew]);
  }

  return points;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
