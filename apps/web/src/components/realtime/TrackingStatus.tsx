import { motion, AnimatePresence } from 'framer-motion';

interface TrackingStatusProps {
  landmarks: any;
  isActive: boolean;
}

export default function TrackingStatus({ landmarks, isActive }: TrackingStatusProps) {
  if (!isActive) return null;

  const hasFace = !!(landmarks?.face && landmarks.face.length > 0);
  const hasHands = !!(landmarks?.hands && landmarks.hands.length > 0);
  const hasPose = !!(landmarks?.pose && landmarks.pose.length > 0);

  const items = [
    { label: 'Face', active: hasFace, color: 'text-green-400', icon: '👤' },
    { label: 'Hands', active: hasHands, color: 'text-blue-400', icon: '🖐️' },
    { label: 'Pose', active: hasPose, color: 'text-purple-400', icon: '🦴' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute bottom-4 left-4 z-50 flex flex-col gap-1.5"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-300 ${
            item.active
              ? `bg-black/60 backdrop-blur-md border border-white/10 ${item.color}`
              : 'bg-black/30 backdrop-blur-sm border border-white/5 text-neutral-600'
          }`}
        >
          <span className="text-sm">{item.icon}</span>
          <span>{item.label}</span>
          {item.active && (
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          )}
        </div>
      ))}
    </motion.div>
  );
}
