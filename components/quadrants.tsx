import React, { Children, ReactNode } from "react";
import {
  Dimensions,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

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
  const fallbackWindow = Dimensions.get("window");
  const safeWidth = width || fallbackWindow.width;
  const safeHeight = height || fallbackWindow.height;
  const squareSize = Math.max(1, Math.min(safeWidth, safeHeight));
  if (width == null || height == null) {
    return null;
  }
  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          { width: "min(100vw, 100vh)", height: "min(100vw, 100vh)" },
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
