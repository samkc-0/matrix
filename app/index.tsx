import Grid, { Cell } from "@/components/grid";
import Quadrants from "@/components/quadrants";
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  Button,
  Platform,
} from "react-native";
import { testProblem } from "@/data/test-problem";
import { useEffect, useState } from "react";

import getDataShape from "@/utils/get-data-shape";
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
      setKeySequence(updatedKeySequence);
    }
  };

  return (
    <View style={styles.container}>
      <Quadrants>
        <Text
          style={{ color: "gold", fontFamily: "JetBrains Mono, monospace" }}
        >
          <Button onPress={() => handleKeyPress(ANY_KEY)} title={ANY_KEY} />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <Button
              key={`key-${n}`}
              onPress={() => handleKeyPress(n.toString())}
              title={n.toString()}
            />
          ))}
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
