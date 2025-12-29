import Matmul from "@/workbook/matmul-svg-core";
import { testProblems } from "@/data/test-problems";

export default function Index() {
  const problem = testProblems[0];
  return <Matmul problem={problem} />;
}
