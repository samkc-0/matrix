export type MatrixLabel = "a" | "b" | "c";

type MatrixLabels = Partial<Record<MatrixLabel, string>>;

type HighlightingOptions = {
  rows?: boolean;
  columns?: boolean;
  targetCell?: boolean;
};

export type MatmulProblem = {
  problemType: "matmul";
  showEquation?: boolean;
  matrixLabels?: MatrixLabels;
  a: number[][];
  b: number[][];
  c: number[][];
  omissions: Array<{
    matrix: MatrixLabel;
    row: number;
    col: number;
  }>;
  valid: boolean;
  detail: string;
  highlighting?: HighlightingOptions;
};

export default MatmulProblem;
