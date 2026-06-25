import { useEffect, useRef, useCallback } from 'react';
import { OneEuroFilter2D } from '@/utils/OneEuroFilter';

interface RealTimeTryOnOverlayProps {
  landmarks: any;
  productAssetUrl: string | null;
  category?: string | null;
  canvasWidth: number;
  canvasHeight: number;
  mirrored?: boolean;
}

// Smoothing filters for real-time overlay positions
const overlayFilters = new Map<string, OneEuroFilter2D>();

function getFilter(key: string): OneEuroFilter2D {
  if (!overlayFilters.has(key)) {
    // Higher beta for responsiveness in real-time
    overlayFilters.set(key, new OneEuroFilter2D(1.5, 0.02, 1.0));
  }
  return overlayFilters.get(key)!;
}

function smoothPoint(key: string, x: number, y: number): { x: number; y: number } {
  const filter = getFilter(key);
  return filter.filter({ x, y });
}

export default function RealTimeTryOnOverlay({
  landmarks,
  productAssetUrl,
  category,
  canvasWidth,
  canvasHeight,
  mirrored = true,
}: RealTimeTryOnOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const productImgRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef<number>(0);

  // Preload product image
  useEffect(() => {
    if (!productAssetUrl) {
      productImgRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = productAssetUrl;
    img.onload = () => {
      productImgRef.current = img;
    };
  }, [productAssetUrl]);

  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ensure canvas matches container
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const img = productImgRef.current;
    if (!img || !landmarks) return;

    const face = landmarks.face;
    const hands = landmarks.hands;
    const pose = landmarks.pose;

    const isCat = (type: string) =>
      category?.toLowerCase().includes(type) || productAssetUrl?.toLowerCase().includes(type);

    // ---- Face metrics ----
    let faceWidth = 150;
    let faceHeight = 0;

    if (face) {
      const leftTemple = face[234];
      const rightTemple = face[454];
      const chin = face[152];
      const forehead = face[10];
      if (leftTemple && rightTemple) {
        faceWidth = Math.hypot(
          (rightTemple.x - leftTemple.x) * canvasWidth,
          (rightTemple.y - leftTemple.y) * canvasHeight
        );
      }
      if (forehead && chin) {
        faceHeight = Math.abs((chin.y - forehead.y) * canvasHeight);
      }
    }

    ctx.save();

    // ========== EARRING ==========
    if (isCat('earring')) {
      const targetW = faceWidth * 0.55;

      if (
        pose && pose[7] && pose[8] &&
        typeof pose[7].visibility === 'number' && pose[7].visibility > 0.5 &&
        typeof pose[8].visibility === 'number' && pose[8].visibility > 0.5
      ) {
        // Pose ear landmarks
        const leftEar = pose[7];
        const rightEar = pose[8];

        let earringDrop = faceHeight > 0 ? faceHeight * 0.10 : faceWidth * 0.12;

        const lSmooth = smoothPoint('ear_l', leftEar.x * canvasWidth, leftEar.y * canvasHeight + earringDrop);
        const rSmooth = smoothPoint('ear_r', rightEar.x * canvasWidth, rightEar.y * canvasHeight + earringDrop);

        drawCentered(ctx, img, lSmooth.x, lSmooth.y, targetW);
        drawCentered(ctx, img, rSmooth.x, rSmooth.y, targetW);
      } else if (face) {
        // Geometric fallback using outer face contour
        const leftOuter = face[234];
        const rightOuter = face[454];
        const nose = face[1];
        if (leftOuter && rightOuter && nose) {
          const earOutward = faceWidth * 0.38;
          const earY = nose.y * canvasHeight + (faceHeight > 0 ? faceHeight * 0.05 : 0);
          const earringDrop = faceHeight > 0 ? faceHeight * 0.18 : faceWidth * 0.15;

          const lSmooth = smoothPoint('ear_geo_l', leftOuter.x * canvasWidth - earOutward, earY + earringDrop);
          const rSmooth = smoothPoint('ear_geo_r', rightOuter.x * canvasWidth + earOutward, earY + earringDrop);

          drawCentered(ctx, img, lSmooth.x, lSmooth.y, targetW);
          drawCentered(ctx, img, rSmooth.x, rSmooth.y, targetW);
        }
      }
    }

    // ========== NECKLACE ==========
    else if (isCat('necklace') || isCat('pendant') || isCat('chain')) {
      if (face) {
        const chin = face[152];
        if (chin) {
          const shoulderW = faceWidth * 2.5;
          const neckOffset = faceHeight > 0 ? faceHeight * 0.20 : faceWidth * 0.25;
          const neckY = chin.y * canvasHeight + neckOffset;
          const neckX = chin.x * canvasWidth;

          const s = smoothPoint('necklace', neckX, neckY);
          drawCenteredBottom(ctx, img, s.x, s.y, shoulderW);
        }
      }
    }

    // ========== NOSE PIN ==========
    else if (isCat('nose') || isCat('pin')) {
      if (face && face[4]) {
        const nose = face[4];
        const targetW = faceWidth * 0.08;
        const s = smoothPoint('nose', nose.x * canvasWidth, nose.y * canvasHeight);
        drawCentered(ctx, img, s.x, s.y, targetW);
      }
    }

    // ========== RING ==========
    else if (isCat('ring')) {
      if (hands && hands.length > 0) {
        const hand = hands[0];
        const ringMCP = hand[13];
        const ringPIP = hand[14];
        const indexMCP = hand[5];
        const pinkyMCP = hand[17];

        if (ringMCP && ringPIP && indexMCP && pinkyMCP) {
          const ringPos = {
            x: ringMCP.x * 0.7 + ringPIP.x * 0.3,
            y: ringMCP.y * 0.7 + ringPIP.y * 0.3,
          };
          const handW = Math.hypot(
            (indexMCP.x - pinkyMCP.x) * canvasWidth,
            (indexMCP.y - pinkyMCP.y) * canvasHeight
          );
          const targetW = handW * 0.45;

          const dx = ringPIP.x - ringMCP.x;
          const dy = ringPIP.y - ringMCP.y;
          const angle = Math.atan2(dy, dx) + Math.PI / 2;

          const s = smoothPoint('ring', ringPos.x * canvasWidth, ringPos.y * canvasHeight);
          drawCenteredRotated(ctx, img, s.x, s.y, targetW, angle);
        }
      }
    }

    // ========== BRACELET ==========
    else if (isCat('bracelet') || isCat('bangle')) {
      if (hands && hands.length > 0) {
        const hand = hands[0];
        const wrist = hand[0];
        const indexMCP = hand[5];
        const pinkyMCP = hand[17];
        const middleMCP = hand[9];

        if (wrist && indexMCP && pinkyMCP && middleMCP) {
          const handW = Math.hypot(
            (indexMCP.x - pinkyMCP.x) * canvasWidth,
            (indexMCP.y - pinkyMCP.y) * canvasHeight
          );
          const wristWidth = handW * 0.70;
          const targetW = wristWidth * 1.3;

          const palmX = (indexMCP.x + middleMCP.x + pinkyMCP.x) / 3;
          const palmY = (indexMCP.y + middleMCP.y + pinkyMCP.y) / 3;
          const dx = palmX - wrist.x;
          const dy = palmY - wrist.y;
          const angle = Math.atan2(dy, dx) + Math.PI / 2;

          const s = smoothPoint('bracelet', wrist.x * canvasWidth, wrist.y * canvasHeight);
          drawCenteredRotated(ctx, img, s.x, s.y, targetW, angle);
        }
      } else {
        // Show hand hint
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText('Show your hand to try bracelet', canvasWidth / 2, canvasHeight - 60);
        ctx.fillText('Show your hand to try bracelet', canvasWidth / 2, canvasHeight - 60);
      }
    }

    // ========== DEFAULT (necklace fallback) ==========
    else {
      if (face) {
        const chin = face[152];
        if (chin) {
          const shoulderW = faceWidth * 2.5;
          const neckOffset = faceHeight > 0 ? faceHeight * 0.20 : faceWidth * 0.25;
          const neckY = chin.y * canvasHeight + neckOffset;
          const s = smoothPoint('default_neck', chin.x * canvasWidth, neckY);
          drawCenteredBottom(ctx, img, s.x, s.y, shoulderW);
        }
      }
    }

    ctx.restore();
  }, [landmarks, productAssetUrl, category, canvasWidth, canvasHeight]);

  // Render loop
  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      drawOverlay();
      animFrameRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawOverlay]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 30 }}
    />
  );
}

// ====== Drawing Helpers ======

function drawCentered(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number
) {
  const aspect = img.height / img.width;
  const h = width * aspect;
  ctx.drawImage(img, x - width / 2, y - h / 2, width, h);
}

function drawCenteredBottom(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number
) {
  const aspect = img.height / img.width;
  const h = width * aspect;
  ctx.drawImage(img, x - width / 2, y, width, h);
}

function drawCenteredRotated(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  angle: number
) {
  const aspect = img.height / img.width;
  const h = width * aspect;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.drawImage(img, -width / 2, -h / 2, width, h);
  ctx.restore();
}
