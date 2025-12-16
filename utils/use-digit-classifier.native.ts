import { useEffect, useState, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { bundleResourceIO } from "@tensorflow/tfjs-react-native";

import type PointInTime from "@/types/point-in-time";
import preprocessGesture from "./preprocess-gesture";

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
