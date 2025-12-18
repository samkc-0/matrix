import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Canvas from "react-native-canvas";

type PreviewGestureProps = {
  tensor: tf.Tensor;
};

export default function PreviewGesture({ tensor }: PreviewGestureProps) {
  const canvasRef = useRef<Canvas | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = async () => {
      const size = 28;
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const [, height, width] = tensor.shape;

      const flat = tensor.reshape([height, width]);
      const data = await flat.data();

      const buffer = new Uint8ClampedArray(width * height);

      for (let i = 0; i < data.length; i++) {
        const v = Math.min(255, Math.floor(data[i] * 255));
        buffer[i * 4 + 0] = v;
        buffer[i * 4 + 1] = v;
        buffer[i * 4 + 2] = v;
        buffer[i * 4 + 3] = 255;
      }

      const imageData = new ImageData(buffer, width, height);
      ctx.putImageData(imageData, 0, 0);

      flat.dispose();
      tensor.dispose();
    };

    draw();
  }, [tensor]);

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
    width: 140, // upscale for MNIST-style preview
    height: 140,
  },
});
