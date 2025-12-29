import { Text, View } from "react-native";

import Matmul from "@/workbook/matmul-svg-core";
import { testProblems } from "@/data/test-problems";
import type { MatmulProblem, Problem } from "@/types/problems";

function isMatmulProblem(problem: Problem): problem is MatmulProblem {
  return problem.problemType === "matmul";
}

export default function Index() {
  const problem = testProblems[0];

  if (problem && isMatmulProblem(problem)) {
    return <Matmul problem={problem} />;
  }

  return (
    <View>
      <Text>Unsupported problem type</Text>
    </View>
  );
}
