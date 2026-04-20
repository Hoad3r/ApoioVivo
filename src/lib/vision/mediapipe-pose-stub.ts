/**
 * Stub para `@mediapipe/pose`.
 *
 * O pacote @tensorflow-models/pose-detection importa `{ Pose }` de
 * `@mediapipe/pose` no topo do módulo (suporte ao modelo BlazePose), mas esse
 * pacote é CommonJS sem exports ESM e quebra o bundler. Como usamos apenas o
 * modelo MoveNet (que só depende do TensorFlow.js), apontamos `@mediapipe/pose`
 * para este stub: o `Pose` aqui nunca é instanciado em runtime.
 */
export class Pose {}

const mediapipePoseStub = {};
export default mediapipePoseStub;
