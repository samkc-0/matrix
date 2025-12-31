import { useEffect, useState, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";

type Status = "loading" | "ready" | "error";

let cachedModel: tf.LayersModel | null = null;
let cachedError: Error | null = null;
let modelLoadPromise: Promise<tf.LayersModel> | null = null;

export default function useDigitClassifier() {
  const [model, setModel] = useState<tf.LayersModel | null>(cachedModel);
  const [status, setStatus] = useState<Status>(
    cachedModel ? "ready" : cachedError ? "error" : "loading",
  );
  const [error, setError] = useState<Error | null>(cachedError);

  useEffect(() => {
    let mounted = true;

    const updateState = (
      nextModel: tf.LayersModel | null,
      nextStatus: Status,
      nextError: Error | null,
    ) => {
      if (!mounted) return;
      setModel(nextModel);
      setStatus(nextStatus);
      setError(nextError);
    };

    if (cachedModel) {
      updateState(cachedModel, "ready", null);
      return () => {
        mounted = false;
      };
    }

    if (cachedError) {
      updateState(null, "error", cachedError);
      return () => {
        mounted = false;
      };
    }

    if (!modelLoadPromise) {
      modelLoadPromise = (async () => {
        await tf.ready();
        const modelUrl = `${window.location.origin}/models/mnist/model.json`;
        return tf.loadLayersModel(modelUrl);
      })();
    }

    modelLoadPromise
      .then((loaded) => {
        cachedModel = loaded;
        cachedError = null;
        updateState(loaded, "ready", null);
      })
      .catch((loadErr) => {
        cachedModel = null;
        cachedError = loadErr as Error;
        modelLoadPromise = null;
        updateState(null, "error", loadErr as Error);
      });

    return () => {
      mounted = false;
    };
  }, []);
  const classify = useCallback(
    (gestureAsTensor: tf.Tensor) => {
      const activeModel = model ?? cachedModel;
      if (!activeModel) {
        throw new Error("Model not loaded");
      }
      const prediction = activeModel.predict(gestureAsTensor) as tf.Tensor;

      console.log(prediction);

      const label = prediction.argMax(-1).dataSync()[0];

      prediction.dispose();
      return label;
    },
    [model],
  );
  return { classify, status, error, modelLoaded: status === "ready" };
}
