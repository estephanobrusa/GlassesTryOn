# glasses-tryon-react

[![npm version](https://img.shields.io/npm/v/glasses-tryon-react)](https://www.npmjs.com/package/glasses-tryon-react)
[![license](https://img.shields.io/npm/l/glasses-tryon-react)](https://github.com/estephanobrusa/GlassesTryOn/blob/main/LICENSE)
[![CI](https://github.com/estephanobrusa/GlassesTryOn/actions/workflows/ci.yml/badge.svg)](https://github.com/estephanobrusa/GlassesTryOn/actions/workflows/ci.yml)

React component for real-time virtual glasses try-on via webcam.

A thin React 18 wrapper around [`glasses-tryon-core`](https://www.npmjs.com/package/glasses-tryon-core) — drop in the `<GlassesTryOn>` component and get instant AR glasses overlay with no configuration required.

---

## Features

- ⚛️ React 18 compatible
- 🎥 Webcam capture and face tracking out of the box
- 🕶️ 3D glasses overlay via MediaPipe + Three.js
- 🔧 Fully configurable via props
- 🧹 Automatic cleanup on unmount
- 📦 Dual ESM/CJS output with TypeScript declarations

---

## Requirements

- React >= 17
- Node.js >= 22
- Browser with WebGL and `navigator.mediaDevices` support
- A `.glb` 3D model of glasses

---

## Install

```bash
npm install glasses-tryon-react
# or
pnpm add glasses-tryon-react
# or
yarn add glasses-tryon-react
```

### Peer dependencies

```bash
npm install react react-dom glasses-tryon-core three
```

---

## Usage

```tsx
import { GlassesTryOn } from 'glasses-tryon-react';

export default function App() {
  return (
    <GlassesTryOn
      model="/models/glasses.glb"
      maxFPS={30}
      modelConfig={{ glassesScaleFactor: 1.0, glassesZ: 10 }}
      onFaceDetected={() => console.log('Face detected')}
    />
  );
}
```

---

## Props

| Prop                             | Type         | Required | Default | Description                                 |
| -------------------------------- | ------------ | :------: | ------- | ------------------------------------------- |
| `model`                          | `string`     |    ✅    | —       | URL to a `.glb` 3D glasses model            |
| `maxFPS`                         | `number`     |    —     | `30`    | Max frames per second                       |
| `modelConfig`                    | `object`     |    —     | —       | Alignment config passed to core engine      |
| `modelConfig.glassesScaleFactor` | `number`     |    —     | `1.0`   | Scale multiplier for the glasses            |
| `modelConfig.glassesZ`           | `number`     |    —     | `10`    | Z-offset for depth positioning              |
| `onFaceDetected`                 | `() => void` |    —     | —       | Callback fired when a face enters the frame |

---

## How it works

The component renders a `<div>` container, instantiates a `GlassesViewer` from `glasses-tryon-core` inside a `useEffect`, starts the AR loop, and destroys the viewer on unmount — no memory leaks.

```
<GlassesTryOn>
    │
    └── useEffect
            ├── new GlassesViewer({ container, model, ... })
            ├── viewer.on('faceDetected', onFaceDetected)
            ├── viewer.start()
            └── return () => viewer.destroy()   ← cleanup
```

---

## Next.js / SSR

The component uses `navigator.mediaDevices` which is browser-only. Import it with dynamic import to avoid SSR errors:

```tsx
import dynamic from 'next/dynamic';

const GlassesTryOn = dynamic(() => import('glasses-tryon-react').then((m) => m.GlassesTryOn), {
  ssr: false,
});
```

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
