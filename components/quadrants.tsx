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
  const { width, height } = useWindowDimensions();
  const squareSize =
    width > 0 && height > 0 ? Math.min(width, height) : undefined;
  return (
    <View
      style={[
        styles.container,
        squareSize
          ? { width: squareSize, height: squareSize }
          : styles.fallbackSize,
      ]}
    >
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
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1,
    borderColor: "black",
    borderWidth: 2,
  },
  fallbackSize: {
    width: "100%",
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  box: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1,
    backgroundColor: "black",
  },
});
