import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Universal Button component
 * variant: 'primary' | 'ghost' | 'danger' | 'success' | 'warning'
 * size: 'sm' | 'md' | 'lg'
 */
const VARIANTS = {
  primary: {
    background: 'linear-gradient(135deg, #3BB7FF 0%, #5E8BFF 100%)',
    border: 'none',
    color: '#fff',
    shadow: '0 4px 20px rgba(59,183,255,0.3)',
    hoverShadow: '0 8px 32px rgba(59,183,255,0.55)',
  },
  ghost: {
    background: 'rgba(59,183,255,0.06)',
    border: '1px solid rgba(59,183,255,0.25)',
    color: '#3BB7FF',
    shadow: 'none',
    hoverShadow: '0 0 20px rgba(59,183,255,0.2)',
    hoverBg: 'rgba(59,183,255,0.14)',
  },
  danger: {
    background: 'linear-gradient(135deg, #FF5252 0%, #ff1744 100%)',
    border: 'none',
    color: '#fff',
    shadow: '0 4px 20px rgba(255,82,82,0.3)',
    hoverShadow: '0 8px 32px rgba(255,82,82,0.55)',
  },
  success: {
    background: 'linear-gradient(135deg, #00E676 0%, #00c853 100%)',
    border: 'none',
    color: '#070B18',
    shadow: '0 4px 20px rgba(0,230,118,0.3)',
    hoverShadow: '0 8px 32px rgba(0,230,118,0.55)',
  },
  warning: {
    background: 'linear-gradient(135deg, #FFC107 0%, #ff8f00 100%)',
    border: 'none',
    color: '#070B18',
    shadow: '0 4px 20px rgba(255,193,7,0.3)',
    hoverShadow: '0 8px 32px rgba(255,193,7,0.55)',
  },
  secondary: {
    background: 'rgba(168,179,207,0.08)',
    border: '1px solid rgba(168,179,207,0.2)',
    color: '#A8B3CF',
    shadow: 'none',
    hoverShadow: 'none',
    hoverBg: 'rgba(168,179,207,0.14)',
  },
};

const SIZES = {
  sm: { padding: '6px 14px', fontSize: '12px', borderRadius: '8px', iconSize: 14 },
  md: { padding: '10px 20px', fontSize: '14px', borderRadius: '10px', iconSize: 16 },
  lg: { padding: '13px 28px', fontSize: '15px', borderRadius: '12px', iconSize: 18 },
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  onClick,
  type = 'button',
  className = '',
  style = {},
  fullWidth = false,
  ...rest
}) => {
  const [hovered, setHovered] = useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;

  const computedStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    background: hovered && v.hoverBg ? v.hoverBg : v.background,
    border: v.border || 'none',
    borderColor: hovered ? '#3BB7FF' : undefined,
    color: v.color,
    boxShadow: hovered ? v.hoverShadow : v.shadow,
    padding: s.padding,
    fontSize: s.fontSize,
    borderRadius: s.borderRadius,
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transform: hovered && !disabled ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
    transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
    width: fullWidth ? '100%' : 'auto',
    textDecoration: 'none',
    position: 'relative',
    overflow: 'hidden',
    letterSpacing: '0.01em',
    fontFamily: 'Inter, sans-serif',
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      style={computedStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...rest}
    >
      {loading ? (
        <Loader2 size={s.iconSize} className="animate-spin" />
      ) : icon ? (
        <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span style={{ display: 'flex', alignItems: 'center' }}>{iconRight}</span>
      )}
    </button>
  );
};

export default Button;
