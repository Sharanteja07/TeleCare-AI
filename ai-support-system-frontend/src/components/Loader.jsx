import React from 'react';

const Loader = ({ size = 'md', className = '', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-2',
    lg: 'w-16 h-16 border-3',
  };

  const containerStyle = fullScreen 
    ? 'fixed inset-0 z-50 bg-white flex flex-col items-center justify-center'
    : 'flex flex-col items-center justify-center py-12 w-full';

  return (
    <div className={`${containerStyle} ${className}`}>
      <div className={`relative ${sizeClasses[size]} rounded-full border-zinc-200 border-t-black animate-spin`} />
      {fullScreen && (
        <div className="mt-4 flex flex-col items-center gap-1">
          <div className="text-xs font-semibold text-black tracking-wider uppercase">TeleCare AI</div>
          <div className="text-[10px] text-zinc-500">Loading portal telemetry...</div>
        </div>
      )}
    </div>
  );
};

export default Loader;
