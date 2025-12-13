import type { PointInTime } from "@/components/gesture-canvas";
import * as tf from "@tensorflow/tfjs";
import { Platform } from "react-native";

function normalizePoints(points: PointInTime[]): PointInTime[] {
  const target = 20;
  const pad = 4;

  const left = Math.min(...points.map((p) => p.x));
  const right = Math.max(...points.map((p) => p.x));
  const top = Math.min(...points.map((p) => p.y));
  const bottom = Math.max(...points.map((p) => p.y));

  const w = Math.max(1, right - left);
  const h = Math.max(1, bottom - top);

  return points.map((p) => ({
    x: ((p.x - left) / w) * target + pad,
    y: ((p.y - top) / h) * target + pad,
    t: p.t,
  }));
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

let mnistModel: tf.LayersModel | null = null;

export async function loadMnistModel() {
  await tf.ready();
  console.log("doing fetch test");
  fetch("/models/mnist/group1-shard1of1.bin")
    .then((r) => r.arrayBuffer())
    .then((b) => console.log(b.byteLength % 4));
  if (Platform.OS === "web") {
    // Web: usa un modelo hospedado o uno dentro de /public
    const modelUrl = `${window.location.origin}/models/mnist/model.json`;
    console.log("modelUrl:", modelUrl);
    mnistModel = await tf.loadLayersModel(modelUrl);
    return;
  }
  // Native: backend + bundleResourceIO
  const tfRN = await import("@tensorflow/tfjs-react-native");
  await tfRN.setBackend("rn");
  await tf.ready();

  const { bundleResourceIO } = tfRN;
  const modelJson = require("../assets/models/mnist/model.json");
  const modelWeights = require("../assets/models/mnist/group1-shard1of1.bin");

  mnistModel = await tf.loadLayersModel(
    bundleResourceIO(modelJson, modelWeights),
  );
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
