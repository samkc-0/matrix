import { useEffect, useRef } from "react";
import preprocessGesture from "@/utils/preprocess-gesture";
import type { Tensor } from "@tensorflow/tfjs";
import type PointInTime from "@/types/point-in-time";

type PreviewGestureProps = {
  gesture: PointInTime[];
};

export default function PreviewGesture({ gesture }: PreviewGestureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const tensor = preprocessGesture(gesture);

    // [1, 28, 28, 1]
    const [, height, width] = tensor.shape;

    const flat = tensor.reshape([height, width]);
    const data = flat.dataSync();

    canvas.width = width;
    canvas.height = height;

    const imageData = ctx.createImageData(width, height);

    for (let i = 0; i < width * height; i++) {
      const v = Math.min(255, Math.floor(data[i] * 255));
      imageData.data[i * 4 + 0] = v;
      imageData.data[i * 4 + 1] = v;
      imageData.data[i * 4 + 2] = v;
      imageData.data[i * 4 + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);

    flat.dispose();
    tensor.dispose();
  }, [gesture]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: "1px solid #ccc",
        imageRendering: "pixelated", // 🔥 clave para MNIST-style
        width: "10%",
        height: "10%",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "white",
      }}
    />
  );
}
