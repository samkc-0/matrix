type DataShapeResult = {
  rows: number;
  cols: number;
  isJagged: boolean;
};

export default function getDataShape<T>(data: T[][]): DataShapeResult {
  const firstRow = data[0];
  if (data.some((row) => row.length !== firstRow.length)) {
    return {
      rows: 0,
      cols: 0,
      isJagged: true,
    };
  }
  return { rows: data.length, cols: firstRow.length, isJagged: false };
}
