import React, { useId } from 'react';

interface SparklineProps {
  data?: number[];
  width?: number;
  height?: number;
  isUp?: boolean;
  showGradient?: boolean;
  strokeWidth?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data = [100, 101, 99, 102, 104, 103, 105],
  width = 100,
  height = 32,
  isUp = true,
  showGradient = true,
  strokeWidth = 2,
  className = '',
}) => {
  const gradientId = useId();

  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="opacity-0" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 4;
  const usableHeight = height - padding * 2;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - padding - ((val - min) / range) * usableHeight;
    return { x, y };
  });

  const linePath = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  const color = isUp ? '#10B981' : '#F43F5E';
  const lastPoint = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible select-none pointer-events-none ${className}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
        <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={color} floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Gradient Area Fill */}
      {showGradient && (
        <path d={areaPath} fill={`url(#${gradientId})`} />
      )}

      {/* Main Trend Line with Neon Glow */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#glow-${gradientId})`}
      />

      {/* Pulsing End Dot on the Latest Price Point */}
      <circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r="3"
        fill={color}
      />
      <circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r="5"
        fill={color}
        opacity="0.4"
        className="animate-ping"
      />
    </svg>
  );
};

