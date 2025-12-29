import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import * as tf from "@tensorflow/tfjs";
import { G, Rect, Svg, Text as SvgText } from "react-native-svg";

import type KeySequence from "@/types/key-sequence";
import type PointInTime from "@/types/point-in-time";
import type { MatmulProblem } from "@/types/problems";

import GestureCanvas from "@/components/gesture-canvas";
import GesturePreview from "@/components/preview-gesture";
import useDigitClassifier from "@/utils/use-digit-classifier";
import preprocessGesture from "@/utils/preprocess-gesture";

type MatrixLabel = "a" | "b" | "c";

const VIEWBOX_SIZE = 1000;
const QUADRANT_SIZE = VIEWBOX_SIZE / 2;
const QUADRANT_PADDING = 60;
const CELL_GAP = 18;
const LABEL_OFFSET = 48;

type MatmulProps = {
  problem: MatmulProblem;
  onComplete?: () => void;
};

export default function MatmulSvgCore({ problem, onComplete }: MatmulProps) {
  const shouldShowEquation = problem.showEquation ?? true;
  const {
    rows: highlightRowsEnabled = true,
    columns: highlightColumnsEnabled = true,
    targetCell: highlightTargetCellEnabled = true,
  } = problem.highlighting ?? {};

  const [keySequence, setKeySequence] = useState<KeySequence>(
    generateKeyPresses(problem),
  );
  const [previewGesture, setPreviewGesture] = useState<tf.Tensor | null>(null);
  const [flashCell, setFlashCell] = useState<{
    label: MatrixLabel;
    row: number;
    col: number;
    color: "success" | "error";
  } | null>(null);
  const cellFlashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const completionNotifiedRef = useRef(false);

  const digitClassifier = useDigitClassifier();

  useEffect(() => {
    setKeySequence(generateKeyPresses(problem));
    completionNotifiedRef.current = false;
    setPreviewGesture((prev) => {
      prev?.dispose();
      return null;
    });
  }, [problem]);

  useEffect(() => {
    if (keySequence.length === 0 && !completionNotifiedRef.current) {
      completionNotifiedRef.current = true;
      onComplete?.();
    }
  }, [keySequence, onComplete]);

  const triggerCellFlash = useCallback(
    (
      cell: { label: MatrixLabel; row: number; col: number },
      color: "success" | "error",
    ) => {
      setFlashCell({ ...cell, color });
      if (cellFlashTimeoutRef.current) {
        clearTimeout(cellFlashTimeoutRef.current);
      }
      cellFlashTimeoutRef.current = setTimeout(() => {
        setFlashCell(null);
        cellFlashTimeoutRef.current = null;
      }, 200);
    },
    [],
  );

  const handleKeyPress = useCallback(
    (key: string) => {
      setKeySequence((prev) => {
        if (prev.length === 0) return prev;
        const current = prev[0];
        if (current.expectedKey === key) {
          triggerCellFlash(
            {
              label: current.label as MatrixLabel,
              row: current.row,
              col: current.col,
            },
            "success",
          );
          return prev.slice(1);
        }
        triggerCellFlash(
          {
            label: current.label as MatrixLabel,
            row: current.row,
            col: current.col,
          },
          "error",
        );
        return prev;
      });
    },
    [triggerCellFlash],
  );

  useEffect(() => {
    // keyboard only supported on web
    if (Platform.OS !== "web") return;

    const onKeyDown = (e: KeyboardEvent) => handleKeyPress(e.key);

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [handleKeyPress]);

  const formatEquation = useCallback(
    ({ row, col }: KeySequence[number]) => {
      const aTerms = problem.a[row];
      const bTerms = problem.b.map((matrixRow) => matrixRow[col]);

      const pairs: string[] = [];

      for (let i = 0; i < aTerms.length; i++) {
        pairs.push(`${aTerms[i]}×${bTerms[i]}`);
      }

      return `${pairs.join(" + ")} =`;
    },
    [problem.a, problem.b],
  );

  useEffect(() => {
    return () => {
      previewGesture?.dispose();
    };
  }, [previewGesture]);

  useEffect(() => {
    return () => {
      if (cellFlashTimeoutRef.current) {
        clearTimeout(cellFlashTimeoutRef.current);
      }
    };
  }, []);

  const handleStrokeEnd = useCallback(
    async (points: PointInTime[]) => {
      const gestureAsTensor = preprocessGesture(points);

      setPreviewGesture((prev) => {
        prev?.dispose();
        return gestureAsTensor.clone();
      });

      if (digitClassifier.modelLoaded) {
        const digit = digitClassifier.classify(gestureAsTensor);
        handleKeyPress(String(digit));
      }

      gestureAsTensor.dispose();
    },
    [digitClassifier, handleKeyPress],
  );

  const { width, height } = useWindowDimensions();
  const fallbackWindow = Dimensions.get("window");
  const safeWidth = width || fallbackWindow.width || 0;
  const safeHeight = height || fallbackWindow.height || 0;
  const haveDimensions = safeWidth > 1 && safeHeight > 1;
  const squareSize = Math.max(1, Math.min(safeWidth, safeHeight));

  const quadrants = useMemo(() => {
    if (!keySequence.length) return null;
    const current = keySequence[0]!;
    const quadrantList = [];

    if (shouldShowEquation) {
      quadrantList.push({
        id: "equation",
        origin: { x: 0, y: 0 },
        render: () => (
          <SvgText
            x={QUADRANT_SIZE / 2}
            y={QUADRANT_SIZE / 2}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="black"
            fontSize={24}
            fontFamily="JetBrains Mono, monospace"
          >
            {formatEquation(current)}
          </SvgText>
        ),
      });
    }

    quadrantList.push(
      {
        id: "b",
        origin: { x: QUADRANT_SIZE, y: 0 },
        render: () => renderMatrix(problem.b, "b"),
      },
      {
        id: "a",
        origin: { x: 0, y: QUADRANT_SIZE },
        render: () => renderMatrix(problem.a, "a"),
      },
      {
        id: "c",
        origin: { x: QUADRANT_SIZE, y: QUADRANT_SIZE },
        render: () => renderMatrix(problem.c, "c"),
      },
    );

    return quadrantList;
  }, [problem, keySequence, formatEquation, shouldShowEquation, flashCell]);

  if (digitClassifier.error) {
    return (
      <View style={styles.container}>
        <Text style={styles.statusText}>
          Error: {digitClassifier.error.message}
        </Text>
      </View>
    );
  }
  if (!digitClassifier.modelLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.statusText}>
          Loading...(model status: {digitClassifier.status})
        </Text>
      </View>
    );
  }

  if (keySequence.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.statusText}>All done!</Text>
      </View>
    );
  }

  if (!haveDimensions && Platform.OS !== "web") {
    return null;
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.svgWrapper,
          haveDimensions
            ? { width: squareSize, height: squareSize }
            : styles.svgFallback,
        ]}
      >
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        >
          <Rect
            x={0}
            y={0}
            width={VIEWBOX_SIZE}
            height={VIEWBOX_SIZE}
            fill="white"
          />
          {quadrants?.map((quadrant) => (
            <G key={quadrant.id} x={quadrant.origin.x} y={quadrant.origin.y}>
              <Rect
                x={0}
                y={0}
                width={QUADRANT_SIZE}
                height={QUADRANT_SIZE}
                fill="white"
                strokeWidth={0}
              />
              <G x={0} y={0}>
                {quadrant.render()}
              </G>
            </G>
          ))}
        </Svg>
      </View>
      <GestureCanvas onStrokeEnd={handleStrokeEnd} />
      {previewGesture && <GesturePreview tensor={previewGesture} />}
    </View>
  );

  function renderMatrix(data: number[][], label: MatrixLabel) {
    const rows = data.length;
    const cols = data[0]?.length ?? 0;
    if (rows === 0 || cols === 0) return null;

    const displayLabel = problem.matrixLabels?.[label] ?? label.toUpperCase();
    const gridWidth = QUADRANT_SIZE - QUADRANT_PADDING * 2;
    const gridHeight = QUADRANT_SIZE - QUADRANT_PADDING * 2 - LABEL_OFFSET;
    const cellWidth = (gridWidth - CELL_GAP * (cols - 1)) / cols;
    const startX = QUADRANT_PADDING;
    const startY = QUADRANT_PADDING + LABEL_OFFSET;

    return (
      <G>
        <SvgText
          x={QUADRANT_SIZE / 2}
          y={QUADRANT_PADDING}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={42}
          fill="#0f172a"
          fontFamily="sans-serif"
        >
          {displayLabel}
        </SvgText>
        {data.map((row, rowIndex) => {
          return row.map((value, colIndex) => {
            const x = startX + colIndex * (cellWidth + CELL_GAP);
            const y = startY + rowIndex * (cellWidth + CELL_GAP);
            const display = getCellDisplay(label, rowIndex, colIndex, value);
            const fontSize =
              cellWidth * 0.35 - Math.max(display.value.length - 1, 0) * 6;
            const isFlashCell =
              flashCell?.label === label &&
              flashCell.row === rowIndex &&
              flashCell.col === colIndex;
            const strokeColor = isFlashCell
              ? flashCell?.color === "error"
                ? "#ef4444"
                : "#22c55e"
              : "black";
            const strokeWidth = isFlashCell ? 6 : 2;
            return (
              <G key={`${label}-${rowIndex}-${colIndex}`}>
                <Rect
                  x={x}
                  y={y}
                  width={cellWidth}
                  height={cellWidth}
                  rx={3}
                  ry={3}
                  fill={display.fill}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />
                <SvgText
                  x={x + cellWidth / 2}
                  y={y + cellWidth / 2}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fontFamily="Comic Sans MS"
                  fontSize={Math.max(28, fontSize)}
                  fill={display.textColor}
                >
                  {display.value}
                </SvgText>
              </G>
            );
          });
        })}
      </G>
    );
  }

  function getCellDisplay(
    label: MatrixLabel,
    row: number,
    col: number,
    value: number,
  ) {
    const ks = keySequence[0];
    const omission = keySequence.find(
      (entry) =>
        entry.label === label && entry.row === row && entry.col === col,
    );
    const actual = formatNumber(value);
    const hidden =
      (omission && ks !== omission) ||
      (omission && omission.show.split("").every((char) => char === "_"));

    let textValue = actual;
    let textColor = "black";
    if (ks && ks.label === label && ks.row === row && ks.col === col) {
      textValue = ks.show;
      if (ks.show.length < actual.length) textColor = "purple";
    } else if (hidden) {
      textValue = "";
    }

    const isRowTerm =
      highlightRowsEnabled && label === "a" && ks?.row === row;
    const isColTerm =
      highlightColumnsEnabled && label === "b" && ks?.col === col;
    const isTarget =
      highlightTargetCellEnabled &&
      ks?.label === label &&
      ks.row === row &&
      ks.col === col;
    const shouldHighlight = isRowTerm || isColTerm || isTarget;

    const fill = shouldHighlight ? "violet" : "#ffffff";

    return { value: textValue, textColor, fill };
  }
}

function generateKeyPresses(
  problem: typeof testProblem,
  blankChar = "",
): KeySequence {
  const keySequence: KeySequence = [];

  for (const omission of problem.omissions) {
    const { matrix: label, row, col } = omission;
    const targetValue = problem[label as MatrixLabel][row][col];
    const representation = formatNumber(targetValue);

    representation.split("").forEach((char, index) => {
      const revealed =
        representation.slice(0, index) +
        blankChar.repeat(Math.max(representation.length - index, 0));

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxHeight: "100%",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    position: "relative",
  },
  svgWrapper: {
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1,
  },
  svgFallback: {
    width: "min(100vw, 100vh)",
    height: "min(100vw, 100vh)",
  },
  statusText: {
    color: "black",
    fontFamily: "sans-serif",
    fontSize: 20,
  },
});
