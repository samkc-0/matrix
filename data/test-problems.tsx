import type { Problem } from "@/types/problems";

export const testProblems: Problem[] = [
  {
    type: "matmul",
    showEquation: false,
    matrixLabels: {
      a: "",
      b: "",
      c: "",
    },
    a: [[3]],
    b: [[4]],
    c: [[12]],
    omissions: [
      {
        matrix: "c",
        row: 0,
        col: 0,
      },
    ],
    valid: true,
    detail: "scalar-scalar",
  },
  {
    type: "matmul",
    showEquation: false,
    matrixLabels: {
      a: "k",
      b: "v",
      c: "kv",
    },
    a: [[-2]],
    b: [[5, -1]],
    c: [[-10, 2]],
    omissions: [
      {
        matrix: "c",
        row: 0,
        col: 0,
      },
      {
        matrix: "c",
        row: 0,
        col: 1,
      },
    ],
    valid: true,
    detail: "scalar-vector",
  },
  {
    type: "matmul",
    showEquation: false,
    matrixLabels: {
      a: "",
      b: "",
      c: "",
    },
    a: [
      [1, 2],
      [3, 0],
    ],
    b: [
      [4, 1],
      [2, 3],
    ],
    c: [
      [8, 7],
      [12, 3],
    ],
    omissions: [
      {
        matrix: "c",
        row: 0,
        col: 0,
      },
      {
        matrix: "c",
        row: 0,
        col: 1,
      },
      {
        matrix: "c",
        row: 1,
        col: 0,
      },
      {
        matrix: "c",
        row: 1,
        col: 1,
      },
    ],
    valid: true,
    detail: "2x2",
  },
  {
    type: "matmul",
    showEquation: false,
    matrixLabels: {
      a: "",
      b: "",
      c: "",
    },
    a: [
      [2, 7, 9],
      [0, 0, 3],
    ],
    b: [
      [1, 9, 5],
      [6, 3, 7],
      [3, 2, 1],
    ],
    c: [
      [71, 57, 68],
      [9, 6, 3],
    ],
    omissions: [
      {
        matrix: "c",
        row: 0,
        col: 0,
      },
      {
        matrix: "c",
        row: 0,
        col: 1,
      },
      {
        matrix: "c",
        row: 0,
        col: 2,
      },
      {
        matrix: "c",
        row: 1,
        col: 0,
      },
      {
        matrix: "c",
        row: 1,
        col: 1,
      },
      {
        matrix: "c",
        row: 1,
        col: 2,
      },
    ],
    valid: true,
    detail: "ok",
  },
];
