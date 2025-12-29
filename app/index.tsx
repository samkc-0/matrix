import { useCallback, useState } from "react";
import { testProblems } from "@/data/test-problems";
import type { MatmulProblem, Problem } from "@/types/problems";

import Message from "@/components/message";
import Matmul from "@/workbook/matmul-svg-core";

export default function Index() {
  const problems: Problem[] = testProblems;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleProblemComplete = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, problems.length));
  }, [problems.length]);

  if (currentIndex >= problems.length) {
    return <Message text="All problems completed!" />;
  }

  return (
    <ProblemHandler
      problem={problems[currentIndex]}
      onProblemComplete={handleProblemComplete}
    />
  );
}

type ProblemHandlerProps = {
  problem: Problem;
  onProblemComplete?: () => void;
};
function ProblemHandler({ problem, onProblemComplete }: ProblemHandlerProps) {
  switch (problem.type) {
    case "matmul":
      return (
        <Matmul
          problem={problem as MatmulProblem}
          onComplete={onProblemComplete}
        />
      );
    default:
      return <Message text={`Unsupported problem type: ${problem.type}`} />;
  }
}
