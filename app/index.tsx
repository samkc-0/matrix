import { View, Text, StyleSheet, Platform } from "react-native";
import { useEffect, useState, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";

import type PointInTime from "@/types/point-in-time";
import type KeySequence from "@/types/key-sequence";

import { testProblem } from "@/data/test-problem";
import Grid from "@/components/grid";
import Quadrants from "@/components/quadrants";
import renderCell from "@/utils/render-cell";
import GestureCanvas from "@/components/gesture-canvas";
import useDigitClassifier from "@/utils/use-digit-classifier";
import GesturePreview from "@/components/preview-gesture";
import preprocessGesture from "@/utils/preprocess-gesture";

export default function Index() {
  const problem = testProblem;

  const [keySequence, setKeySequence] = useState<KeySequence>(
    generateKeyPresses(problem),
  );

  const [previewGesture, setPreviewGesture] = useState<tf.Tensor | null>(null);

  const digitClassifier = useDigitClassifier();

  const handleKeyPress = useCallback((key: string) => {
    console.log("detected key press:", key);
    console.log("want:", keySequence[0].expectedKey);
    setKeySequence((prev) => {
      if (prev.length === 0) return prev;
      if (prev[0].expectedKey === key) {
        return prev.slice(1);
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const onKeyDown = (e: KeyboardEvent) => {
      handleKeyPress(e.key);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [handleKeyPress]);

  const formatEquation = ({ row, col }: Required<KeySequence[number]>) => {
    let aTerms = problem.a[row];
    let bTerms = problem.b.map((row) => row[col]);

    let pairs = [];

    for (let i = 0; i < aTerms.length; i++) {
      const aTerm = aTerms[i];
      const bTerm = bTerms[i];
      pairs.push(`${aTerm}×${bTerm}`);
    }

    return pairs.join(" + ") + " =";
  };

  const handleStrokeEnd = async (points: PointInTime[]) => {
    // TODO: might want to add synthetic data for - and .
    const gestureAsTensor = preprocessGesture(points);
    setPreviewGesture(gestureAsTensor);
    if (digitClassifier.modelLoaded) {
      const digit = digitClassifier.classify(gestureAsTensor);
      console.log(digit);
      handleKeyPress(String(digit));
    }
    gestureAsTensor.dispose();
  };

  const renderA = useCallback(renderCell("a", keySequence), [keySequence]);
  const renderB = useCallback(renderCell("b", keySequence), [keySequence]);
  const renderC = useCallback(renderCell("c", keySequence), [keySequence]);

  if (digitClassifier.error) {
    return <Text>Error: {digitClassifier.error.message}</Text>;
  }
  if (!digitClassifier.modelLoaded) {
    return <Text>Loading...(model status: {digitClassifier.status})</Text>;
  }

  if (keySequence.length === 0) {
    return (
      <View style={styles.container}>
        <Text
          style={{ color: "white", fontFamily: "JetBrains Mono, monospace" }}
        >
          All done!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Quadrants>
        <Text
          style={{ color: "white", fontFamily: "JetBrains Mono, monospace" }}
        >
          {formatEquation(keySequence[0])}
        </Text>

        {/* Matrix B (top right) */}
        <Grid data={problem.b} renderItem={renderB} />

        {/* Matrix A (bottom left) */}
        <Grid data={problem.a} renderItem={renderA} />

        {/* Answer Matrix C (bottom right) */}
        <Grid data={problem.c} renderItem={renderC} />
      </Quadrants>
      <GestureCanvas onStrokeEnd={handleStrokeEnd} />
      {previewGesture && <GesturePreview tensor={previewGesture} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxHeight: "100%",
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  square: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "black",
  },
});
function generateKeyPresses(
  problem: typeof testProblem,
  blankChar = "",
): KeySequence {
  const keySequence: KeySequence = [];

  for (const omission of problem.omissions) {
    const { matrix: label, row, col } = omission;
    const targetValue = problem[label as "a" | "b" | "c"][row][col];
    const representation = formatNumber(targetValue);

    representation.split("").forEach((char, i) => {
      const revealed =
        representation.slice(0, i) +
        blankChar.repeat(representation.length - i);

      keySequence.push({
        expectedKey: char,
        label,
        row,
        col,
        show: revealed,
      });
    });
  }

  return keySequence;
}

function formatNumber(n: number): string {
  return Number.isInteger(n)
    ? n.toString()
    : parseFloat(n.toString()).toString();
}
