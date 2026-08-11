import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Premium dark Input component
 * Props: label, type, placeholder, value, onChange, icon (Lucide component), error, required, disabled, hint
 */
const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  required,
  disabled,
  hint,
  className = '',
  style = {},
  ...rest
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPwd ? 'text' : 'password') : type;

  const wrapStyle = {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(7,11,24,0.8)',
    border: `1px solid ${error ? '#FF5252' : focused ? '#3BB7FF' : 'rgba(120,160,255,0.2)'}`,
    borderRadius: '10px',
    boxShadow: focused
      ? `0 0 0 3px ${error ? 'rgba(255,82,82,0.15)' : 'rgba(59,183,255,0.15)'},  0 0 20px ${error ? 'rgba(255,82,82,0.08)' : 'rgba(59,183,255,0.08)'}`
      : 'none',
    transition: 'all 0.25s ease',
    opacity: disabled ? 0.5 : 1,
  };

  const inputStyle = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#FFFFFF',
    fontSize: '14px',
    padding: '10px 14px',
    paddingLeft: Icon ? '0' : '14px',
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <div style={{ marginBottom: '4px', ...style }} className={className}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: '#A8B3CF',
            marginBottom: '6px',
            letterSpacing: '0.01em',
          }}
        >
          {label}
          {required && <span style={{ color: '#FF5252', marginLeft: '3px' }}>*</span>}
        </label>
      )}

      <div style={wrapStyle}>
        {Icon && (
          <div style={{ paddingLeft: '12px', color: focused ? '#3BB7FF' : '#A8B3CF', display: 'flex', transition: 'color 0.2s' }}>
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          style={inputStyle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd(v => !v)}
            style={{
              paddingRight: '12px',
              color: '#A8B3CF',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#3BB7FF'}
            onMouseLeave={e => e.currentTarget.style.color = '#A8B3CF'}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {error && (
        <p style={{ fontSize: '12px', color: '#FF5252', marginTop: '5px' }}>{error}</p>
      )}
      {hint && !error && (
        <p style={{ fontSize: '12px', color: '#A8B3CF', marginTop: '5px' }}>{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
