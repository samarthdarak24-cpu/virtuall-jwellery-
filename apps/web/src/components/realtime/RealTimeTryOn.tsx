import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MediaPipeDetector from '@/components/photo/MediaPipeDetector';
import RealTimeTryOnOverlay from '@/components/realtime/RealTimeTryOnOverlay';
import TrackingStatus from '@/components/realtime/TrackingStatus';
import FPSCounter from '@/components/realtime/FPSCounter';

interface RealTimeTryOnProps {
  productAssetUrl: string | null;
  category: string | null;
  onScreenshot?: (dataUrl: string) => void;
}

export default function RealTimeTryOn({
  productAssetUrl,
  category,
  onScreenshot,
}: RealTimeTryOnProps) {
  const [landmarks, setLandmarks] = useState<any>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [showFps, setShowFps] = useState(false);
  const [resolution, setResolution] = useState({ w: 1280, h: 720 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLandmarksDetected = useCallback((lm: any) => {
    setLandmarks(lm);
    if (lm?.imageWidth && lm?.imageHeight) {
      setResolution({ w: lm.imageWidth, h: lm.imageHeight });
    }
  }, []);

  const handleScreenshot = useCallback(() => {
    if (!containerRef.current) return;
    // Capture the container as a composite
    const video = containerRef.current.querySelector('video');
    const overlayCanvas = containerRef.current.querySelector('canvas');
    if (!video) return;

    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth || 1280;
    captureCanvas.height = video.videoHeight || 720;
    const ctx = captureCanvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

    // Draw overlay on top
    if (overlayCanvas) {
      ctx.drawImage(overlayCanvas, 0, 0, captureCanvas.width, captureCanvas.height);
    }

    const dataUrl = captureCanvas.toDataURL('image/png');
    onScreenshot?.(dataUrl);

    // Auto-download
    const link = document.createElement('a');
    link.download = `jewelfit-realtime-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, [onScreenshot]);

  const startCamera = useCallback(() => {
    setCameraActive(true);
  }, []);

  const stopCamera = useCallback(() => {
    setCameraActive(false);
    setLandmarks(null);
  }, []);

  return (
    <div className="w-full relative">
      {/* Main viewport */}
      <div
        ref={containerRef}
        className="relative w-full bg-gradient-to-br from-neutral-950 to-black rounded-3xl overflow-hidden shadow-2xl border border-luxury-gold/10"
        style={{ aspectRatio: '16/9', minHeight: '480px' }}
      >
        {cameraActive ? (
          <>
            {/* MediaPipe processes the webcam and outputs landmarks */}
            <MediaPipeDetector
              imageUrl={null}
              useCamera={true}
              onLandmarksDetected={handleLandmarksDetected}
            />

            {/* Real-time jewelry overlay drawn on top of the video */}
            {productAssetUrl && (
              <RealTimeTryOnOverlay
                landmarks={landmarks}
                productAssetUrl={productAssetUrl}
                category={category}
                canvasWidth={resolution.w}
                canvasHeight={resolution.h}
                mirrored={true}
              />
            )}

            {/* Tracking status HUD */}
            <TrackingStatus landmarks={landmarks} isActive={cameraActive} />

            {/* FPS counter */}
            <FPSCounter visible={showFps} />

            {/* Product info badge */}
            {productAssetUrl && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 left-4 z-40 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold border border-luxury-gold/30 flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-luxury-gold rounded-full animate-pulse" />
                <span className="text-luxury-gold">{category?.toUpperCase() || 'JEWELRY'}</span>
                <span className="text-neutral-400">• Real-Time</span>
              </motion.div>
            )}

            {/* No product selected hint */}
            {!productAssetUrl && (
              <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-black/70 backdrop-blur-xl px-8 py-5 rounded-2xl border border-luxury-gold/20 text-center"
                >
                  <p className="text-2xl mb-2">💎</p>
                  <p className="text-white font-semibold mb-1">Select Jewelry</p>
                  <p className="text-neutral-400 text-sm">
                    Choose a piece from the sidebar to try it on
                  </p>
                </motion.div>
              </div>
            )}
          </>
        ) : (
          /* Camera off — show start screen */
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-center p-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <motion.div
                className="mx-auto mb-8"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg
                  className="w-28 h-28 mx-auto text-luxury-gold drop-shadow-lg"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </motion.div>

              <h3 className="text-3xl font-display font-bold mb-4 text-white">
                Real-Time Try-On
              </h3>
              <p className="text-neutral-400 font-elegant text-lg max-w-md mx-auto mb-8">
                Use your webcam to see how jewelry looks on you — live and in real-time
              </p>

              <button
                onClick={startCamera}
                className="btn-primary text-lg px-10 py-4 flex items-center justify-center gap-3 mx-auto"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Start Camera
              </button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Control bar */}
      <AnimatePresence>
        {cameraActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 flex flex-wrap gap-3 justify-center"
          >
            <button
              onClick={handleScreenshot}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-white/10 rounded-xl transition-all text-sm font-semibold flex items-center gap-2 text-white"
            >
              📸 Capture
            </button>

            <button
              onClick={() => setShowFps(!showFps)}
              className={`px-5 py-2.5 border rounded-xl transition-all text-sm font-semibold flex items-center gap-2 ${
                showFps
                  ? 'bg-green-900/40 border-green-500/30 text-green-200'
                  : 'bg-neutral-900 border-white/10 text-white hover:bg-neutral-800'
              }`}
            >
              ⚡ FPS
            </button>

            <button
              onClick={stopCamera}
              className="px-5 py-2.5 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-red-200 rounded-xl transition-all text-sm font-semibold flex items-center gap-2"
            >
              ⏹️ Stop Camera
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
