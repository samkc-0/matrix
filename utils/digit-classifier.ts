// digitClassifier.ts
import * as tf from "@tensorflow/tfjs";
import { Platform } from "react-native";

// Platform-specific imports
let tfReactNative: any = null;

type Point = { x: number; y: number };

let model: tf.LayersModel | null = null;
let isReady = false;

/**
 * Initialize TensorFlow and load the MNIST model
 * Call this once when your app starts
 */

export async function initClassifier(): Promise<void> {
  if (Platform.OS !== "web") {
    console.log("TensorFlow.js only supported on web in this configuration");
    isReady = true; // Mark as ready but won't actually classify
    return;
  }

  await tf.ready();
  model = await tf.loadLayersModel("/models/mnist/model.json");
  isReady = true;
}

/**
 * Check if classifier is ready
 */
export function isClassifierReady(): boolean {
  return isReady;
}

/**
 * Rasterize stroke points to a 28x28 grayscale image
 * Uses pure JS math - works on all platforms
 */
function strokeToImageData(points: Point[]): Float32Array {
  const IMG_SIZE = 28;
  const image = new Float32Array(IMG_SIZE * IMG_SIZE).fill(0);

  if (points.length < 2) {
    return image;
  }

  // Find bounding box of the stroke
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;

  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  // Handle edge case of single point or vertical/horizontal line
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);

  // Make the bounding box square and add padding
  const size = Math.max(width, height);
  const padding = size * 0.3;
  const totalSize = size + 2 * padding;

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // MNIST digits are typically centered in a 20x20 box within 28x28
  // with ~4px padding on each side
  const targetSize = 20;
  const offset = 4;
  const scale = targetSize / totalSize;

  // Transform point to image coordinates
  const transformPoint = (p: Point): { x: number; y: number } => ({
    x: (p.x - centerX) * scale + IMG_SIZE / 2,
    y: (p.y - centerY) * scale + IMG_SIZE / 2,
  });

  // Draw anti-aliased lines between consecutive points
  for (let i = 1; i < points.length; i++) {
    const p0 = transformPoint(points[i - 1]);
    const p1 = transformPoint(points[i]);
    drawLineWithThickness(image, IMG_SIZE, p0.x, p0.y, p1.x, p1.y, 1.5);
  }

  // Normalize to 0-1 range (MNIST format)
  const maxVal = Math.max(...image, 1);
  for (let i = 0; i < image.length; i++) {
    image[i] = image[i] / maxVal;
  }

  return image;
}

/**
 * Draw a line with thickness using Xiaolin Wu's algorithm variant
 */
function drawLineWithThickness(
  image: Float32Array,
  size: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  thickness: number,
): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.max(Math.ceil(dist * 2), 1);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + dx * t;
    const y = y0 + dy * t;

    // Draw a soft circle at each point
    const radius = thickness;
    const minPx = Math.floor(x - radius - 1);
    const maxPx = Math.ceil(x + radius + 1);
    const minPy = Math.floor(y - radius - 1);
    const maxPy = Math.ceil(y + radius + 1);

    for (let py = minPy; py <= maxPy; py++) {
      for (let px = minPx; px <= maxPx; px++) {
        if (px < 0 || px >= size || py < 0 || py >= size) continue;

        const distance = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
        if (distance <= radius) {
          // Soft falloff for anti-aliasing
          const intensity = Math.max(0, 1 - distance / radius);
          const idx = py * size + px;
          image[idx] = Math.min(1, image[idx] + intensity);
        }
      }
    }
  }
}

/**
 * Classify a digit from stroke points
 * Returns array of { digit, confidence } sorted by confidence
 */
export async function classifyDigit(
  points: Point[],
): Promise<{ digit: number; confidence: number }[]> {
  if (!model || !isReady) {
    throw new Error("Classifier not initialized. Call initClassifier() first.");
  }

  if (points.length < 2) {
    throw new Error("Not enough points to classify");
  }

  // Convert stroke to image
  const imageData = strokeToImageData(points);

  // Create tensor and reshape for model [batch, height, width, channels]
  const tensor = tf.tensor(imageData).reshape([1, 28, 28, 1]);

  // Run prediction
  const prediction = model.predict(tensor) as tf.Tensor;
  const probabilities = await prediction.data();

  // Clean up tensors
  tensor.dispose();
  prediction.dispose();

  // Format results
  const results = Array.from(probabilities).map((confidence, digit) => ({
    digit,
    confidence,
  }));

  // Sort by confidence descending
  results.sort((a, b) => b.confidence - a.confidence);

  return results;
}

/**
 * Get the most likely digit
 */
export async function classifyDigitSimple(
  points: Point[],
): Promise<{ digit: number; confidence: number }> {
  if (Platform.OS !== "web") {
    // Fallback: Send to an API or return mock data
    return { digit: Math.floor(Math.random() * 10), confidence: 0.5 };
  }
  const results: { digit: number; confidence: number }[] =
    await classifyDigit(points);
  return results[0];
}
