import type { PointInTime } from "@/types/point-in-time";

/**
 * Draw a line with thickness using Xiaolin Wu's algorithm variant
 */
function drawLineWithThickness(
  image: Float32Array,
  size: number,
  start: PointInTime,
  end: PointInTime,
  thickness: number,
): void {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.max(Math.ceil(dist * 2), 1);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = start.x + dx * t;
    const y = start.y + dy * t;

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

function drawStroke(
  image: Float32Array,
  size: number,
  start: PointInTime,
  end: PointInTime,
) {
  drawLineWithThickness(image, size, start, end, 1.5);
}

export default drawStroke;
