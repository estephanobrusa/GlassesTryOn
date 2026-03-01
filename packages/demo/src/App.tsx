// App.tsx

import React from 'react';
import { GlassesTryOn } from 'glasses-tryon-react';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '500px', backgroundColor: '#f0f0f0' }}>
      <GlassesTryOn
        model="/models/glasses1.glb"
        smoothingFactor={0.8}
        maxFPS={30}
        onFaceDetected={() => console.log('Cara detectada')}
        modelConfig={{ scale: 1, offset: { z: 5 } }}
      />
    </div>
  );
}
