import { Text, View } from "react-native";

import Matmul from "@/workbook/matmul-svg-core";
import { testProblems } from "@/data/test-problems";
import type { MatmulProblem, Problem } from "@/types/problems";

export default function Index() {
  const problems: Problem[] = testProblems;

  return <ProblemHandler problem={problems[0]} />;
}

type ProblemHandlerProps = {
  problem: Problem;
};
function ProblemHandler({ problem }: ProblemHandlerProps) {
  switch (problem.type) {
    case "matmul":
      return <Matmul problem={problem as MatmulProblem} />;
    default:
      return (
        <View>
          <Text>Unsupported problem type</Text>
        </View>
      );
  }
}
