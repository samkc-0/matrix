import type { PointInTime } from "@/components/gesture-canvas";

export default function rasterizeLine(
  grid: number[][],
  p1: PointInTime,
  p2: PointInTime,
) {
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
