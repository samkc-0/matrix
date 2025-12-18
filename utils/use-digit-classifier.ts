import { useEffect, useState, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";

type Status = "loading" | "ready" | "error";

export default function useDigitClassifier() {
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
    (gestureAsTensor: tf.Tensor) => {
      if (!model) {
        throw new Error("Model not loaded");
      }
      const prediction = model.predict(gestureAsTensor) as tf.Tensor;

      console.log(prediction);

      const digit = prediction.argMax(-1).dataSync()[0];

      prediction.dispose();
      return String(digit);
    },
    [model],
  );
  return { classify, status, error, modelLoaded: status === "ready" };
}
