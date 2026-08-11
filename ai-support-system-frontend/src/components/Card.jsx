import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  className = '', 
  onClick,
  actions
}) => {
  const isClickable = typeof onClick === 'function';

  return (
    <div 
      onClick={onClick}
      className={`rounded-xl border border-zinc-200 bg-white p-6 transition-all duration-200 ${
        isClickable ? 'cursor-pointer hover:bg-zinc-50' : ''
      } ${className}`}
    >
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between border-b border-zinc-100 pb-4 mb-4 gap-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-black tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-zinc-500 mt-1 font-normal">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Card;
