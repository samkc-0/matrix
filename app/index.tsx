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
  keySequence: KeySequence;
};

const renderCell = (
  label: string,
  omissions: Omission[],
  handleKeyPress: any,
) => {
  return (item: number, i: number, j: number) => {
    let value = item.toString();
    const omission = omissions.find(
      (o) => o.label === label && o.row === i && o.col === j,
    );
    if (omission) {
      value = omission.keySequence[0].show;
    }
    const fontSize = 38 - 6 * value.length;
    let color = "gold";
    if (omission) {
      color = "red";
    }
    if (
      label === omissions[0].label &&
      i == omissions[0].row &&
      j == omissions[0].col
    ) {
      color = "lime";
    }
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
            {value}
          </Text>
        </Pressable>
      </Cell>
    );
  };
};

export default function Index() {
  const problem = testProblem;
  const [omissions, setOmissions] = useState<Omission[]>(
    problem.omissions.map((o) => {
      return {
        label: o.matrix,
        row: o.row,
        col: o.col,
        keySequence: generateKeyPresses(
          problem[o.matrix as "a" | "b" | "c"],
          o.row,
          o.col,
        ),
      };
    }),
  );

  const [expectedKey, setExpectedKey] = useState(() => {
    console.log(omissions);
    return omissions[0].keySequence[0].expect || ANY_KEY;
  });

  const handleKeyPress = (key: string) => {
    if (key !== expectedKey) {
      console.log(`wong key. want ${expectedKey} but got ${key}`);
      return;
    }

    const currentKeySequence = omissions[0].keySequence;
    const currentOmission = omissions[0];

    // is the problem done?
    if (currentKeySequence.length === 1 && omissions.length == 1) {
      console.log("done.");
      return;
    }

    // is the cell done?
    if (currentKeySequence.length === 1) {
      setOmissions(omissions.slice(1));
      if (omissions[0].keySequence[0].expect === undefined) {
        setExpectedKey(ANY_KEY);
        console.log(omissions);
        return;
      }
      setExpectedKey(omissions[0].keySequence[0].expect || ANY_KEY);
      return;
    }

    // otherwise just move to the key key press
    currentOmission.keySequence = currentKeySequence.slice(1);
    setOmissions([currentOmission, ...omissions.slice(1)]);
    if (omissions[0].keySequence[0].expect === undefined) {
      setExpectedKey(ANY_KEY);
      return;
    }
    setExpectedKey(omissions[0].keySequence[0].expect || ANY_KEY);
  };

  // indices for omissions & key sequences
  return (
    <View style={styles.container}>
      <Quadrants>
        <Text
          style={{ color: "gold", fontFamily: "JetBrains Mono, monospace" }}
        >
          <Button onPress={() => handleKeyPress(ANY_KEY)} title={ANY_KEY} />
        </Text>

        {/* Matrix B (top right) */}
        <Grid
          data={problem.b}
          renderItem={renderCell("b", omissions, handleKeyPress)}
        />

        {/* Matrix A (bottom left) */}
        <Grid
          data={problem.a}
          renderItem={renderCell("a", omissions, handleKeyPress)}
        />

        {/* Answer Matrix C (bottom right) */}
        <Grid
          data={problem.c}
          renderItem={renderCell("c", omissions, handleKeyPress)}
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
