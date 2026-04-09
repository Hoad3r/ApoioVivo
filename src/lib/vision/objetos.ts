import "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

export type Predicao = cocoSsd.DetectedObject;

let modeloPromise: Promise<cocoSsd.ObjectDetection> | null = null;

/** Carrega o modelo COCO-SSD uma única vez (lazy singleton). */
export function carregarModeloObjetos(): Promise<cocoSsd.ObjectDetection> {
  if (!modeloPromise) {
    modeloPromise = cocoSsd.load();
  }
  return modeloPromise;
}

/** Detecta objetos no frame atual do vídeo. */
export async function detectarObjetos(
  video: HTMLVideoElement,
): Promise<Predicao[]> {
  const modelo = await carregarModeloObjetos();
  return modelo.detect(video);
}
