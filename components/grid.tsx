import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type Props<T> = {
  data: T[][];
  renderItem: (item: T, i?: number, j?: number) => ReactNode;
};

export default function Grid<T>({ data, renderItem }: Props<T>) {
  const { rows, cols, isJagged } = getDataShape(data);
  if (isJagged) {
    throw new Error("All rows must be the same length");
  }
  if (rows === 0 || cols === 0) return null;
  return (
    <View style={styles.container}>
      {data.map((row: T[], i) => {
        return (
          <View key={`row-${i}`} style={styles.row}>
            {row.map((item: T, j) => {
              return (
                <View key={`cell-${i}-${j}`} style={styles.cell}>
                  {renderItem(item, i, j)}
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
  },
});

type DataShapeResult = {
  rows?: number;
  cols?: number;
  isJagged: boolean;
};
function getDataShape<T>(data: T[][]): DataShapeResult {
  const firstRow = data[0];
  if (data.some((row) => row.length !== firstRow.length)) {
    return {
      rows: undefined,
      cols: undefined,
      isJagged: true,
    };
  }
  return { rows: data.length, cols: firstRow.length, isJagged: false };
}
