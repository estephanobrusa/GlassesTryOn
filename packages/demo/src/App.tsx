// App.tsx

import React from 'react';
import { GlassesTryOn } from 'glasses-tryon-react';

export default function App() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111',
      }}
    >
      <div
        style={{
          width: 'min(100vw, 177.78vh)',
          height: 'min(100vh, 56.25vw)',
          position: 'relative',
        }}
      >
        <GlassesTryOn
          model={`${import.meta.env.BASE_URL}models/test.glb`}
          maxFPS={30}
          onFaceDetected={() => console.log('face detected')}
          modelConfig={{ scale: 30 }}
        />
      </div>
    </div>
  );
}
