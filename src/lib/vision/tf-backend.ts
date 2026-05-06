import * as tf from "@tensorflow/tfjs";

let pronto: Promise<void> | null = null;

/**
 * Garante que o backend do TensorFlow esteja inicializado antes de qualquer
 * operação. Sem isto, o tf.js tenta usar 'webgpu' (prioridade alta) sem
 * inicializá-lo e lança erro. Forçamos 'webgl' (com fallback para 'cpu').
 * Executa uma única vez (lazy singleton).
 */
export function garantirBackend(): Promise<void> {
  if (!pronto) {
    pronto = (async () => {
      try {
        await tf.setBackend("webgl");
      } catch {
        await tf.setBackend("cpu");
      }
      await tf.ready();
    })();
  }
  return pronto;
}
