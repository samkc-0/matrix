export type Problem = {
  problemType: string;
};

export type MatmulProblem = {
  problemType: "matmul";
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
};
