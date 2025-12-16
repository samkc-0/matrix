import type { PointInTime } from "@/types/point-in-time";
throw new Error("invalid platform");

export default function useDigitClassifier() {
  return {
    classify: (points: PointInTime[]) => {},
    status: "error",
    error: { message: "invalid platform" },
    modelLoaded: false,
  };
}
