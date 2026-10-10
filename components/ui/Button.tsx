import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  children,
  disabled,
  style,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    fontFamily: 'var(--font-condensed)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    border: '1px solid var(--rule)',
    borderRadius: 'var(--r-1)',
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
    width: fullWidth ? '100%' : 'auto',
    boxSizing: 'border-box',
    textDecoration: 'none',
  };

  const sizeStyle: Record<string, React.CSSProperties> = {
    sm: { padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--fs-label)' },
    md: { padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--fs-body)' },
    lg: { padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--fs-lead)' },
  };

  const variantStyle: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--oxide)',
      borderColor: 'var(--oxide)',
      color: 'var(--ink)',
    },
    secondary: {
      backgroundColor: 'var(--basalt-2)',
      borderColor: 'var(--rule)',
      color: 'var(--ink)',
    },
    danger: {
      backgroundColor: 'var(--alarm)',
      borderColor: 'var(--alarm)',
      color: 'var(--ink)',
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      color: 'var(--ink-dim)',
    },
  };

  return (
    <button
      disabled={disabled}
      style={{
        ...baseStyle,
        ...sizeStyle[size],
        ...variantStyle[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};
