// GlassesTryOn.tsx
import React, { useEffect, useRef } from 'react';
import { GlassesViewer, GlassesViewerOptions } from 'glasses-tryon-core';

interface GlassesTryOnProps {
  model: string;
  smoothingFactor?: number;
  maxFPS?: number;
  onFaceDetected?: () => void;
  modelConfig?: {
    scale?: number;
    offset?: { x?: number; y?: number; z?: number };
  };
  alignmentConfig?: {
    glassesScaleFactor?: number;
    glassesZ?: number;
  };
}

export const GlassesTryOn: React.FC<GlassesTryOnProps> = ({
  model,
  smoothingFactor,
  maxFPS,
  onFaceDetected,
  modelConfig,
  alignmentConfig,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<GlassesViewer | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      viewerRef.current = new GlassesViewer({
        container: containerRef.current,
        model: { url: model, ...(modelConfig || {}) },
        tracking: { smoothingFactor },
        render: { maxFPS },
        alignmentConfig,
      });
      viewerRef.current.on('faceDetected', onFaceDetected || (() => {}));
      viewerRef.current.start();
    }
    return () => {
      viewerRef.current?.destroy();
    };
  }, [model, smoothingFactor, maxFPS, onFaceDetected]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};
