import { useEffect, useRef, useState } from 'react';
import { Camera } from '@mediapipe/camera_utils';
// Note: Types from @mediapipe/holistic might not be installed, using any for now or FaceMesh types roughly align
// Actually we can load CDN implementation entirely.

interface MediaPipeDetectorProps {
    imageUrl: string | null;
    useCamera: boolean;
    onLandmarksDetected: (landmarks: any) => void;
}

export default function MediaPipeDetector({
    imageUrl,
    useCamera,
    onLandmarksDetected,
}: MediaPipeDetectorProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const holisticRef = useRef<any>(null); // Use any for Holistic instance
    const cameraRef = useRef<Camera | null>(null);

    useEffect(() => {
        let isActive = true;

        const initMediaPipe = async () => {
            try {
                // Load FaceMesh
                const { FaceMesh } = await import('@mediapipe/face_mesh');
                const { Hands } = await import('@mediapipe/hands');

                const faceMesh = new FaceMesh({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
                });
                faceMesh.setOptions({
                    maxNumFaces: 1,
                    refineLandmarks: true,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });

                const hands = new Hands({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
                });
                hands.setOptions({
                    maxNumHands: 2,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });

                // Composite Results Holder
                let latestFace: any = null;
                let latestHands: any = null;

                faceMesh.onResults((results) => {
                    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                        latestFace = results.multiFaceLandmarks[0];
                    } else {
                        latestFace = null;
                    }
                    dispatchResults();
                });

                hands.onResults((results) => {
                    latestHands = results; // returns multiHandLandmarks
                    dispatchResults();
                });

                const dispatchResults = () => {
                    // Check if we have anything
                    if (!latestFace && !latestHands) return;

                    onLandmarksDetected({
                        face: latestFace, // Array[468/478]
                        hands: latestHands?.multiHandLandmarks, // Array of Array[21]
                        imageWidth: videoRef.current?.videoWidth || 1280,
                        imageHeight: videoRef.current?.videoHeight || 720,
                    });
                    setLoading(false);
                };

                if (isActive) {
                    if (useCamera) {
                        startCamera(faceMesh, hands);
                    } else if (imageUrl) {
                        processStaticImage(faceMesh, hands);
                    }
                }
            } catch (err) {
                console.error("Failed to load AI Models", err);
                setError("Failed to load tracking modules.");
            }
        };

        const processStaticImage = async (faceMesh: any, hands: any) => {
            if (!imageUrl) return;
            setLoading(true);

            try {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = async () => {
                    // Send image to both models
                    await faceMesh.send({ image: img });
                    await hands.send({ image: img });
                };
                img.onerror = () => {
                    setError("Failed to load image");
                    setLoading(false);
                };
                img.src = imageUrl;
            } catch (err) {
                console.error("Image processing error", err);
                setError("Failed to process image");
                setLoading(false);
            }
        };

        const startCamera = (faceMesh: any, hands: any) => {
            if (!videoRef.current) return;
            setLoading(true);

            try {
                const camera = new Camera(videoRef.current, {
                    onFrame: async () => {
                        if (videoRef.current) {
                            // Send to both models
                            // Note: This effectively doubles the processing load. 
                            // Might reduce FPS. But allows simultaneous tracking.
                            await faceMesh.send({ image: videoRef.current });
                            await hands.send({ image: videoRef.current });
                        }
                    },
                    width: 1280,
                    height: 720,
                });
                camera.start();
                cameraRef.current = camera;
            } catch (err) {
                console.error("Camera error", err);
                setError("Camera access denied");
                setLoading(false);
            }
        };

        if (useCamera || imageUrl) {
            initMediaPipe();
        }

        return () => {
            isActive = false;
            if (cameraRef.current) cameraRef.current.stop();
            // Close logic if available
        };
    }, [useCamera, imageUrl, onLandmarksDetected]);

    return (
        <div className="absolute inset-0 bg-black">
            {useCamera && (
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    muted
                />
            )}

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                    <div className="text-white flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                        {useCamera ? 'Initializing Face & Hand Tracking...' : 'Analyzing Photo...'}
                    </div>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                    <div className="text-red-400">{error}</div>
                </div>
            )}
            {!loading && !error && useCamera && (
                <div className="absolute bottom-4 left-4 bg-green-500/20 border border-green-500/50 rounded-lg px-3 py-1 z-10 flex flex-col gap-1">
                    <span className="text-green-400 text-sm">✓ Face Tracking Active</span>
                    <span className="text-blue-400 text-sm">✓ Hand Tracking Active</span>
                </div>
            )}
            {!loading && !error && imageUrl && !useCamera && (
                <div className="absolute bottom-4 left-4 bg-blue-500/20 border border-blue-500/50 rounded-lg px-3 py-1 z-10 flex flex-col gap-1">
                    <span className="text-blue-400 text-sm">✓ Photo Analyzed</span>
                </div>
            )}
        </div>
    );
}
