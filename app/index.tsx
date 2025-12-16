import { View, Text, StyleSheet, Platform } from "react-native";
import { useEffect, useState, useCallback } from "react";

import type PointInTime from "@/types/point-in-time";
import type KeySequence from "@/types/key-sequence";

import { testProblem } from "@/data/test-problem";
import Grid from "@/components/grid";
import Quadrants from "@/components/quadrants";
import renderCell from "@/utils/render-cell";
import GestureCanvas from "@/components/gesture-canvas";
import useDigitClassifier from "@/utils/use-digit-classifier";

export default function Index() {
  const problem = testProblem;

  const [keySequence, setKeySequence] = useState<KeySequence>(
    generateKeyPresses(problem),
  );

  const digitClassifier = useDigitClassifier();

  const handleKeyPress = (key: string) => {
    if (keySequence.length === 0) return;
    if (key === keySequence[0].expectedKey) {
      const updatedKeySequence = keySequence.slice(1);
      console.log(updatedKeySequence[0]);
      setKeySequence(() => updatedKeySequence);
    }
  };

  if (Platform.OS === "web") {
    useEffect(() => {
      document.addEventListener("keydown", (e) => {
        handleKeyPress(e.key);
      });
      return () => {
        document.removeEventListener("keydown", (e) => {
          handleKeyPress(e.key);
        });
      };
    }, [keySequence]);
  }

  const formatEquation = ({ label, row, col }: any) => {
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
    // TODO: rasterize thick lines with the good algo
    // also make a train.sh script that trains and copies the weights
    // also might want to add synthetic data for - and .
    if (digitClassifier.modelLoaded) {
      const digit = digitClassifier.classify(points);
      console.log(digit);
    }
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
