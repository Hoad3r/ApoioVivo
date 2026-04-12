import "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import type { Keypoint } from "./queda";

let detectorPromise: Promise<poseDetection.PoseDetector> | null = null;

/** Carrega o detector de pose MoveNet uma única vez (lazy singleton). */
export function carregarDetectorPose(): Promise<poseDetection.PoseDetector> {
  if (!detectorPromise) {
    detectorPromise = poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING },
    );
  }
  return detectorPromise;
}

/** Estima a pose principal e retorna seus keypoints. */
export async function detectarPose(
  video: HTMLVideoElement,
): Promise<Keypoint[]> {
  const detector = await carregarDetectorPose();
  const poses = await detector.estimatePoses(video);
  return (poses[0]?.keypoints ?? []) as Keypoint[];
}
