import {
  AlphaType,
  Canvas,
  ColorType,
  Image,
  Skia,
} from "@shopify/react-native-skia";
import * as tf from "@tensorflow/tfjs";
import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

const SIZE = 28;
const SCALE = 2;

type PreviewGestureProps = {
  tensor: tf.Tensor;
};

export default function PreviewGesture({ tensor }: PreviewGestureProps) {
  const [image, setImage] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // tensor shape: [1, 28, 28, 1]
      const data = await tensor.data(); // Float32Array, length 784

      const pixels = new Uint8Array(SIZE * SIZE * 4);

      for (let i = 0; i < SIZE * SIZE; i++) {
        const clamped = Math.max(0, Math.min(1, data[i])) * 255;
        const v = 255 - clamped; // invert so strokes become black on white

        pixels[i * 4 + 0] = v; // R
        pixels[i * 4 + 1] = v; // G
        pixels[i * 4 + 2] = v; // B
        pixels[i * 4 + 3] = 255; // A
      }

      const img = Skia.Image.MakeImage(
        {
          width: SIZE,
          height: SIZE,
          colorType: ColorType.RGBA_8888,
          alphaType: AlphaType.Opaque,
        },
        Skia.Data.fromBytes(pixels),
        SIZE * 4,
      );

      if (mounted) setImage(img);
    })();

    return () => {
      mounted = false;
    };
  }, [tensor]);

  if (!image) return null;

  return (
    <View style={styles.container}>
      <Canvas style={{ width: SIZE * SCALE, height: SIZE * SCALE }}>
        <Image
          image={image}
          x={0}
          y={0}
          width={SIZE * SCALE}
          height={SIZE * SCALE}
          fit="fill" // nearest-like when integer scaling
        />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    borderColor: "white",
    borderWidth: 2,
  },
});
