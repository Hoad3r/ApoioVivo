import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // Usamos só o MoveNet; o BlazePose (@mediapipe/pose) não é necessário e
      // quebra o bundler. Apontamos para um stub vazio.
      "@mediapipe/pose": "./src/lib/vision/mediapipe-pose-stub.ts",
    },
  },
};

export default nextConfig;
