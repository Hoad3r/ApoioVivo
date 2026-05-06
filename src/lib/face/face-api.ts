import * as faceapi from "@vladmandic/face-api";

// A instância de TensorFlow embutida no face-api (tipos não expõem tudo).
const tf = faceapi.tf as unknown as {
  setBackend: (name: string) => Promise<boolean>;
  ready: () => Promise<void>;
};

let carregado: Promise<void> | null = null;

/** Carrega os modelos de detecção, landmarks e reconhecimento (de /public/models). */
export function carregarModelosFace(): Promise<void> {
  if (!carregado) {
    carregado = (async () => {
      // Inicializa o backend do TensorFlow antes de qualquer operação.
      // Sem isto, o face-api tenta usar 'webgpu' não inicializado e quebra.
      try {
        await tf.setBackend("webgl");
      } catch {
        await tf.setBackend("cpu");
      }
      await tf.ready();
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
    })();
  }
  return carregado;
}

const OPCOES = new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,
  scoreThreshold: 0.5,
});

/** Calcula o descritor facial (128 valores) do rosto principal, ou null. */
export async function descritorDe(
  input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
): Promise<Float32Array | null> {
  await carregarModelosFace();
  const deteccao = await faceapi
    .detectSingleFace(input, OPCOES)
    .withFaceLandmarks()
    .withFaceDescriptor();
  return deteccao?.descriptor ?? null;
}
