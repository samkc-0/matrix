import Grid, { Cell } from "@/components/grid";
import Quadrants from "@/components/quadrants";
import {
  Animated,
  View,
  Pressable,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { testProblem } from "@/data/test-problem";
import { useEffect, useState, useRef, useCallback } from "react";

import GestureCanvas from "@/components/gesture-canvas";
import { loadMnistModel, recognizeGesture } from "@/utils/recognize-gesture";

type Omission = {
  label: string;
  row: number;
  col: number;
};

const renderCell = (label: string, keySequence: KeySequence) => {
  return function renderItem(item: number, i: number, j: number) {
    let value = item.toString();
    const fontSize = 38 - 6 * value.length;

    const omission = keySequence.find(
      (ks) => ks.label === label && ks.row === i && ks.col === j,
    );

    const ks = keySequence[0];

    const hidden =
      (omission && ks !== omission) ||
      (omission && omission.show.split("").every((c) => c === "_"));

    const isTargetCell =
      ks && ks.label === label && ks.row === i && ks.col === j;

    if (isTargetCell) value = ks.show;
    else if (hidden) value = "";

    const isRowTerm = label === "a" && ks.row === i;
    const isColTerm = label === "b" && ks.col === j;
    const isTerm = isRowTerm || isColTerm;

    let staticColor = "white";
    if (hidden) staticColor = "silver";
    if (isTerm || isTargetCell) staticColor = "violet";

    const shouldAnimate = isTerm || isTargetCell;
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
      ).start();

      if (shouldAnimate) {
        const offset = (isRowTerm ? i : j) / 3;
        anim.setValue(offset);
      }
    }, []);

    const animatedColor = anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ["violet", "violet", "violet"],
    });

    return (
      <Cell
        key={`cell-${i}-${j}`}
        style={{
          backgroundColor: shouldAnimate ? animatedColor : staticColor,
        }}
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
  const [keySequence, setKeySequence] = useState<KeySequence>(
    generateKeyPresses(problem),
  );
  useEffect(() => {
    const load = async () => {
      await loadMnistModel();
    };
  }, []);
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
      pairs.push(`${aTerm}×${bTerm}`);
    }

    return pairs.join(" + ") + " =";
  };

  const handleHandwriting = (points: { x: number; y: number; t: number }[]) => {
    console.log(points);

    const value = recognizeGesture(points);
    console.log("recognized: ", value);

    // automatically answer, for testing purposes
    handleKeyPress(keySequence[0].expectedKey);
  };

  const renderA = useCallback(renderCell("a", keySequence), [keySequence]);
  const renderB = useCallback(renderCell("b", keySequence), [keySequence]);
  const renderC = useCallback(renderCell("c", keySequence), [keySequence]);

  return (
    <View style={styles.container}>
      <Quadrants>
        <Text
          style={{ color: "white", fontFamily: "JetBrains Mono, monospace" }}
        >
          {deriveEquation(keySequence[0])}
        </Text>

        {/* Matrix B (top right) */}
        <Grid data={problem.b} renderItem={renderB} />

        {/* Matrix A (bottom left) */}
        <Grid data={problem.a} renderItem={renderA} />

        {/* Answer Matrix C (bottom right) */}
        <Grid data={problem.c} renderItem={renderC} />
      </Quadrants>
      <GestureCanvas onStrokeEnd={handleHandwriting} />
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

type KeySequenceState = {
  expectedKey: string;
  label: string;
  row: number;
  col: number;
  show: string;
};

type KeySequence = KeySequenceState[];

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
