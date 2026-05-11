import { Evaluator } from "./calculator/Evaluator.js";
import { Parser } from "./calculator/Parser.js";


const imageInput = document.getElementById("imageInput");
const verticalFunctionInput = document.getElementById("verticalFunction");
const horizontalFunctionInput = document.getElementById("horizontalFunction");
const cipherButton = document.getElementById("cipherButton");
const resetButton = document.getElementById("resetButton");
const statusBox = document.getElementById("status");

const originalCanvas = document.getElementById("originalCanvas");
const cipherCanvas = document.getElementById("cipherCanvas");

const originalCtx = originalCanvas.getContext("2d");
const cipherCtx = cipherCanvas.getContext("2d");

let loadedImage = null;
let originalImageData = null;

imageInput.addEventListener("change", handleImageUpload);
cipherButton.addEventListener("click", handleCipherClick);
resetButton.addEventListener("click", resetCipherCanvas);

const evaluator = new Evaluator();
const parser = new Parser();

function setStatus(message, type = "default") {
  statusBox.textContent = message;
  statusBox.className = "status";

  if (type === "success") {
    statusBox.classList.add("success");
  }

  if (type === "error") {
    statusBox.classList.add("error");
  }
}

function handleImageUpload(event) {
  const file = event.target.files[0];

  if (!file) {
    setStatus("No file selected.", "error");
    return;
  }

  if (!file.type.startsWith("image/")) {
    setStatus("Please upload an image file.", "error");
    return;
  }

  loadImageFromFile(file)
    .then((image) => {
      loadedImage = image;

      drawOriginalImage(image);
      prepareCipherCanvas(image);

      cipherButton.disabled = false;
      resetButton.disabled = false;

      setStatus("Image uploaded successfully. You can now press Cipher.", "success");
    })
    .catch((error) => {
      console.error(error);
      setStatus("Could not load the image.", "error");
    });
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function setCanvasSize(canvas, width, height) {
  canvas.width = width;
  canvas.height = height;
}

function drawOriginalImage(image) {
  setCanvasSize(originalCanvas, image.width, image.height);

  originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
  originalCtx.drawImage(image, 0, 0);

  originalImageData = originalCtx.getImageData(
    0,
    0,
    originalCanvas.width,
    originalCanvas.height
  );
}

function prepareCipherCanvas(image) {
  setCanvasSize(cipherCanvas, image.width, image.height);

  cipherCtx.clearRect(0, 0, cipherCanvas.width, cipherCanvas.height);
  cipherCtx.drawImage(image, 0, 0);
}

function resetCipherCanvas() {
  if (!loadedImage) {
    setStatus("Upload an image first.", "error");
    return;
  }

  prepareCipherCanvas(loadedImage);
  setStatus("Cipher canvas was reset to the original image.", "success");
}

function handleCipherClick() {
  if (!loadedImage) {
    setStatus("Upload an image before ciphering.", "error");
    return;
  }

  const verticalFunction = verticalFunctionInput.value.trim();
  const horizontalFunction = horizontalFunctionInput.value.trim();

  const imageData = getCipherImageData();

  const changedImageData = applyCipherAlgorithm({
    imageData,
    width: cipherCanvas.width,
    height: cipherCanvas.height,
    verticalFunction,
    horizontalFunction,
  });

  putCipherImageData(changedImageData);

  setStatus(
    "Cipher function executed. Replace the placeholder algorithm with your own logic.",
    "success"
  );
}

function getCipherImageData() {
  return originalCtx.getImageData(
    0,
    0,
    originalCanvas.width,
    originalCanvas.height
  );
}

function putCipherImageData(imageData) {
  cipherCtx.putImageData(imageData, 0, 0);
}

function getPixelIndex(x, y, width) {
  return (y * width + x) * 4;
}

function getPixel(data, x, y, width) {
  const index = getPixelIndex(x, y, width);

  return {
    r: data[index],
    g: data[index + 1],
    b: data[index + 2],
    a: data[index + 3],
  };
}

function setPixel(data, x, y, width, pixel) {
  const index = getPixelIndex(x, y, width);

  data[index] = pixel.r;
  data[index + 1] = pixel.g;
  data[index + 2] = pixel.b;
  data[index + 3] = pixel.a;
}

function clampColorValue(value) {
  return Math.max(0, Math.min(255, value));
}

function applyCipherAlgorithm(options) {
  const { imageData, width, height, verticalFunction, horizontalFunction } = options;
  const data = imageData.data;

  let vertical_ast = parser.parse(verticalFunction);
  let horizontal_ast = parser.parse(horizontalFunction);
  try {
    
  } catch (error) {
    setStatus(error.message, "error");
    return imageData;
  }

  // 1. Horizontal cipher
  // PHP logic:
  // for each row i:
  // x = i
  // offset = horizontal_func(x)
  // rotate row by offset
  for (let y = 0; y < height; y++) {
    const offsetValue = evaluator.evaluate(horizontal_ast, { x: y });
    const offset = normalizeOffset(offsetValue, width);

    rotateRowRight(data, width, y, offset);
  }

  // 2. Vertical cipher
  // PHP logic:
  // for each column i:
  // x = i
  // offset = vertical_func(x)
  // rotate column by offset
  for (let x = 0; x < width; x++) {
    const offsetValue = evaluator.evaluate(vertical_ast, {x: x});
    const offset = normalizeOffset(offsetValue, height);

    if (offset === 0) {
      continue;
    }

    rotateColumnDown(data, width, height, x, offset);
  }

  return imageData;
}
function rotateRowRight(data, width, y, offset) {
  if (offset === 0) {
    return;
  }

  // This repeats your PHP three-reverse algorithm:
  // reverse last offset pixels
  // reverse full row
  // reverse from offset to end

  reverseRowSegment(data, width, y, width - offset, width - 1);
  reverseRowSegment(data, width, y, 0, width - 1);
  reverseRowSegment(data, width, y, offset, width - 1);
}

function rotateColumnDown(data, width, height, x, offset) {
  if (offset === 0) {
    return;
  }

  // Same idea, but vertically:
  // reverse bottom offset pixels
  // reverse full column
  // reverse from offset to bottom

  reverseColumnSegment(data, width, x, height - offset, height - 1);
  reverseColumnSegment(data, width, x, 0, height - 1);
  reverseColumnSegment(data, width, x, offset, height - 1);
}

function reverseRowSegment(data, width, y, left, right) {
  while (left < right) {
    swapPixels(data, left, y, right, y, width);
    left++;
    right--;
  }
}

function reverseColumnSegment(data, width, x, top, bottom) {
  while (top < bottom) {
    swapPixels(data, x, top, x, bottom, width);
    top++;
    bottom--;
  }
}

function swapPixels(data, x1, y1, x2, y2, width) {
  const index1 = getPixelIndex(x1, y1, width);
  const index2 = getPixelIndex(x2, y2, width);

  const r = data[index1];
  const g = data[index1 + 1];
  const b = data[index1 + 2];
  const a = data[index1 + 3];

  data[index1] = data[index2];
  data[index1 + 1] = data[index2 + 1];
  data[index1 + 2] = data[index2 + 2];
  data[index1 + 3] = data[index2 + 3];

  data[index2] = r;
  data[index2 + 1] = g;
  data[index2 + 2] = b;
  data[index2 + 3] = a;
}

function normalizeOffset(value, size) {
  let offset = Math.trunc(Number(value));

  if (!Number.isFinite(offset)) {
    return 0;
  }

  // Correct cyclic modulo.
  // Example:
  // -1 with size 10 becomes 9
  // 11 with size 10 becomes 1
  offset = ((offset % size) + size) % size;

  return offset;
}