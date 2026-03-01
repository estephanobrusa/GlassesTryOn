# Librería Open Source Try-On 3D de Lentes con Three.js

## Resumen
Permite probar lentes virtuales en tiempo real usando la cámara web. V1: try-on básico, renderizado de lentes 3D alineados a la cara, Three.js para render, MediaPipe para tracking.

## Estructura
- `/packages/core`: Motor principal (tracking, render, alignment)
- `/packages/react`: Wrapper React
- `/packages/demo`: Demo para testing

## Instalación
1. Instala dependencias:
   ```bash
   npm install
   ```
2. Compila los paquetes:
   ```bash
   npm run build --workspace=packages/core
   npm run build --workspace=packages/react
   ```
3. Inicia la demo:
   ```bash
   npm start --workspace=packages/demo
   ```

## Uso básico
```ts
const viewer = new GlassesViewer({ container: document.getElementById("app"), model: { url: "/glasses.glb" } });
await viewer.start();
```

## Uso en React
```tsx
<GlassesTryOn
  model="/models/rayban.glb"
  smoothingFactor={0.8}
  maxFPS={30}
  onFaceDetected={() => console.log("Cara detectada")}
/>
```

## Roadmap
- Captura de foto
- Multi-face
- Postprocessing
- Export pose
- Plugins
