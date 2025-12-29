export type MatrixLabel = "a" | "b" | "c";

type MatrixLabels = Partial<Record<MatrixLabel, string>>;

export type MatmulProblem = {
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
};

export default MatmulProblem;
