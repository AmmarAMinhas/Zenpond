const canvas = document.getElementById("pondCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const ducks = [];
const capybaras = [];

let duckImage = new Image();
duckImage.src = "../assets/img/duck2.0.svg";

let capybaraImage = new Image();
capybaraImage.src = "../assets/img/float.svg";

let waterImage = new Image();
waterImage.src = "../assets/img/water.jpg";

const baseSpeed = 0.001;
const DUCK_SIZE = 60;
const CAPY_SIZE = 100;
const MIN_DISTANCE = DUCK_SIZE * 1.1;
const MAX_RADIUS_X = 180; // Reduced from 230
const MAX_RADIUS_Y = 100; // Reduced from 140

function getPondCenter() {
  return {
    x: canvas.width / 2,
    y: canvas.height / 2 + 40,
  };
}

function isOverlapping(x1, y1, r1, x2, y2, r2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < r1 + r2;
}

function loadDucks() {
  const numDucks = 10;
  const angleIncrement = (2 * Math.PI) / numDucks;
  let attempts = 0;

  for (let i = 0; i < numDucks; i++) {
    let angle, radiusX, radiusY, overlap;
    do {
      overlap = false;
      angle = angleIncrement * i + Math.random() * 0.3;
      radiusX = 80 + Math.random() * (MAX_RADIUS_X - 80); // Adjusted for smaller path
      radiusY = 60 + Math.random() * (MAX_RADIUS_Y - 60); // Adjusted for smaller path
      const newX = radiusX * Math.cos(angle);
      const newY = radiusY * Math.sin(angle);

      for (const other of ducks) {
        const otherX = other.radiusX * Math.cos(other.angle);
        const otherY = other.radiusY * Math.sin(other.angle);
        if (
          isOverlapping(
            newX,
            newY,
            DUCK_SIZE / 2,
            otherX,
            otherY,
            DUCK_SIZE / 2
          )
        ) {
          overlap = true;
          break;
        }
      }

      attempts++;
      if (attempts > 1000) break;
    } while (overlap);

    ducks.push({ angle, speed: baseSpeed, radiusX, radiusY });
  }
}

function drawPond() {
  const { x: cx, y: cy } = getPondCenter();

  ctx.beginPath();
  ctx.moveTo(cx - 250, cy - 100);
  ctx.bezierCurveTo(cx - 300, cy - 50, cx - 350, cy + 50, cx - 250, cy + 100);
  ctx.bezierCurveTo(cx - 200, cy + 150, cx - 100, cy + 180, cx, cy + 150);
  ctx.bezierCurveTo(cx + 100, cy + 180, cx + 200, cy + 150, cx + 250, cy + 100);
  ctx.bezierCurveTo(cx + 350, cy + 50, cx + 300, cy - 50, cx + 250, cy - 100);
  ctx.bezierCurveTo(cx + 200, cy - 150, cx, cy - 180, cx - 250, cy - 100);
  ctx.closePath();

  if (waterImage.complete && waterImage.naturalWidth !== 0) {
    const pattern = ctx.createPattern(waterImage, "repeat");
    ctx.fillStyle = pattern;
  } else {
    ctx.fillStyle = "#87CEEB";
  }

  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#2e7d32";
  ctx.stroke();
}

function drawAnimals() {
  const { x: cx, y: cy } = getPondCenter();

  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  ducks.forEach((duck) => {
    const x = cx + duck.radiusX * Math.cos(duck.angle);
    const y = cy + duck.radiusY * Math.sin(duck.angle);
    ctx.drawImage(duckImage, x, y, DUCK_SIZE, DUCK_SIZE);
  });

  capybaras.forEach((capy) => {
    const x = cx + capy.radiusX * Math.cos(capy.angle);
    const y = cy + capy.radiusY * Math.sin(capy.angle);
    ctx.drawImage(capybaraImage, x, y, CAPY_SIZE, CAPY_SIZE);
  });

  ctx.shadowColor = "transparent";
}

function updatePositions() {
  // Duck collisions with other ducks
  ducks.forEach((duck, i) => {
    duck.angle += duck.speed;

    for (let j = 0; j < ducks.length; j++) {
      if (i !== j) {
        const other = ducks[j];
        const dx =
          duck.radiusX * Math.cos(duck.angle) -
          other.radiusX * Math.cos(other.angle);
        const dy =
          duck.radiusY * Math.sin(duck.angle) -
          other.radiusY * Math.sin(other.angle);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MIN_DISTANCE) {
          const adjustment = (0.003 * (MIN_DISTANCE - dist)) / MIN_DISTANCE;
          duck.angle += adjustment;
          duck.speed = Math.min(duck.speed + 0.0003, 0.002);
        }
      }
    }

    // Duck collisions with capybaras
    capybaras.forEach((capy) => {
      const dx =
        duck.radiusX * Math.cos(duck.angle) -
        capy.radiusX * Math.cos(capy.angle);
      const dy =
        duck.radiusY * Math.sin(duck.angle) -
        capy.radiusY * Math.sin(capy.angle);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < (DUCK_SIZE + CAPY_SIZE) / 2) {
        const adjustment =
          (0.003 * ((DUCK_SIZE + CAPY_SIZE) / 2 - dist)) /
          ((DUCK_SIZE + CAPY_SIZE) / 2);
        duck.angle += adjustment;
        duck.speed = Math.min(duck.speed + 0.0003, 0.002);
      }
    });

    duck.radiusX = Math.min(Math.max(duck.radiusX, 60), MAX_RADIUS_X - 10);
    duck.radiusY = Math.min(Math.max(duck.radiusY, 60), MAX_RADIUS_Y - 10);
    duck.speed = Math.max(duck.speed - 0.00002, baseSpeed);
  });

  // Capybara collisions with other capybaras
  capybaras.forEach((capy, i) => {
    capy.angle += capy.speed;

    for (let j = 0; j < capybaras.length; j++) {
      if (i !== j) {
        const other = capybaras[j];
        const dx =
          capy.radiusX * Math.cos(capy.angle) -
          other.radiusX * Math.cos(other.angle);
        const dy =
          capy.radiusY * Math.sin(capy.angle) -
          other.radiusY * Math.sin(other.angle);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CAPY_SIZE) {
          const adjustment = (0.003 * (CAPY_SIZE - dist)) / CAPY_SIZE;
          capy.angle += adjustment;
          capy.speed = Math.min(capy.speed + 0.0003, 0.002);
        }
      }
    }

    // Capybara collisions with ducks
    ducks.forEach((duck) => {
      const dx =
        capy.radiusX * Math.cos(capy.angle) -
        duck.radiusX * Math.cos(duck.angle);
      const dy =
        capy.radiusY * Math.sin(capy.angle) -
        duck.radiusY * Math.sin(duck.angle);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < (DUCK_SIZE + CAPY_SIZE) / 2) {
        const adjustment =
          (0.003 * ((DUCK_SIZE + CAPY_SIZE) / 2 - dist)) /
          ((DUCK_SIZE + CAPY_SIZE) / 2);
        capy.angle += adjustment;
        capy.speed = Math.min(capy.speed + 0.0003, 0.002);
      }
    });

    capy.radiusX = Math.min(Math.max(capy.radiusX, 60), MAX_RADIUS_X - 10);
    capy.radiusY = Math.min(Math.max(capy.radiusY, 60), MAX_RADIUS_Y - 10);
    capy.speed = Math.max(capy.speed - 0.00002, baseSpeed);
  });
}

