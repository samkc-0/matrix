import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Canvas from "react-native-canvas";

import preprocessGesture from "@/utils/preprocess-gesture";
import type PointInTime from "@/types/point-in-time";

type PreviewGestureProps = {
  gesture: PointInTime[];
};

export default function PreviewGesture({ gesture }: PreviewGestureProps) {
  const canvasRef = useRef<Canvas | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = async () => {
      // ⚠️ react-native-canvas needs explicit size
      const size = 28;
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const tensor = preprocessGesture(gesture);
      const [, height, width] = tensor.shape;

      const flat = tensor.reshape([height, width]);
      const data = await flat.data();

      const imageData = ctx.createImageData(width, height);

      for (let i = 0; i < data.length; i++) {
        const v = Math.min(255, Math.floor(data[i] * 255));
        const j = i * 4;

        imageData.data[j + 0] = v;
        imageData.data[j + 1] = v;
        imageData.data[j + 2] = v;
        imageData.data[j + 3] = 255;
      }

      ctx.putImageData(imageData, 0, 0);

      flat.dispose();
      tensor.dispose();
    };

    draw();
  }, [gesture]);

  return (
    <View style={styles.container}>
      <Canvas ref={canvasRef} style={styles.canvas} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute", // RN replacement for "fixed"
    top: 0,
    left: 0,
    padding: 4,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  canvas: {
    width: 140,   // upscale for MNIST-style preview
    height: 140,
  },
});

