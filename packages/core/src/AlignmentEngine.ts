// AlignmentEngine.ts
import * as THREE from 'three';

// Índices MediaPipe FaceMesh
const IDX = {
  LEFT_EYE: 33,
  RIGHT_EYE: 263,
  NOSE_TIP: 1,
  CHIN: 152,
  FOREHEAD: 10, // punto entre cejas, útil para eje vertical
  LEFT_EAR: 234,
  RIGHT_EAR: 454,
};

export class AlignmentEngine {
  // Dimensiones del video — se actualizan desde fuera si hace falta
  private videoWidth: number;
  private videoHeight: number;

  // Tamaño "virtual" del espacio Three.js que mapea al video
  // Ajusta viewHeight según el FOV de tu cámara (45° y z=50 → ~41 unidades)
  private readonly VIEW_HEIGHT = 41;

  // Parámetros configurables para diagnóstico visual
  public glassesZ: number = 0; // Ajusta la posición Z de los glasses
  public glassesScaleFactor: number = 1; // Multiplica la escala calculada

  constructor(videoWidth = 640, videoHeight = 480) {
    this.videoWidth = videoWidth;
    this.videoHeight = videoHeight;
  }

  setVideoDimensions(w: number, h: number) {
    this.videoWidth = w;
    this.videoHeight = h;
  }

  computeTransform(landmarks: any[]): { position: any; quaternion: any; scale: any } {
    if (!landmarks || landmarks.length < 468) {
      return { position: null, quaternion: null, scale: null };
    }

    const lm = (idx: number) => ({
      x: landmarks[idx][0],
      y: landmarks[idx][1],
      z: landmarks[idx][2] ?? 0,
    });

    const leftEye = lm(IDX.LEFT_EYE);
    const rightEye = lm(IDX.RIGHT_EYE);
    const noseTip = lm(IDX.NOSE_TIP);
    const chin = lm(IDX.CHIN);
    const forehead = lm(IDX.FOREHEAD);

    // ------------------------------------------------------------------
    // 1. POSICIÓN — convertir de píxeles a espacio Three.js
    // ------------------------------------------------------------------
    // Three.js con PerspectiveCamera(45°) y camera.z=50:
    //   viewHeight = 2 * tan(22.5°) * 50 ≈ 41.4
    //   viewWidth  = viewHeight * (container.width / container.height)
    const aspect = this.videoWidth / this.videoHeight;
    const viewWidth = this.VIEW_HEIGHT * aspect;

    // Punto de referencia: punto medio entre los ojos
    const eyeMidPx = {
      x: (leftEye.x + rightEye.x) / 2,
      y: (leftEye.y + rightEye.y) / 2,
    };

    // Convierte píxeles → coordenadas Three.js
    // En Three.js: x positivo = derecha, y positivo = arriba
    // En imagen:   x positivo = derecha, y positivo = abajo  → invertir Y
    const position = {
      x: (eyeMidPx.x / this.videoWidth - 0.5) * viewWidth,
      y: -(eyeMidPx.y / this.videoHeight - 0.5) * this.VIEW_HEIGHT,
      z: this.glassesZ, // la profundidad real del modelo la controla tu escena
    };

    // 2. ESCALA — distancia interpupilar normalizada
    // IPD en píxeles
    const ipdPx = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y);
    // Normaliza a coordenadas de escena y aplica factor
    const scale = (ipdPx / this.videoWidth) * viewWidth * this.glassesScaleFactor;

    // Diagnóstico visual: mostrar valores en consola
    if (typeof window !== 'undefined') {
      console.log('[AlignmentEngine] Posición glasses:', position);
      console.log('[AlignmentEngine] Escala glasses:', scale);
      console.log('[AlignmentEngine] IPD px:', ipdPx);
    }

    // 3. ROTACIÓN — usando vectores del plano facial

    const faceRight = new THREE.Vector3(
      -(rightEye.x - leftEye.x),
      rightEye.y - leftEye.y, // sin negar
      rightEye.z - leftEye.z,
    ).normalize();

    const faceUp = new THREE.Vector3(
      -(forehead.x - chin.x), // sin negar
      -(forehead.y - chin.y), // negar Y
      -(forehead.z - chin.z), // negar Z
    ).normalize();

    const faceNormal = new THREE.Vector3().crossVectors(faceRight, faceUp).normalize().negate();

    // Construye matriz de rotación a partir de los 3 ejes
    const rotMatrix = new THREE.Matrix4().makeBasis(faceRight, faceUp, faceNormal);
    const q = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);

    return {
      position,
      quaternion: [q.x, q.y, q.z, q.w],
      scale,
    };
  }
}
