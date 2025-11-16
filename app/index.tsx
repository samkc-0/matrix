import Grid, { Cell } from "@/components/grid";
import Quadrants from "@/components/quadrants";
import { View, Text, StyleSheet } from "react-native";
import { testProblem } from "@/data/test-problem";

import getDataShape from "@/utils/get-data-shape";

type Omission = {
  label: string;
  row: number;
  col: number;
  keySequence: KeySequence;
};

const renderCell = (label: string, omissions: Omission[]) => {
  omissions = omissions.filter((o) => o.label === label);
  return (item: number, i: number, j: number) => {
    let value = item.toString();
    const omission = omissions.find((o) => o.row === i && o.col === j);
    if (omission) {
      value = omission.keySequence[1].show;
    }
    const fontSize = 38 - 6 * value.length;
    return (
      <Cell
        key={`cell-${i}-${j}`}
        style={{ backgroundColor: omission ? "red" : "gold" }}
      >
        <Text
          style={{
            fontSize,
            color: "black",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          {value}
        </Text>
      </Cell>
    );
  };
};

export default function Index() {
  const problem = testProblem;
  const omissions = problem.omissions.map((o) => {
    return {
      label: o.matrix,
      row: o.row,
      col: o.col,
      keySequence: generateKeyPresses(problem[o.matrix], o.row, o.col),
    };
  });
  return (
    <View style={styles.container}>
      <Quadrants>
        <Text
          style={{ color: "gold", fontFamily: "JetBrains Mono, monospace" }}
        >
          (info)
        </Text>

        {/* Matrix B (top right) */}
        <Grid data={problem.b} renderItem={renderCell("b", omissions)} />

        {/* Matrix A (bottom left) */}
        <Grid data={problem.a} renderItem={renderCell("a", omissions)} />

        {/* Answer Matrix C (bottom right) */}
        <Grid data={problem.c} renderItem={renderCell("c", omissions)} />
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
  expect?: string;
  show: string;
};
type KeySequence = KeySequenceState[];

function generateKeyPresses(
  matrix: number[][],
  row: number,
  col: number,
): KeySequence {
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
  const keySequence: KeySequence = [];
  const blanked = "_".repeat(representation.length);
  representation.split("").forEach((char, i) => {
    if (i == 0) {
      const state = { show: "?", expect: char };
      keySequence.push(state);
    } else {
      const show = representation.slice(0, i) + blanked.slice(i);
      const expect = char;
      keySequence.push({ show, expect });
    }
  });
  const filledOutState = { show: representation, expect: undefined };
  return keySequence.concat(filledOutState);
}

function formatNumber(n: number): string {
  return Number.isInteger(n)
    ? n.toString()
    : parseFloat(n.toString()).toString();
}
