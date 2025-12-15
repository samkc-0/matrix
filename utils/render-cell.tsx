import { Animated, Text } from "react-native";
import { useRef, useEffect } from "react";
import { KeySequence, KeySequenceState } from "@/types/key-sequence";
import { Cell } from "@/components/grid";

export default function renderCell(
  label: string,
  keySequence: KeySequence,
): Function {
  return function renderItem(item: number, i: number, j: number) {
    let value = item.toString();
    const fontSize = 38 - 6 * value.length;

    const omission = keySequence.find(
      (ks: KeySequenceState) =>
        ks.label === label && ks.row === i && ks.col === j,
    );

    const ks = keySequence[0];

    const hidden =
      (omission && ks !== omission) ||
      (omission && omission.show.split("").every((c: string) => c === "_"));

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
}

