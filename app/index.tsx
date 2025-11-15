import Grid, { Cell } from "@/components/grid";
import Quadrants from "@/components/quadrants";
import { View, Text, StyleSheet } from "react-native";
import { testProblem } from "@/data/test-problem";

import getDataShape from "@/utils/get-data-shape";

const renderCell = (item: number) => {
  const fontSize = 38 - 6 * item.toString().length;
  return (
    <Cell>
      <Text
        style={{
          fontSize,
          color: "black",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        {item.toString()}
      </Text>
    </Cell>
  );
};

export default function Index() {
  const problem = testProblem;
  return (
    <View style={styles.container}>
      <Quadrants>
        <Text
          style={{ color: "gold", fontFamily: "JetBrains Mono, monospace" }}
        >
          (info)
        </Text>

        {/* Matrix B (top right) */}
        <Grid data={problem.b} renderItem={renderCell} />

        {/* Matrix A (bottom left) */}
        <Grid data={problem.a} renderItem={renderCell} />

        {/* Answer Matrix C (bottom right) */}
        <Grid data={problem.c} renderItem={renderCell} />
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

function generateKeyPresses(
  matrix: number[][],
  row: number,
  col: number,
): string[][] {
  const { rows, cols, isJagged } = getDataShape(matrix);
  if (isJagged) {
    throw new Error("All matrix rows must be the same length");
  }
  if (rows === 0 || cols === 0) {
    throw new Error("Matrix is empty");
  }
  if (row >= rows) {
    throw new Error(
      `Row index out of bounds: i=${row} for ${rows}x${cols} matrix`,
    );
  }
  if (col >= cols) {
    throw new Error(
      `Column index out of bounds: j=${col} for ${rows}x${cols} matrix`,
    );
  }

  const targetValue = matrix[row][col];
  const representation = formatNumber(targetValue);
  const keySequence: string[][] = [];
  const blanked = "_".repeat(representation.length);
  representation.split("").forEach((char, i) => {
    const next = blanked.slice(0, i) + char + blanked.slice(i + 1);
    keySequence.push([char, next]);
  });
  return keySequence;
}

function formatNumber(n: number): string {
  return Number.isInteger(n)
    ? n.toString()
    : parseFloat(n.toString()).toString();
}
