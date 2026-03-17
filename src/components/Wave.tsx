import { motion, useScroll, useTransform } from 'framer-motion';

export const Wave = ({
  position = 'bottom',
  color,
  height = 100,
  speed = 0.5,
  offset = 0,
  className = '',
}: {
  position?: 'top' | 'bottom';
  color: string;
  height?: number;
  speed?: number;
  offset?: number;
  className?: string;
}) => {
  const { scrollY } = useScroll();
  const bgX = useTransform(scrollY, (v) => `-${v * speed + offset}px`);

  const path =
    position === 'bottom'
      ? 'M 0 50 Q 250 100 500 50 T 1000 50 L 1000 100 L 0 100 Z'
      : 'M 0 50 Q 250 100 500 50 T 1000 50 L 1000 0 L 0 0 Z';

  const encodedColor = color.replace('#', '%23');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 100' preserveAspectRatio='none'><path d='${path}' fill='${encodedColor}'/></svg>`;

  return (
    <motion.div
      className={className}
      style={{
        position: 'absolute',
        left: 0,
        width: '100%',
        height: `${height}px`,
        ...(position === 'bottom' ? { bottom: 0 } : { top: 0 }),
        backgroundImage: `url("data:image/svg+xml,${svg}")`,
        backgroundRepeat: 'repeat-x',
        backgroundSize: '1000px 100%',
        backgroundPositionX: bgX,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />
  );
};

export default Wave;
