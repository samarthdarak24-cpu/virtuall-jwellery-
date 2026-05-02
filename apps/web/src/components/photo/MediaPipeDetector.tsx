import { useEffect, useRef, useState } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { OneEuroFilter2D } from '@/utils/OneEuroFilter';
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
    
    // One Euro Filters for landmark smoothing (reduces jitter by 67% as per research paper)
    // Using minCutoff = 1.0 Hz and beta = 0.007 as specified in the paper
    const faceFiltersRef = useRef<Map<number, OneEuroFilter2D>>(new Map());
    const handFiltersRef = useRef<Map<string, OneEuroFilter2D>>(new Map());

    /**
     * Apply One Euro Filter to smooth landmarks
     * This reduces jitter while maintaining responsiveness to deliberate motion
     */
    const smoothLandmarks = (landmarks: any[], filterMap: Map<any, OneEuroFilter2D>, keyPrefix: string = '') => {
        if (!landmarks) return landmarks;
        
        return landmarks.map((landmark, index) => {
            const key = `${keyPrefix}${index}`;
            if (!filterMap.has(key)) {
                // Initialize filter with research paper parameters
                filterMap.set(key, new OneEuroFilter2D(1.0, 0.007, 1.0));
            }
            const filter = filterMap.get(key)!;
            return filter.filter({ x: landmark.x, y: landmark.y });
        });
    };

    useEffect(() => {
        let isActive = true;

        const initMediaPipe = async () => {
            try {
                // Load FaceMesh, Hands, and Pose
                const { FaceMesh } = await import('@mediapipe/face_mesh');
                const { Hands } = await import('@mediapipe/hands');
                const { Pose } = await import('@mediapipe/pose');

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

                // Add Pose detection for ear landmarks
                const pose = new Pose({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
                });
                pose.setOptions({
                    modelComplexity: 1,
                    smoothLandmarks: true,
                    enableSegmentation: false,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });

                // Composite Results Holder
                let latestFace: any = null;
                let latestHands: any = null;
                let latestPose: any = null;

                faceMesh.onResults((results) => {
                    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                        // Apply One Euro Filter for temporal smoothing
                        latestFace = useCamera 
                            ? smoothLandmarks(results.multiFaceLandmarks[0], faceFiltersRef.current, 'face_')
                            : results.multiFaceLandmarks[0]; // No smoothing for static images
                    } else {
                        latestFace = null;
                    }
                    dispatchResults();
                });

                hands.onResults((results) => {
                    if (results.multiHandLandmarks && useCamera) {
                        // Apply One Euro Filter to each hand
                        const smoothedHands = results.multiHandLandmarks.map((handLandmarks: any, handIndex: number) => 
                            smoothLandmarks(handLandmarks, handFiltersRef.current, `hand${handIndex}_`)
                        );
                        latestHands = { ...results, multiHandLandmarks: smoothedHands };
                    } else {
                        latestHands = results; // No smoothing for static images
                    }
                    dispatchResults();
                });

                pose.onResults((results) => {
                    if (results.poseLandmarks) {
                        // Apply One Euro Filter for pose landmarks
                        latestPose = useCamera 
                            ? smoothLandmarks(results.poseLandmarks, handFiltersRef.current, 'pose_')
                            : results.poseLandmarks; // No smoothing for static images
                    } else {
                        latestPose = null;
                    }
                    dispatchResults();
                });

                const dispatchResults = () => {
                    // Check if we have anything
                    if (!latestFace && !latestHands && !latestPose) return;

                    onLandmarksDetected({
                        face: latestFace, // Array[468/478]
                        hands: latestHands?.multiHandLandmarks, // Array of Array[21]
                        pose: latestPose, // Array[33] - includes ear landmarks at index 7 (left) and 8 (right)
                        imageWidth: videoRef.current?.videoWidth || 1280,
                        imageHeight: videoRef.current?.videoHeight || 720,
                    });
                    setLoading(false);
                };

                if (isActive) {
                    if (useCamera) {
                        startCamera(faceMesh, hands, pose);
                    } else if (imageUrl) {
                        processStaticImage(faceMesh, hands, pose);
                    }
                }
            } catch (err) {
                console.error("Failed to load AI Models", err);
                setError("Failed to load tracking modules.");
            }
        };

        const processStaticImage = async (faceMesh: any, hands: any, pose: any) => {
            if (!imageUrl) return;
            setLoading(true);

            try {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = async () => {
                    // Send image to all three models
                    await faceMesh.send({ image: img });
                    await hands.send({ image: img });
                    await pose.send({ image: img });
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

        const startCamera = (faceMesh: any, hands: any, pose: any) => {
            if (!videoRef.current) return;
            setLoading(true);

            try {
                const camera = new Camera(videoRef.current, {
                    onFrame: async () => {
                        if (videoRef.current) {
                            // Send to all three models
                            await faceMesh.send({ image: videoRef.current });
                            await hands.send({ image: videoRef.current });
                            await pose.send({ image: videoRef.current });
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
                    <span className="text-purple-400 text-sm">✓ Pose Tracking Active (Ears)</span>
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
