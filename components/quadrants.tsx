import React, { Children, ReactNode, useCallback, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";

type Props = {
  children: ReactNode[] | ReactNode;
};

export default function Quadrants({ children }: Props) {
  if (Children.count(children) !== 4) {
    throw new Error("Quadrants must have 4 children");
  }
  const [topLeft, topRight, bottomLeft, bottomRight] =
    Children.toArray(children);
  const [squareSize, setSquareSize] = useState<number>();

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    const nextSize = Math.min(width, height);
    if (!Number.isFinite(nextSize) || nextSize <= 0) return;
    setSquareSize(nextSize);
  }, []);
  return (
    <View style={styles.wrapper} onLayout={handleLayout}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
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
    maxWidth: "100vw",
    maxHeight: "100vh",
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
