import { useEffect, useState, useCallback } from "react";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-react-native";
import * as tf from "@tensorflow/tfjs";
import { bundleResourceIO } from "@tensorflow/tfjs-react-native";

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
        await tf.setBackend("rn-webgl");
        const modelJson = require("@/assets/models/mnist/model.json");
        const modelWeights = require("@/assets/models/mnist/group1-shard1of1.bin");
        const loaded = await tf.loadLayersModel(
          bundleResourceIO(modelJson, modelWeights),
        );

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

      return tf.tidy(() => {
        const prediction = model.predict(gestureAsTensor) as tf.Tensor;
        const digitTensor = prediction.argMax(-1);
        const digit = digitTensor.dataSync()[0];

        prediction.dispose();
        return String(digit);
      });
    },
    [model],
  );
  return { classify, status, error, modelLoaded: status === "ready" };
}
