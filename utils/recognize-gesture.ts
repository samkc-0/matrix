import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { bundleResourceIO } from "@tensorflow/tfjs-react-native";

import type { PointInTime } from "@/components/gesture-canvas";

import modelJson from "@/assets/models/mnist/model.json";
import modelWeights from "@/assets/models/mnist/group1-shard1of1.bin";

let mnistModel: tf.LayersModel | null = null;

export async function loadMnistModel() {
  await tf.ready();
  mnistModel = await tf.loadLayersModel(
    bundleResourceIO(modelJson, modelWeights),
  );
  console.log("MNIST model loaded");
}

function normalizePoints(points: PointInTime[]): PointInTime[] {
  const target = 20;
  const pad = 4;

  const left = Math.min(...points.map((p) => p.x));
  const right = Math.max(...points.map((p) => p.x));
  const top = Math.min(...points.map((p) => p.y));
  const bottom = Math.max(...points.map((p) => p.y));

  return points.map((p) => ({
    x: ((p.x - left) / (right - left)) * target + pad,
    y: ((p.y - top) / (bottom - top)) * target + pad,
    t: p.t,
  }));
}

export function recognizeGesture(points: PointInTime[]): string {
  if (!mnistModel) {
    throw new Error("MNIST model not loaded");
  }
  const norm = normalizePoints(points);
  const image = Array.from({ length: 28 }, (_, i) => Array(28).fill(0));

  for (let i = 1; i < norm.length; i++) {
    const start = norm[i - 1];
    const end = norm[i];
    rasterizeLine(image, start, end);
  }

  const flat = image.flat();
  const input = tf.tensor(flat, [1, 28, 28, 1]).toFloat().div(255);

  const prediction = mnistModel.predict(input) as tf.Tensor;
  const digit = prediction.argMax(-1).dataSync()[0];

  return String(digit);
}

function rasterizeLine(grid: number[][], p1: PointInTime, p2: PointInTime) {
  let x0 = Math.round(p1.x);
  let y0 = Math.round(p1.y);
  let x1 = Math.round(p2.x);
  let y1 = Math.round(p2.y);

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    if (x0 >= 0 && x0 < 28 && y0 >= 0 && y0 < 28) {
      grid[y0][x0] = 255; // stroke pixel
    }

    if (x0 === x1 && y0 === y1) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
}
