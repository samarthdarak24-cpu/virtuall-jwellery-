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
                // USING MEDIAPIPE POSE FOR ACCURATE EAR DETECTION
                // MediaPipe Pose has direct ear landmarks:
                // Landmark 7: Left ear
                // Landmark 8: Right ear
                
                const targetW = faceWidth * 0.65 * userScale; // EXTRA LARGE and visible (65% of face width)
                const pose = landmarks?.pose;
                
                // DEBUG: Log what we're receiving (console only, no visual overlay)
                console.log('Earring Detection:', {
                    hasPose: !!pose,
                    hasLeftEar: !!(pose && pose[7]),
                    hasRightEar: !!(pose && pose[8]),
                    hasFace: !!face,
                    leftEarCoords: pose && pose[7] ? { x: pose[7].x, y: pose[7].y, visibility: pose[7].visibility } : null,
                    rightEarCoords: pose && pose[8] ? { x: pose[8].x, y: pose[8].y, visibility: pose[8].visibility } : null,
                    faceWidth,
                    targetEarringWidth: targetW,
                });
                
                if (pose && pose[7] && pose[8] && 
                    typeof pose[7].visibility === 'number' && pose[7].visibility > 0.5 &&
                    typeof pose[8].visibility === 'number' && pose[8].visibility > 0.5) {
                    // Use MediaPipe Pose ear landmarks (most accurate!)
                    const leftEar = pose[7];   // Left ear keypoint
                    const rightEar = pose[8];  // Right ear keypoint
                    
                    // Get face reference for scaling
                    const chin = face?.[152];
                    const forehead = face?.[10];
                    
                    // Calculate earring drop (they hang below the ear)
                    let earringDrop = 0;
                    if (chin && forehead) {
                        const faceVerticalSpan = Math.abs((chin.y - forehead.y) * canvasHeight);
                        earringDrop = faceVerticalSpan * 0.10; // 10% drop
                    } else {
                        earringDrop = faceWidth * 0.12; // Fallback drop
                    }
                    
                    // Position earrings at detected ear locations
                    const leftEarX = leftEar.x * canvasWidth;
                    const leftEarY = leftEar.y * canvasHeight + earringDrop;
                    
                    const rightEarX = rightEar.x * canvasWidth;
                    const rightEarY = rightEar.y * canvasHeight + earringDrop;
                    
                    console.log('Using POSE ear landmarks:', {
                        leftEarX, leftEarY, rightEarX, rightEarY, earringDrop
                    });
                    
                    // Draw earrings at actual ear positions
                    drawResizedImage(ctx, loadedProductImg!, leftEarX + userX, leftEarY + userY, targetW, true, 0, 1.0);
                    drawResizedImage(ctx, loadedProductImg!, rightEarX + userX, rightEarY + userY, targetW, true, 0, 1.0);
                } else if (face) {
                    // Fallback to IMPROVED geometric calculation using OUTER FACE CONTOUR near ears
                    console.log('Using GEOMETRIC calculation (pose not available)');
                    
                    // Use outer face contour landmarks that are closest to ears:
                    // Landmark 234: Left jaw/cheek outer edge (closest to left ear on face mesh)
                    // Landmark 454: Right jaw/cheek outer edge (closest to right ear on face mesh)
                    const leftOuterFace = face[234];   // Left outer face edge
                    const rightOuterFace = face[454];  // Right outer face edge
                    const nose = face[1];              // Nose tip
                    const noseBridge = face[6];        // Nose bridge (between eyes)
                    const chin = face[152];
                    const forehead = face[10];
                    
                    if (leftOuterFace && rightOuterFace && nose && noseBridge && chin && forehead) {
                        const faceVerticalSpan = Math.abs((chin.y - forehead.y) * canvasHeight);
                        
                        // Ear vertical position: Between nose bridge and chin
                        // Typically ears are at the level of nose TIP (not nose bridge/eyes)
                        // Use nose tip as the vertical reference
                        const noseTipY = nose.y * canvasHeight;
                        const noseBridgeY = noseBridge.y * canvasHeight;
                        
                        // Ears are typically at nose tip level, slightly below
                        const earVerticalPosition = noseTipY + (faceVerticalSpan * 0.05); // Slightly below nose tip
                        
                        // Ears are OUTSIDE the face mesh outer edge
                        // Need to extrapolate significantly outward from the outer face points
                        const earOutwardOffset = faceWidth * 0.40; // Move 40% of face width BEYOND outer face edge
                        
                        // Left ear position - BEYOND the left outer face edge, at nose level
                        const leftEarX = (leftOuterFace.x * canvasWidth) - earOutwardOffset;
                        const leftEarY = earVerticalPosition;
                        
                        // Right ear position - BEYOND the right outer face edge, at nose level
                        const rightEarX = (rightOuterFace.x * canvasWidth) + earOutwardOffset;
                        const rightEarY = earVerticalPosition;
                        
                        // Earring drop (they hang below the ear lobe)
                        const earringDrop = faceVerticalSpan * 0.18; // Larger drop for dangling earrings
                        
                        console.log('Ear positions (nose level):', {
                            leftEarX, leftEarY, rightEarX, rightEarY,
                            noseTipY, earVerticalPosition, earringDrop,
                            leftOuterFaceX: leftOuterFace.x * canvasWidth,
                            leftOuterFaceY: leftOuterFace.y * canvasHeight,
                            earOutwardOffset, faceWidth, faceVerticalSpan
                        });
                        
                        drawResizedImage(ctx, loadedProductImg!, leftEarX + userX, leftEarY + earringDrop + userY, targetW, true, 0, 1.0);
                        drawResizedImage(ctx, loadedProductImg!, rightEarX + userX, rightEarY + earringDrop + userY, targetW, true, 0, 1.0);
                    }
                } else {
                    // Final fallback when no detection available
                    console.log('Using FALLBACK positioning');
                    const earY = canvasHeight * 0.38;
                    const earSpacing = canvasWidth * 0.48; // Even wider
                    drawResizedImage(ctx, loadedProductImg!, canvasWidth * 0.5 - earSpacing, earY, targetW, true, 0, 1.0);
                    drawResizedImage(ctx, loadedProductImg!, canvasWidth * 0.5 + earSpacing, earY, targetW, true, 0, 1.0);
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
                
                console.log('Ring detection:', {
                    hasHands: !!(hands && hands.length > 0),
                    handCount: hands ? hands.length : 0
                });
                
                if (hands && hands.length > 0) {
                    const hand = hands[0];
                    
                    // MediaPipe Hand Landmarks for ring finger:
                    // 13: Ring finger MCP (base/knuckle)
                    // 14: Ring finger PIP (middle joint)
                    // 15: Ring finger DIP (top joint)
                    // 16: Ring finger tip
                    
                    const ringMCP = hand[13];      // Ring finger base
                    const ringPIP = hand[14];      // Ring finger middle joint
                    const ringDIP = hand[15];      // Ring finger top joint
                    const indexMCP = hand[5];      // For sizing reference
                    const pinkyMCP = hand[17];     // For sizing reference
                    const middleMCP = hand[9];     // Middle finger base

                    console.log('Ring finger landmarks:', {
                        hasRingMCP: !!ringMCP,
                        hasRingPIP: !!ringPIP,
                        hasRingDIP: !!ringDIP,
                        ringMCPCoords: ringMCP ? { x: ringMCP.x, y: ringMCP.y } : null,
                        ringPIPCoords: ringPIP ? { x: ringPIP.x, y: ringPIP.y } : null
                    });

                    if (ringMCP && ringPIP && ringDIP && indexMCP && pinkyMCP) {
                        // Position ring closer to the knuckle (MCP joint)
                        const ringPosition = {
                            x: ringMCP.x * 0.7 + ringPIP.x * 0.3, // 70% at base, 30% toward middle
                            y: ringMCP.y * 0.7 + ringPIP.y * 0.3
                        };
                        
                        const ringX = ringPosition.x * canvasWidth;
                        const ringY = ringPosition.y * canvasHeight;

                        // Calculate hand width for reference
                        const handW = Math.hypot(
                            (indexMCP.x - pinkyMCP.x) * canvasWidth, 
                            (indexMCP.y - pinkyMCP.y) * canvasHeight
                        );
                        
                        // Calculate actual finger width by measuring distance between adjacent fingers
                        // Ring finger width can be estimated from the spacing
                        const fingerSpacing = handW / 4; // Approximate spacing between fingers
                        const fingerWidth = fingerSpacing * 0.85; // Finger is slightly narrower than spacing
                        
                        // Ring should be sized appropriately - BIGGER for visibility
                        const ringInnerDiameter = fingerWidth * 1.1; // 10% larger than finger
                        const ringThickness = fingerWidth * 0.25; // Ring band thickness
                        const ringOuterDiameter = ringInnerDiameter + (ringThickness * 2);
                        const targetW = ringOuterDiameter * userScale * 1.8; // MUCH LARGER - 1.8x multiplier

                        // Calculate finger direction for ring rotation
                        const dx = ringPIP.x - ringMCP.x;
                        const dy = ringPIP.y - ringMCP.y;
                        const fingerAngle = Math.atan2(dy, dx);
                        
                        // Ring should be perpendicular to finger direction
                        const ringAngle = fingerAngle + Math.PI / 2;
                        
                        // Calculate perspective squash based on finger angle
                        const fingerAngleFromHorizontal = Math.abs(Math.sin(fingerAngle));
                        const perspectiveSquash = 0.35 + (fingerAngleFromHorizontal * 0.45); // Range: 0.35 to 0.8

                        console.log('Ring positioning:', {
                            ringX, ringY,
                            handWidth: handW,
                            fingerWidth, 
                            ringInnerDiameter,
                            ringOuterDiameter,
                            targetW,
                            fingerAngle: (fingerAngle * 180 / Math.PI).toFixed(1) + '°',
                            ringAngle: (ringAngle * 180 / Math.PI).toFixed(1) + '°',
                            perspectiveSquash: perspectiveSquash.toFixed(2)
                        });

                        // Draw the ring simply - just the image rotated and positioned
                        drawResizedImage(ctx, loadedProductImg!, ringX + userX, ringY + userY, targetW, true, ringAngle, perspectiveSquash);
                        tracked = true;
                    }
                }

                if (!tracked) {
                    console.log('Ring: Using fallback (manual mode)');
                    const targetW = canvasWidth * 0.15 * userScale;
                    y = canvasHeight * 0.75;
                    drawResizedImage(ctx, loadedProductImg!, x + userX, y + userY, targetW, true, 0, 1.0);
                    drawManualText(ctx, canvasWidth, canvasHeight);
                }
            }
            else if (isCat('bracelet') || isCat('bangle')) {
                let tracked = false;
                
                console.log('Bracelet detection:', {
                    hasHands: !!(hands && hands.length > 0),
                    handCount: hands ? hands.length : 0,
                    loadedProductImg: !!loadedProductImg
                });
                
                if (hands && hands.length > 0) {
                    const hand = hands[0];
                    
                    // MediaPipe Hand Landmarks:
                    // 0: Wrist
                    const wrist = hand[0];           // Wrist base
                    const thumbCMC = hand[1];        // Thumb base
                    const indexMCP = hand[5];        // Index finger base
                    const middleMCP = hand[9];       // Middle finger base
                    const ringMCP = hand[13];        // Ring finger base
                    const pinkyMCP = hand[17];       // Pinky base

                    console.log('Hand landmarks available:', {
                        hasWrist: !!wrist,
                        hasIndexMCP: !!indexMCP,
                        hasPinkyMCP: !!pinkyMCP,
                        hasMiddleMCP: !!middleMCP,
                        wristCoords: wrist ? { x: wrist.x, y: wrist.y } : null
                    });

                    if (wrist && indexMCP && pinkyMCP && middleMCP && thumbCMC) {
                        // Wrist position - use the actual wrist landmark
                        const wX = wrist.x * canvasWidth;
                        const wY = wrist.y * canvasHeight;
                        
                        // Calculate hand width across knuckles (MCP joints)
                        const handWidth = Math.hypot(
                            (indexMCP.x - pinkyMCP.x) * canvasWidth, 
                            (indexMCP.y - pinkyMCP.y) * canvasHeight
                        );
                        
                        // Calculate wrist width (narrower than hand)
                        const wristWidth = handWidth * 0.70; // Wrist is about 70% of hand width
                        
                        // Bracelet should be visible and properly sized
                        const braceletDiameter = wristWidth * 1.3; // 30% larger than wrist for visibility
                        const targetW = braceletDiameter * userScale;
                        
                        // Calculate arm/hand direction vector
                        const palmCenterX = (indexMCP.x + middleMCP.x + ringMCP.x + pinkyMCP.x) / 4;
                        const palmCenterY = (indexMCP.y + middleMCP.y + ringMCP.y + pinkyMCP.y) / 4;
                        
                        const dx = palmCenterX - wrist.x;
                        const dy = palmCenterY - wrist.y;
                        const handAngle = Math.atan2(dy, dx);
                        
                        // Bracelet should be perpendicular to hand direction
                        const braceletAngle = handAngle + Math.PI / 2;
                        
                        // Calculate perspective based on hand orientation
                        const handAngleFromHorizontal = Math.abs(Math.sin(handAngle));
                        const perspectiveSquash = 0.35 + (handAngleFromHorizontal * 0.45); // Range: 0.35 to 0.8
                        
                        // Position bracelet at wrist, slightly toward the hand
                        const braceletOffset = wristWidth * 0.2;
                        const braceletX = wX + Math.cos(handAngle) * braceletOffset;
                        const braceletY = wY + Math.sin(handAngle) * braceletOffset;
                        
                        console.log('Bracelet positioning:', {
                            wristX: wX, wristY: wY,
                            braceletX, braceletY,
                            handWidth, wristWidth, 
                            braceletDiameter,
                            targetW,
                            handAngle: (handAngle * 180 / Math.PI).toFixed(1) + '°',
                            braceletAngle: (braceletAngle * 180 / Math.PI).toFixed(1) + '°',
                            perspectiveSquash: perspectiveSquash.toFixed(2),
                            palmCenter: { x: palmCenterX, y: palmCenterY }
                        });

                        // Draw the bracelet simply - just the image rotated and positioned
                        drawResizedImage(ctx, loadedProductImg!, braceletX + userX, braceletY + userY, targetW, true, braceletAngle, perspectiveSquash);
                        tracked = true;
                    }
                }

                if (!tracked) {
                    console.log('Bracelet: Hand not detected - show message');
                    // Don't show bracelet in wrong position - show instruction instead
                    ctx.save();
                    ctx.font = "bold 24px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillStyle = "#FFD700";
                    ctx.strokeStyle = "#000";
                    ctx.lineWidth = 3;
                    const message = "Show your hand to try bracelet";
                    ctx.strokeText(message, canvasWidth / 2, canvasHeight / 2);
                    ctx.fillText(message, canvasWidth / 2, canvasHeight / 2);
                    ctx.restore();
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

        function draw3DRing(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, diameter: number, rotation: number, squashY: number, fingerAngle: number) {
            // Advanced photorealistic ring rendering with PBR and proper 3D wrapping
            
            const outerRadiusX = diameter * 0.5;
            const outerRadiusY = diameter * 0.5 * squashY;
            const thickness = diameter * 0.28; // Ring band thickness (thicker than bracelet)
            const innerRadiusX = Math.max(outerRadiusX - thickness, outerRadiusX * 0.4); // Ensure positive
            const innerRadiusY = Math.max(outerRadiusY - thickness, outerRadiusY * 0.4); // Ensure positive
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            
            // Step 1: Draw soft shadow UNDER the ring (contact shadow on finger)
            ctx.globalCompositeOperation = 'multiply';
            const shadowGradient = ctx.createRadialGradient(0, thickness * 0.25, innerRadiusX * 0.7, 0, thickness * 0.25, outerRadiusX * 1.08);
            shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            shadowGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.2)');
            shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
            ctx.fillStyle = shadowGradient;
            ctx.beginPath();
            ctx.ellipse(0, thickness * 0.25, outerRadiusX * 1.05, outerRadiusY * 1.05, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.globalCompositeOperation = 'source-over';
            
            // Step 2: Draw the ring with 3D segments for realistic wrapping
            const segmentCount = 36; // High segment count for smooth curve
            const angleStep = (Math.PI * 2) / segmentCount;
            
            // Draw back segments first (proper depth layering)
            for (let pass = 0; pass < 2; pass++) {
                for (let i = 0; i < segmentCount; i++) {
                    const angle = i * angleStep;
                    const nextAngle = ((i + 1) % segmentCount) * angleStep;
                    
                    // Calculate 3D position on cylinder
                    const cosAngle = Math.cos(angle);
                    const sinAngle = Math.sin(angle);
                    const cosNext = Math.cos(nextAngle);
                    const sinNext = Math.sin(nextAngle);
                    
                    // Determine visibility (front vs back)
                    const isFront = cosAngle > -0.15;
                    
                    // First pass: back segments, Second pass: front segments
                    if ((pass === 0 && isFront) || (pass === 1 && !isFront)) continue;
                    
                    // Calculate segment positions
                    const outerX1 = cosAngle * outerRadiusX;
                    const outerY1 = sinAngle * outerRadiusY;
                    const outerX2 = cosNext * outerRadiusX;
                    const outerY2 = sinNext * outerRadiusY;
                    
                    const innerX1 = cosAngle * innerRadiusX;
                    const innerY1 = sinAngle * innerRadiusY;
                    const innerX2 = cosNext * innerRadiusX;
                    const innerY2 = sinNext * innerRadiusY;
                    
                    // Calculate lighting based on surface normal (PBR)
                    const normalX = cosAngle;
                    const normalY = sinAngle * squashY;
                    const normalLength = Math.sqrt(normalX * normalX + normalY * normalY);
                    const normalizedX = normalX / normalLength;
                    const normalizedY = normalY / normalLength;
                    
                    // Light direction (from top-left, slightly stronger for rings)
                    const lightX = -0.4;
                    const lightY = -0.6;
                    const lightZ = 0.7;
                    
                    // Calculate diffuse lighting
                    const normalZ = Math.sqrt(Math.max(0, 1 - normalizedX * normalizedX - normalizedY * normalizedY));
                    const dotProduct = normalizedX * lightX + normalizedY * lightY + normalZ * lightZ;
                    const diffuse = Math.max(0.25, dotProduct * 0.75 + 0.25);
                    
                    // Calculate specular highlight (stronger for metallic rings)
                    const reflectZ = 2 * dotProduct * normalZ - lightZ;
                    const specular = Math.pow(Math.max(0, reflectZ), 25) * 0.5;
                    
                    // Occlusion factor
                    const occlusion = isFront ? 1.0 : 0.35 + (cosAngle * 0.35);
                    
                    // Draw segment
                    ctx.save();
                    
                    ctx.beginPath();
                    ctx.moveTo(outerX1, outerY1);
                    ctx.lineTo(outerX2, outerY2);
                    ctx.lineTo(innerX2, innerY2);
                    ctx.lineTo(innerX1, innerY1);
                    ctx.closePath();
                    ctx.clip();
                    
                    const segmentCenterX = (outerX1 + outerX2 + innerX1 + innerX2) / 4;
                    const segmentCenterY = (outerY1 + outerY2 + innerY1 + innerY2) / 4;
                    const segmentSize = diameter * 0.18;
                    
                    ctx.globalAlpha = occlusion;
                    ctx.drawImage(
                        img,
                        (i / segmentCount) * img.width, 0,
                        img.width / segmentCount, img.height,
                        segmentCenterX - segmentSize / 2, segmentCenterY - segmentSize / 2,
                        segmentSize, segmentSize
                    );
                    
                    // Apply lighting
                    ctx.globalCompositeOperation = 'multiply';
                    ctx.fillStyle = `rgba(${255 * diffuse}, ${255 * diffuse}, ${255 * diffuse}, 1)`;
                    ctx.fill();
                    
                    // Apply specular highlight
                    if (specular > 0.1 && isFront) {
                        ctx.globalCompositeOperation = 'screen';
                        ctx.fillStyle = `rgba(255, 255, 255, ${specular})`;
                        ctx.fill();
                    }
                    
                    ctx.restore();
                }
            }
            
            // Step 3: Add edge highlights for metallic/gemstone appearance
            if (innerRadiusX > 0 && innerRadiusY > 0) {
                ctx.globalCompositeOperation = 'screen';
                const edgeGradient = ctx.createLinearGradient(0, -outerRadiusY, 0, outerRadiusY);
                edgeGradient.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
                edgeGradient.addColorStop(0.25, 'rgba(255, 255, 255, 0)');
                edgeGradient.addColorStop(0.75, 'rgba(255, 255, 255, 0)');
                edgeGradient.addColorStop(1, 'rgba(120, 120, 120, 0.25)');
                
                ctx.beginPath();
                ctx.ellipse(0, 0, outerRadiusX, outerRadiusY, 0, 0, Math.PI * 2);
                ctx.ellipse(0, 0, innerRadiusX, innerRadiusY, 0, 0, Math.PI * 2, true);
                ctx.fillStyle = edgeGradient;
                ctx.fill();
            }
            
            ctx.restore();
        }

        function draw3DBracelet(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, diameter: number, rotation: number, squashY: number, handAngle: number) {
            // Advanced photorealistic bracelet rendering with PBR and proper 3D wrapping
            
            const outerRadiusX = diameter * 0.5;
            const outerRadiusY = diameter * 0.5 * squashY;
            const thickness = diameter * 0.22; // Band thickness
            const innerRadiusX = Math.max(outerRadiusX - thickness, outerRadiusX * 0.4); // Ensure positive
            const innerRadiusY = Math.max(outerRadiusY - thickness, outerRadiusY * 0.4); // Ensure positive
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            
            // Step 1: Draw soft shadow UNDER the bracelet (ambient occlusion)
            ctx.globalCompositeOperation = 'multiply';
            const shadowGradient = ctx.createRadialGradient(0, thickness * 0.3, innerRadiusX * 0.8, 0, thickness * 0.3, outerRadiusX * 1.1);
            shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            shadowGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
            shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
            ctx.fillStyle = shadowGradient;
            ctx.beginPath();
            ctx.ellipse(0, thickness * 0.3, outerRadiusX * 1.05, outerRadiusY * 1.05, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.globalCompositeOperation = 'source-over';
            
            // Step 2: Draw the bracelet with 3D segments for realistic wrapping
            const segmentCount = 32; // High segment count for smooth curve
            const angleStep = (Math.PI * 2) / segmentCount;
            
            // Draw back segments first (proper depth layering)
            for (let pass = 0; pass < 2; pass++) {
                for (let i = 0; i < segmentCount; i++) {
                    const angle = i * angleStep;
                    const nextAngle = ((i + 1) % segmentCount) * angleStep;
                    
                    // Calculate 3D position on cylinder
                    const cosAngle = Math.cos(angle);
                    const sinAngle = Math.sin(angle);
                    const cosNext = Math.cos(nextAngle);
                    const sinNext = Math.sin(nextAngle);
                    
                    // Determine visibility (front vs back)
                    const isFront = cosAngle > -0.2; // Segments facing camera
                    
                    // First pass: back segments, Second pass: front segments
                    if ((pass === 0 && isFront) || (pass === 1 && !isFront)) continue;
                    
                    // Calculate segment positions (outer and inner edges)
                    const outerX1 = cosAngle * outerRadiusX;
                    const outerY1 = sinAngle * outerRadiusY;
                    const outerX2 = cosNext * outerRadiusX;
                    const outerY2 = sinNext * outerRadiusY;
                    
                    const innerX1 = cosAngle * innerRadiusX;
                    const innerY1 = sinAngle * innerRadiusY;
                    const innerX2 = cosNext * innerRadiusX;
                    const innerY2 = sinNext * innerRadiusY;
                    
                    // Calculate lighting based on surface normal (PBR) - LIGHTER
                    const normalX = cosAngle;
                    const normalY = sinAngle * squashY;
                    const normalLength = Math.sqrt(normalX * normalX + normalY * normalY);
                    const normalizedX = normalX / normalLength;
                    const normalizedY = normalY / normalLength;
                    
                    // Light direction (from top-left) - BRIGHTER
                    const lightX = -0.3;
                    const lightY = -0.7;
                    const lightZ = 0.6;
                    
                    // Calculate diffuse lighting (Lambertian) - MUCH BRIGHTER
                    const normalZ = Math.sqrt(Math.max(0, 1 - normalizedX * normalizedX - normalizedY * normalizedY));
                    const dotProduct = normalizedX * lightX + normalizedY * lightY + normalZ * lightZ;
                    const diffuse = Math.max(0.6, dotProduct * 0.4 + 0.6); // Brighter: 0.6 to 1.0
                    
                    // Calculate specular highlight (Phong) - STRONGER
                    const viewZ = 1.0; // Camera looking straight
                    const reflectX = 2 * dotProduct * normalizedX - lightX;
                    const reflectY = 2 * dotProduct * normalizedY - lightY;
                    const reflectZ = 2 * dotProduct * normalZ - lightZ;
                    const specular = Math.pow(Math.max(0, reflectZ), 20) * 0.3;
                    
                    // Occlusion factor (darker on sides and back) - LIGHTER
                    const occlusion = isFront ? 1.0 : 0.6 + (cosAngle * 0.2);
                    
                    // Draw segment quad
                    ctx.save();
                    
                    // Create clipping path for this segment
                    ctx.beginPath();
                    ctx.moveTo(outerX1, outerY1);
                    ctx.lineTo(outerX2, outerY2);
                    ctx.lineTo(innerX2, innerY2);
                    ctx.lineTo(innerX1, innerY1);
                    ctx.closePath();
                    ctx.clip();
                    
                    // Draw bracelet texture for this segment
                    const segmentCenterX = (outerX1 + outerX2 + innerX1 + innerX2) / 4;
                    const segmentCenterY = (outerY1 + outerY2 + innerY1 + innerY2) / 4;
                    const segmentSize = diameter * 0.15;
                    
                    ctx.globalAlpha = occlusion;
                    ctx.drawImage(
                        img,
                        (i / segmentCount) * img.width, 0,
                        img.width / segmentCount, img.height,
                        segmentCenterX - segmentSize / 2, segmentCenterY - segmentSize / 2,
                        segmentSize, segmentSize
                    );
                    
                    // Apply lighting - LIGHTER MULTIPLY
                    ctx.globalCompositeOperation = 'multiply';
                    ctx.globalAlpha = 0.5; // Reduce multiply effect
                    ctx.fillStyle = `rgba(${255 * diffuse}, ${255 * diffuse}, ${255 * diffuse}, 1)`;
                    ctx.fill();
                    
                    // Apply specular highlight
                    if (specular > 0.05 && isFront) {
                        ctx.globalCompositeOperation = 'screen';
                        ctx.globalAlpha = specular;
                        ctx.fillStyle = `rgba(255, 255, 255, 1)`;
                        ctx.fill();
                    }
                    
                    ctx.restore();
                }
            }
            
            // Step 3: Add edge highlights for metallic appearance - SUBTLE
            if (innerRadiusX > 0 && innerRadiusY > 0) {
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha = 0.3; // Reduce highlight intensity
                const edgeGradient = ctx.createLinearGradient(0, -outerRadiusY, 0, outerRadiusY);
                edgeGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
                edgeGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0)');
                edgeGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
                edgeGradient.addColorStop(1, 'rgba(100, 100, 100, 0.1)');
                
                ctx.beginPath();
                ctx.ellipse(0, 0, outerRadiusX, outerRadiusY, 0, 0, Math.PI * 2);
                ctx.ellipse(0, 0, innerRadiusX, innerRadiusY, 0, 0, Math.PI * 2, true);
                ctx.fillStyle = edgeGradient;
                ctx.fill();
            }
            
            ctx.restore();
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
