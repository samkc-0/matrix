type PointInTime = { x: number; y: number; t: number };

type PointsHandler = (points: PointInTime[]) => void;

export default PointInTime;

export { PointInTime, PointsHandler };
