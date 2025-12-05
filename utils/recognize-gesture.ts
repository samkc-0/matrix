import type { PointInTime } from "@/components/gesture-canvas";

function normalizePoints(points: PointInTime[], dim = [28, 28]): PointInTime[] {
  const [w, h] = dim;
  const left = Math.min(...points.map((p) => p.x));
  const right = Math.max(...points.map((p) => p.x));
  const top = Math.min(...points.map((p) => p.y));
  const bottom = Math.max(...points.map((p) => p.y));
  return points.map((p) => {
    return {
      x: ((p.x - left) / (right - left)) * w,
      y: ((p.y - top) / (bottom - top)) * h,
      t: p.t,
    };
  });
}

export function recognizeGesture(points: PointInTime[]): string {
  return "3";
}
