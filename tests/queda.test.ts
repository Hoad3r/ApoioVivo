import { describe, it, expect } from "vitest";
import { avaliarQueda, type Keypoint } from "@/lib/vision/queda";

function pose(parts: Record<string, [number, number]>): Keypoint[] {
  return Object.entries(parts).map(([name, [x, y]]) => ({
    name,
    x,
    y,
    score: 0.9,
  }));
}

describe("avaliarQueda", () => {
  it("em pé (tronco vertical) NÃO é queda", () => {
    const kp = pose({
      left_shoulder: [100, 80],
      right_shoulder: [140, 80],
      left_hip: [105, 240],
      right_hip: [135, 240],
    });
    expect(avaliarQueda(kp)).toBe(false);
  });

  it("deitado (tronco horizontal) É queda", () => {
    const kp = pose({
      left_shoulder: [80, 200],
      right_shoulder: [80, 240],
      left_hip: [260, 205],
      right_hip: [260, 245],
    });
    expect(avaliarQueda(kp)).toBe(true);
  });

  it("sem keypoints suficientes NÃO é queda", () => {
    expect(avaliarQueda(pose({ nose: [100, 100] }))).toBe(false);
  });

  it("webcam sem quadris: cabeça acima dos ombros NÃO é queda", () => {
    const kp = pose({
      nose: [120, 40],
      left_shoulder: [100, 120],
      right_shoulder: [140, 120],
    });
    expect(avaliarQueda(kp)).toBe(false);
  });

  it("webcam sem quadris: cabeça ao lado dos ombros É queda", () => {
    const kp = pose({
      nose: [40, 120],
      left_shoulder: [200, 110],
      right_shoulder: [210, 130],
    });
    expect(avaliarQueda(kp)).toBe(true);
  });

  it("ignora keypoints com score baixo", () => {
    const kp: Keypoint[] = [
      { name: "left_shoulder", x: 100, y: 120, score: 0.1 },
      { name: "right_shoulder", x: 140, y: 120, score: 0.1 },
      { name: "nose", x: 120, y: 40, score: 0.1 },
    ];
    expect(avaliarQueda(kp)).toBe(false);
  });
});
