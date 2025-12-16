import rasterizeLine from "@/utils/rasterize-line";
import normalizePoints from "@/utils/normalize-points";
import type { PointInTime } from "@/types/point-in-time";
import * as tf from "@tensorflow/tfjs";

export default function preprocessGesture(points: PointInTime[]): tf.Tensor {
  const norm = normalizePoints(points);
  const image = new Float32Array(28 * 28);

  for (let i = 1; i < norm.length; i++) {
    const start = norm[i - 1];
    const end = norm[i];
    rasterizeLine(image, 28, start, end);
  }
  const centered = centerImage(image, 28);
  return tf.tensor(centered, [1, 28, 28, 1]).toFloat();
}

function centerImage(image: Float32Array, size: number): Float32Array {
  let sum = 0;
  let cx = 0;
  let cy = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = image[y * size + x];
      sum += v;
      cx += x * v;
      cy += y * v;
    }
  }

  if (sum === 0) return image;

  cx /= sum;
  cy /= sum;

  const dx = Math.round(size / 2 - cx);
  const dy = Math.round(size / 2 - cy);

  const out = new Float32Array(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= size || ny < 0 || ny >= size) continue;
      out[ny * size + nx] = image[y * size + x];
    }
  }

  return out;
}
