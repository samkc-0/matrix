import preprocessGesture from "@/utils/preprocess-gesture";
import type { Tensor } from "@tensorflow/tfjs";

type PreviewGestureProps = {
  gesture: PointInTime[];
};
// render rasterized gesture tensor as an image in a component
export default function PreviewGesture({ gesture }: PreviewGestureProps) {
  const preprocessed: Tensor = preprocessGesture(gesture);
  return (
    <img
      src={preprocessed.dataSync()}
      width={preprocessed.shape[1]}
      height={preprocessed.shape[0]}
    />
  );
}
