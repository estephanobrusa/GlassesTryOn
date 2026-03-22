import React, { useEffect, useRef } from 'react';
import { GlassesViewer } from 'glasses-tryon-core';

interface GlassesTryOnProps {
  model: string;
  maxFPS?: number;
  onFaceDetected?: () => void;
  modelConfig?: {
    scale?: number;
    offset?: { x?: number; y?: number; z?: number };
  };
}

export const GlassesTryOn: React.FC<GlassesTryOnProps> = ({
  model,
  maxFPS,
  onFaceDetected,
  modelConfig,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<GlassesViewer | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      viewerRef.current = new GlassesViewer({
        container: containerRef.current,
        model: { url: model, ...(modelConfig || {}) },
        render: { maxFPS },
        debug: true,
        alignmentConfig: {
          glassesScaleFactor: modelConfig?.scale || 1,
          glassesZ: modelConfig?.offset?.z || 1,
        },
      });
      viewerRef.current.on('faceDetected', onFaceDetected || (() => {}));
      viewerRef.current.start();
    }
    return () => {
      viewerRef.current?.destroy();
    };
  }, [model, maxFPS, onFaceDetected]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};
