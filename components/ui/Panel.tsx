import React from 'react';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  raised?: boolean;
}

export const Panel: React.FC<PanelProps> = ({ children, raised = false, style, ...props }) => {
  return (
    <div
      style={{
        backgroundColor: raised ? 'var(--basalt-2)' : 'var(--basalt)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-4)',
        boxSizing: 'border-box',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
