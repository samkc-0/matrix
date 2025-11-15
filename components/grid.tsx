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
  container: {
    backgroundColor: "royalblue",
    width: "80%",
    height: "80%",
    aspectRatio: 1,
  },
  row: {
    flexDirection: "row",
    margin: 0,
    padding: 0,
  },
  cell: {
    boxSizing: "border-box",
    borderColor: "black",
    borderWidth: 2,
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    margin: 2,
    width: 50,
    backgroundColor: "white",
    borderRadius: 3,
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
