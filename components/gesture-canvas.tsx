import React, { useRef, useState } from "react";
import { View, PanResponder, StyleSheet } from "react-native";
import Svg, { Polyline } from "react-native-svg";

export type PointInTime = { x: number; y: number; t: number };
export type PointsHandler = (points: PointInTime[]) => void;

export default function GestureCanvas({
  onStrokeEnd,
}: {
  onStrokeEnd: PointsHandler;
}) {
  const pointsRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const [renderPoints, setRenderPoints] = useState<{ x: number; y: number }[]>(
    [],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: (event) => {
        pointsRef.current = [];
        const p = {
          x: event.nativeEvent.locationX,
          y: event.nativeEvent.locationY,
          t: Date.now(),
        };
        pointsRef.current.push(p);
        setRenderPoints([{ x: p.x, y: p.y }]);
      },

      onPanResponderMove: (event) => {
        const p = {
          x: event.nativeEvent.locationX,
          y: event.nativeEvent.locationY,
          t: Date.now(),
        };
        pointsRef.current.push(p);
        setRenderPoints([
          ...pointsRef.current.map((pt) => ({ x: pt.x, y: pt.y })),
        ]);
      },

      onPanResponderRelease: () => {
        onStrokeEnd(pointsRef.current);
        pointsRef.current = [];
        setRenderPoints([]);
      },

      onPanResponderTerminate: () => {
        pointsRef.current = [];
        setRenderPoints([]);
      },
    }),
  ).current;

  return (
    <View style={styles.overlay} {...panResponder.panHandlers}>
      <Svg style={styles.overlay}>
        <Polyline
          points={renderPoints.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="white"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
