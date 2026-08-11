import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full mt-auto py-6 border-t border-slate-800/40 text-center flex flex-col sm:flex-row items-center justify-between px-6 gap-4">
      <div className="text-xs font-sans text-slate-500">
        &copy; {new Date().getFullYear()} Aether Telecom. All rights reserved.
      </div>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-display font-medium text-slate-400 tracking-wider uppercase">
          AI Diagnostician Online (v2.1.0)
        </span>
      </div>
    </footer>
  );
};

export default Footer;
