'use client';

import React, { useState } from 'react';

const GLOSSARY: Record<string, string> = {
  ECLSS: 'Environmental Control and Life Support System — equipment that recycles water, cleans air, and keeps astronauts alive.',
  MOXIE: 'Mars Oxygen ISRU Experiment — technology that splits Martian carbon dioxide (CO2) into breathable oxygen (O2).',
  mSv: 'Millisievert — unit measuring biological damage from radiation. Earth humans receive ~3 mSv per year.',
  ISRU: 'In-Situ Resource Utilization — living off the land by manufacturing water, oxygen, and fuel from Martian soil and air.',
  sol: 'One Martian solar day — lasts 24 hours, 39 minutes, and 35 seconds.',
  tau: 'Optical depth — a measurement of how much sunlight is blocked by atmospheric dust.',
  Kilopower: 'A compact NASA space fission nuclear reactor using Stirling engines to deliver continuous electric power.',
  SPE: 'Solar Particle Event — a high-energy proton storm launched by solar flares that penetrates unshielded walls.',
};

interface TooltipProps {
  term: string;
  definition?: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ term, definition, children }) => {
  const [visible, setVisible] = useState(false);
  const text = definition || GLOSSARY[term] || term;

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor: 'help',
      }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      tabIndex={0}
      role="tooltip"
      aria-label={`${term}: ${text}`}
    >
      <span
        style={{
          borderBottom: '1px dotted var(--ember)',
          color: 'var(--ink)',
        }}
      >
        {children || term}
      </span>
      {visible && (
        <span
          style={{
            position: 'absolute',
            bottom: '125%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--basalt-2)',
            border: '1px solid var(--ember)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-label)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--r-1)',
            width: 'max-content',
            maxWidth: '260px',
            zIndex: 100,
            whiteSpace: 'normal',
            lineHeight: 1.4,
            pointerEvents: 'none',
          }}
        >
          <strong style={{ color: 'var(--ember)', display: 'block', marginBottom: '2px' }}>{term}</strong>
          {text}
        </span>
      )}
    </span>
  );
};
