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

  return tf.tensor(image, [1, 28, 28, 1]).toFloat().div(255);
}
