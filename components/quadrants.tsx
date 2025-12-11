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
  const size = Math.min(width, height);
  return (
    <View style={{ width: size, height: size, ...styles.container }}>
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
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1,
    borderColor: "black",
    borderWidth: 2,
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
