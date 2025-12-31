import React, { useRef, useState } from "react";
import { View, PanResponder, StyleSheet } from "react-native";
import Svg, { Polyline } from "react-native-svg";

import { PointInTime, PointsHandler } from "@/types/point-in-time";

type GestureCanvasProps = {
  onStrokeEnd: PointsHandler;
  fallback?: () => void;
};

const TAP_MOVEMENT_THRESHOLD_SQ = 25; // roughly 5px movement before treating as a stroke

export default function GestureCanvas({
  onStrokeEnd,
  fallback,
}: GestureCanvasProps) {
  const pointsRef = useRef<PointInTime[]>([]);
  const isTapRef = useRef(true);
  const [renderPoints, setRenderPoints] = useState<{ x: number; y: number }[]>(
    [],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: (event) => {
        pointsRef.current = [];
        isTapRef.current = true;
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
        const firstPoint = pointsRef.current[0];
        if (firstPoint) {
          const dx = p.x - firstPoint.x;
          const dy = p.y - firstPoint.y;
          if (dx * dx + dy * dy > TAP_MOVEMENT_THRESHOLD_SQ) {
            isTapRef.current = false;
          }
        }
        pointsRef.current.push(p);
        setRenderPoints([
          ...pointsRef.current.map((pt) => ({ x: pt.x, y: pt.y })),
        ]);
      },

      onPanResponderRelease: () => {
        if (isTapRef.current && fallback) {
          fallback();
        } else {
          onStrokeEnd(pointsRef.current);
        }
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
          stroke="#06aed5"
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
