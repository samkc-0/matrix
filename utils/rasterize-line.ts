import type { PointInTime } from "@/types/point-in-time";

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

export default drawLineWithThickness;
