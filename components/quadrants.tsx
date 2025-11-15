import React, { Children, ReactNode } from "react";
import { View, StyleSheet } from "react-native";

type Props = {
  children: ReactNode[] | ReactNode;
};

export function Quadrants({ children }: Props) {
  if (Children.count(children) !== 4) {
    throw new Error("Quadrants must have 4 children");
  }
  const [topLeft, topRight, bottomLeft, bottomRight] =
    Children.toArray(children);
  return (
    <View style={styles.quadrants}>
      <View style={styles.row}>
        <View style={styles.quadrant}>{topLeft}</View>
        <View style={styles.quadrant}>{topRight}</View>
      </View>
      <View style={styles.row}>
        <View style={styles.quadrant}>{bottomLeft}</View>
        <View style={styles.quadrant}>{bottomRight}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quadrants: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  quadrant: {
    flex: 1,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