function replaceDuckWithCapybara() {
  if (ducks.length === 0) return;
  const { x: cx, y: cy } = getPondCenter();

  let maxTries = 20;
  while (maxTries-- > 0) {
    const randomIndex = Math.floor(Math.random() * ducks.length);
    const removedDuck = ducks[randomIndex];
    const newX = cx + removedDuck.radiusX * Math.cos(removedDuck.angle);
    const newY = cy + removedDuck.radiusY * Math.sin(removedDuck.angle);

    let overlap = false;
    for (const capy of capybaras) {
      const capyX = cx + capy.radiusX * Math.cos(capy.angle);
      const capyY = cy + capy.radiusY * Math.sin(capy.angle);
      if (
        isOverlapping(newX, newY, CAPY_SIZE / 2, capyX, capyY, CAPY_SIZE / 2)
      ) {
        overlap = true;
        break;
      }
    }

    if (!overlap) {
      ducks.splice(randomIndex, 1);
      capybaras.push({
        angle: removedDuck.angle,
        speed: baseSpeed,
        radiusX: removedDuck.radiusX,
        radiusY: removedDuck.radiusY,
      });
      break;
    }
  }
}

waterImage.onload = () => {
  animate();
};

loadDucks();
document
  .getElementById("cameraButton")
  .addEventListener("click", replaceDuckWithCapybara);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPond();
  drawAnimals();
  updatePositions();
  requestAnimationFrame(animate);
}

animate();

// 🎧 Lofi volume control
const audio = document.getElementById("lofiPlayer");
const slider = document.getElementById("volumeSlider");

if (audio && slider) {
  audio.volume = parseFloat(slider.value);

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {});
  }

  slider.addEventListener("input", () => {
    audio.volume = parseFloat(slider.value);
  });
}


// Modal logic
const modal = document.getElementById("fileModal");
const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const closeModal = document.querySelector(".close");

document.getElementById("cameraButton").addEventListener("click", () => {
  modal.style.display = "block";
});

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// 📸 Upload image and show processed result
uploadButton.addEventListener("click", async (event) => {
  event.preventDefault(); // prevent refresh

  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a JPG file.");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);

  console.log("📤 Sending image to Flask...");

  try {
    console.log("📤 Sending fetch request...");
    const response = await fetch("http://localhost:5000/process_image", {
      method: "POST",
      body: formData,
    });
  
    console.log("📬 Response status:", response.status);
  
    const rawText = await response.text();
    console.log("📦 Raw response text:", rawText);
  
    const data = JSON.parse(rawText); // ← do this manually to catch parsing issues
    console.log("✅ Parsed JSON:", data);
  
    const resultImageUrl = `data:image/jpeg;base64,${data.result_image}`;
    displayPopupImage(resultImageUrl);
    modal.style.display = "none";
  } catch (error) {
    console.error("❌ Upload failed:", error);
    // alert("Something went wrong during upload. Check console.");
  }
  
});



// 🖼️ Show result in popup
const imagePopup = document.getElementById("imagePopup");
const popupImage = document.getElementById("popupImage");
const closePopup = document.querySelector(".close-popup");
const downloadButton = document.getElementById("downloadButton");

function displayPopupImage(imageUrl) {
  popupImage.src = imageUrl;
  imagePopup.style.display = "block";

  downloadButton.onclick = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "processed-image.jpg";
    link.click();
  };
}

closePopup.addEventListener("click", () => {
  imagePopup.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === imagePopup) {
    imagePopup.style.display = "none";
  }
});

document.getElementById("Volume").addEventListener("click", () => {
  const iframe = document.getElementById("lofiYouTube");

  // Random start between 0 and 3600 seconds (1 hour)
  const randomStart = Math.floor(Math.random() * 3600);
});
