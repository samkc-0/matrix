import { useEffect, useState, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";

import type { PointInTime } from "@/components/gesture-canvas";
import normalizePoints from "@/utils/normalize-points";
import rasterizeLine from "@/utils/rasterize-line";

type Status = "loading" | "ready" | "error";

export function useDigitClassifier() {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        await tf.ready();
        const modelUrl = `${window.location.origin}/models/mnist/model.json`;
        const loaded = await tf.loadLayersModel(modelUrl);
        if (mounted) {
          setModel(loaded);
          setStatus("ready");
        }
      } catch (e) {
        if (mounted) {
          setError(e as Error);
          setStatus("error");
        }
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);
  const classify = useCallback(
    (input: PointInTime[]) => {
      if (!model) {
        throw new Error("Model not loaded");
      }
      const gestureAsTensor = preprocessGesture(input);
      const prediction = model.predict(gestureAsTensor) as tf.Tensor;
      const digit = prediction.argMax(-1).dataSync()[0];

      prediction.dispose();
      return String(digit);
    },
    [model],
  );
  return { classify, status, error, modelLoaded: status === "ready" };
}
`
export async function loadMnistModel() {
  await tf.ready();
  console.log("doing fetch test");
  fetch("/models/mnist/group1-shard1of1.bin")
    .then((r) => r.arrayBuffer())
    .then((b) => console.log(b.byteLength % 4));
  if (Platform.OS === "web") {
    // Web: usa un modelo hospedado o uno dentro de /public
    const modelUrl = `${window.location.origin}/models/mnist/model.json`;
    console.log("modelUrl:", modelUrl);
    mnistModel = await tf.loadLayersModel(modelUrl);
    return;
  }
  // Native: backend + bundleResourceIO
  const tfRN = await import("@tensorflow/tfjs-react-native");
  await tfRN.setBackend("rn");
  await tf.ready();

  const { bundleResourceIO } = tfRN;
  const modelJson = require("../assets/models/mnist/model.json");
  const modelWeights = require("../assets/models/mnist/group1-shard1of1.bin");

  mnistModel = await tf.loadLayersModel(
    bundleResourceIO(modelJson, modelWeights),
  );
}

export function recognizeGesture(points: PointInTime[]): string {
  if (!mnistModel) {
    throw new Error("MNIST model not loaded");
  }
  const norm = normalizePoints(points);
  const image = Array.from({ length: 28 }, (_, i) => Array(28).fill(0));

  for (let i = 1; i < norm.length; i++) {
    const start = norm[i - 1];
    const end = norm[i];
    rasterizeLine(image, start, end);
  }

  const flat = image.flat();
  const input = tf.tensor(flat, [1, 28, 28, 1]).toFloat().div(255);

  const prediction = mnistModel.predict(input) as tf.Tensor;
  const digit = prediction.argMax(-1).dataSync()[0];

  return String(digit);
}

`


function preprocessGesture(points: PointInTime[]): tf.Tensor {
  const norm = normalizePoints(points);
  const image = Array.from({ length: 28 }, (_, i) => Array(28).fill(0));

  for (let i = 1; i < norm.length; i++) {
    const start = norm[i - 1];
    const end = norm[i];
    rasterizeLine(image, start, end);
  }

  const flat = image.flat();
  return tf.tensor(flat, [1, 28, 28, 1]).toFloat().div(255);
}

