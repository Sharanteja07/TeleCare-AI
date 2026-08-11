import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Animated counter hook
 */
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const numTarget = typeof target === 'number' ? target : parseFloat(target);
    if (isNaN(numTarget)) return;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quart
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(eased * numTarget));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, duration]);

  return count;
}

const TYPE_COLORS = {
  primary: { glow: 'rgba(59,183,255,0.3)',  icon: 'rgba(59,183,255,0.15)',  text: '#3BB7FF' },
  success: { glow: 'rgba(0,230,118,0.25)',   icon: 'rgba(0,230,118,0.12)',   text: '#00E676' },
  warning: { glow: 'rgba(255,193,7,0.25)',   icon: 'rgba(255,193,7,0.12)',   text: '#FFC107' },
  danger:  { glow: 'rgba(255,82,82,0.25)',   icon: 'rgba(255,82,82,0.12)',   text: '#FF5252' },
  accent:  { glow: 'rgba(94,139,255,0.3)',   icon: 'rgba(94,139,255,0.12)',  text: '#5E8BFF' },
  info:    { glow: 'rgba(59,183,255,0.25)',  icon: 'rgba(59,183,255,0.1)',   text: '#3BB7FF' },
};

/**
 * StatsCard
 * Props:
 *  - title: string
 *  - value: number | string
 *  - icon: ReactNode (JSX element)
 *  - trend: number (positive = up, negative = down, 0 = flat)
 *  - trendLabel: string
 *  - type: 'primary' | 'success' | 'warning' | 'danger' | 'accent' | 'info'
 *  - suffix: string (e.g. '%', 'ms')
 *  - animate: bool (default true)
 */
const StatsCard = ({
  title,
  value,
  icon,
  trend,
  trendLabel,
  type = 'primary',
  suffix = '',
  animate = true,
}) => {
  const colors = TYPE_COLORS[type] || TYPE_COLORS.primary;
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  const isNumeric = !isNaN(numValue) && value !== 'Online' && value !== 'N/A';
  const displayCount = useCountUp(isNumeric && animate ? numValue : 0);
  const display = isNumeric && animate ? `${displayCount}${suffix}` : `${value}${suffix}`;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 cursor-default group"
      style={{
        background: 'rgba(18,25,47,0.72)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(120,160,255,0.12)',
        boxShadow: `0 4px 24px rgba(0,0,0,0.35), 0 0 20px ${colors.glow.replace('0.3', '0.06')}`,
        transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
        e.currentTarget.style.borderColor = colors.text.replace(')', ',0.4)').replace('rgb', 'rgba');
        e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 30px ${colors.glow}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderColor = 'rgba(120,160,255,0.12)';
        e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.35), 0 0 20px ${colors.glow.replace('0.3', '0.06')}`;
      }}
    >
      {/* Corner glow */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle, ${colors.text} 0%, transparent 70%)` }}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#A8B3CF' }}>
            {title}
          </p>
          <div
            className="text-3xl font-display font-bold text-white leading-none animate-slideUp"
            style={{ letterSpacing: '-0.02em' }}
          >
            {display}
          </div>
          {(trend !== undefined || trendLabel) && (
            <div className="flex items-center gap-1.5 mt-2">
              {trend !== undefined && trend !== 0 && (
                <>
                  {trend > 0
                    ? <TrendingUp size={13} style={{ color: '#00E676' }} />
                    : <TrendingDown size={13} style={{ color: '#FF5252' }} />
                  }
                  <span className="text-xs font-medium" style={{ color: trend > 0 ? '#00E676' : '#FF5252' }}>
                    {Math.abs(trend)}%
                  </span>
                </>
              )}
              {trendLabel && (
                <span className="text-xs" style={{ color: '#A8B3CF' }}>{trendLabel}</span>
              )}
            </div>
          )}
        </div>

        {/* Icon box */}
        <div
          className="rounded-xl p-2.5 shrink-0 transition-all duration-300 group-hover:scale-110"
          style={{
            background: colors.icon,
            boxShadow: `0 0 20px ${colors.glow}`,
          }}
        >
          <span style={{ color: colors.text, display: 'flex', alignItems: 'center' }}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
};

export { StatsCard };
export default StatsCard;
