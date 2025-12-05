import Grid, { Cell } from "@/components/grid";
import Quadrants from "@/components/quadrants";
import { View, Pressable, Text, StyleSheet, Platform } from "react-native";
import { testProblem } from "@/data/test-problem";
import { useEffect, useState } from "react";

import GestureCanvas from "@/components/gesture-canvas";
import { recognizeGesture } from "@/utils/recognize-gesture";

const ANY_KEY = "space";

type Omission = {
  label: string;
  row: number;
  col: number;
};

const renderCell = (
  label: string,
  keySequence: KeySequence,
  handleKeyPress: any,
) => {
  return function renderItem(item: number, i: number, j: number) {
    let value = item.toString();
    const fontSize = 38 - 6 * value.length;

    const omission = keySequence.find(
      (ks) => ks.label === label && ks.row === i && ks.col === j,
    );

    const ks = keySequence[0];

    const hide =
      (omission && ks !== omission) ||
      (omission && omission.show.split("").every((c) => c === "_"));

    const isTargetCell =
      ks && ks.label === label && ks.row === i && ks.col === j;

    if (isTargetCell) value = ks.show;
    else if (hide) value = "?";

    const isTerm =
      (label === "a" && ks.row === i) || (label === "b" && ks.col === j);
    let cellColor = "white";
    if (isTargetCell) cellColor = "violet";
    else if (hide) cellColor = "silver";
    else if (isTerm) cellColor = "violet";

    return (
      <Cell
        key={`cell-${i}-${j}`}
        style={{
          backgroundColor: cellColor,
          transition: "background-color 0.5s ease-in-out",
        }}
      >
        <Pressable onPress={() => handleKeyPress(value)}>
          <Text
            style={{
              fontSize,
              color: "black",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {value}
          </Text>
        </Pressable>
      </Cell>
    );
  };
};

export default function Index() {
  const problem = testProblem;
  const [keySequence, setKeySequence] = useState<KeySequence>(
    generateKeyPresses(problem),
  );

  useEffect(() => {
    console.log(keySequence[0]);
  }, [keySequence]);

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

  const deriveEquation = ({ label, row, col }: any) => {
    let aTerms = problem.a[row];
    let bTerms = problem.b.map((row) => row[col]);

    let pairs = [];

    for (let i = 0; i < aTerms.length; i++) {
      const aTerm = aTerms[i];
      const bTerm = bTerms[i];
      pairs.push(`${aTerm} x ${bTerm}`);
    }

    return pairs.join(" + ") + " =";
  };

  const handleHandwriting = (points: { x: number; y: number; t: number }[]) => {
    console.log(points);
    const value = recognizeGesture(points);
    console.log(value);
    handleKeyPress(value);
  };

  return (
    <View style={styles.container}>
      <Quadrants>
        <Text
          style={{ color: "white", fontFamily: "JetBrains Mono, monospace" }}
        >
          {deriveEquation(keySequence[0])}
        </Text>

        {/* Matrix B (top right) */}
        <Grid
          data={problem.b}
          renderItem={renderCell("b", keySequence, handleKeyPress)}
        />

        {/* Matrix A (bottom left) */}
        <Grid
          data={problem.a}
          renderItem={renderCell("a", keySequence, handleKeyPress)}
        />

        {/* Answer Matrix C (bottom right) */}
        <Grid
          data={problem.c}
          renderItem={renderCell("c", keySequence, handleKeyPress)}
        />
      </Quadrants>
      <GestureCanvas onStrokeEnd={handleHandwriting} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "black",
    alignItems: "center",
  },
  square: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "black",
  },
});

type KeySequenceState = {
  expectedKey: string;
  label: string;
  row: number;
  col: number;
  show: string;
};

type KeySequence = KeySequenceState[];

function generateKeyPresses(problem: typeof testProblem): KeySequence {
  const keySequence: KeySequence = [];

  for (const omission of problem.omissions) {
    const { matrix: label, row, col } = omission;
    const targetValue = problem[label as "a" | "b" | "c"][row][col];
    const representation = formatNumber(targetValue);

    representation.split("").forEach((char, i) => {
      const revealed =
        representation.slice(0, i) + "_".repeat(representation.length - i);

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
