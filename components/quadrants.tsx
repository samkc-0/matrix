import React, { Children, ReactNode } from "react";
import { View, useWindowDimensions, StyleSheet } from "react-native";

type Props = {
  children: ReactNode[] | ReactNode;
};

export default function Quadrants({ children }: Props) {
  if (Children.count(children) !== 4) {
    throw new Error("Quadrants must have 4 children");
  }
  const [topLeft, topRight, bottomLeft, bottomRight] =
    Children.toArray(children);
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.box}>{topLeft}</View>
        <View style={styles.box}>{topRight}</View>
      </View>
      <View style={styles.row}>
        <View style={styles.box}>{bottomLeft}</View>
        <View style={styles.box}>{bottomRight}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1,
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  box: {
    flex: 1,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1,
  },
});
