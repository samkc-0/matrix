import Grid from "@/components/grid";
import Quadrants from "@/components/quadrants";
import { View, Text, StyleSheet, Platform } from "react-native";
import { testProblem } from "@/data/test-problem";
import { useEffect, useState, useRef, useCallback } from "react";

import type PointInTime from "@/types/point-in-time";
import type KeySequence from "@/types/key-sequence";

import GestureCanvas from "@/components/gesture-canvas";
import useDigitClassifier from "@/utils/use-digit-classifier";

export default function Index() {
  const problem = testProblem;
  const [keySequence, setKeySequence] = useState<KeySequence>(
    generateKeyPresses(problem),
  );
  const [modelLoaded, setModelLoaded] = useState(false);

  const [prediction, setPrediction] = useState<{
    digit: number;
    confidence: number;
  } | null>(null);

  useEffect(() => {}, []);

  if (Platform.OS === "web") {
    useEffect(() => {
      document.addEventListener("keypress", (e) => {
        handleKeyPress(e.key);
      });

      return () => {
        document.removeEventListener("keypress", (e) => {
          handleKeyPress(e.key);
        });
      };
    }, [keySequence]);
  }

  const handleKeyPress = (key: string) => {
    if (keySequence.length === 0) return;
    if (key === keySequence[0].expectedKey) {
      const updatedKeySequence = keySequence.slice(1);
      console.log(updatedKeySequence[0]);
      setKeySequence(() => updatedKeySequence);
    }
  };

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
    if (!isClassifierReady() || points.length < 5) return;

    try {
      const result = await classifyDigitSimple(
        points.map((p) => ({ x: p.x, y: p.y })),
      );
      setPrediction(result);
    } catch (error) {
      console.error("Classification error:", error);
    }
  };

  const renderA = useCallback(renderCell("a", keySequence), [keySequence]);
  const renderB = useCallback(renderCell("b", keySequence), [keySequence]);
  const renderC = useCallback(renderCell("c", keySequence), [keySequence]);

  if (!modelLoaded) {
    return <Text>Loading...</Text>;
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
