import { useEffect, useRef, useState } from 'react';

interface FPSCounterProps {
  visible?: boolean;
}

export default function FPSCounter({ visible = true }: FPSCounterProps) {
  const [fps, setFps] = useState(0);
  const frameTimesRef = useRef<number[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!visible) return;

    let running = true;
    const loop = (now: number) => {
      if (!running) return;
      frameTimesRef.current.push(now);
      // Keep only last 60 frame timestamps
      while (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }
      if (frameTimesRef.current.length >= 2) {
        const elapsed =
          frameTimesRef.current[frameTimesRef.current.length - 1] -
          frameTimesRef.current[0];
        const frames = frameTimesRef.current.length - 1;
        setFps(Math.round((frames / elapsed) * 1000));
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="absolute top-4 right-4 z-50 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 font-mono text-xs">
      <span
        className={fps >= 24 ? 'text-green-400' : fps >= 15 ? 'text-yellow-400' : 'text-red-400'}
      >
        {fps} FPS
      </span>
    </div>
  );
}
