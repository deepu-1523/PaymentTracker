import React from 'react';

export const StatCard = ({ title, value, subtext, icon: Icon, trend, color = 'indigo', onClick }) => {
  const colorMap = {
    indigo: {
      bg: 'rgba(99, 102, 241, 0.12)',
      text: '#818cf8',
      border: 'rgba(99, 102, 241, 0.25)',
      glow: '0 4px 20px rgba(99, 102, 241, 0.15)',
    },
    green: {
      bg: 'rgba(16, 185, 129, 0.12)',
      text: '#10b981',
      border: 'rgba(16, 185, 129, 0.25)',
      glow: '0 4px 20px rgba(16, 185, 129, 0.15)',
    },
    amber: {
      bg: 'rgba(245, 158, 11, 0.12)',
      text: '#f59e0b',
      border: 'rgba(245, 158, 11, 0.25)',
      glow: '0 4px 20px rgba(245, 158, 11, 0.15)',
    },
    rose: {
      bg: 'rgba(244, 63, 94, 0.12)',
      text: '#f43f5e',
      border: 'rgba(244, 63, 94, 0.25)',
      glow: '0 4px 20px rgba(244, 63, 94, 0.15)',
    },
    sky: {
      bg: 'rgba(14, 165, 233, 0.12)',
      text: '#38bdf8',
      border: 'rgba(14, 165, 233, 0.25)',
      glow: '0 4px 20px rgba(14, 165, 233, 0.15)',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`card ${onClick ? 'card-interactive' : ''}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: scheme.glow,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {title}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
            {value}
          </div>
          {subtext && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {subtext}
            </div>
          )}
        </div>
        {Icon && (
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: scheme.bg,
              color: scheme.text,
              border: `1px solid ${scheme.border}`,
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      {trend && (
        <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '12px' }}>
          {trend}
        </div>
      )}
    </div>
  );
};
