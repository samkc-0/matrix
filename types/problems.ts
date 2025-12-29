type HighlightingOptions = {
  rows?: boolean;
  columns?: boolean;
  targetCell?: boolean;
};

export type MatmulProblem = {
  type: "matmul";
  showEquation: boolean;
  matrixLabels: {
    a: string;
    b: string;
    c: string;
  };
  a: number[][];
  b: number[][];
  c: number[][];
  omissions: {
    matrix: "a" | "b" | "c";
    row: number;
    col: number;
  }[];
  valid: boolean;
  detail: string;
  highlighting?: HighlightingOptions;
};

export type Problem = MatmulProblem;
