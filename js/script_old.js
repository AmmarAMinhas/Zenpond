const canvas = document.getElementById("pondCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const ducks = [];
const capybaras = [];
let duckImage = new Image();
duckImage.src = "../assets/img/duck2.0.svg";
let capybaraImage = new Image();
capybaraImage.src = "../assets/img/capybara03.png";
const baseSpeed = 0.0005;
const maxRadiusX = 280;
const maxRadiusY = 160;

// Load initial ducks with random but evenly distributed positions
function loadDucks() {
  const numDucks = 10;
  const angleIncrement = (2 * Math.PI) / numDucks; // Evenly spaced angles

  for (let i = 0; i < numDucks; i++) {
    let angle = angleIncrement * i + (Math.random() - 0.5) * 0.2; // Slight randomness
    let radiusX = 100 + Math.random() * 180; // Random radiusX
    let radiusY = 80 + Math.random() * 80; // Random radiusY
    ducks.push({ angle, speed: baseSpeed, radiusX, radiusY });
  }
}

// Draw the pond with a custom shape
function drawPond() {
  const pondCenterX = canvas.width / 2;
  const pondCenterY = canvas.height * 0.7;

  // Create a gradient for the pond
  const gradient = ctx.createRadialGradient(
    pondCenterX,
    pondCenterY,
    50,
    pondCenterX,
    pondCenterY,
    300
  );
  gradient.addColorStop(0, "#87CEEB"); // Light blue at the center
  gradient.addColorStop(1, "#4682B4"); // Darker blue at the edges

  ctx.fillStyle = gradient;

  // Draw a custom, irregular shape for the pond
  ctx.beginPath();
  ctx.moveTo(pondCenterX - 250, pondCenterY - 100); // Start point

  // Create irregular edges using Bezier curves
  ctx.bezierCurveTo(
    pondCenterX - 300,
    pondCenterY - 50, // Control point 1
    pondCenterX - 350,
    pondCenterY + 50, // Control point 2
    pondCenterX - 250,
    pondCenterY + 100 // End point
  );
  ctx.bezierCurveTo(
    pondCenterX - 200,
    pondCenterY + 150, // Control point 1
    pondCenterX - 100,
    pondCenterY + 180, // Control point 2
    pondCenterX,
    pondCenterY + 150 // End point
  );
  ctx.bezierCurveTo(
    pondCenterX + 100,
    pondCenterY + 180, // Control point 1
    pondCenterX + 200,
    pondCenterY + 150, // Control point 2
    pondCenterX + 250,
    pondCenterY + 100 // End point
  );
  ctx.bezierCurveTo(
    pondCenterX + 350,
    pondCenterY + 50, // Control point 1
    pondCenterX + 300,
    pondCenterY - 50, // Control point 2
    pondCenterX + 250,
    pondCenterY - 100 // End point
  );
  ctx.bezierCurveTo(
    pondCenterX + 200,
    pondCenterY - 150, // Control point 1
    pondCenterX,
    pondCenterY - 180, // Control point 2
    pondCenterX - 250,
    pondCenterY - 100 // End point
  );

  ctx.closePath(); // Close the path
  ctx.fill(); // Fill the pond with the gradient
}

// Draw ducks and capybaras
function drawAnimals() {
  const pondCenterX = canvas.width / 2;
  const pondCenterY = canvas.height * 0.7;

  ducks.forEach((duck) => {
    let x = pondCenterX + duck.radiusX * Math.cos(duck.angle);
    let y = pondCenterY + duck.radiusY * Math.sin(duck.angle);

    // Add shadow for depth
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.drawImage(duckImage, x, y, 50, 50);
  });

  capybaras.forEach((capybara) => {
    let x = pondCenterX + capybara.radiusX * Math.cos(capybara.angle);
    let y = pondCenterY + capybara.radiusY * Math.sin(capybara.angle);

    // Add shadow for depth
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.drawImage(capybaraImage, x, y, 60, 60);
  });

  // Reset shadow
  ctx.shadowColor = "transparent";
}

// Update positions of ducks and capybaras
function updatePositions() {
  const pondCenterX = canvas.width / 2;
  const pondCenterY = canvas.height * 0.7;

  // Update ducks
  ducks.forEach((duck, i) => {
    duck.angle += duck.speed;

    // Avoid other ducks (original logic)
    ducks.forEach((otherDuck, j) => {
      if (i !== j) {
        let dx =
          duck.radiusX * Math.cos(duck.angle) -
          otherDuck.radiusX * Math.cos(otherDuck.angle);
        let dy =
          duck.radiusY * Math.sin(duck.angle) -
          otherDuck.radiusY * Math.sin(otherDuck.angle);
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 50) {
          let adjustment = (0.005 * (50 - distance)) / 50;
          duck.angle += adjustment;
          duck.speed = baseSpeed;
        }
      }
    });

    // Avoid capybaras (original logic)
    capybaras.forEach((capy) => {
      let dx =
        duck.radiusX * Math.cos(duck.angle) -
        capy.radiusX * Math.cos(capy.angle);
      let dy =
        duck.radiusY * Math.sin(duck.angle) -
        capy.radiusY * Math.sin(capy.angle);
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 50) {
        let adjustment = (0.005 * (50 - distance)) / 50;
        duck.angle += adjustment;
        duck.speed = baseSpeed;
      }
    });
  });

  // Update capybaras
  capybaras.forEach((capybara, i) => {
    capybara.angle += capybara.speed;

    // Avoid other capybaras (original logic)
    capybaras.forEach((otherCapy, j) => {
      if (i !== j) {
        let dx =
          capybara.radiusX * Math.cos(capybara.angle) -
          otherCapy.radiusX * Math.cos(otherCapy.angle);
        let dy =
          capybara.radiusY * Math.sin(capybara.angle) -
          otherCapy.radiusY * Math.sin(otherCapy.angle);
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 50) {
          let adjustment = (0.005 * (50 - distance)) / 50;
          capybara.angle += adjustment;
          capybara.speed = baseSpeed;
        }
      }
    });

    // Avoid ducks (original logic)
    ducks.forEach((duck) => {
      let dx =
        capybara.radiusX * Math.cos(capybara.angle) -
        duck.radiusX * Math.cos(duck.angle);
      let dy =
        capybara.radiusY * Math.sin(capybara.angle) -
        duck.radiusY * Math.sin(duck.angle);
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 50) {
        let adjustment = (0.005 * (50 - distance)) / 50;
        capybara.angle += adjustment;
        capybara.speed = baseSpeed;
      }
    });
  });
}

// Replace a random duck with a capybara
function replaceDuckWithCapybara() {
  if (ducks.length > 0) {
    // Randomly select a duck to replace
    const randomIndex = Math.floor(Math.random() * ducks.length);
    const removedDuck = ducks.splice(randomIndex, 1)[0]; // Remove the duck at the random index

    // Add a capybara in its place
    capybaras.push({
      angle: removedDuck.angle,
      speed: baseSpeed,
      radiusX: removedDuck.radiusX, // Keep the same radius
      radiusY: removedDuck.radiusY, // Keep the same radius
    });
  }
}

// Initialize
loadDucks();
document
  .getElementById("cameraButton")
  .addEventListener("click", replaceDuckWithCapybara);

// Animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPond();
  drawAnimals();
  updatePositions();
  requestAnimationFrame(animate);
}

animate();
