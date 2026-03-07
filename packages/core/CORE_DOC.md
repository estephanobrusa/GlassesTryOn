# GlassesTryON Core Documentation

> **Note:** This project is currently under development and was created for learning purposes.

## Overview

The `core` package provides the foundational modules for the GlassesTryON AR try-on system. It enables robust, real-time overlay of 3D glasses models on a user's face using MediaPipe FaceMesh and Three.js. The architecture is modular, allowing for easy extension and maintenance.

---

## Module Summaries

### 1. CameraCalibration

- **Purpose:** Manages camera intrinsic parameters (focal lengths and principal point) for 3D pose estimation.
- **Key Class:** `CameraCalibration`
- **Exports:** `CameraIntrinsics` interface, `CameraCalibration` class

### 2. CameraEngine

- **Purpose:** Handles camera access, video stream management, and video element lifecycle.
- **Key Class:** `CameraEngine`
- **Features:** Starts/stops the camera, provides a mirrored (`scaleX(-1)`) video element for selfie view.

### 3. FaceMeshRunner

- **Purpose:** Initializes and runs MediaPipe FaceMesh (WASM) for real-time face landmark detection.
- **Key Class:** `FaceMeshRunner`
- **Exports:** `FaceLandmark` interface (typed landmark data)
- **Features:**
  - Loads and configures FaceMesh with `refineLandmarks: true`
  - Continuously detects face landmarks via `requestAnimationFrame` loop
  - Properly cancels pending rAF on `stop()` to prevent race conditions

### 4. FaceGeometryEstimator

- **Purpose:** Estimates 3D head pose (position, rotation, scale) from detected face landmarks.
- **Key Class:** `FaceGeometryEstimator`
- **Exports:** `FacePose` interface, `AlignmentConfig` interface
- **Features:**
  - Uses rotation matrix from 3 orthogonal face axes (inter-ocular, forehead-chin, face normal)
  - Blended scale from width (70%) and height (30%) measurements
  - Adaptive smoothing: slower lerp when still, faster when moving
  - Accepts `AlignmentConfig` overrides for `glassesScaleFactor` and `glassesZ`

### 5. PoseApplier

- **Purpose:** Applies a `FacePose` (position, quaternion, scale) directly to a Three.js model.
- **Key Class:** `PoseApplier`
- **Features:** Static `applyPose()` method that copies position, quaternion, and uniform scale.

### 6. ThreeSceneManager

- **Purpose:** Manages the Three.js scene, orthographic camera, lighting, and model rendering.
- **Key Class:** `ThreeSceneManager`
- **Features:**
  - Sets up an orthographic camera in negated-pixel coordinate space
  - Canvas is mirrored (`scaleX(-1)`) to match the selfie-view video
  - Handles model bounding box centering for proper pivot alignment

### 7. GlassesViewer

- **Purpose:** Orchestrates the entire AR pipeline, integrating all modules above.
- **Key Class:** `GlassesViewer`
- **Features:**
  - Promise-based model loading (GLTF/GLB via `GLTFLoader`)
  - FPS throttling via `render.maxFPS` option
  - `alignmentConfig` passed through to `FaceGeometryEstimator`
  - Custom `pixelRatio` support
  - Event system: `modelLoaded`, `faceDetected`, `faceLost`
  - Full cleanup in `destroy()` (rAF cancellation, all sub-modules disposed)

---

## Public API Exports

```ts
export { GlassesViewer } from './GlassesViewer';
export type { GlassesViewerOptions } from './GlassesViewer';
export type { AlignmentConfig, FacePose } from './FaceGeometryEstimator';
export type { FaceLandmark } from './FaceMeshRunner';
export type { CameraIntrinsics } from './CameraCalibration';
```

---

## Pipeline Flow

```
CameraEngine → FaceMeshRunner → FaceGeometryEstimator → PoseApplier → ThreeSceneManager
                                 ↑ CameraCalibration
```

The `GlassesViewer` class coordinates this pipeline, ensuring smooth and accurate AR overlay.

---
