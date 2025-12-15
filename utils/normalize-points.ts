import { PointInTime } from "@/components/gesture-canvas";

export default function normalizePoints(points: PointInTime[]): PointInTime[] {
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
