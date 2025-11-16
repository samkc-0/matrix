import Grid, { Cell } from "@/components/grid";
import Quadrants from "@/components/quadrants";
import { View, Pressable, Text, StyleSheet, Button } from "react-native";
import { testProblem } from "@/data/test-problem";
import { useState } from "react";

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
  return (item: number, i: number, j: number) => {
    let value = item.toString();
    const fontSize = 38 - 6 * value.length;
    const ks = keySequence[0];
    const isTargetCell =
      ks && ks.label === label && ks.row === i && ks.col === j;
    const color = isTargetCell ? "lime" : "gold";
    return (
      <Cell key={`cell-${i}-${j}`} style={{ backgroundColor: color }}>
        <Pressable onPress={() => handleKeyPress(value)}>
          <Text
            style={{
              fontSize,
              color: "black",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {isTargetCell ? ks.show : value}
          </Text>
        </Pressable>
      </Cell>
    );
  };
};

export default function Index() {
  const problem = testProblem;
  const [keySequence, setKeySequence] = useState(generateKeyPresses(problem));

  const handleKeyPress = (key: string) => {
    if (key === keySequence[0].expectedKey) {
      setKeySequence(keySequence.slice(1));
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
  omissions: Omission[];
};

type KeySequence = KeySequenceState[];

function generateKeyPresses(problem: typeof testProblem): KeySequence {
  const keySequence: KeySequence = [];
  for (const omission of problem.omissions) {
    const { matrix: label, row, col } = omission;
    const targetValue = problem[label as "a" | "b" | "c"][row][col];
    const representation = formatNumber(targetValue);
    representation.split("").forEach((char, i) => {
      keySequence.push({
        expectedKey: char,
        label,
        row,
        col,
        show: representation.slice(0, i),
        omissions: problem.omissions
          .slice(1)
          .map(({ matrix: label, row, col }) => {
            return {
              label,
              row,
              col,
            };
          }),
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
