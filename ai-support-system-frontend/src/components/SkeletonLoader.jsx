import React from 'react';

const shimmerStyle = {
  background: 'rgba(18,25,47,0.8)',
  borderRadius: '8px',
  position: 'relative',
  overflow: 'hidden',
};

const shimmerAfter = `
.skeleton-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent 0%, rgba(59,183,255,0.06) 40%, rgba(59,183,255,0.12) 60%, transparent 100%);
  animation: shimmer 1.8s infinite linear;
}
`;

/** Single skeleton line */
export const SkeletonLine = ({ width = '100%', height = 14, style = {} }) => (
  <div className="skeleton" style={{ width, height, borderRadius: '6px', ...shimmerStyle, ...style }} />
);

/** Skeleton text block */
export const SkeletonText = ({ lines = 3, style = {} }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
    {Array.from({ length: lines }, (_, i) => (
      <SkeletonLine key={i} width={i === lines - 1 ? '65%' : '100%'} />
    ))}
  </div>
);

/** Skeleton stats card */
export const SkeletonStatsCard = () => (
  <div
    style={{
      ...shimmerStyle,
      padding: '20px',
      borderRadius: '16px',
      border: '1px solid rgba(120,160,255,0.08)',
    }}
    className="skeleton"
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <SkeletonLine width="50%" height={11} />
        <SkeletonLine width="35%" height={32} />
        <SkeletonLine width="45%" height={11} />
      </div>
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '10px', ...shimmerStyle }} />
    </div>
  </div>
);

/** Skeleton table row */
export const SkeletonTableRow = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }, (_, i) => (
      <td key={i} style={{ padding: '14px 16px' }}>
        <SkeletonLine width={i === 0 ? '80px' : i === cols - 1 ? '60px' : '100%'} />
      </td>
    ))}
  </tr>
);

/** Skeleton table (multiple rows) */
export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <>
    {Array.from({ length: rows }, (_, i) => <SkeletonTableRow key={i} cols={cols} />)}
  </>
);

/** Skeleton card */
export const SkeletonCard = ({ height = 120, style = {} }) => (
  <div
    className="skeleton"
    style={{
      ...shimmerStyle,
      height,
      borderRadius: '16px',
      border: '1px solid rgba(120,160,255,0.08)',
      ...style,
    }}
  />
);

/** AI loading spinner */
export const AILoader = ({ message = 'Loading...' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', gap: '16px' }}>
    <div style={{ position: 'relative', width: 48, height: 48 }}>
      <div
        style={{
          width: 48, height: 48,
          borderRadius: '50%',
          border: '2px solid rgba(59,183,255,0.15)',
          borderTop: '2px solid #3BB7FF',
          animation: 'spin 0.9s linear infinite',
          boxShadow: '0 0 15px rgba(59,183,255,0.3)',
        }}
      />
      <div
        style={{
          position: 'absolute', inset: 8,
          borderRadius: '50%',
          border: '2px solid rgba(94,139,255,0.15)',
          borderBottom: '2px solid #5E8BFF',
          animation: 'spin 1.3s linear infinite reverse',
        }}
      />
    </div>
    <p style={{ fontSize: '14px', color: '#A8B3CF', margin: 0 }}>{message}</p>
  </div>
);

/** Full page loader */
const SkeletonLoader = ({ type = 'dashboard' }) => {
  if (type === 'stats') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[0,1,2,3].map(i => <SkeletonStatsCard key={i} />)}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="skeleton" style={{ ...shimmerStyle, borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(120,160,255,0.08)' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(120,160,255,0.08)' }}>
          <SkeletonLine width="180px" height={18} />
        </div>
        <table style={{ width: '100%' }}>
          <tbody>
            <SkeletonTable rows={6} cols={6} />
          </tbody>
        </table>
      </div>
    );
  }

  return <AILoader message="Loading..." />;
};

export default SkeletonLoader;
