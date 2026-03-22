# glasses-tryon-core

[![npm version](https://img.shields.io/npm/v/glasses-tryon-core)](https://www.npmjs.com/package/glasses-tryon-core)
[![license](https://img.shields.io/npm/l/glasses-tryon-core)](https://github.com/estephanobrusa/GlassesTryOn/blob/main/LICENSE)
[![CI](https://github.com/estephanobrusa/GlassesTryOn/actions/workflows/ci.yml/badge.svg)](https://github.com/estephanobrusa/GlassesTryOn/actions/workflows/ci.yml)

Framework-agnostic AR engine for real-time virtual glasses try-on via webcam.

> ⚠️ **Not production-ready.** This project is built for learning purposes and is under active development. APIs may change without notice and it is not recommended for use in production applications.

Uses **MediaPipe FaceMesh** to detect 468 facial landmarks, estimates head pose in 3D, and overlays a **Three.js** glasses model on the live video feed — all in the browser, no server required.

---

## Features

- 🎥 Real-time webcam capture and face tracking
- 🧠 468-landmark face mesh via MediaPipe
- 📐 Head pose estimation (position, rotation, scale)
- 🕶️ 3D glasses overlay with Three.js orthographic renderer
- 🔌 Framework-agnostic — works with React, Vue, Svelte, or plain JS/TS
- 📦 Dual ESM/CJS output with TypeScript declarations

---

## Architecture

```
CameraEngine → FaceMeshRunner → FaceGeometryEstimator → PoseApplier → ThreeSceneManager
                                  ↑ CameraCalibration
All orchestrated by GlassesViewer (event emitter)
```

---

## Requirements

- Node.js >= 22
- Browser with WebGL and `navigator.mediaDevices` support
- A `.glb` 3D model of glasses

---

## Install

```bash
npm install glasses-tryon-core
# or
pnpm add glasses-tryon-core
# or
yarn add glasses-tryon-core
```

### Peer dependencies

```bash
npm install three
```

---

## Usage

```ts
import { GlassesViewer } from 'glasses-tryon-core';

const viewer = new GlassesViewer({
  container: document.getElementById('app')!,
  model: { url: '/models/glasses.glb' },
  render: { maxFPS: 30 },
  alignmentConfig: {
    glassesScaleFactor: 1.0,
    glassesZ: 10,
  },
  debug: false,
});

// Listen to events
viewer.on('faceDetected', () => console.log('Face detected'));
viewer.on('faceLost', () => console.log('Face lost'));
viewer.on('modelLoaded', () => console.log('Model ready'));

// Start the AR session
await viewer.start();

// Stop and clean up
viewer.destroy();
```

---

## API

### `new GlassesViewer(options)`

| Option                               | Type          | Required | Description                            |
| ------------------------------------ | ------------- | :------: | -------------------------------------- |
| `container`                          | `HTMLElement` |    ✅    | DOM element that will host the canvas  |
| `model.url`                          | `string`      |    ✅    | URL to a `.glb` 3D glasses model       |
| `render.maxFPS`                      | `number`      |    —     | Max frames per second (default: `30`)  |
| `alignmentConfig.glassesScaleFactor` | `number`      |    —     | Scale multiplier for the glasses model |
| `alignmentConfig.glassesZ`           | `number`      |    —     | Z-offset for depth positioning         |
| `debug`                              | `boolean`     |    —     | Show debug overlay (default: `false`)  |

### Events

| Event          | Payload | Description                   |
| -------------- | ------- | ----------------------------- |
| `faceDetected` | —       | A face entered the frame      |
| `faceLost`     | —       | The face left the frame       |
| `modelLoaded`  | —       | The 3D model finished loading |

### Methods

| Method                   | Description                           |
| ------------------------ | ------------------------------------- |
| `start(): Promise<void>` | Start camera and AR loop              |
| `destroy(): void`        | Stop everything and release resources |
| `on(event, callback)`    | Subscribe to an event                 |
| `off(event, callback)`   | Unsubscribe from an event             |

---

## Browser Compatibility

| Browser       | Support |
| ------------- | :-----: |
| Chrome 90+    |   ✅    |
| Firefox 90+   |   ✅    |
| Safari 15+    |   ✅    |
| Edge 90+      |   ✅    |
| Mobile Chrome |   ✅    |
| Mobile Safari |   ✅    |

> Requires WebGL 2.0 and `getUserMedia` API.

---

## Contributing

See [CONTRIBUTING.md](https://github.com/estephanobrusa/GlassesTryOn/blob/main/CONTRIBUTING.md) and the [main repository](https://github.com/estephanobrusa/GlassesTryOn) for development setup.

## License

[MIT](https://github.com/estephanobrusa/GlassesTryOn/blob/main/LICENSE) © Estephano Brusa
