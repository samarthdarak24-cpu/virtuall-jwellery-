import { useEffect, useRef, useState } from 'react';
import { Transform } from '@jewelfit/types';

interface PhotoTryOnCanvasProps {
    imageUrl: string | null;
    landmarks: any;
    productAssetUrl: string | null;
    category?: string | null;
}

// Helper function defined outside
const lerp = (a: { x: number, y: number }, b: { x: number, y: number }, t: number) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t
});

export default function PhotoTryOnCanvas({
    imageUrl,
    landmarks,
    productAssetUrl,
    category,
}: PhotoTryOnCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvasTransform, setCanvasTransform] = useState<Transform>({
        scale: 1,
        rotation: 0,
        translateX: 0,
        translateY: 0,
    });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [loadedProductImg, setLoadedProductImg] = useState<HTMLImageElement | null>(null);

    // Pre-load product image
    useEffect(() => {
        if (!productAssetUrl) {
            setLoadedProductImg(null);
            return;
        }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = productAssetUrl;
        img.onload = () => setLoadedProductImg(img);
    }, [productAssetUrl]);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        function drawJewelryOverlay(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
            if (!loadedProductImg) return; // Only draw if image is loaded

            let x = canvasWidth * 0.5;
            let y = canvasHeight * 0.65;

            const isCat = (type: string) => category?.toLowerCase().includes(type) || productAssetUrl?.toLowerCase().includes(type);
            const face = landmarks?.face;
            const hands = landmarks?.hands;

            // Face Metrics
            let faceWidth = 150;
            let faceHeight = 0;
            let neckY = 0;
            let chinX = x;

            if (face) {
                const leftTemple = face[234];
                const rightTemple = face[454];
                const chin = face[152];
                const forehead = face[10];

                if (leftTemple && rightTemple) {
                    faceWidth = Math.hypot((rightTemple.x - leftTemple.x) * canvasWidth, (rightTemple.y - leftTemple.y) * canvasHeight);
                }

                if (forehead && chin) {
                    faceHeight = Math.abs((chin.y - forehead.y) * canvasHeight);
                }

                if (chin) {
                    chinX = chin.x * canvasWidth;
                    // Necklace should sit at base of neck/collarbone
                    // Typically 15-25% of face height below chin
                    const neckOffset = faceHeight > 0 ? faceHeight * 0.20 : faceWidth * 0.25;
                    neckY = (chin.y * canvasHeight) + neckOffset;
                    x = chinX;
                    y = chin.y * canvasHeight;
                }
            }

            const userX = canvasTransform.translateX;
            const userY = canvasTransform.translateY;
            const userScale = canvasTransform.scale;

            ctx.save();

            if (isCat('earring')) {
                const targetW = faceWidth * 0.15 * userScale;
                if (face) {
                    const leftEar = face[234];
                    const rightEar = face[454];
                    const chin = face[152];

                    if (leftEar && rightEar && chin) {
                        const earToChinDist = Math.abs((chin.y - leftEar.y) * canvasHeight);
                        const drop = earToChinDist * 0.15;

                        drawResizedImage(ctx, loadedProductImg!, (leftEar.x * canvasWidth) + userX, (leftEar.y * canvasHeight) + drop + userY, targetW, true, 0, 1.0);
                        drawResizedImage(ctx, loadedProductImg!, (rightEar.x * canvasWidth) + userX, (rightEar.y * canvasHeight) + drop + userY, targetW, true, 0, 1.0);
                    }
                } else {
                    drawResizedImage(ctx, loadedProductImg!, canvasWidth * 0.35, canvasHeight * 0.45, targetW, true, 0, 1.0);
                    drawResizedImage(ctx, loadedProductImg!, canvasWidth * 0.65, canvasHeight * 0.45, targetW, true, 0, 1.0);
                }
            }
            else if (isCat('nose') || isCat('pin')) {
                const targetW = faceWidth * 0.08 * userScale;
                if (face && face[4]) {
                    const nose = face[4];
                    drawResizedImage(ctx, loadedProductImg!, nose.x * canvasWidth + userX, nose.y * canvasHeight + userY, targetW, true, 0, 1.0);
                } else {
                    drawResizedImage(ctx, loadedProductImg!, x + userX, y + userY, targetW, true, 0, 1.0);
                }
            }
            else if (isCat('ring')) {
                let tracked = false;
                if (hands && hands.length > 0) {
                    const hand = hands[0];
                    const fingerMCP = hand[9];
                    const fingerPIP = hand[10];
                    const indexMCP = hand[5];
                    const pinkyMCP = hand[17];

                    if (fingerMCP && fingerPIP && indexMCP && pinkyMCP) {
                        const ringPos = lerp(fingerMCP, fingerPIP, 0.5);

                        const hX = ringPos.x * canvasWidth;
                        const hY = ringPos.y * canvasHeight;

                        const handW = Math.hypot((indexMCP.x - pinkyMCP.x) * canvasWidth, (indexMCP.y - pinkyMCP.y) * canvasHeight);
                        const targetW = handW * 0.45 * userScale;

                        const dx = fingerPIP.x - fingerMCP.x;
                        const dy = fingerPIP.y - fingerMCP.y;
                        const angle = Math.atan2(dy, dx) - Math.PI / 2;

                        drawResizedImage(ctx, loadedProductImg!, hX + userX, hY + userY, targetW, true, angle, 0.6);
                        tracked = true;
                    }
                }

                if (!tracked) {
                    const targetW = canvasWidth * 0.15 * userScale;
                    y = canvasHeight * 0.75;
                    drawResizedImage(ctx, loadedProductImg!, x + userX, y + userY, targetW, true, 0, 1.0);
                    drawManualText(ctx, canvasWidth, canvasHeight);
                }
            }
            else if (isCat('bracelet') || isCat('bangle')) {
                let tracked = false;
                if (hands && hands.length > 0) {
                    const hand = hands[0];
                    const wrist = hand[0];
                    const middleMCP = hand[9];
                    const indexMCP = hand[5];
                    const pinkyMCP = hand[17];

                    if (wrist && indexMCP && pinkyMCP) {
                        const wX = wrist.x * canvasWidth;
                        const wY = wrist.y * canvasHeight;
                        const handW = Math.hypot((indexMCP.x - pinkyMCP.x) * canvasWidth, (indexMCP.y - pinkyMCP.y) * canvasHeight);
                        const targetW = handW * 2.2 * userScale;
                        const dx = middleMCP.x - wrist.x;
                        const dy = middleMCP.y - wrist.y;
                        const armAngle = Math.atan2(dy, dx);
                        const bangleAngle = armAngle - Math.PI / 2;

                        drawResizedImage(ctx, loadedProductImg!, wX + userX, wY + userY, targetW, true, bangleAngle, 0.7);
                        tracked = true;
                    }
                }

                if (!tracked) {
                    const targetW = canvasWidth * 0.25 * userScale;
                    y = canvasHeight * 0.75;
                    drawResizedImage(ctx, loadedProductImg!, x + userX, y + userY, targetW, true, 0, 1.0);
                    drawManualText(ctx, canvasWidth, canvasHeight);
                }
            }
            else {
                // Necklace
                const angle = 0;
                const shoulderWidth = faceWidth * 2.5;
                const targetW = shoulderWidth * userScale;
                const targetX = (face && face[152]) ? (face[152].x * canvasWidth) : x;
                const targetY = (face) ? neckY : y;
                drawResizedImage(ctx, loadedProductImg!, targetX + userX, targetY + userY, targetW, false, angle, 1.0);
            }

            ctx.restore();
        }

        const drawScene = (width: number, height: number, img?: HTMLImageElement) => {
            ctx.clearRect(0, 0, width, height);
            if (img) ctx.drawImage(img, 0, 0, width, height);
            if (loadedProductImg) drawJewelryOverlay(ctx, width, height);
        };

        if (imageUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const containerWidth = 800;
                const containerHeight = 600;
                const aspectRatio = img.width / img.height;
                let drawWidth, drawHeight;
                if (aspectRatio > containerWidth / containerHeight) {
                    drawWidth = containerWidth;
                    drawHeight = containerWidth / aspectRatio;
                } else {
                    drawHeight = containerHeight;
                    drawWidth = containerHeight * aspectRatio;
                }
                canvas.width = drawWidth;
                canvas.height = drawHeight;
                drawScene(drawWidth, drawHeight, img);
            };
            img.src = imageUrl;
        } else {
            canvas.width = 800;
            canvas.height = 600;
            drawScene(800, 600);
        }

        function drawManualText(ctx: CanvasRenderingContext2D, w: number, h: number) {
            ctx.font = "bold 20px sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "#FFF";
            ctx.shadowColor = "#000";
            ctx.shadowBlur = 4;
            ctx.fillText("Manual Mode: Drag to Adjust (Hands not detected)", w / 2, h - 40);
        }

        function drawResizedImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, targetWidth: number, centerAligned: boolean, rotation: number, squashY: number) {
            const aspect = img.height / img.width;
            const h = targetWidth * aspect;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.scale(1, squashY);

            if (centerAligned) {
                ctx.drawImage(img, -targetWidth / 2, -h / 2, targetWidth, h);
            } else {
                ctx.drawImage(img, -targetWidth / 2, 0, targetWidth, h);
            }

            ctx.restore();
        }

    }, [imageUrl, landmarks, productAssetUrl, canvasTransform, category, loadedProductImg]);


    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging) return;
        setCanvasTransform(prev => ({
            ...prev,
            translateX: prev.translateX + (e.clientX - dragStart.x),
            translateY: prev.translateY + (e.clientY - dragStart.y),
        }));
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => { setIsDragging(false); };

    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.95 : 1.05;
        setCanvasTransform(prev => ({ ...prev, scale: Math.max(0.1, Math.min(5, prev.scale * delta)) }));
    };

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain cursor-move pointer-events-auto"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            />
        </div>
    );
}
