import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['@mediapipe/face_landmarker', '@mediapipe/pose', '@mediapipe/tasks-vision'],
  target: 'es2020',
  platform: 'browser'
});