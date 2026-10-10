import React from 'react';

interface TagProps {
  label: string;
  variant?: 'nominal' | 'caution' | 'alarm' | 'neutral' | 'active';
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export const Tag: React.FC<TagProps> = ({ label, variant = 'neutral', size = 'sm', style }) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    nominal: {
      color: 'var(--sage)',
      borderColor: 'var(--sage)',
      backgroundColor: 'transparent',
    },
    caution: {
      color: 'var(--caution)',
      borderColor: 'var(--caution)',
      backgroundColor: 'transparent',
    },
    alarm: {
      color: 'var(--alarm)',
      borderColor: 'var(--alarm)',
      backgroundColor: 'transparent',
    },
    neutral: {
      color: 'var(--ink-dim)',
      borderColor: 'var(--rule)',
      backgroundColor: 'transparent',
    },
    active: {
      color: 'var(--ember)',
      borderColor: 'var(--ember)',
      backgroundColor: 'transparent',
    },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-0)',
        fontFamily: 'var(--font-condensed)',
        fontSize: size === 'sm' ? 'var(--fs-label)' : 'var(--fs-body)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: size === 'sm' ? '1px 6px' : '2px 8px',
        lineHeight: 1.2,
        fontWeight: 600,
        ...variantStyles[variant],
        ...style,
      }}
    >
      {label}
    </span>
  );
};
