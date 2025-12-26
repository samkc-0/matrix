import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";

type PreviewGestureProps = {
  tensor: tf.Tensor;
};

export default function PreviewGesture({ tensor }: PreviewGestureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    // [1, 28, 28, 1]
    const [, height, width] = tensor.shape;

    const flat = tensor.reshape([height, width]);
    const data = flat.dataSync();

    canvas.width = width;
    canvas.height = height;

    const imageData = ctx.createImageData(width, height);

    for (let i = 0; i < width * height; i++) {
      const clamped = Math.min(255, Math.floor(data[i] * 255));
      const v = 255 - clamped; // invert so ink is black on white
      imageData.data[i * 4 + 0] = v;
      imageData.data[i * 4 + 1] = v;
      imageData.data[i * 4 + 2] = v;
      imageData.data[i * 4 + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);

    flat.dispose();
  }, [tensor]);

  useEffect(() => {
    // Kick off a quick fade-out each time a new tensor arrives.
    setVisible(true);
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
    }
    fadeTimeoutRef.current = setTimeout(() => setVisible(false), 250);

    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, [tensor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        imageRendering: "pixelated", // 🔥 clave para MNIST-style
        width: "20vw",
        height: "20vw",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "white",
        opacity: visible ? 1 : 0,
        transition: "opacity 150ms ease-out",
      }}
    />
  );
}
