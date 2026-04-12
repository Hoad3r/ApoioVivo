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
});
