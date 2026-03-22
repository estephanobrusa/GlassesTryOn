# GlassesTryON — Open Source 3D Glasses Virtual Try-On

[![CI](https://github.com/estephanobrusa/GlassesTryOn/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/estephanobrusa/GlassesTryOn/actions/workflows/ci.yml)
[![npm core](https://img.shields.io/npm/v/glasses-tryon-core?label=core)](https://www.npmjs.com/package/glasses-tryon-core)
[![npm react](https://img.shields.io/npm/v/glasses-tryon-react?label=react)](https://www.npmjs.com/package/glasses-tryon-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> ⚠️ **Not production-ready.** This project is built for learning purposes and is under active development. APIs may change without notice and it is not recommended for use in production applications.

## Overview

Real-time virtual glasses try-on using webcam, MediaPipe FaceMesh, and Three.js.
Monorepo with three packages: **core** engine, **react** wrapper, and **demo** app.

## Architecture

```
CameraEngine → FaceMeshRunner → FaceGeometryEstimator → PoseApplier → ThreeSceneManager
                                 ↑ CameraCalibration
```

All orchestrated by `GlassesViewer`.

## Structure

| Package               | Path              | Purpose                                                  |
| --------------------- | ----------------- | -------------------------------------------------------- |
| `glasses-tryon-core`  | `/packages/core`  | Engine: camera, face tracking, pose estimation, 3D scene |
| `glasses-tryon-react` | `/packages/react` | `<GlassesTryOn>` React component                         |
| `glasses-tryon-demo`  | `/packages/demo`  | Vite demo app for testing                                |

## Prerequisites

- Node.js >= 18
- pnpm >= 9

## Installation

```bash
pnpm install
```

## Build

```bash
# Build core + react packages
pnpm run build:all

# Or individually
pnpm run build:core
pnpm run build:react
```

## Development

```bash
# Start Vite dev server for the demo
pnpm run dev:demo
# → opens http://localhost:5173
```

## Usage — Vanilla JS/TS

```ts
import { GlassesViewer } from 'glasses-tryon-core';

const viewer = new GlassesViewer({
  container: document.getElementById('app')!,
  model: { url: '/models/glasses.glb' },
  render: { maxFPS: 30 },
  alignmentConfig: { glassesScaleFactor: 1.0, glassesZ: 10 },
  debug: false,
});

viewer.on('faceDetected', () => console.log('Face detected'));
viewer.on('faceLost', () => console.log('Face lost'));
viewer.on('modelLoaded', () => console.log('Model ready'));

await viewer.start();

// Cleanup
viewer.destroy();
```

## Usage — React

```tsx
import { GlassesTryOn } from 'glasses-tryon-react';

<GlassesTryOn
  model="/models/glasses.glb"
  maxFPS={30}
  onFaceDetected={() => console.log('Face detected')}
  modelConfig={{ scale: 1.0 }}
/>;
```

## VS Code Tasks

| Task                    | Description           |
| ----------------------- | --------------------- |
| **Build All** (default) | Build core + react    |
| **Dev Demo**            | Start Vite dev server |
| **Lint** / **Lint Fix** | Run ESLint            |
| **Format**              | Run Prettier          |

## Linting & Formatting

```bash
pnpm run lint        # Check
pnpm run lint:fix    # Auto-fix
pnpm run format      # Prettier
```
